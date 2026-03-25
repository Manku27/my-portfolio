import { type SpriteFrame, KNIGHT_COLLISION_W, KNIGHT_COLLISION_H, KNIGHT_RENDER_HEIGHT } from '@/lib/sprites/knight-frames'

export const CHARACTER_W = KNIGHT_COLLISION_W
export const CHARACTER_H = KNIGHT_COLLISION_H

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  sheet: HTMLImageElement | null,
  frame: SpriteFrame,
  facingLeft: boolean
): void {
  if (!sheet) {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x, y, CHARACTER_W, CHARACTER_H)
    return
  }

  const destH = KNIGHT_RENDER_HEIGHT
  const destW = Math.round(frame.w * (KNIGHT_RENDER_HEIGHT / frame.h))
  // Centre horizontally on collision box; align feet at bottom of hitbox
  const destX = x + (CHARACTER_W - destW) / 2
  const destY = y + CHARACTER_H - KNIGHT_RENDER_HEIGHT

  if (facingLeft) {
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, -(destX + destW), destY, destW, destH)
    ctx.restore()
  } else {
    ctx.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, destX, destY, destW, destH)
  }
}
