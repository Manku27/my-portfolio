// About Me world — single room.
// Enter by falling through the void in the spawn room.
// Touch the top edge (jump out) to return to the spawn room.

import { about } from '@/lib/data/index'

export const ABOUT_SECTION_COUNT = 1   // kept for any callers that reference it

// ─── Geometry constants ───────────────────────────────────────────────────────

const FLOOR_Y_FAC = 0.82   // solid floor top as fraction of canvas height
const PLATFORM_H  = 18
const BRICK_W     = 80

// ─── Room content ─────────────────────────────────────────────────────────────

const TITLE = 'About Me'

const LINES = [
  'Jadavpur EE grad. Multiple backlogs. Barely graduated.',
  'Started at 3.5 LPA — turned out to actually love the work.',
  '',
  'Batman and Spider-Man pulled me back when I had nothing.',
  'I still read comics. That is not a casual detail.',
  '',
  about.pattern ?? 'Find the thing that refuses to leave. Build from there.',
  '',
  '↑  Jump to the top edge to return',
]

// ─── Collision geometry ────────────────────────────────────────────────────────

export interface PlatformRect { x: number; y: number; w: number; h: number }

export function getAboutPlatforms(
  _sectionIdx: number,
  canvasW: number,
  canvasH: number
): PlatformRect[] {
  const floorY = Math.round(canvasH * FLOOR_Y_FAC)

  // Two decorative mid-air steps to break up the vertical space
  const stepDefs = [
    { centreFrac: 0.28, yFrac: 0.46 },
    { centreFrac: 0.72, yFrac: 0.60 },
  ]

  const rects: PlatformRect[] = stepDefs.map(s => ({
    x: Math.round(canvasW * s.centreFrac - BRICK_W / 2),
    y: Math.round(canvasH * s.yFrac),
    w: BRICK_W,
    h: PLATFORM_H,
  }))

  // Solid floor — no exit gap
  rects.push({ x: 0, y: floorY, w: canvasW, h: PLATFORM_H })

  return rects
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawBrickStep(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number
): void {
  ctx.fillStyle = '#2a1a0a'
  ctx.fillRect(x, y, w, PLATFORM_H)

  ctx.fillStyle = 'rgba(0,0,0,0.30)'
  ctx.fillRect(x, y + Math.floor(PLATFORM_H / 2), w, 1)

  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 1
  for (let mx = x + 32; mx < x + w; mx += 32) {
    ctx.beginPath(); ctx.moveTo(mx, y); ctx.lineTo(mx, y + PLATFORM_H); ctx.stroke()
  }

  const g = ctx.createLinearGradient(0, y, 0, y + 3)
  g.addColorStop(0, 'rgba(200,120,40,0.45)')
  g.addColorStop(1, 'rgba(200,120,40,0)')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, 3)
}

// ─── Main draw ────────────────────────────────────────────────────────────────

export function drawAboutSection(
  ctx: CanvasRenderingContext2D,
  _sectionIdx: number,
  canvasW: number,
  canvasH: number
): void {
  const floorY  = Math.round(canvasH * FLOOR_Y_FAC)

  // ── Background ──
  ctx.fillStyle = '#040c0a'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Side cave glows
  const lG = ctx.createRadialGradient(0, canvasH * 0.5, 0, 0, canvasH * 0.5, canvasW * 0.35)
  lG.addColorStop(0, 'rgba(20,110,65,0.18)'); lG.addColorStop(1, 'rgba(20,110,65,0)')
  ctx.fillStyle = lG; ctx.fillRect(0, 0, canvasW * 0.35, canvasH)

  const rG = ctx.createRadialGradient(canvasW, canvasH * 0.5, 0, canvasW, canvasH * 0.5, canvasW * 0.35)
  rG.addColorStop(0, 'rgba(20,110,65,0.14)'); rG.addColorStop(1, 'rgba(20,110,65,0)')
  ctx.fillStyle = rG; ctx.fillRect(canvasW * 0.65, 0, canvasW * 0.35, canvasH)

  // Top-edge return hint — subtle upward glow
  const topGlow = ctx.createLinearGradient(0, 0, 0, canvasH * 0.12)
  topGlow.addColorStop(0, 'rgba(50,200,130,0.18)')
  topGlow.addColorStop(1, 'rgba(50,200,130,0)')
  ctx.fillStyle = topGlow
  ctx.fillRect(0, 0, canvasW, canvasH * 0.12)

  // ── Title ──
  const titleFs = Math.max(22, Math.floor(canvasW * 0.034))
  ctx.font = `700 ${titleFs}px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(210,250,230,0.92)'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.shadowColor = 'rgba(50,210,140,0.45)'; ctx.shadowBlur = 14
  ctx.fillText(TITLE, canvasW / 2, canvasH * 0.08)
  ctx.shadowBlur = 0

  // ── Body lines ──
  const bodyFs = Math.max(15, Math.floor(canvasW * 0.019))
  const lineH  = bodyFs * 1.75
  const startY = canvasH * 0.08 + titleFs * 1.4 + canvasH * 0.025

  LINES.forEach((line, i) => {
    if (!line) return
    if (line.startsWith('↑')) {
      ctx.font      = `400 ${Math.max(13, Math.floor(bodyFs * 0.85))}px 'Perpetua', serif`
      ctx.fillStyle = 'rgba(120,200,160,0.55)'
      ctx.shadowColor = 'rgba(50,190,130,0.30)'; ctx.shadowBlur = 6
    } else {
      ctx.font      = `400 ${bodyFs}px 'Perpetua', serif`
      ctx.fillStyle = 'rgba(160,220,195,0.75)'
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText(line, canvasW / 2, startY + i * lineH)
    ctx.shadowBlur = 0
  })

  ctx.textBaseline = 'alphabetic'

  // ── Brick steps ──
  const stepDefs = [
    { centreFrac: 0.28, yFrac: 0.46 },
    { centreFrac: 0.72, yFrac: 0.60 },
  ]
  stepDefs.forEach(s => {
    const sx = Math.round(canvasW * s.centreFrac - BRICK_W / 2)
    const sy = Math.round(canvasH * s.yFrac)
    drawBrickStep(ctx, sx, sy, BRICK_W)
  })

  // ── Solid floor ──
  ctx.fillStyle = '#1c3228'
  ctx.fillRect(0, floorY, canvasW, PLATFORM_H)
  ctx.fillStyle = 'rgba(60,210,140,0.28)'
  ctx.fillRect(0, floorY, canvasW, 2)

  const up = ctx.createLinearGradient(0, floorY - 60, 0, floorY)
  up.addColorStop(0, 'rgba(30,160,100,0)'); up.addColorStop(1, 'rgba(30,160,100,0.10)')
  ctx.fillStyle = up; ctx.fillRect(0, floorY - 60, canvasW, 60)

  ctx.textAlign = 'left'
}
