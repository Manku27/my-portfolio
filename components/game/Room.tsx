// Room rendering — draws a single room's background onto the canvas.
// roomIndex: 0 = work (left), 1 = spawn (centre), 2 = timeline (right)

const ROOM_LABELS = ['← Work', 'Spawn', 'Timeline →']
const ROOM_TINTS = ['#051010', '#050a0a', '#050d0a']

export function drawRoom(
  ctx: CanvasRenderingContext2D,
  roomIndex: number,
  canvasWidth: number,
  canvasHeight: number,
  groundY: number
): void {
  // Background
  ctx.fillStyle = ROOM_TINTS[roomIndex] ?? '#050a0a'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Ground plane
  ctx.fillStyle = '#1a3a3a'
  ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY)

  // Room label
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.font = '14px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(ROOM_LABELS[roomIndex] ?? `Room ${roomIndex}`, canvasWidth / 2, 32)
}
