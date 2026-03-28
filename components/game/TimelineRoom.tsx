// Timeline world — rooms 2 and 3, all entries from lib/data/timeline.ts.
// Walking right = going back in time. Most recent entries closest to spawn.
// Three visual types: milestone (tall obelisk), rich (display case), short (post marker).
// Speech bubbles via proximity trigger — same mechanic as work room.

import { timelineEntries } from '@/lib/data/index'
import { timelineToBubble, type BubbleContent } from './SpeechBubble'
import type { TimelineEntry } from '@/lib/types'
import { getImage } from '@/utils/loadAssets'

// ─── Pole sprites ─────────────────────────────────────────────────────────────

export const POLE_SRCS = [
  '/sprites/poles/pole_02.png',
  '/sprites/poles/pole_03.png',
  '/sprites/poles/pole_04.png',
  '/sprites/poles/pole_04_FG.png',
  '/sprites/poles/pole_05.png',
  '/sprites/poles/pole_08.png',
]

// Fixed display width for all pole sprites — keeps visuals uniform regardless of source dimensions
const POLE_DISPLAY_W = 64

/** Draw a pole sprite (or fallback rect) from groundY up by poleH px, centred on x. */
function drawPoleSprite(
  ctx:       CanvasRenderingContext2D,
  poleIndex: number,
  x:         number,
  groundY:   number,
  poleH:     number,
  fallbackColor: string,
  scale:     number,
): void {
  const displayW = POLE_DISPLAY_W * scale
  const src = POLE_SRCS[poleIndex % POLE_SRCS.length]
  const img = getImage(src)
  if (img && img.naturalHeight > 0) {
    ctx.drawImage(img, x - displayW / 2, groundY - poleH, displayW, poleH)
  } else {
    ctx.fillStyle = fallbackColor
    ctx.fillRect(x - displayW / 2, groundY - poleH, displayW, poleH)
  }
}

// ─── Entry sorting and room split ─────────────────────────────────────────────

const ALL_ENTRIES: TimelineEntry[] = [...timelineEntries].sort((a, b) =>
  b.date.localeCompare(a.date)
)

// Entries per room — increase this number if entries start overlapping as content grows
const ENTRIES_PER_ROOM = 4

// Dynamically chunk entries into rooms — adding data automatically expands the world
const ROOM_CHUNKS: TimelineEntry[][] = []
for (let i = 0; i < ALL_ENTRIES.length; i += ENTRIES_PER_ROOM) {
  ROOM_CHUNKS.push(ALL_ENTRIES.slice(i, i + ENTRIES_PER_ROOM))
}

/** Number of timeline rooms needed — consumed by GameCanvas to compute total world width. */
export const TIMELINE_ROOM_COUNT = ROOM_CHUNKS.length

// Even horizontal spacing within a room (10% margin each side)
function evenSpacing(count: number): number[] {
  if (count === 1) return [0.5]
  return Array.from({ length: count }, (_, i) => 0.10 + i * (0.80 / (count - 1)))
}

const ROOM_X_FRACS = ROOM_CHUNKS.map(chunk => evenSpacing(chunk.length))

// ─── Visual constants ─────────────────────────────────────────────────────────

const POLE_RENDER_H = 260   // all pole sprites drawn at this fixed height
const MILESTONE_H   = 185   // element height used for trigger radius only
const RICH_H        = 145
const SHORT_H       = 130

// Category accent colours
const CAT_COLOR: Record<string, [number, number, number]> = {
  work:     [200, 148,  48],   // amber
  personal: [190,  90, 130],   // rose
  projects:  [50, 195, 130],   // teal-green
  writing:  [130, 120, 210],   // violet
}

function catRgb(category: string, alpha: number): string {
  const [r, g, b] = CAT_COLOR[category] ?? [80, 190, 140]
  return `rgba(${r},${g},${b},${alpha})`
}

function entryHeight(e: TimelineEntry): number {
  if (e.isMilestone) return MILESTONE_H
  if (e.entryType === 'rich') return RICH_H
  return SHORT_H
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function labelDate(date: string): string {
  // "2025-04-01" → "Apr 2025"
  const [y, m] = date.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m, 10) - 1] ?? m} ${y}`
}

function drawMilestone(
  ctx:       CanvasRenderingContext2D,
  x:         number,
  groundY:   number,
  entry:     TimelineEntry,
  poleIndex: number,
  scale:     number,
): void {
  const poleH    = POLE_RENDER_H * scale
  const capW     = 32 * scale
  const gemR     = 9  * scale
  const poleTopY = groundY - poleH
  const capY     = poleTopY - 4 * scale

  // Ambient glow halo
  const haloR = 110 * scale
  const halo = ctx.createRadialGradient(x, capY, 0, x, capY, haloR)
  halo.addColorStop(0, catRgb(entry.category, 0.18))
  halo.addColorStop(1, catRgb(entry.category, 0))
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(x, capY, haloR, 0, Math.PI * 2); ctx.fill()

  // Pillar body — pole sprite
  drawPoleSprite(ctx, poleIndex, x, groundY, poleH, '#2e4228', scale)

  // Cap bar
  const capBarH = 5 * scale
  const capG = ctx.createLinearGradient(0, capY - capBarH, 0, capY)
  capG.addColorStop(0, catRgb(entry.category, 0.95))
  capG.addColorStop(1, catRgb(entry.category, 0.5))
  ctx.fillStyle = capG
  ctx.fillRect(x - capW / 2, capY - capBarH, capW, capBarH)

  // Gem / crystal on top
  const gemY = capY - capBarH - gemR - 2 * scale
  const gemG = ctx.createRadialGradient(x, gemY, 0, x, gemY, gemR * 1.6)
  gemG.addColorStop(0,   catRgb(entry.category, 0.95))
  gemG.addColorStop(0.5, catRgb(entry.category, 0.55))
  gemG.addColorStop(1,   catRgb(entry.category, 0))
  ctx.fillStyle = gemG
  ctx.beginPath(); ctx.arc(x, gemY, gemR * 1.6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = catRgb(entry.category, 0.9)
  ctx.beginPath(); ctx.arc(x, gemY, gemR, 0, Math.PI * 2); ctx.fill()

  // Date — Perpetua above gem
  const dateSize  = Math.round(22 * scale)
  const titleSize = Math.round(28 * scale)
  const dateY     = gemY - gemR - 8 * scale
  const titleY    = dateY - dateSize * 1.1
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'bottom'
  ctx.font      = `400 ${dateSize}px 'Perpetua', serif`
  ctx.fillStyle = catRgb(entry.category, 0.70)
  ctx.fillText(labelDate(entry.date), x, dateY)

  // Title — Trajan Pro, brighter
  ctx.font      = `700 ${titleSize}px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(235,220,165,0.95)'
  const maxW    = 340 * scale
  ctx.save()
  const words = entry.title.split(' ')
  const titleLines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxW && cur) {
      titleLines.push(cur); cur = w
    } else { cur = test }
  }
  if (cur) titleLines.push(cur)
  const titleLineH = titleSize * 1.2
  titleLines.slice(0, 3).reverse().forEach((line, i) => {
    ctx.fillText(line, x, titleY - i * titleLineH)
  })
  ctx.restore()

  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
}

function drawRichEntry(
  ctx:       CanvasRenderingContext2D,
  x:         number,
  groundY:   number,
  entry:     TimelineEntry,
  poleIndex: number,
  scale:     number,
): void {
  const poleH  = POLE_RENDER_H * scale
  const frameW = 160 * scale
  const frameH = 96  * scale
  const frameY = groundY - poleH - frameH

  // Soft ambient glow
  const haloR = 80 * scale
  const halo = ctx.createRadialGradient(x, frameY + frameH / 2, 0, x, frameY + frameH / 2, haloR)
  halo.addColorStop(0, catRgb(entry.category, 0.14))
  halo.addColorStop(1, catRgb(entry.category, 0))
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(x, frameY + frameH / 2, haloR, 0, Math.PI * 2); ctx.fill()

  // Base pillar — pole sprite
  drawPoleSprite(ctx, poleIndex, x, groundY, poleH, '#1e3030', scale)

  // Display frame background
  ctx.fillStyle = '#060f10'
  ctx.strokeStyle = catRgb(entry.category, 0.55)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.rect(x - frameW / 2, frameY, frameW, frameH)
  ctx.fill(); ctx.stroke()

  // Inner frame glow
  const fInner = ctx.createLinearGradient(0, frameY, 0, frameY + frameH)
  fInner.addColorStop(0, catRgb(entry.category, 0.07))
  fInner.addColorStop(1, catRgb(entry.category, 0.02))
  ctx.fillStyle = fInner
  ctx.fillRect(x - frameW / 2 + 2, frameY + 2, frameW - 4, frameH - 4)

  const tagSize   = Math.round(19 * scale)
  const titleSize = Math.round(25 * scale)

  // Category tag inside frame
  ctx.font      = `700 ${tagSize}px 'Trajan Pro', serif`
  ctx.fillStyle = catRgb(entry.category, 0.80)
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(entry.category.toUpperCase(), x, frameY + frameH * 0.36)

  // Date inside frame
  ctx.font      = `400 ${tagSize}px 'Perpetua', serif`
  ctx.fillStyle = catRgb(entry.category, 0.55)
  ctx.fillText(labelDate(entry.date), x, frameY + frameH * 0.68)

  // Title above frame
  ctx.font      = `700 ${titleSize}px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(200,230,215,0.92)'
  ctx.textBaseline = 'bottom'
  const words = entry.title.split(' ')
  const titleLines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > 320 * scale && cur) { titleLines.push(cur); cur = w }
    else { cur = test }
  }
  if (cur) titleLines.push(cur)
  const titleLineH = titleSize * 1.2
  titleLines.slice(0, 3).reverse().forEach((line, i) => {
    ctx.fillText(line, x, frameY - 6 * scale - i * titleLineH)
  })

  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
}

function drawShortEntry(
  ctx:       CanvasRenderingContext2D,
  x:         number,
  groundY:   number,
  entry:     TimelineEntry,
  poleIndex: number,
  scale:     number,
): void {
  const poleH = POLE_RENDER_H * scale
  const capW  = 18 * scale
  const postY = groundY - poleH

  // Subtle glow
  const haloR = 55 * scale
  const halo = ctx.createRadialGradient(x, postY, 0, x, postY, haloR)
  halo.addColorStop(0, catRgb(entry.category, 0.12))
  halo.addColorStop(1, catRgb(entry.category, 0))
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(x, postY, haloR, 0, Math.PI * 2); ctx.fill()

  // Post — pole sprite
  drawPoleSprite(ctx, poleIndex, x, groundY, poleH, '#1e3030', scale)

  // Cap
  const capBarH = 4 * scale
  ctx.fillStyle = catRgb(entry.category, 0.85)
  ctx.fillRect(x - capW / 2, postY - capBarH, capW, capBarH)

  const dateSize  = Math.round(21 * scale)
  const titleSize = Math.round(24 * scale)

  // Date
  ctx.font      = `400 ${dateSize}px 'Perpetua', serif`
  ctx.fillStyle = catRgb(entry.category, 0.65)
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(labelDate(entry.date), x, postY - 8 * scale)

  // Title — word-wrapped up to 3 lines
  ctx.font      = `700 ${titleSize}px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(190,225,205,0.90)'
  const maxW    = 320 * scale
  const words   = entry.title.split(' ')
  const titleLines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxW && cur) { titleLines.push(cur); cur = w }
    else { cur = test }
  }
  if (cur) titleLines.push(cur)
  const titleLineH = titleSize * 1.2
  titleLines.slice(0, 3).reverse().forEach((line, i) => {
    ctx.fillText(line, x, postY - 26 * scale - i * titleLineH)
  })

  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
}

// ─── Public draw ──────────────────────────────────────────────────────────────

export function drawTimelineRoom(
  ctx:         CanvasRenderingContext2D,
  roomIndex:   number,
  canvasWidth: number,
  groundY:     number
): void {
  // Scale everything relative to a 700px-tall canvas (groundY ≈ 616).
  // Smaller screens shrink poles, fonts, and offsets proportionally.
  const scale = Math.min(1, groundY / 616)

  const chunkIndex = roomIndex - 2
  const entries    = ROOM_CHUNKS[chunkIndex] ?? []
  const xFracs     = ROOM_X_FRACS[chunkIndex] ?? []

  entries.forEach((entry, i) => {
    const x         = canvasWidth * xFracs[i]
    const poleIndex = i % POLE_SRCS.length
    if (entry.isMilestone)               drawMilestone(ctx, x, groundY, entry, poleIndex, scale)
    else if (entry.entryType === 'rich') drawRichEntry(ctx, x, groundY, entry, poleIndex, scale)
    else                                 drawShortEntry(ctx, x, groundY, entry, poleIndex, scale)
  })
}

// ─── Proximity triggers ───────────────────────────────────────────────────────

export interface TimelineTrigger {
  id:      string
  worldX:  number        // absolute world-space X
  roofY:   number
  radius:  number
  content: BubbleContent
}

export function getTimelineTriggers(canvasW: number, groundY: number): TimelineTrigger[] {
  const triggers: TimelineTrigger[] = []

  ROOM_CHUNKS.forEach((chunk, chunkIndex) => {
    const roomNum = 2 + chunkIndex
    chunk.forEach((entry, i) => {
      triggers.push({
        id:      entry.id,
        worldX:  roomNum * canvasW + canvasW * ROOM_X_FRACS[chunkIndex][i],
        roofY:   groundY - entryHeight(entry),
        radius:  70,
        content: timelineToBubble(entry),
      })
    })
  })

  return triggers
}
