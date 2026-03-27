// Reusable Canvas 2D dialogue box — Hollow Knight style.
// Fixed top-of-canvas panel, full width, ornament borders.
// Animated via `progress` (0=hidden → 1=fully open) — caller drives the lerp.
// Perpetua for body, Trajan Pro for title and role.

import { wrapText } from '@/utils/wrapText'
import { getImage } from '@/utils/loadAssets'
import type { WorkExperience, ConsultingEngagement, TimelineEntry, Project } from '@/lib/types'

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

export function pavilionToBubble(
  projects: Project[],
  consultingEngagements: { client: string; clientDescription: string; period: string; location: string; bullets: string[] }[]
): BubbleContent {
  const bullets: string[] = []

  // Consulting first
  for (const c of consultingEngagements) {
    bullets.push(`${c.client} — ${c.clientDescription}`)
    bullets.push(...c.bullets)
  }

  // Projects
  for (const p of projects) {
    bullets.push(`${p.name} — ${p.description}`)
  }

  return {
    title:   'Personal Projects & Consulting',
    role:    'Side work, open source, and independent builds',
    bullets,
  }
}

// ─── Scroll button rects (module-level cache, updated each draw frame) ────────

interface BtnRect { x: number; y: number; w: number; h: number }

export interface BubbleBtnRects {
  up:   BtnRect
  down: BtnRect
}

let _lastBtnRects: BubbleBtnRects | null = null

/** Returns the last-drawn scroll button rects — call after drawSpeechBubble. */
export function getLastBubbleBtnRects(): BubbleBtnRects | null {
  return _lastBtnRects
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

const PAD_X      = 72
const PAD_Y      = 20
const TOP_MARGIN = 80

const TOP_SPRITE = '/sprites/Controller_Dialogue_0000_top.png'
const BOT_SPRITE = '/sprites/Controller_Dialogue_0001_bot.png'

export function drawSpeechBubble(
  ctx:     CanvasRenderingContext2D,
  content: BubbleContent,
  progress: number,
  canvasW: number,
  canvasH: number,
  page:    number = 0,
): void {
  if (progress <= 0.01) return

  const alpha = Math.min(1, progress)

  // Ornament sprites
  const topImg = getImage(TOP_SPRITE)
  const botImg = getImage(BOT_SPRITE)

  // Scale ornaments to a target height, maintain aspect ratio, centre horizontally
  const ornH = Math.round(canvasH * 0.055)
  const topW = topImg ? Math.round(topImg.naturalWidth * ornH / (topImg.naturalHeight || 1)) : canvasW
  const botW = botImg ? Math.round(botImg.naturalWidth * ornH / (botImg.naturalHeight || 1)) : canvasW
  const topX = (canvasW - topW) / 2
  const botX = (canvasW - botW) / 2

  // Font sizes — scale with canvas width
  const titleFs  = Math.max(32, Math.round(canvasW * 0.026))
  const roleFs   = Math.max(15, Math.round(canvasW * 0.013))
  const metaFs   = Math.max(13, Math.round(canvasW * 0.011))
  const bulletFs = Math.max(14, Math.round(canvasW * 0.013))

  const innerW = canvasW - PAD_X * 2

  // ── Build body lines ─────────────────────────────────────────────────────────
  interface TextLine {
    text:      string
    font:      string
    color:     string
    indent:    number
    lineH:     number
    isDivider?: boolean
    glow?:     boolean
  }

  const bodyLines: TextLine[] = []

  if (content.role) bodyLines.push({
    text:   content.role,
    font:   `italic 400 ${roleFs}px 'Perpetua', serif`,
    color:  'rgba(255,255,255,0.92)',
    indent: 0,
    lineH:  roleFs * 1.55,
    glow:   true,
  })

  if (content.meta) bodyLines.push({
    text:   content.meta,
    font:   `400 ${metaFs}px 'Perpetua', serif`,
    color:  'rgba(200,220,215,0.60)',
    indent: 0,
    lineH:  metaFs * 1.6,
  })

  if (content.description) {
    const descFont = `400 ${metaFs}px 'Perpetua', serif`
    ctx.font = descFont
    const wrapped = wrapText(ctx, content.description, innerW)
    wrapped.forEach(l => bodyLines.push({
      text:   l,
      font:   descFont,
      color:  'rgba(220,235,230,0.72)',
      indent: 0,
      lineH:  metaFs * 1.6,
    }))
  }

  if (content.bullets.length > 0) {
    bodyLines.push({ text: '', font: '', color: '', indent: 0, lineH: metaFs * 1.2, isDivider: true })
    const bulletFont = `400 ${bulletFs}px 'Perpetua', serif`
    ctx.font = bulletFont
    content.bullets.forEach(b => {
      const wrapped = wrapText(ctx, `· ${b}`, innerW - 8)
      wrapped.forEach((l, li) => bodyLines.push({
        text:   l,
        font:   bulletFont,
        color:  'rgba(240,248,244,0.90)',
        indent: li > 0 ? bulletFs * 0.8 : bulletFs * 0.6,
        lineH:  bulletFs * 1.6,
        glow:   true,
      }))
    })
  }

  const bodyH = bodyLines.reduce((s, l) => s + l.lineH, 0)

  // Total inner content height: body only (title renders below box)
  const innerH        = PAD_Y + bodyH
  const maxBoxH       = canvasH * 0.55
  const boxH          = Math.min(Math.max(canvasH * 0.42, PAD_Y * 2 + innerH + ornH * 2), maxBoxH)
  const availableH = boxH - ornH * 2 - PAD_Y * 2

  // Split bodyLines into pages by available height
  const pages: TextLine[][] = []
  let curPage: TextLine[]   = []
  let curH = 0
  for (const line of bodyLines) {
    if (curH + line.lineH > availableH && curPage.length > 0) {
      pages.push(curPage)
      curPage = []
      curH    = 0
    }
    curPage.push(line)
    curH += line.lineH
  }
  if (curPage.length > 0) pages.push(curPage)

  const maxPage     = Math.max(0, pages.length - 1)
  const clampedPage = Math.max(0, Math.min(page, maxPage))
  const pageLines   = pages[clampedPage] ?? []
  const multiPage   = pages.length > 1

  // No slide — fixed position, fade in via globalAlpha only
  const slideY = TOP_MARGIN

  ctx.save()
  ctx.globalAlpha = alpha

  // 1. Background
  ctx.fillStyle = 'rgba(4,10,8,0.82)'
  ctx.fillRect(0, slideY, canvasW, boxH)

  // 2. Top ornament — scaled to ornH, centred
  if (topImg) {
    ctx.drawImage(topImg, topX, slideY, topW, ornH)
  } else {
    ctx.strokeStyle = 'rgba(55,170,115,0.45)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, slideY + ornH); ctx.lineTo(canvasW, slideY + ornH)
    ctx.stroke()
  }

  // 4. Bottom ornament — scaled to ornH, centred
  if (botImg) {
    ctx.drawImage(botImg, botX, slideY + boxH - ornH, botW, ornH)
  } else {
    ctx.strokeStyle = 'rgba(55,170,115,0.45)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, slideY + boxH - ornH); ctx.lineTo(canvasW, slideY + boxH - ornH)
    ctx.stroke()
  }

  // Clip to box interior (excluding ornaments)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, slideY + ornH, canvasW, boxH - ornH * 2)
  ctx.clip()

  // 3. Body text — starts at boxTop + ornH + PAD_Y
  const contentTop = slideY + ornH + PAD_Y

  // Body lines — current page only
  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
  let ty = contentTop + (pageLines[0]?.lineH ?? 0) * 0.78

  pageLines.forEach(line => {
    if (line.isDivider) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(PAD_X,           ty - line.lineH * 0.35)
      ctx.lineTo(canvasW - PAD_X, ty - line.lineH * 0.35)
      ctx.stroke()
      ty += line.lineH
      return
    }
    if (line.glow) {
      ctx.shadowColor = 'rgba(160,240,210,0.35)'
      ctx.shadowBlur  = 6
    }
    ctx.font      = line.font
    ctx.fillStyle = line.color
    ctx.fillText(line.text, PAD_X + line.indent, ty)
    if (line.glow) {
      ctx.shadowBlur = 0
    }
    ty += line.lineH
  })

  ctx.restore() // end clip

  // Pagination buttons + indicator — only when multi-page
  if (multiPage) {
    const BTN_W   = 72
    const BTN_H   = 28
    const BTN_GAP = 8
    const btnY    = slideY + boxH - ornH - BTN_H - 8
    const downX   = canvasW - PAD_X - BTN_W
    const upX     = downX - BTN_GAP - BTN_W

    // Cache rects for click detection in GameCanvas
    _lastBtnRects = {
      up:   { x: upX,   y: btnY, w: BTN_W, h: BTN_H },
      down: { x: downX, y: btnY, w: BTN_W, h: BTN_H },
    }

    const drawBtn = (rect: BtnRect, label: string, enabled: boolean) => {
      ctx.globalAlpha  = alpha * (enabled ? 0.92 : 0.22)
      ctx.fillStyle    = 'rgba(8,24,18,0.90)'
      ctx.strokeStyle  = 'rgba(100,190,150,0.55)'
      ctx.lineWidth    = 1
      ctx.beginPath()
      ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 5)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle    = 'rgba(210,245,230,0.95)'
      ctx.font         = `400 13px 'Perpetua', serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2)
    }

    drawBtn(_lastBtnRects.up,   '◀ Prev', clampedPage > 0)
    drawBtn(_lastBtnRects.down, 'Next ▶', clampedPage < maxPage)

    // Pulsing hint text — left of buttons
    const pulse     = 0.6 + 0.4 * Math.sin(Date.now() / 400)
    const hintLabel = clampedPage === 0
      ? 'Enter  ▶'
      : clampedPage < maxPage
        ? '⌫ Back     Enter  ▶'
        : '⌫ Back'
    const indicatorX = upX - 12
    ctx.globalAlpha  = alpha * pulse * 0.65
    ctx.font         = `400 13px 'Perpetua', serif`
    ctx.fillStyle    = 'rgba(180,220,200,1)'
    ctx.textAlign    = 'right'
    ctx.textBaseline = 'middle'
    ctx.fillText(hintLabel, indicatorX, btnY + BTN_H / 2)

    // Page counter — e.g. "2 / 3"
    ctx.globalAlpha  = alpha * 0.45
    ctx.font         = `400 11px 'Perpetua', serif`
    ctx.fillStyle    = 'rgba(180,220,200,1)'
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${clampedPage + 1} / ${pages.length}`, canvasW / 2, btnY + BTN_H / 2)

    ctx.globalAlpha  = alpha
    ctx.textAlign    = 'left'
    ctx.textBaseline = 'alphabetic'
  } else {
    _lastBtnRects = null
  }

  // 5. Title — Trajan Pro 700, absolute bottom-left of canvas (Elderbug style)
  const TITLE_SCREEN_Y = canvasH - 48
  const TITLE_SCREEN_X = PAD_X
  ctx.font         = `700 ${titleFs}px 'Trajan Pro', serif`
  ctx.fillStyle    = 'rgba(220,195,110,0.97)'
  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.globalAlpha  = Math.min(1, progress)
  ctx.fillText(content.title, TITLE_SCREEN_X, TITLE_SCREEN_Y)

  ctx.restore()
}
