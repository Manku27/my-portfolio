// Timeline world — rooms 2 and 3, all entries from lib/data/timeline.ts.
// Walking right = going back in time. Most recent entries closest to spawn.
// Three visual types: milestone (tall obelisk), rich (display case), short (post marker).
// Speech bubbles via proximity trigger — same mechanic as work room.

import { timelineEntries } from '@/lib/data/index'
import { timelineToBubble, type BubbleContent } from './SpeechBubble'
import type { TimelineEntry } from '@/lib/types'

// ─── Entry sorting and room split ─────────────────────────────────────────────

const ALL_ENTRIES: TimelineEntry[] = [...timelineEntries].sort((a, b) =>
  b.date.localeCompare(a.date)
)

// 8 most recent → room 2 (closer to spawn), remaining → room 3
const ROOM2_ENTRIES = ALL_ENTRIES.slice(0, 8)
const ROOM3_ENTRIES = ALL_ENTRIES.slice(8)

// Even horizontal spacing within a room (8% margin each side)
function evenSpacing(count: number): number[] {
  if (count === 1) return [0.5]
  return Array.from({ length: count }, (_, i) => 0.08 + i * (0.84 / (count - 1)))
}

const ROOM2_X = evenSpacing(ROOM2_ENTRIES.length)
const ROOM3_X = evenSpacing(ROOM3_ENTRIES.length)

// ─── Visual constants ─────────────────────────────────────────────────────────

const MILESTONE_H = 175
const RICH_H      = 125
const SHORT_H     = 88

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
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  entry: TimelineEntry
): void {
  const pillarH = MILESTONE_H
  const pillarW = 12
  const capW    = 28
  const gemR    = 7
  const pillarY = groundY - pillarH
  const capY    = pillarY - 4

  // Ambient glow halo
  const halo = ctx.createRadialGradient(x, capY, 0, x, capY, 90)
  halo.addColorStop(0, catRgb(entry.category, 0.16))
  halo.addColorStop(1, catRgb(entry.category, 0))
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(x, capY, 90, 0, Math.PI * 2); ctx.fill()

  // Pillar body — subtle gradient for depth
  const pg = ctx.createLinearGradient(x - pillarW / 2, 0, x + pillarW / 2, 0)
  pg.addColorStop(0, '#1a2818'); pg.addColorStop(0.5, '#2e4228'); pg.addColorStop(1, '#1a2818')
  ctx.fillStyle = pg
  ctx.fillRect(x - pillarW / 2, pillarY, pillarW, pillarH)

  // Cap bar
  const capG = ctx.createLinearGradient(0, capY - 4, 0, capY)
  capG.addColorStop(0, catRgb(entry.category, 0.95))
  capG.addColorStop(1, catRgb(entry.category, 0.5))
  ctx.fillStyle = capG
  ctx.fillRect(x - capW / 2, capY - 4, capW, 4)

  // Gem / crystal on top
  const gemY = capY - 4 - gemR - 2
  const gemG = ctx.createRadialGradient(x, gemY, 0, x, gemY, gemR * 1.6)
  gemG.addColorStop(0,   catRgb(entry.category, 0.95))
  gemG.addColorStop(0.5, catRgb(entry.category, 0.55))
  gemG.addColorStop(1,   catRgb(entry.category, 0))
  ctx.fillStyle = gemG
  ctx.beginPath(); ctx.arc(x, gemY, gemR * 1.6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = catRgb(entry.category, 0.9)
  ctx.beginPath(); ctx.arc(x, gemY, gemR, 0, Math.PI * 2); ctx.fill()

  // Date — small Perpetua above gem
  const dateY  = gemY - gemR - 6
  const titleY = dateY - 14
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'bottom'
  ctx.font      = `400 11px 'Perpetua', serif`
  ctx.fillStyle = catRgb(entry.category, 0.60)
  ctx.fillText(labelDate(entry.date), x, dateY)

  // Title — Trajan Pro, brighter
  ctx.font      = `700 13px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(235,220,165,0.95)'
  // Split title across max two lines manually at ~200px
  const maxW = 200
  ctx.save()
  // Measure and wrap title naively at spaces
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
  const titleLineH = 16
  titleLines.slice(0, 2).reverse().forEach((line, i) => {
    ctx.fillText(line, x, titleY - i * titleLineH)
  })
  ctx.restore()

  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
}

function drawRichEntry(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  entry: TimelineEntry
): void {
  const baseH  = 55
  const frameW = 80
  const frameH = 58
  const baseW  = 10
  const baseY  = groundY - baseH
  const frameY = baseY - frameH

  // Soft ambient glow
  const halo = ctx.createRadialGradient(x, frameY + frameH / 2, 0, x, frameY + frameH / 2, 65)
  halo.addColorStop(0, catRgb(entry.category, 0.12))
  halo.addColorStop(1, catRgb(entry.category, 0))
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(x, frameY + frameH / 2, 65, 0, Math.PI * 2); ctx.fill()

  // Base pillar
  ctx.fillStyle = '#1e3030'
  ctx.fillRect(x - baseW / 2, baseY, baseW, baseH)

  // Display frame background
  ctx.fillStyle = '#060f10'
  ctx.strokeStyle = catRgb(entry.category, 0.55)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.rect(x - frameW / 2, frameY, frameW, frameH)
  ctx.fill(); ctx.stroke()

  // Inner frame glow (subtle gradient fill)
  const fInner = ctx.createLinearGradient(0, frameY, 0, frameY + frameH)
  fInner.addColorStop(0, catRgb(entry.category, 0.07))
  fInner.addColorStop(1, catRgb(entry.category, 0.02))
  ctx.fillStyle = fInner
  ctx.fillRect(x - frameW / 2 + 2, frameY + 2, frameW - 4, frameH - 4)

  // Category tag inside frame
  ctx.font      = `700 9px 'Trajan Pro', serif`
  ctx.fillStyle = catRgb(entry.category, 0.70)
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(entry.category.toUpperCase(), x, frameY + frameH * 0.38)

  // Date inside frame
  ctx.font      = `400 9px 'Perpetua', serif`
  ctx.fillStyle = catRgb(entry.category, 0.50)
  ctx.fillText(labelDate(entry.date), x, frameY + frameH * 0.65)

  // Title above frame
  ctx.font      = `700 12px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(200,230,215,0.90)'
  ctx.textBaseline = 'bottom'
  const words = entry.title.split(' ')
  const titleLines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > 180 && cur) { titleLines.push(cur); cur = w }
    else { cur = test }
  }
  if (cur) titleLines.push(cur)
  const titleLineH = 15
  titleLines.slice(0, 2).reverse().forEach((line, i) => {
    ctx.fillText(line, x, frameY - 4 - i * titleLineH)
  })

  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
}

function drawShortEntry(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  entry: TimelineEntry
): void {
  const postH = SHORT_H
  const postW = 6
  const capW  = 14
  const postY = groundY - postH

  // Subtle glow
  const halo = ctx.createRadialGradient(x, postY, 0, x, postY, 40)
  halo.addColorStop(0, catRgb(entry.category, 0.10))
  halo.addColorStop(1, catRgb(entry.category, 0))
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(x, postY, 40, 0, Math.PI * 2); ctx.fill()

  // Post
  ctx.fillStyle = '#1e3030'
  ctx.fillRect(x - postW / 2, postY, postW, postH)

  // Cap
  ctx.fillStyle = catRgb(entry.category, 0.80)
  ctx.fillRect(x - capW / 2, postY - 3, capW, 3)

  // Date
  ctx.font      = `400 10px 'Perpetua', serif`
  ctx.fillStyle = catRgb(entry.category, 0.55)
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'bottom'
  ctx.fillText(labelDate(entry.date), x, postY - 6)

  // Title (one line, truncated)
  ctx.font      = `700 11px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(190,225,205,0.85)'
  const maxW   = 160
  let title    = entry.title
  while (ctx.measureText(title).width > maxW && title.length > 8) {
    title = title.slice(0, -4) + '…'
  }
  ctx.fillText(title, x, postY - 18)

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
  const entries = roomIndex === 2 ? ROOM2_ENTRIES : ROOM3_ENTRIES
  const xFracs  = roomIndex === 2 ? ROOM2_X       : ROOM3_X

  entries.forEach((entry, i) => {
    const x = canvasWidth * xFracs[i]
    if (entry.isMilestone)          drawMilestone(ctx, x, groundY, entry)
    else if (entry.entryType === 'rich') drawRichEntry(ctx, x, groundY, entry)
    else                            drawShortEntry(ctx, x, groundY, entry)
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

  ROOM2_ENTRIES.forEach((entry, i) => {
    triggers.push({
      id:      entry.id,
      worldX:  2 * canvasW + canvasW * ROOM2_X[i],
      roofY:   groundY - entryHeight(entry),
      radius:  70,
      content: timelineToBubble(entry),
    })
  })

  ROOM3_ENTRIES.forEach((entry, i) => {
    triggers.push({
      id:      entry.id,
      worldX:  3 * canvasW + canvasW * ROOM3_X[i],
      roofY:   groundY - entryHeight(entry),
      radius:  70,
      content: timelineToBubble(entry),
    })
  })

  return triggers
}
