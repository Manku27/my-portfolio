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

  // Ambient glow — drawn before sprite so it sits behind the character
  const centerX = x + CHARACTER_W / 2
  const centerY = destY + KNIGHT_COLLISION_H / 2

  // Outer soft halo
  const outerRadius = 160
  const outerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius)
  outerGlow.addColorStop(0,   'rgba(160,240,220,0.22)')
  outerGlow.addColorStop(0.4, 'rgba(160,240,220,0.12)')
  outerGlow.addColorStop(1,   'rgba(160,240,220,0)')
  ctx.fillStyle = outerGlow
  ctx.beginPath()
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
  ctx.fill()

  // Inner tight core
  const innerRadius = 55
  const innerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius)
  innerGlow.addColorStop(0,   'rgba(200,255,240,0.45)')
  innerGlow.addColorStop(0.5, 'rgba(180,240,225,0.20)')
  innerGlow.addColorStop(1,   'rgba(160,230,215,0)')
  ctx.fillStyle = innerGlow
  ctx.beginPath()
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
  ctx.fill()

  if (facingLeft) {
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, -(destX + destW), destY, destW, destH)
    ctx.restore()
  } else {
    ctx.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, destX, destY, destW, destH)
  }
}
