// Ambient particle system — sparse wisps for the spawn room atmosphere.
// Spec (game-design.md):
//   - 20-30 total, mostly still
//   - Variable sizes: a few large ghost wisps, medium motes, near-invisible specks
//   - Cold white and faint teal — not blue-grey
//   - Large portions of screen remain pure dark

export type Particle = {
  xNorm: number   // 0–1 normalised X (multiply by canvas width each frame)
  yNorm: number   // 0–1 normalised Y (multiply by canvas height)
  radius: number
  opacity: number
  r: number; g: number; b: number // base colour
  phase: number   // sine drift phase offset
  freq: number    // drift oscillation frequency (rad/s)
  amp: number     // drift amplitude (px)
}

// Particle tiers
const LARGE_COUNT  = 4   // large ghost wisps
const MEDIUM_COUNT = 8   // medium motes
const SPECK_COUNT  = 14  // near-invisible specks
export const PARTICLE_COUNT = LARGE_COUNT + MEDIUM_COUNT + SPECK_COUNT

// Cold white and faint teal — two colour variants
const COLD_WHITE: [number,number,number] = [230, 255, 248]
const FAINT_TEAL: [number,number,number] = [60,  200, 150]

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function createParticles(): Particle[] {
  const particles: Particle[] = []

  // Large wisps — upper half of screen, spread out
  for (let i = 0; i < LARGE_COUNT; i++) {
    const isTeal = Math.random() > 0.5
    const [r, g, b] = isTeal ? FAINT_TEAL : COLD_WHITE
    particles.push({
      xNorm:   rand(0.05, 0.95),
      yNorm:   rand(0.05, 0.55),
      radius:  rand(7, 13),
      opacity: rand(0.30, 0.50),
      r, g, b,
      phase: rand(0, Math.PI * 2),
      freq:  rand(0.15, 0.35),
      amp:   rand(1.5, 3.5),
    })
  }

  // Medium motes — anywhere above ground (top 80%)
  for (let i = 0; i < MEDIUM_COUNT; i++) {
    const isTeal = Math.random() > 0.4
    const [r, g, b] = isTeal ? FAINT_TEAL : COLD_WHITE
    particles.push({
      xNorm:   rand(0.02, 0.98),
      yNorm:   rand(0.08, 0.80),
      radius:  rand(1.5, 3.5),
      opacity: rand(0.15, 0.28),
      r, g, b,
      phase: rand(0, Math.PI * 2),
      freq:  rand(0.20, 0.55),
      amp:   rand(0.8, 2.0),
    })
  }

  // Specks — entire screen, very faint
  for (let i = 0; i < SPECK_COUNT; i++) {
    const [r, g, b] = Math.random() > 0.5 ? FAINT_TEAL : COLD_WHITE
    particles.push({
      xNorm:   rand(0.01, 0.99),
      yNorm:   rand(0.03, 0.92),
      radius:  rand(0.4, 1.2),
      opacity: rand(0.04, 0.12),
      r, g, b,
      phase: rand(0, Math.PI * 2),
      freq:  rand(0.30, 0.80),
      amp:   rand(0.3, 1.0),
    })
  }

  return particles
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  canvasW: number,
  canvasH: number,
  time: number   // seconds — used for drift
): void {
  for (const p of particles) {
    const x = p.xNorm * canvasW
    // Gentle vertical sine drift — imperceptible at rest
    const y = p.yNorm * canvasH + Math.sin(time * p.freq + p.phase) * p.amp

    if (p.radius >= 5) {
      // Large wisp — soft radial gradient glow
      const grd = ctx.createRadialGradient(x, y, 0, x, y, p.radius * 3)
      grd.addColorStop(0,   `rgba(${p.r},${p.g},${p.b},${p.opacity})`)
      grd.addColorStop(0.4, `rgba(${p.r},${p.g},${p.b},${p.opacity * 0.4})`)
      grd.addColorStop(1,   `rgba(${p.r},${p.g},${p.b},0)`)
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(x, y, p.radius * 3, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Small particle — simple filled circle
      ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`
      ctx.beginPath()
      ctx.arc(x, y, p.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
