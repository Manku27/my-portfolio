// Room rendering — two-phase draw so parallax layers sit between bg and environment.
import { drawTimelineRoom } from './TimelineRoom'
import { drawWorkRoom } from './WorkRoom'
import { profile } from '@/lib/data/index'
// roomIndex: 0 = work (left), 1 = spawn (centre), 2 = timeline (right)

const ROOM_TINTS = ['#070a06', '#050a0a', '#050d0a']

const LAMP_STEM_H = 90
const LAMP_BULB_R = 10

export const LAMP_X_FACTOR = 0.18
export function lampBulbY(groundY: number): number {
  return groundY - LAMP_STEM_H - LAMP_BULB_R
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function radialGlow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  color: string, alpha: number
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb', 'rgba'))
  g.addColorStop(1, color.replace(')', ',0)').replace('rgb', 'rgba'))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

// ─── Lamp post ────────────────────────────────────────────────────────────────

function drawLampPost(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  glowScale: number
): void {
  const stemY = groundY - LAMP_STEM_H
  const bulbX = x
  const bulbY = stemY - LAMP_BULB_R

  // Stem
  ctx.fillStyle = '#2a4a4a'
  ctx.fillRect(x - 3, stemY, 6, LAMP_STEM_H)

  // Outer glow — expands on hover
  const glowR = LAMP_BULB_R * 4 + glowScale * LAMP_BULB_R * 5
  const glowAlpha = 0.18 + glowScale * 0.22
  const glow = ctx.createRadialGradient(bulbX, bulbY, 0, bulbX, bulbY, glowR)
  glow.addColorStop(0, `rgba(120,255,200,${glowAlpha})`)
  glow.addColorStop(1, 'rgba(120,255,200,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(bulbX, bulbY, glowR, 0, Math.PI * 2)
  ctx.fill()

  // Bulb core
  const brightness = Math.round(160 + glowScale * 95)
  ctx.fillStyle = `rgb(${brightness},255,${brightness + 20})`
  ctx.beginPath()
  ctx.arc(bulbX, bulbY, LAMP_BULB_R, 0, Math.PI * 2)
  ctx.fill()
}

// ─── Spawn room atmosphere ────────────────────────────────────────────────────

function drawSpawnAtmosphere(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  // Far ambient light blobs — drawn before parallax layers so they sit deep
  // Upper-left teal cluster
  radialGlow(ctx, w * 0.08, h * 0.22, w * 0.18, 'rgb(40,160,120)', 0.10)
  // Upper-right cold white wisp
  radialGlow(ctx, w * 0.75, h * 0.18, w * 0.14, 'rgb(180,240,230)', 0.07)
  // Mid-right faint amber accent
  radialGlow(ctx, w * 0.88, h * 0.42, w * 0.10, 'rgb(200,160,60)', 0.06)
}

function drawSpawnGroundGlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  groundY: number
): void {
  // Wide bioluminescent band along ground edge
  const band = ctx.createLinearGradient(0, groundY - 18, 0, groundY + 4)
  band.addColorStop(0, 'rgba(60,200,150,0)')
  band.addColorStop(0.6, 'rgba(60,200,150,0.08)')
  band.addColorStop(1, 'rgba(60,200,150,0.18)')
  ctx.fillStyle = band
  ctx.fillRect(0, groundY - 18, w, 22)

  // Bright top edge line
  ctx.fillStyle = 'rgba(80,220,170,0.22)'
  ctx.fillRect(0, groundY, w, 2)

  // Ground-level moss glow patches
  radialGlow(ctx, w * 0.38, groundY, w * 0.12, 'rgb(40,180,120)', 0.07)
  radialGlow(ctx, w * 0.65, groundY, w * 0.09, 'rgb(40,180,120)', 0.06)
}

function drawVignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  // Top-to-bottom subtle darkening at top
  const top = ctx.createLinearGradient(0, 0, 0, h * 0.35)
  top.addColorStop(0, 'rgba(0,0,0,0.45)')
  top.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = top
  ctx.fillRect(0, 0, w, h * 0.35)

  // Left and right edge darkening
  const left = ctx.createLinearGradient(0, 0, w * 0.12, 0)
  left.addColorStop(0, 'rgba(0,0,0,0.35)')
  left.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = left
  ctx.fillRect(0, 0, w * 0.12, h)

  const right = ctx.createLinearGradient(w, 0, w * 0.88, 0)
  right.addColorStop(0, 'rgba(0,0,0,0.35)')
  right.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = right
  ctx.fillRect(w * 0.88, 0, w * 0.12, h)
}

// ─── Name platform layout ─────────────────────────────────────────────────────
// Uses measureText (reliable after FontFace preload in GameCanvas).
// Single line when the full name fits at a readable size; two lines only as a
// fallback for narrow viewports. Caller passes layout to both draw and collision.

const NAME_CENTRE_Y_FAC   = 0.25   // centreY = canvasH * this
const SINGLE_TARGET_FAC   = 0.84   // full name spans this fraction of canvas on single line
const MIN_SINGLE_FONT     = 40     // px — below this single line is unreadably small, use two lines
const TWO_LINE_TARGET_FAC = 0.84   // last word spans this fraction on each two-line row

export interface NameLayout {
  twoLine:   boolean
  fontSize:  number
  platformY: number   // canvas Y of top of text bounding box (collision top)
  platformW: number   // width of widest line (platform collision width)
  platformX: number   // canvas X of left edge (centred)
}

export function getNameLayout(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number
): NameLayout {
  const centreY = canvasH * NAME_CENTRE_Y_FAC
  const [, last] = profile.name.split(' ')

  // Measure at 100px reference — fonts are preloaded so this is reliable
  ctx.save()
  ctx.font = `700 100px 'Trajan Pro', serif`
  const fullW = ctx.measureText(profile.name).width
  const lastW = ctx.measureText(last).width
  ctx.restore()

  // Guard: font not yet rasterised returns near-zero widths
  if (fullW < 10 || lastW < 10) {
    const fallbackFs = Math.floor(canvasW * 0.08)
    const fallbackW  = canvasW * 0.74
    const fallbackX  = (canvasW - fallbackW) / 2
    const lineH      = fallbackFs * 1.15
    return {
      twoLine: true, fontSize: fallbackFs,
      platformY: centreY - lineH / 2 - fallbackFs / 2,
      platformW: fallbackW, platformX: fallbackX,
    }
  }

  // Single-line: scale so full name = SINGLE_TARGET_FAC of canvas width
  const singleFontSize = Math.floor(canvasW * SINGLE_TARGET_FAC * 100 / fullW)

  if (singleFontSize >= MIN_SINGLE_FONT) {
    const platformW = fullW * singleFontSize / 100
    const platformX = (canvasW - platformW) / 2
    const platformY = centreY - singleFontSize / 2
    return { twoLine: false, fontSize: singleFontSize, platformY, platformW, platformX }
  }

  // Two-line fallback: scale so last word (longer) = TWO_LINE_TARGET_FAC of canvas
  const twoFontSize = Math.floor(canvasW * TWO_LINE_TARGET_FAC * 100 / lastW)
  const lineH       = twoFontSize * 1.15
  const platformW   = lastW * twoFontSize / 100
  const platformX   = (canvasW - platformW) / 2
  const platformY   = centreY - lineH / 2 - twoFontSize / 2
  return { twoLine: true, fontSize: twoFontSize, platformY, platformW, platformX }
}

function drawNamePlatform(
  ctx: CanvasRenderingContext2D,
  layout: NameLayout,
  canvasW: number,
  canvasH: number,
  glow = 0
): void {
  const { twoLine, fontSize } = layout
  const centreY = canvasH * NAME_CENTRE_Y_FAC
  const [first, last] = profile.name.split(' ')

  // Atmospheric glow when character stands on the name
  if (glow > 0.01) {
    const glowR = canvasW * 0.44
    const g = ctx.createRadialGradient(canvasW / 2, centreY, 0, canvasW / 2, centreY, glowR)
    g.addColorStop(0,   `rgba(200,255,245,${glow * 0.22})`)
    g.addColorStop(0.5, `rgba(140,230,220,${glow * 0.10})`)
    g.addColorStop(1,   'rgba(100,200,200,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(canvasW / 2, centreY, glowR, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.font         = `700 ${fontSize}px 'Trajan Pro', serif`
  ctx.fillStyle    = `rgba(255,255,255,${0.88 + glow * 0.12})`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'

  let tagY: number
  if (twoLine) {
    const lineH = fontSize * 1.15
    ctx.fillText(first, canvasW / 2, centreY - lineH / 2)
    ctx.fillText(last,  canvasW / 2, centreY + lineH / 2)
    tagY = centreY + lineH / 2 + fontSize * 0.75
  } else {
    ctx.fillText(profile.name, canvasW / 2, centreY)
    tagY = centreY + fontSize * 0.75
  }

  // Tagline — Perpetua, muted, below name block
  const tagFontSize = Math.max(16, Math.floor(fontSize * 0.28))
  ctx.font      = `400 ${tagFontSize}px 'Perpetua', serif`
  ctx.fillStyle = 'rgba(180,220,210,0.65)'
  ctx.fillText(profile.tagline, canvasW / 2, tagY)

  ctx.textAlign = 'left'
}

// ─── Phase 1: background fill ─────────────────────────────────────────────────
// Called before parallax layers.

export function drawRoomBackground(
  ctx: CanvasRenderingContext2D,
  roomIndex: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.fillStyle = ROOM_TINTS[roomIndex] ?? '#050a0a'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  if (roomIndex === 1) {
    drawSpawnAtmosphere(ctx, canvasWidth, canvasHeight)
  }
}

// ─── Phase 2: ground + props ───────────────────────────────────────────────────
// Called after parallax background layers.

export function drawRoomEnvironment(
  ctx: CanvasRenderingContext2D,
  roomIndex: number,
  canvasWidth: number,
  canvasHeight: number,
  groundY: number,
  lampGlow = 0,
  nameGlow = 0,
  nameLayout?: NameLayout
): void {
  // Ground plane
  ctx.fillStyle = '#152e2e'
  ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY)

  if (roomIndex === 1) {
    drawSpawnGroundGlow(ctx, canvasWidth, groundY)
    drawLampPost(ctx, canvasWidth * LAMP_X_FACTOR, groundY, lampGlow)
    drawVignette(ctx, canvasWidth, canvasHeight)
    const layout = nameLayout ?? getNameLayout(ctx, canvasWidth, canvasHeight)
    drawNamePlatform(ctx, layout, canvasWidth, canvasHeight, nameGlow)
  } else {
    // Basic ground edge for other rooms
    ctx.fillStyle = 'rgba(80,200,160,0.10)'
    ctx.fillRect(0, groundY, canvasWidth, 2)
  }

  // Work room — room 0
  if (roomIndex === 0) {
    drawWorkRoom(ctx, canvasWidth, groundY)
  }

  // Timeline room — room 2
  if (roomIndex === 2) {
    drawTimelineRoom(ctx, canvasWidth, groundY)
  }
}
