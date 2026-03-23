export const CHARACTER_W = 32
export const CHARACTER_H = 48

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, CHARACTER_W, CHARACTER_H)
}
