// About Me world — vertical descent through story sections.
// Each section has 3 small brick steps (like the spawn room staircase) that
// descend from the entry side toward the exit gap, forcing the player to
// traverse the section and read the content on the way down.

import { about } from '@/lib/data/index'

export const ABOUT_SECTION_COUNT = 5
export const RETURN_SECTION      = ABOUT_SECTION_COUNT - 1

// ─── Geometry constants ───────────────────────────────────────────────────────

const FLOOR_Y_FAC     = 0.80   // main floor top as fraction of section height
const FLOOR_GAP_W_FAC = 0.22   // exit gap width as fraction of canvas width
const PLATFORM_H      = 18

// ─── Per-section step definitions ────────────────────────────────────────────
// Three small steps descending from entry side to exit side.
// centreFrac: centre X of step as fraction of canvas width
// yFrac:      top of step as fraction of section height
// wPx:        fixed pixel width — matches spawn room brick width (80px)
//
// Entry positions:
//   Section 0: from spawn pit  → charVX ≈ canvasW * 0.50 (centre)
//   Section 1: from left  gap  → charVX ≈ canvasW * 0.11
//   Section 2: from right gap  → charVX ≈ canvasW * 0.82
//   Section 3: from left  gap  → charVX ≈ canvasW * 0.11
//   Section 4: from right gap  → full solid floor (return)

interface StepDef { centreFrac: number; yFrac: number; wPx: number }

const BRICK_W = 80  // matches spawn room brick width

const STEP_DEFS: StepDef[][] = [
  [  // 0 — Kota — enters centre (0.50), exits LEFT
    { centreFrac: 0.50, yFrac: 0.35, wPx: BRICK_W },
    { centreFrac: 0.30, yFrac: 0.52, wPx: BRICK_W },
    { centreFrac: 0.11, yFrac: 0.67, wPx: BRICK_W },
  ],
  [  // 1 — Batman & Spider-Man — enters left (0.11), exits RIGHT
    { centreFrac: 0.11, yFrac: 0.35, wPx: BRICK_W },
    { centreFrac: 0.35, yFrac: 0.52, wPx: BRICK_W },
    { centreFrac: 0.59, yFrac: 0.67, wPx: BRICK_W },
  ],
  [  // 2 — Jadavpur — enters right (0.82), exits LEFT
    { centreFrac: 0.82, yFrac: 0.35, wPx: BRICK_W },
    { centreFrac: 0.55, yFrac: 0.52, wPx: BRICK_W },
    { centreFrac: 0.11, yFrac: 0.67, wPx: BRICK_W },
  ],
  [  // 3 — 3.5 LPA — enters left (0.11), exits RIGHT
    { centreFrac: 0.11, yFrac: 0.35, wPx: BRICK_W },
    { centreFrac: 0.35, yFrac: 0.52, wPx: BRICK_W },
    { centreFrac: 0.59, yFrac: 0.67, wPx: BRICK_W },
  ],
  [],  // 4 — The Pattern — no steps, solid floor only
]

// Which side has the exit gap (null = solid floor / return section)
const EXIT_SIDE: ('left' | 'right' | null)[] = [
  'left', 'right', 'left', 'right', null,
]

// ─── Section content ──────────────────────────────────────────────────────────

interface SectionDef { title: string; lines: string[] }

const SECTIONS: SectionDef[] = [
  {
    title: 'Kota',
    lines: [
      'Believed a good college would fix everything.',
      'Found a genuine love for physics —',
      'and an exam system that wasn\'t built for how I think.',
      'I had a mental breakdown.',
    ],
  },
  {
    title: 'Batman & Spider-Man',
    lines: [
      'Literally. Not metaphorically.',
      'Those characters pulled me back when I had nothing.',
      'I still read comics.',
      'That is not a casual detail.',
    ],
  },
  {
    title: 'Jadavpur University',
    lines: [
      'Cheap fees. Strong brand.',
      'Struggled through Electrical Engineering.',
      'Multiple backlogs. Barely graduated.',
      'Covid helped.',
    ],
  },
  {
    title: '3.5 LPA',
    lines: [
      'Chose web development for pragmatic reasons.',
      'It paid, and I needed to pay.',
      'Started at 3.5 LPA.',
      'What I didn\'t expect was to actually love it.',
    ],
  },
  {
    title: about.pattern.split('\n')[0] ?? 'The Pattern',
    lines: [
      about.pattern.split('\n')[1] ?? 'This has worked every single time.',
      '',
      '↑  Press jump to return to the surface',
    ],
  },
]

// ─── Collision geometry ────────────────────────────────────────────────────────

export interface PlatformRect { x: number; y: number; w: number; h: number }

export function getAboutPlatforms(
  sectionIdx: number,
  canvasW: number,
  canvasH: number
): PlatformRect[] {
  const floorY   = Math.round(canvasH * FLOOR_Y_FAC)
  const exitSide = EXIT_SIDE[sectionIdx]
  const stepDefs = STEP_DEFS[sectionIdx] ?? []

  const rects: PlatformRect[] = stepDefs.map(s => ({
    x: Math.round(canvasW * s.centreFrac - s.wPx / 2),
    y: Math.round(canvasH * s.yFrac),
    w: s.wPx,
    h: PLATFORM_H,
  }))

  if (exitSide === null) {
    // Return section — full solid floor
    rects.push({ x: 0, y: floorY, w: canvasW, h: PLATFORM_H })
  } else {
    const gapW   = canvasW * FLOOR_GAP_W_FAC
    const floorX = exitSide === 'left' ? gapW : 0
    rects.push({ x: floorX, y: floorY, w: canvasW - gapW, h: PLATFORM_H })
  }

  return rects
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function drawBrickStep(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number
): void {
  ctx.fillStyle = '#2a1a0a'
  ctx.fillRect(x, y, w, PLATFORM_H)

  // Mid mortar line
  ctx.fillStyle = 'rgba(0,0,0,0.30)'
  ctx.fillRect(x, y + Math.floor(PLATFORM_H / 2), w, 1)

  // Vertical mortar every 32px
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'
  ctx.lineWidth = 1
  for (let mx = x + 32; mx < x + w; mx += 32) {
    ctx.beginPath(); ctx.moveTo(mx, y); ctx.lineTo(mx, y + PLATFORM_H); ctx.stroke()
  }

  // Amber rim light on top
  const g = ctx.createLinearGradient(0, y, 0, y + 3)
  g.addColorStop(0, 'rgba(200,120,40,0.45)')
  g.addColorStop(1, 'rgba(200,120,40,0)')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, 3)
}

// ─── Main draw ────────────────────────────────────────────────────────────────

const BG_TINTS = ['#040e08', '#040c0e', '#05080e', '#060a05', '#040808']

export function drawAboutSection(
  ctx: CanvasRenderingContext2D,
  sectionIdx: number,
  canvasW: number,
  canvasH: number
): void {
  const section  = SECTIONS[sectionIdx]
  if (!section) return

  const exitSide = EXIT_SIDE[sectionIdx]
  const floorY   = Math.round(canvasH * FLOOR_Y_FAC)
  const stepDefs = STEP_DEFS[sectionIdx] ?? []

  // Background
  ctx.fillStyle = BG_TINTS[sectionIdx] ?? '#040c08'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Side cave glows
  const lG = ctx.createRadialGradient(0, canvasH * 0.5, 0, 0, canvasH * 0.5, canvasW * 0.35)
  lG.addColorStop(0, 'rgba(20,110,65,0.18)'); lG.addColorStop(1, 'rgba(20,110,65,0)')
  ctx.fillStyle = lG; ctx.fillRect(0, 0, canvasW * 0.35, canvasH)

  const rG = ctx.createRadialGradient(canvasW, canvasH * 0.5, 0, canvasW, canvasH * 0.5, canvasW * 0.35)
  rG.addColorStop(0, 'rgba(20,110,65,0.14)'); rG.addColorStop(1, 'rgba(20,110,65,0)')
  ctx.fillStyle = rG; ctx.fillRect(canvasW * 0.65, 0, canvasW * 0.35, canvasH)

  // Progress indicator
  ctx.font = `400 12px 'Perpetua', serif`
  ctx.fillStyle = 'rgba(80,150,110,0.38)'
  ctx.textAlign = 'right'; ctx.textBaseline = 'top'
  ctx.fillText(`${sectionIdx + 1} / ${ABOUT_SECTION_COUNT}`, canvasW - 20, 20)

  // Title
  const titleFs = Math.max(22, Math.floor(canvasW * 0.034))
  ctx.font = `700 ${titleFs}px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(210,250,230,0.92)'
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'
  ctx.shadowColor = 'rgba(50,210,140,0.45)'; ctx.shadowBlur = 14
  ctx.fillText(section.title, canvasW / 2, canvasH * 0.08)
  ctx.shadowBlur = 0

  // Body lines
  const bodyFs = Math.max(15, Math.floor(canvasW * 0.019))
  ctx.font = `400 ${bodyFs}px 'Perpetua', serif`
  ctx.fillStyle = 'rgba(160,220,195,0.75)'; ctx.textBaseline = 'top'
  const lineH  = bodyFs * 1.75
  const startY = canvasH * 0.08 + titleFs * 1.4 + canvasH * 0.025
  section.lines.forEach((line, i) => {
    if (!line) return
    if (line.startsWith('↑')) {
      ctx.font = `400 ${Math.max(13, Math.floor(bodyFs * 0.85))}px 'Perpetua', serif`
      ctx.fillStyle = 'rgba(120,200,160,0.55)'
      ctx.shadowColor = 'rgba(50,190,130,0.30)'; ctx.shadowBlur = 6
    } else {
      ctx.font = `400 ${bodyFs}px 'Perpetua', serif`
      ctx.fillStyle = 'rgba(160,220,195,0.75)'
    }
    ctx.fillText(line, canvasW / 2, startY + i * lineH)
    ctx.shadowBlur = 0
  })
  ctx.textBaseline = 'alphabetic'

  // ── Brick steps ──
  stepDefs.forEach(s => {
    const sx = Math.round(canvasW * s.centreFrac - s.wPx / 2)
    const sy = Math.round(canvasH * s.yFrac)
    drawBrickStep(ctx, sx, sy, s.wPx)
  })

  // ── Main floor ──
  if (exitSide === null) {
    // Solid return floor
    ctx.fillStyle = '#1c3228'
    ctx.fillRect(0, floorY, canvasW, PLATFORM_H)
    ctx.fillStyle = 'rgba(60,210,140,0.28)'
    ctx.fillRect(0, floorY, canvasW, 2)

    const up = ctx.createLinearGradient(0, floorY - 60, 0, floorY)
    up.addColorStop(0, 'rgba(30,160,100,0)'); up.addColorStop(1, 'rgba(30,160,100,0.10)')
    ctx.fillStyle = up; ctx.fillRect(0, floorY - 60, canvasW, 60)
  } else {
    const gapW   = canvasW * FLOOR_GAP_W_FAC
    const floorX = exitSide === 'left' ? gapW : 0
    const floorW = canvasW - gapW

    ctx.fillStyle = '#1c3228'
    ctx.fillRect(floorX, floorY, floorW, PLATFORM_H)
    ctx.fillStyle = 'rgba(60,210,140,0.22)'
    ctx.fillRect(floorX, floorY, floorW, 2)

    // Downward ambient + arrow above exit gap
    const gapX = exitSide === 'left' ? 0 : canvasW * (1 - FLOOR_GAP_W_FAC)
    const gapCx = gapX + gapW / 2

    const dg = ctx.createLinearGradient(0, floorY, 0, floorY + 40)
    dg.addColorStop(0, 'rgba(20,140,80,0.12)'); dg.addColorStop(1, 'rgba(20,140,80,0)')
    ctx.fillStyle = dg; ctx.fillRect(gapX, floorY, gapW, 40)

    ctx.font = `400 ${Math.max(13, Math.floor(canvasW * 0.014))}px 'Perpetua', serif`
    ctx.fillStyle = 'rgba(100,185,140,0.45)'
    ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
    ctx.fillText('↓', gapCx, floorY - 8)
    ctx.textBaseline = 'alphabetic'
  }

  ctx.textAlign = 'left'
}
