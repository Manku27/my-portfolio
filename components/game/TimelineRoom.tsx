// Timeline room — renders timeline entries as world objects in the game world.
// One room to the right of spawn. Most recent entries first.
// Data sourced from lib/data/index.ts — never hardcoded.

import { timelineEntries } from '@/lib/data/index'
import { wrapText } from '@/utils/wrapText'
import type { TimelineEntry } from '@/lib/types'

// Pull 3 non-work entries — clearly differentiates timeline world from work world
const ROOM_ENTRIES: TimelineEntry[] = timelineEntries
  .filter(e => e.category !== 'work')
  .slice(0, 3)

// X positions as fraction of canvas width
const ENTRY_X_FACTORS = [0.20, 0.52, 0.82]

function drawMilestoneMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  entry: TimelineEntry
): void {
  const pillarW = 10
  const pillarH = 160
  const pillarX = x - pillarW / 2
  const pillarY = groundY - pillarH

  // Amber glow behind pillar
  const glow = ctx.createRadialGradient(x, pillarY, 0, x, pillarY, 80)
  glow.addColorStop(0, 'rgba(200,160,60,0.14)')
  glow.addColorStop(1, 'rgba(200,160,60,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, pillarY, 80, 0, Math.PI * 2)
  ctx.fill()

  // Pillar body
  ctx.fillStyle = '#3a3020'
  ctx.fillRect(pillarX, pillarY, pillarW, pillarH)

  // Pillar top cap
  ctx.fillStyle = '#c8a040'
  ctx.fillRect(pillarX - 4, pillarY - 4, pillarW + 8, 4)

  // Date
  ctx.fillStyle = 'rgba(200,160,60,0.7)'
  ctx.font = '11px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(entry.date.slice(0, 7), x, pillarY - 14)

  // Title
  ctx.fillStyle = 'rgba(240,220,160,0.92)'
  ctx.font = 'bold 13px Georgia, serif'
  const titleLines = wrapText(ctx, entry.title, 180)
  titleLines.forEach((line, i) => {
    ctx.fillText(line, x, pillarY - 30 - (titleLines.length - 1 - i) * 16)
  })

  // Body (truncated, smaller)
  if (entry.body) {
    ctx.fillStyle = 'rgba(200,200,180,0.60)'
    ctx.font = '10px Georgia, serif'
    const bodyLines = wrapText(ctx, entry.body, 190).slice(0, 3)
    bodyLines.forEach((line, i) => {
      ctx.fillText(line, x, pillarY - 30 - titleLines.length * 16 - 10 - i * 13)
    })
  }
}

function drawEntryMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  entry: TimelineEntry
): void {
  const pillarW = 6
  const pillarH = 90
  const pillarX = x - pillarW / 2
  const pillarY = groundY - pillarH

  // Subtle teal glow
  const glow = ctx.createRadialGradient(x, pillarY, 0, x, pillarY, 50)
  glow.addColorStop(0, 'rgba(60,200,150,0.10)')
  glow.addColorStop(1, 'rgba(60,200,150,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(x, pillarY, 50, 0, Math.PI * 2)
  ctx.fill()

  // Pillar body
  ctx.fillStyle = '#1e3030'
  ctx.fillRect(pillarX, pillarY, pillarW, pillarH)

  // Pillar top
  ctx.fillStyle = '#40a080'
  ctx.fillRect(pillarX - 3, pillarY - 3, pillarW + 6, 3)

  // Date
  ctx.fillStyle = 'rgba(80,200,150,0.6)'
  ctx.font = '10px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(entry.date.slice(0, 7), x, pillarY - 12)

  // Title
  ctx.fillStyle = 'rgba(180,240,210,0.85)'
  ctx.font = 'bold 12px Georgia, serif'
  const titleLines = wrapText(ctx, entry.title, 160).slice(0, 2)
  titleLines.forEach((line, i) => {
    ctx.fillText(line, x, pillarY - 24 - (titleLines.length - 1 - i) * 15)
  })

  // Body (1 line only for short markers)
  if (entry.body) {
    ctx.fillStyle = 'rgba(160,210,190,0.50)'
    ctx.font = '10px Georgia, serif'
    const bodyLine = wrapText(ctx, entry.body, 170)[0]
    if (bodyLine) ctx.fillText(bodyLine + '…', x, pillarY - 24 - titleLines.length * 15 - 10)
  }
}

export function drawTimelineRoom(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  groundY: number
): void {
  ROOM_ENTRIES.forEach((entry, i) => {
    const x = canvasWidth * ENTRY_X_FACTORS[i]
    if (entry.isMilestone) {
      drawMilestoneMarker(ctx, x, groundY, entry)
    } else {
      drawEntryMarker(ctx, x, groundY, entry)
    }
  })
}
