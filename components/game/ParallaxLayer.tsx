// Three parallax depth layers drawn between background and ground.
//
// Factors (from game-design.md):
//   far  ~0.1  — barely moves
//   mid  ~0.4  — moderate
//   fore ~0.8  — fastest (drawn above ground, below character)

// ─── Far layer — volumetric cave-light bloom ──────────────────────────────────
// A single large radial gradient that shifts very slightly with the character,
// giving the impression of a fixed light source deep inside the cave.

function drawFarLayer(
  ctx: CanvasRenderingContext2D,
  charX: number,
  w: number,
  h: number
): void {
  // Bloom centre drifts gently with character (factor 0.03 — barely perceptible)
  const bloomX = w * 0.5 + charX * 0.03
  const bloomY = h * 0.58
  const radius  = w * 0.75

  const bloom = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, radius)
  bloom.addColorStop(0.00, 'rgba(55,175,150,0.40)')
  bloom.addColorStop(0.25, 'rgba(30,120,110,0.28)')
  bloom.addColorStop(0.55, 'rgba(12, 60, 75,0.15)')
  bloom.addColorStop(1.00, 'rgba( 4, 10, 20,0)')

  ctx.fillStyle = bloom
  ctx.beginPath()
  ctx.arc(bloomX, bloomY, radius, 0, Math.PI * 2)
  ctx.fill()
}

// ─── Mid layer — hanging vine silhouettes ──────────────────────────────────────
// Organic bezier-tapered vines hanging from the top of the screen.
// Dark near-black silhouettes read against the bloom light behind them.

const MID_TILE = 480

// Vine definitions within one tile — [rootX, width, height, curvature]
// rootX / width in px (within tile), height in px from top of screen.
// curvature controls how far the bezier control points bow outward.
const VINES = [
  { x:  30, w: 52, h: 210, bow:  14 },
  { x: 100, w: 32, h: 145, bow:   9 },
  { x: 160, w: 68, h: 255, bow:  18 },
  { x: 245, w: 28, h: 118, bow:   7 },
  { x: 290, w: 46, h: 185, bow:  12 },
  { x: 360, w: 36, h: 230, bow:  10 },
  { x: 420, w: 58, h: 160, bow:  15 },
] as const

function drawMidLayer(
  ctx: CanvasRenderingContext2D,
  charX: number,
  w: number,
  _h: number,
  _groundY: number
): void {
  const factor = 0.25
  const offset = ((charX * factor) % MID_TILE + MID_TILE) % MID_TILE

  ctx.fillStyle = 'rgba(5,15,20,0.85)'

  const copies = Math.ceil(w / MID_TILE) + 2
  for (let copy = -1; copy < copies; copy++) {
    const tileLeft = copy * MID_TILE - offset

    for (const v of VINES) {
      const rx = tileLeft + v.x          // root left edge
      const tipW = Math.max(4, v.w * 0.18)  // taper to a narrow tip

      ctx.beginPath()
      // Top-left corner → bottom-left (tapered), bezier in
      ctx.moveTo(rx, 0)
      ctx.bezierCurveTo(
        rx - v.bow, v.h * 0.35,
        rx + (v.w - tipW) / 2 - v.bow * 0.5, v.h * 0.72,
        rx + (v.w - tipW) / 2, v.h
      )
      // Tip across
      ctx.lineTo(rx + (v.w + tipW) / 2, v.h)
      // Bottom-right → top-right (tapered), bezier out
      ctx.bezierCurveTo(
        rx + (v.w + tipW) / 2 + v.bow * 0.5, v.h * 0.72,
        rx + v.w + v.bow, v.h * 0.35,
        rx + v.w, 0
      )
      ctx.closePath()
      ctx.fill()
    }
  }
}

// ─── Foreground layer ─────────────────────────────────────────────────────────
// Each stalk type has its own lerp rate and sway amplitude.
// swayValues[i] is maintained externally (one lerped value per stalk type).

const FORE_TILE = 320

export interface GrassImages {
  a: HTMLImageElement | null  // grass_01_idle0000.png — tall leafy
  b: HTMLImageElement | null  // grass_03_idle0015.png — thin stalk
  c: HTMLImageElement | null  // simple_grass0007.png  — blade cluster
}

// Wind sway — time-based sin oscillation, different freq/phase per position
const WIND = [
  { freq: 0.65, phase: 0.0,  amp: 7  },  // A — slow, wide
  { freq: 1.05, phase: 1.3,  amp: 5  },  // B — faster, modest
  { freq: 0.85, phase: 2.5,  amp: 9  },  // C — medium, wider
  { freq: 1.25, phase: 0.7,  amp: 4  },  // D — fastest, narrow
] as const

function drawForeLayer(
  ctx: CanvasRenderingContext2D,
  w: number,
  groundY: number,
  time: number,
  grassImgs?: GrassImages
): void {
  // factor = 0 → plants are fixed to screen; no shift as character walks
  const swA = Math.sin(time * WIND[0].freq + WIND[0].phase) * WIND[0].amp
  const swB = Math.sin(time * WIND[1].freq + WIND[1].phase) * WIND[1].amp
  const swC = Math.sin(time * WIND[2].freq + WIND[2].phase) * WIND[2].amp
  const swD = Math.sin(time * WIND[3].freq + WIND[3].phase) * WIND[3].amp

  // Pre-compute sprite draw dimensions (outside tile loop for efficiency)
  const dA = grassImgs?.a ? {
    h: 72,
    w: Math.round(grassImgs.a.naturalWidth * 72 / (grassImgs.a.naturalHeight || 1)) || 32,
  } : null
  const dB = grassImgs?.b ? {
    h: 56,
    w: Math.round(grassImgs.b.naturalWidth * 56 / (grassImgs.b.naturalHeight || 1)) || 22,
  } : null
  const dC = grassImgs?.c ? {
    h: 52,
    w: Math.round(grassImgs.c.naturalWidth * 52 / (grassImgs.c.naturalHeight || 1)) || 42,
  } : null

  const copies = Math.ceil(w / FORE_TILE) + 2
  for (let copy = -1; copy < copies; copy++) {
    const base = copy * FORE_TILE

    // Position A
    if (dA && grassImgs?.a) {
      ctx.drawImage(grassImgs.a, base + 20 + swA - dA.w / 2, groundY - dA.h, dA.w, dA.h)
    } else {
      ctx.fillStyle = 'rgba(5,20,18,0.85)'
      ctx.fillRect(base + 20 + swA,  groundY - 55, 5, 55)
      ctx.fillRect(base + 10 + swA,  groundY - 70, 24, 18)
    }

    // Position B
    if (dB && grassImgs?.b) {
      ctx.drawImage(grassImgs.b, base + 110 + swB - dB.w / 2, groundY - dB.h, dB.w, dB.h)
    } else {
      ctx.fillStyle = 'rgba(5,20,18,0.85)'
      ctx.fillRect(base + 110 + swB, groundY - 40, 4, 40)
      ctx.fillRect(base + 103 + swB, groundY - 52, 18, 14)
    }

    // Position C
    if (dC && grassImgs?.c) {
      ctx.drawImage(grassImgs.c, base + 220 + swC - dC.w / 2, groundY - dC.h, dC.w, dC.h)
    } else {
      ctx.fillStyle = 'rgba(5,20,18,0.85)'
      ctx.fillRect(base + 220 + swC, groundY - 65, 5, 65)
      ctx.fillRect(base + 210 + swC, groundY - 80, 26, 18)
    }

    // Position D (reuses grassC sprite)
    if (dC && grassImgs?.c) {
      ctx.drawImage(grassImgs.c, base + 290 + swD - dC.w / 2, groundY - dC.h, dC.w, dC.h)
    } else {
      ctx.fillStyle = 'rgba(5,20,18,0.85)'
      ctx.fillRect(base + 290 + swD, groundY - 35, 4, 35)
    }
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
  canvasW: number,
  groundY: number,
  time: number,
  grassImgs?: GrassImages
): void {
  drawForeLayer(ctx, canvasW, groundY, time, grassImgs)
}
