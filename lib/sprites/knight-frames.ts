// ============================================================
// lib/sprites/knight-frames.ts
//
// Pre-computed frame coordinates for the Knight sprite sheet.
// Source: public/sprites/knight.webp (1024x1024, RGBA, transparent bg)
//
// Computed by analysing alpha channel pixel boundaries.
// Each frame: { x, y, w, h } — pixel coordinates in the source image.
//
// Usage in Canvas 2D:
//   ctx.drawImage(spriteSheet, frame.x, frame.y, frame.w, frame.h,
//                 destX, destY, destW, destH)
//
// Walk left = draw walk right frames with ctx.scale(-1, 1)
// ============================================================

export interface SpriteFrame {
  x: number
  y: number
  w: number
  h: number
}

// ------------------------------------------------------------
// Walk right — 9 frames, y=0, h=79
// Plays at ~10 fps for a natural walk feel
// ------------------------------------------------------------
export const WALK_FRAMES: SpriteFrame[] = [
  { x: 22,  y: 0, w: 39, h: 79 },
  { x: 100, y: 0, w: 46, h: 79 },
  { x: 182, y: 0, w: 46, h: 79 },
  { x: 257, y: 0, w: 47, h: 79 },
  { x: 340, y: 0, w: 47, h: 79 },
  { x: 413, y: 0, w: 53, h: 79 },
  { x: 491, y: 0, w: 53, h: 79 },
  { x: 577, y: 0, w: 46, h: 79 },
  { x: 659, y: 0, w: 46, h: 79 },
]

// ------------------------------------------------------------
// Idle — 7 frames, y=639, h=78
// Plays at ~6 fps for a slow breathing idle
// ------------------------------------------------------------
export const IDLE_FRAMES: SpriteFrame[] = [
  { x: 22,  y: 639, w: 39, h: 78 },
  { x: 101, y: 639, w: 43, h: 78 },
  { x: 180, y: 639, w: 38, h: 78 },
  { x: 263, y: 639, w: 43, h: 78 },
  { x: 341, y: 639, w: 38, h: 78 },
  { x: 421, y: 639, w: 42, h: 78 },
  { x: 502, y: 639, w: 39, h: 78 },
]

// ------------------------------------------------------------
// Jump — 10 frames, y=561, h=72
// Character rising with cloak spreading wide.
// Play frames 0-4 on the way up (rising).
// Hold frame 5 at apex.
// Play frames 6-9 on the way down (falling).
// All frames are uniform 50px wide — clean and consistent.
// ------------------------------------------------------------
export const JUMP_FRAMES: SpriteFrame[] = [
  { x: 16,  y: 717, w: 50, h: 72 },
  { x: 95,  y: 717, w: 50, h: 72 },
  { x: 177, y: 717, w: 50, h: 72 },
  { x: 256, y: 717, w: 50, h: 72 },
  { x: 338, y: 717, w: 50, h: 72 },
  { x: 417, y: 717, w: 50, h: 72 },
  { x: 496, y: 717, w: 50, h: 72 },
  { x: 575, y: 717, w: 50, h: 72 },
  { x: 657, y: 717, w: 50, h: 72 },
  { x: 736, y: 717, w: 46, h: 72 },
]

// ------------------------------------------------------------
// Land — use first idle frame as the landing pose
// Hold for 2 frames then transition to idle loop
// ------------------------------------------------------------
export const LAND_FRAME: SpriteFrame = { x: 22, y: 639, w: 39, h: 78 }

// ------------------------------------------------------------
// Animation state config
// fps  = frames per second for this animation
// loop = whether to loop or hold last frame
// ------------------------------------------------------------
export const ANIM_CONFIG = {
  idle: { frames: IDLE_FRAMES, fps: 6,  loop: true  },
  walk: { frames: WALK_FRAMES, fps: 10, loop: true  },
  jump: { frames: JUMP_FRAMES, fps: 10, loop: false },
  land: { frames: [LAND_FRAME], fps: 8, loop: false },
} as const

export type AnimationState = keyof typeof ANIM_CONFIG

// ------------------------------------------------------------
// Sprite sheet path — served from public/
// ------------------------------------------------------------
export const KNIGHT_SPRITE_PATH = '/sprites/knight.webp'

// ------------------------------------------------------------
// Render dimensions
// Source frames are ~50px wide. Scale up for visibility.
// Collision box is fixed regardless of frame width variance.
// ------------------------------------------------------------
export const KNIGHT_RENDER_HEIGHT = 80   // px — display height
export const KNIGHT_COLLISION_W   = 32   // px — hitbox width
export const KNIGHT_COLLISION_H   = 72   // px — hitbox height
