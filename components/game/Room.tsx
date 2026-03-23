// Room rendering — two-phase draw so parallax layers sit between bg and environment.
// roomIndex: 0 = work (left), 1 = spawn (centre), 2 = timeline (right)

const ROOM_LABELS = ['← Work', 'Spawn', 'Timeline →']
const ROOM_TINTS  = ['#051010', '#050a0a', '#050d0a']

const LAMP_STEM_H = 90
const LAMP_BULB_R = 10

// Exported so GameCanvas can compute hover distance against lamp bulb position
export const LAMP_X_FACTOR = 0.18 // fraction of canvasWidth
export function lampBulbY(groundY: number): number {
  return groundY - LAMP_STEM_H - LAMP_BULB_R
}

// glowScale: 0 = resting glow, 1 = fully hovered (larger, brighter)
function drawLampPost(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  glowScale: number
): void {
  const stemX = x - LAMP_STEM_H / 2 // visual width, not height — minor off, kept as-is
  const stemY = groundY - LAMP_STEM_H
  const bulbX = x
  const bulbY = stemY - LAMP_BULB_R

  // Stem
  ctx.fillStyle = '#2a4a4a'
  ctx.fillRect(x - 3, stemY, 6, LAMP_STEM_H)

  // Outer glow — radius grows with glowScale
  const baseGlowR = LAMP_BULB_R * 4
  const glowR = baseGlowR + glowScale * LAMP_BULB_R * 5
  const glowAlpha = 0.18 + glowScale * 0.22
  const glow = ctx.createRadialGradient(bulbX, bulbY, 0, bulbX, bulbY, glowR)
  glow.addColorStop(0, `rgba(120,255,200,${glowAlpha})`)
  glow.addColorStop(1, 'rgba(120,255,200,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(bulbX, bulbY, glowR, 0, Math.PI * 2)
  ctx.fill()

  // Bulb core — brightens slightly on hover
  const brightness = Math.round(160 + glowScale * 95)
  ctx.fillStyle = `rgb(${brightness},255,${brightness + 20})`
  ctx.beginPath()
  ctx.arc(bulbX, bulbY, LAMP_BULB_R, 0, Math.PI * 2)
  ctx.fill()
}

// Phase 1 — fill background + label. Called before parallax layers.
export function drawRoomBackground(
  ctx: CanvasRenderingContext2D,
  roomIndex: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  ctx.fillStyle = ROOM_TINTS[roomIndex] ?? '#050a0a'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.font = '13px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(ROOM_LABELS[roomIndex] ?? `Room ${roomIndex}`, canvasWidth / 2, 28)
}

// Phase 2 — ground + room props. Called after parallax background layers.
// lampGlow: 0–1, only used in spawn room (roomIndex === 1)
export function drawRoomEnvironment(
  ctx: CanvasRenderingContext2D,
  roomIndex: number,
  canvasWidth: number,
  canvasHeight: number,
  groundY: number,
  lampGlow = 0
): void {
  // Ground plane
  ctx.fillStyle = '#1a3a3a'
  ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY)

  // Ground edge highlight
  ctx.fillStyle = 'rgba(80,200,160,0.12)'
  ctx.fillRect(0, groundY, canvasWidth, 2)

  // Spawn room: lamp post on left path
  if (roomIndex === 1) {
    drawLampPost(ctx, canvasWidth * LAMP_X_FACTOR, groundY, lampGlow)
  }
}
