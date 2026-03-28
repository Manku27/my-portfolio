// Full-screen image overlay — drawn on top of everything else.
// Returns the close-button rect so GameCanvas can handle clicks.

import { getImage, loadImage } from '@/utils/loadAssets'

export interface ViewerRects {
  close: { x: number; y: number; w: number; h: number }
}

export function drawImageViewer(
  ctx:    CanvasRenderingContext2D,
  W:      number,
  H:      number,
  src:    string,
): ViewerRects {
  // Ensure the image is loading if not yet cached
  const img = getImage(src)
  if (!img) loadImage(src).catch(() => {})

  // ── Dim overlay ──────────────────────────────────────────────────────────────
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.92)'
  ctx.fillRect(0, 0, W, H)

  // ── Image ────────────────────────────────────────────────────────────────────
  if (img && img.naturalWidth > 0) {
    const pad    = 72
    const maxW   = W - pad * 2
    const maxH   = H - pad * 2
    const aspect = img.naturalWidth / img.naturalHeight
    let drawW = maxW
    let drawH = drawW / aspect
    if (drawH > maxH) { drawH = maxH; drawW = drawH * aspect }
    const drawX = (W - drawW) / 2
    const drawY = (H - drawH) / 2

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(drawX, drawY, drawW, drawH, 8)
    ctx.clip()
    ctx.drawImage(img, drawX, drawY, drawW, drawH)
    ctx.restore()

    ctx.strokeStyle = 'rgba(80,180,140,0.45)'
    ctx.lineWidth   = 1
    ctx.beginPath()
    ctx.roundRect(drawX, drawY, drawW, drawH, 8)
    ctx.stroke()
  }

  // ── Close button (✕) — top-right ─────────────────────────────────────────────
  const BTN  = 38
  const MARGIN = 20
  const cx = W - BTN - MARGIN
  const cy = MARGIN

  ctx.fillStyle   = 'rgba(8,20,16,0.94)'
  ctx.strokeStyle = 'rgba(100,200,160,0.65)'
  ctx.lineWidth   = 1
  ctx.beginPath()
  ctx.roundRect(cx, cy, BTN, BTN, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle    = 'rgba(200,240,220,0.95)'
  ctx.font         = `400 18px 'Perpetua', serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('✕', cx + BTN / 2, cy + BTN / 2)
  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.restore()

  return { close: { x: cx, y: cy, w: BTN, h: BTN } }
}
