// Reusable Canvas 2D speech bubble.
// Draws above an anchor point with a pointer pointing down at it.
// Animated via `progress` (0=hidden → 1=fully open) — caller drives the lerp.
// Perpetua for body, Trajan Pro for title.

import { wrapText } from '@/utils/wrapText'
import type { WorkExperience, ConsultingEngagement, TimelineEntry } from '@/lib/types'

// ─── Content type ─────────────────────────────────────────────────────────────

export interface BubbleContent {
  title:       string
  role?:       string
  meta?:       string    // period · location
  description?: string
  bullets:     string[]
}

// ─── Converters ───────────────────────────────────────────────────────────────

export function workToBubble(w: WorkExperience): BubbleContent {
  return {
    title:       w.company,
    role:        w.role,
    meta:        `${w.period}  ·  ${w.location}`,
    description: w.companyDescription,
    bullets:     w.bullets,
  }
}

export function consultingToBubble(c: ConsultingEngagement): BubbleContent {
  return {
    title:       c.client,
    role:        'Consulting',
    meta:        `${c.period}  ·  ${c.location}`,
    description: c.clientDescription,
    bullets:     c.bullets,
  }
}

const CATEGORY_LABEL: Record<string, string> = {
  work:     'Career',
  personal: 'Personal',
  projects: 'Project',
  writing:  'Writing',
}

export function timelineToBubble(e: TimelineEntry): BubbleContent {
  return {
    title:       e.title,
    role:        CATEGORY_LABEL[e.category] ?? e.category,
    meta:        e.date.slice(0, 7).replace('-', ' / '),
    description: e.body,
    bullets:     e.tags ?? [],
  }
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

const PAD_X    = 40
const PAD_Y    = 32
const PTR_H    = 14
const CORNER_R = 12

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x,     y + h, x,     y + h - r, r)
  ctx.lineTo(x,     y + r)
  ctx.arcTo(x,     y,     x + r, y,         r)
  ctx.closePath()
}

interface TextLine {
  text:    string
  font:    string
  color:   string
  indent:  number
  lineH:   number   // vertical advance after this line
  isDivider?: boolean
}

export function drawSpeechBubble(
  ctx:      CanvasRenderingContext2D,
  anchorX:  number,   // screen X — tip of the pointer
  anchorY:  number,   // screen Y — tip of the pointer (building roof)
  content:  BubbleContent,
  progress: number,   // 0=hidden, 1=fully open
  canvasW:  number,
  canvasH:  number
): void {
  if (progress <= 0.01) return

  const bubbleW = Math.min(canvasW * 0.92, canvasW - 16)
  const innerW  = bubbleW - PAD_X * 2

  // Font sizes — scale gently with canvas width, min floor for small screens
  const titleFs  = Math.max(28, Math.round(canvasW * 0.022))
  const roleFs   = Math.max(18, Math.round(canvasW * 0.015))
  const metaFs   = Math.max(14, Math.round(canvasW * 0.012))
  const bulletFs = Math.max(16, Math.round(canvasW * 0.014))

  // ── Build line list ──────────────────────────────────────────────────────────
  const lines: TextLine[] = []

  lines.push({
    text:   content.title,
    font:   `700 ${titleFs}px 'Trajan Pro', serif`,
    color:  'rgba(220,195,110,0.97)',
    indent: 0,
    lineH:  titleFs * 1.55,
  })

  if (content.role) lines.push({
    text:   content.role,
    font:   `italic 400 ${roleFs}px 'Perpetua', serif`,
    color:  'rgba(200,225,205,0.88)',
    indent: 0,
    lineH:  roleFs * 1.6,
  })

  if (content.meta) lines.push({
    text:   content.meta,
    font:   `400 ${metaFs}px 'Perpetua', serif`,
    color:  'rgba(150,195,160,0.55)',
    indent: 0,
    lineH:  metaFs * 1.7,
  })

  if (content.description) {
    const descFont = `400 ${metaFs}px 'Perpetua', serif`
    ctx.font = descFont
    const wrappedDesc = wrapText(ctx, content.description, innerW)
    wrappedDesc.forEach(l => lines.push({
      text:   l,
      font:   descFont,
      color:  'rgba(150,190,155,0.50)',
      indent: 0,
      lineH:  metaFs * 1.7,
    }))
  }

  // Divider
  lines.push({ text: '', font: '', color: '', indent: 0, lineH: metaFs * 1.4, isDivider: true })

  // Bullets — all of them, wrapped to inner width
  const bulletFont = `400 ${bulletFs}px 'Perpetua', serif`
  ctx.font = bulletFont
  content.bullets.forEach(b => {
    const wrapped = wrapText(ctx, `· ${b}`, innerW - 8)
    wrapped.forEach((l, li) => lines.push({
      text:   l,
      font:   bulletFont,
      color:  'rgba(190,215,192,0.86)',
      indent: li > 0 ? bulletFs * 0.8 : 0,
      lineH:  bulletFs * 1.65,
    }))
  })

  // ── Geometry ─────────────────────────────────────────────────────────────────
  const contentH = lines.reduce((sum, l) => sum + l.lineH, 0)
  const naturalH = PAD_Y * 2 + contentH

  // Cap at 88% of canvas height — clip content if it overflows
  const maxBubbleH = canvasH * 0.88
  const bubbleH    = Math.min(naturalH, maxBubbleH)
  const clipped    = naturalH > maxBubbleH

  // Horizontal: centre over anchor, clamped to canvas
  let bx = anchorX - bubbleW / 2
  bx = Math.max(8, Math.min(canvasW - bubbleW - 8, bx))

  // Vertical: above anchor — clamp so bubble never goes above top of canvas
  const by = Math.max(8, anchorY - bubbleH - PTR_H - 6)

  // Pointer X: tracks anchorX, clamped inside bubble edges
  const ptrX = Math.min(Math.max(anchorX - bx, 24), bubbleW - 24)

  // ── Draw ─────────────────────────────────────────────────────────────────────
  ctx.save()
  ctx.globalAlpha = Math.min(1, progress)

  // Background
  ctx.fillStyle   = 'rgba(5,18,16,0.97)'
  ctx.strokeStyle = 'rgba(55,175,125,0.55)'
  ctx.lineWidth   = 1.5
  roundRect(ctx, bx, by, bubbleW, bubbleH, CORNER_R)
  ctx.fill()
  ctx.stroke()

  // Pointer — fill then outline two slanted edges
  ctx.fillStyle = 'rgba(5,18,16,0.97)'
  ctx.beginPath()
  ctx.moveTo(bx + ptrX - 10, by + bubbleH)
  ctx.lineTo(bx + ptrX + 10, by + bubbleH)
  ctx.lineTo(bx + ptrX,      by + bubbleH + PTR_H)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(55,175,125,0.55)'
  ctx.lineWidth   = 1.5
  ctx.beginPath()
  ctx.moveTo(bx + ptrX - 10, by + bubbleH)
  ctx.lineTo(bx + ptrX,      by + bubbleH + PTR_H)
  ctx.lineTo(bx + ptrX + 10, by + bubbleH)
  ctx.stroke()

  // Clip text to bubble interior
  ctx.beginPath()
  roundRect(ctx, bx + 1, by + 1, bubbleW - 2, bubbleH - (clipped ? 36 : 2), CORNER_R)
  ctx.clip()

  // Text — walk through line list
  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
  let ty = by + PAD_Y + lines[0].lineH * 0.78

  lines.forEach(line => {
    if (line.isDivider) {
      ctx.strokeStyle = 'rgba(55,155,100,0.22)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(bx + PAD_X,           ty - line.lineH * 0.35)
      ctx.lineTo(bx + bubbleW - PAD_X, ty - line.lineH * 0.35)
      ctx.stroke()
      ty += line.lineH
      return
    }
    ctx.font      = line.font
    ctx.fillStyle = line.color
    ctx.fillText(line.text, bx + PAD_X + line.indent, ty)
    ty += line.lineH
  })

  ctx.restore()

  // "More" fade indicator if content was clipped
  if (clipped) {
    ctx.save()
    ctx.globalAlpha = Math.min(1, progress) * 0.7
    const fadeY = by + bubbleH - 36
    const fade  = ctx.createLinearGradient(0, fadeY, 0, by + bubbleH - 4)
    fade.addColorStop(0, 'rgba(5,18,16,0)')
    fade.addColorStop(1, 'rgba(5,18,16,0.95)')
    ctx.fillStyle = fade
    ctx.fillRect(bx + 2, fadeY, bubbleW - 4, 34)

    ctx.font      = `400 ${metaFs}px 'Perpetua', serif`
    ctx.fillStyle = 'rgba(100,190,150,0.65)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('▼  scroll for more', bx + bubbleW / 2, by + bubbleH - 18)
    ctx.restore()
  }
}
