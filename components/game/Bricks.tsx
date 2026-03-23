// Bricks — interactive world objects in the spawn room.
// Character hits them from below while jumping; triggers a shake animation.
// Content is always visible — the hit is tactile feedback only, not a reveal.

export interface Brick {
  room: number        // which room (world room index)
  xFrac: number       // centre x as fraction of room width
  yFromGround: number // distance of brick TOP above ground
  w: number
  h: number
  shake: number       // shake timer (seconds remaining, counts down to 0)
}

// Bricks placed in spawn room (room 1).
// yFromGround chosen so they're hittable with a single jump (max ~235px).
const BRICK_DEFS: Omit<Brick, 'shake'>[] = [
  { room: 1, xFrac: 0.36, yFromGround: 140, w: 52, h: 20 },
  { room: 1, xFrac: 0.54, yFromGround: 200, w: 52, h: 20 },
  { room: 1, xFrac: 0.68, yFromGround: 155, w: 52, h: 20 },
]

export function initBricks(): Brick[] {
  return BRICK_DEFS.map(d => ({ ...d, shake: 0 }))
}

export function updateBricks(bricks: Brick[], delta: number): void {
  for (const brick of bricks) {
    if (brick.shake > 0) brick.shake = Math.max(0, brick.shake - delta)
  }
}

// Called after charY is updated by velocity, before ground clamp.
// Returns adjusted velY and charY when character's head hits a brick underside.
export function checkBrickCollisions(
  bricks: Brick[],
  charX: number,
  charY: number,
  velY: number,
  charW: number,
  groundY: number,
  canvasWidth: number
): { newVelY: number; newCharY: number } {
  if (velY >= 0) return { newVelY: velY, newCharY: charY }

  let newVelY  = velY
  let newCharY = charY

  for (const brick of bricks) {
    const bwx     = brick.room * canvasWidth + brick.xFrac * canvasWidth - brick.w / 2
    const bwy     = groundY - brick.yFromGround          // brick top
    const bBottom = bwy + brick.h                        // brick bottom

    const hOverlap   = charX + charW > bwx && charX < bwx + brick.w
    const vPenetrate = newCharY < bBottom && newCharY > bwy

    if (hOverlap && vPenetrate) {
      newVelY  = 0
      newCharY = bBottom  // push head down to brick underside
      if (brick.shake <= 0) brick.shake = 0.28
    }
  }

  return { newVelY, newCharY }
}

export function drawBricks(
  ctx: CanvasRenderingContext2D,
  bricks: Brick[],
  cameraX: number,
  groundY: number,
  canvasWidth: number
): void {
  for (const brick of bricks) {
    const bwxWorld = brick.room * canvasWidth + brick.xFrac * canvasWidth - brick.w / 2
    const screenX  = bwxWorld - cameraX
    const baseY    = groundY - brick.yFromGround

    // Shake: decaying oscillation — amplitude fades as shake timer counts down
    const shakeOffset = brick.shake > 0
      ? Math.sin(brick.shake * 90) * 4 * (brick.shake / 0.28)
      : 0
    const screenY = baseY + shakeOffset

    // Brick body
    ctx.fillStyle = '#2e1e10'
    ctx.fillRect(screenX, screenY, brick.w, brick.h)

    // Mortar lines — horizontal split + staggered verticals
    ctx.strokeStyle = 'rgba(200,150,70,0.22)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(screenX,            screenY + brick.h / 2)
    ctx.lineTo(screenX + brick.w,  screenY + brick.h / 2)
    ctx.moveTo(screenX + brick.w / 2,      screenY)
    ctx.lineTo(screenX + brick.w / 2,      screenY + brick.h / 2)
    ctx.moveTo(screenX + brick.w / 4,      screenY + brick.h / 2)
    ctx.lineTo(screenX + brick.w / 4,      screenY + brick.h)
    ctx.moveTo(screenX + brick.w * 3 / 4,  screenY + brick.h / 2)
    ctx.lineTo(screenX + brick.w * 3 / 4,  screenY + brick.h)
    ctx.stroke()

    // Amber rim light on top edge
    ctx.fillStyle = 'rgba(200,150,60,0.18)'
    ctx.fillRect(screenX, screenY, brick.w, 2)

    // Hit glow — fades with shake timer
    if (brick.shake > 0) {
      const alpha = (brick.shake / 0.28) * 0.20
      const cx    = screenX + brick.w / 2
      const cy    = screenY + brick.h / 2
      const glow  = ctx.createRadialGradient(cx, cy, 0, cx, cy, brick.w * 0.9)
      glow.addColorStop(0, `rgba(220,170,60,${alpha})`)
      glow.addColorStop(1, 'rgba(220,170,60,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, brick.w * 0.9, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
