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
// Three-step staircase leading up to the name platform.
// At 1280×720 the name top sits ~498px above ground (canvasH*0.25 - fontSize*0.5
// where fontSize = canvasW*0.042). Jump height with JUMP_VEL=920, GRAVITY=1800 = 235px.
//   Ground  → step 1: 140px jump  ✓
//   step 1  → step 2: 120px jump  ✓
//   step 2  → step 3: 100px jump  ✓
//   step 3  → name:   ~138px jump ✓  (name at ~498, step 3 at 360)
const BRICK_DEFS: Omit<Brick, 'shake'>[] = [
  { room: 1, xFrac: 0.30, yFromGround: 170, w: 80, h: 20 },  // step 1 — easy first hop
  { room: 1, xFrac: 0.42, yFromGround: 290, w: 80, h: 20 },  // step 2 — mid
  { room: 1, xFrac: 0.55, yFromGround: 390, w: 80, h: 20 },  // step 3 — just below name
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
  charH: number,
  groundY: number,
  canvasWidth: number
): { newVelY: number; newCharY: number; landed: boolean } {
  let newVelY  = velY
  let newCharY = charY
  let landed   = false

  for (const brick of bricks) {
    const bwx     = brick.room * canvasWidth + brick.xFrac * canvasWidth - brick.w / 2
    const bwy     = groundY - brick.yFromGround   // brick top
    const bBottom = bwy + brick.h                 // brick bottom

    const hOverlap = charX + charW > bwx && charX < bwx + brick.w

    // Head hits underside going UP — block and shake
    if (newVelY < 0 && hOverlap) {
      if (newCharY < bBottom && newCharY > bwy) {
        newVelY  = 0
        newCharY = bBottom
        if (brick.shake <= 0) brick.shake = 0.28
      }
    }

    // Feet land on top going DOWN — block and land
    if (newVelY > 0 && hOverlap) {
      const feet = newCharY + charH
      if (feet >= bwy && feet < bBottom) {
        newVelY  = 0
        newCharY = bwy - charH
        landed   = true
      }
    }
  }

  return { newVelY, newCharY, landed }
}

export function drawBricks(
  ctx: CanvasRenderingContext2D,
  bricks: Brick[],
  cameraX: number,
  groundY: number,
  canvasWidth: number,
  platImg?: HTMLImageElement | null
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

    if (platImg && brick.room === 1) {
      // Sprite platform — scale up on larger screens; centre visual on collision box
      const uiScale = Math.min(1.4, Math.max(1.0, canvasWidth / 1200))
      const vW  = Math.round(brick.w * uiScale)
      const drawH = Math.round(platImg.naturalHeight * vW / (platImg.naturalWidth || vW)) || 40
      const vX  = screenX - Math.round((vW - brick.w) / 2)
      ctx.drawImage(platImg, vX, screenY, vW, drawH)
    } else {
      // Code-drawn fallback
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
    }

    // Hit glow — drawn on top regardless of sprite/code path
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
