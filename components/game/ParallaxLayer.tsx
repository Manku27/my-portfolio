// Three parallax depth layers drawn between background and ground.
//
// Factors (from game-design.md):
//   far  ~0.1  — barely moves
//   mid  ~0.4  — moderate
//   fore ~0.8  — fastest (drawn above ground, below character)

// ─── Far layer ────────────────────────────────────────────────────────────────

const FAR_TILE = 600

function drawFarLayer(
  ctx: CanvasRenderingContext2D,
  charX: number,
  w: number,
  h: number
): void {
  const factor = 0.1
  const offset = ((charX * factor) % FAR_TILE + FAR_TILE) % FAR_TILE

  ctx.fillStyle = 'rgba(10,40,40,0.55)'

  const copies = Math.ceil(w / FAR_TILE) + 2
  for (let copy = -1; copy < copies; copy++) {
    const base = copy * FAR_TILE - offset
    ctx.beginPath()
    ctx.moveTo(base, h * 0.55)
    ctx.lineTo(base + 80,  h * 0.30)
    ctx.lineTo(base + 180, h * 0.48)
    ctx.lineTo(base + 300, h * 0.28)
    ctx.lineTo(base + 420, h * 0.45)
    ctx.lineTo(base + FAR_TILE, h * 0.55)
    ctx.lineTo(base + FAR_TILE, 0)
    ctx.lineTo(base, 0)
    ctx.closePath()
    ctx.fill()
  }
}

// ─── Mid layer ─────────────────────────────────────────────────────────────────

const MID_TILE = 480

function drawMidLayer(
  ctx: CanvasRenderingContext2D,
  charX: number,
  w: number,
  h: number,
  groundY: number
): void {
  const factor = 0.4
  const offset = ((charX * factor) % MID_TILE + MID_TILE) % MID_TILE

  ctx.fillStyle = 'rgba(8,30,28,0.70)'

  const copies = Math.ceil(w / MID_TILE) + 2
  for (let copy = -1; copy < copies; copy++) {
    const base = copy * MID_TILE - offset
    ctx.fillRect(base + 40,  groundY - 160, 50, 160)
    ctx.fillRect(base + 160, groundY - 90,  90,  90)
    ctx.fillRect(base + 320, groundY - 200, 30, 200)
    ctx.fillRect(base + 310, groundY - 220, 50,  24)
  }
}

// ─── Foreground layer ─────────────────────────────────────────────────────────
// Each stalk type has its own lerp rate and sway amplitude.
// swayValues[i] is maintained externally (one lerped value per stalk type).

const FORE_TILE = 320

// Per-stalk config — exported so GameCanvas can maintain independent lerp state
export const STALK_CONFIGS = [
  { lerpRate: 0.035, amplitude: 1.0  }, // A — slowest, full sway
  { lerpRate: 0.08,  amplitude: 0.55 }, // B — faster, less sway
  { lerpRate: 0.055, amplitude: 1.25 }, // C — medium, more sway
  { lerpRate: 0.12,  amplitude: 0.4  }, // D — fastest, minimal sway
] as const

export const MAX_SWAY = 14 // px — base amplitude, scaled by each stalk's amplitude

function drawForeLayer(
  ctx: CanvasRenderingContext2D,
  charX: number,
  w: number,
  groundY: number,
  swayValues: number[]
): void {
  const factor = 0.8
  const offset = ((charX * factor) % FORE_TILE + FORE_TILE) % FORE_TILE
  const [swA, swB, swC, swD] = swayValues

  ctx.fillStyle = 'rgba(5,20,18,0.85)'

  const copies = Math.ceil(w / FORE_TILE) + 2
  for (let copy = -1; copy < copies; copy++) {
    const base = copy * FORE_TILE - offset
    // Stalk A
    ctx.fillRect(base + 20 + swA,  groundY - 55, 5, 55)
    ctx.fillRect(base + 10 + swA,  groundY - 70, 24, 18)
    // Stalk B
    ctx.fillRect(base + 110 + swB, groundY - 40, 4, 40)
    ctx.fillRect(base + 103 + swB, groundY - 52, 18, 14)
    // Stalk C
    ctx.fillRect(base + 220 + swC, groundY - 65, 5, 65)
    ctx.fillRect(base + 210 + swC, groundY - 80, 26, 18)
    // Stalk D
    ctx.fillRect(base + 290 + swD, groundY - 35, 4, 35)
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function drawParallaxBackground(
  ctx: CanvasRenderingContext2D,
  charX: number,
  canvasW: number,
  canvasH: number,
  groundY: number
): void {
  drawFarLayer(ctx, charX, canvasW, canvasH)
  drawMidLayer(ctx, charX, canvasW, canvasH, groundY)
}

export function drawParallaxForeground(
  ctx: CanvasRenderingContext2D,
  charX: number,
  canvasW: number,
  groundY: number,
  swayValues: number[]
): void {
  drawForeLayer(ctx, charX, canvasW, groundY, swayValues)
}
