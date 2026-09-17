// Activity world — rooms placed after the timeline rooms, populated from
// live atproto/Popfeed data (passed in, not statically imported — the data
// is fetched server-side and can grow between deploys without a code change).
// Same island-and-box visual language as WorkRoom's company islands — the box
// holds the real poster art instead of a logo. Visual-only elevation (no
// collision); proximity trigger stays ground-level like Timeline's.

import type { ActivityItem } from '@/lib/types'
import { activityToBubble, type BubbleContent } from './SpeechBubble'
import { getImage, loadImage } from '@/utils/loadAssets'
import { POLE_SRCS, drawPoleSprite } from './TimelineRoom'

// Entries per room — one more than Timeline's density, since the tighter
// type-aware layout below leaves room for it.
const ENTRIES_PER_ROOM = 5

function chunkActivity(items: ActivityItem[]): ActivityItem[][] {
  const chunks: ActivityItem[][] = []
  for (let i = 0; i < items.length; i += ENTRIES_PER_ROOM) {
    chunks.push(items.slice(i, i + ENTRIES_PER_ROOM))
  }
  return chunks
}

// Packs items left-to-right by their own footprint instead of spreading
// everything evenly — media islands are wider and get more breathing room,
// pole markers are narrower and sit tighter. Row is centred on the room.
//
// Gaps are responsive to canvas width, not fixed: whatever room is left after
// the markers themselves (up to ROW_WIDTH_FRACTION of the canvas) gets split
// between the gaps, media gaps taking a bigger share than pole gaps — so on a
// wide window the row stretches to use the space, and on a narrow one gaps
// shrink toward their floor instead of overflowing. Marker sizes themselves
// stay fixed (matching Work/Timeline's own convention); only spacing flexes.
// Returns absolute world-space x centres, in canvas-width-independent px
// (same "before scale" unit as the visual constants below).
function layoutRow(items: ActivityItem[], canvasWidth: number, scale: number): number[] {
  if (items.length === 0) return []

  const widths = items.map((item) => (item.posterUrl ? ISLAND_W : TEXT_FRAME_W) * scale)
  const sumWidths = widths.reduce((a, b) => a + b, 0)

  const gapTypes: Array<'media' | 'pole'> = items.slice(0, -1).map((item) => (item.posterUrl ? 'media' : 'pole'))
  const gapWeight = (t: 'media' | 'pole') => (t === 'media' ? 2 : 1)
  const totalWeight = gapTypes.reduce((s, t) => s + gapWeight(t), 0) || 1

  const maxRowW = canvasWidth * ROW_WIDTH_FRACTION
  const availableForGaps = Math.max(0, maxRowW - sumWidths)

  const gaps = gapTypes.map((t) => {
    const share = (availableForGaps * gapWeight(t)) / totalWeight
    const min = (t === 'media' ? MEDIA_GAP_MIN : POLE_GAP_MIN) * scale
    const max = (t === 'media' ? MEDIA_GAP_MAX : POLE_GAP_MAX) * scale
    return Math.min(max, Math.max(min, share))
  })

  const totalW = sumWidths + gaps.reduce((a, b) => a + b, 0)
  let cursor = (canvasWidth - totalW) / 2
  return widths.map((w, i) => {
    const center = cursor + w / 2
    cursor += w + (gaps[i] ?? 0)
    return center
  })
}

/** Number of rooms needed for this activity list — 0 if empty. */
export function getActivityRoomCount(activity: ActivityItem[]): number {
  return chunkActivity(activity).length
}

// ─── Visual constants — same island-and-box language as WorkRoom, poster fills
// the box in its natural aspect ratio instead of a fixed-shape logo. Visual-only
// elevation: no collision, still a ground-level proximity trigger like Timeline.

const PLATFORM_SRC = '/sprites/wp_plat_float_01.png'
const ISLAND_OFFSET = 132  // island top, px above groundY, before scale
const ISLAND_W = 200       // platform sprite draw width, before scale
const BOX_MAX_W = 186       // poster box max width, before scale
const BOX_MAX_H = 270       // poster box max height, before scale
const ROW_WIDTH_FRACTION = 0.86  // max fraction of canvas width a room's row may use
const MEDIA_GAP_MIN = 20, MEDIA_GAP_MAX = 100  // gap after a media island, before scale
const POLE_GAP_MIN = 10, POLE_GAP_MAX = 50     // gap after a pole marker — narrower range too

const TYPE_COLOR: Record<ActivityItem['type'], [number, number, number]> = {
  movie: [200, 148, 48],       // amber
  tv_show: [50, 195, 130],     // teal-green
  video_game: [190, 90, 130],  // rose
  book: [130, 120, 210],       // violet
  post: [80, 160, 220],        // sky blue
}

const TYPE_LABEL: Record<ActivityItem['type'], string> = {
  movie: 'MOVIE',
  tv_show: 'TV',
  video_game: 'GAME',
  book: 'BOOK',
  post: 'POST',
}

function typeRgb(type: ActivityItem['type'], alpha: number): string {
  const [r, g, b] = TYPE_COLOR[type]
  return `rgba(${r},${g},${b},${alpha})`
}

function drawIsland(
  ctx: CanvasRenderingContext2D,
  x: number,
  islandTopY: number,
  type: ActivityItem['type'],
  scale: number,
): void {
  const iW = ISLAND_W * scale

  // Ambient glow beneath island
  const glowR = iW * 0.9
  const glow = ctx.createRadialGradient(x, islandTopY + 10 * scale, 0, x, islandTopY + 10 * scale, glowR)
  glow.addColorStop(0, typeRgb(type, 0.13))
  glow.addColorStop(1, typeRgb(type, 0))
  ctx.fillStyle = glow
  ctx.fillRect(x - glowR, islandTopY + 10 * scale - glowR, glowR * 2, glowR * 2)

  const platImg = getImage(PLATFORM_SRC)
  if (platImg && platImg.naturalWidth > 0) {
    const vH = Math.round((platImg.naturalHeight * iW) / platImg.naturalWidth)
    ctx.drawImage(platImg, x - iW / 2, islandTopY, iW, vH)

    const bellyTop = islandTopY + vH
    const bellyH = 18 * scale
    ctx.fillStyle = '#0c1910'
    ctx.beginPath()
    ctx.moveTo(x - iW / 2 + 6 * scale, bellyTop)
    ctx.lineTo(x + iW / 2 - 6 * scale, bellyTop)
    ctx.lineTo(x + iW / 2 - 14 * scale, bellyTop + bellyH)
    ctx.lineTo(x - iW / 2 + 14 * scale, bellyTop + bellyH)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.fillStyle = '#241c14'
    ctx.fillRect(x - iW / 2, islandTopY, iW, 20 * scale)
  }
}

/**
 * Draws the poster box, natural aspect ratio, contained within the max envelope.
 * Only called when item.posterUrl is set — see drawTextMarker for the no-image case.
 * Returns box top Y.
 */
function drawPosterBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  islandTopY: number,
  item: ActivityItem & { posterUrl: string },
  scale: number,
): number {
  const maxW = BOX_MAX_W * scale
  const maxH = BOX_MAX_H * scale
  const img = getImage(item.posterUrl)

  let boxW = maxW
  let boxH = maxH * 0.66
  if (img && img.naturalWidth > 0) {
    const aspect = img.naturalWidth / img.naturalHeight
    boxW = maxW
    boxH = boxW / aspect
    if (boxH > maxH) {
      boxH = maxH
      boxW = boxH * aspect
    }
  }

  const boxY = islandTopY - boxH
  const boxX = x - boxW / 2

  if (img && img.naturalWidth > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(boxX, boxY, boxW, boxH)
    ctx.clip()
    ctx.drawImage(img, boxX, boxY, boxW, boxH)
    ctx.restore()
  } else {
    ctx.fillStyle = '#060f10'
    ctx.fillRect(boxX, boxY, boxW, boxH)
    ctx.fillStyle = typeRgb(item.type, 0.40)
    ctx.font = `400 ${Math.round(12 * scale)}px 'Perpetua', serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Loading…', x, boxY + boxH / 2)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    loadImage(item.posterUrl).catch(() => {})
  }

  ctx.strokeStyle = typeRgb(item.type, 0.65)
  ctx.lineWidth = 1.5 * scale
  ctx.strokeRect(boxX, boxY, boxW, boxH)

  return boxY
}

// ─── Text marker — pole + frame, for entries with no real image (posts) ──────
// A poster-style box with nothing in it reads as broken, not text-content —
// this reuses the pole language instead, same one Timeline already uses.

const TEXT_FRAME_W = 170
const TEXT_FRAME_H = 108
const TEXT_POLE_H = 260

function drawTextMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  item: ActivityItem,
  poleIndex: number,
  scale: number,
): void {
  const poleH = TEXT_POLE_H * scale
  const frameW = TEXT_FRAME_W * scale
  const frameH = TEXT_FRAME_H * scale
  const frameY = groundY - poleH - frameH

  const haloR = 80 * scale
  const halo = ctx.createRadialGradient(x, frameY + frameH / 2, 0, x, frameY + frameH / 2, haloR)
  halo.addColorStop(0, typeRgb(item.type, 0.14))
  halo.addColorStop(1, typeRgb(item.type, 0))
  ctx.fillStyle = halo
  ctx.beginPath(); ctx.arc(x, frameY + frameH / 2, haloR, 0, Math.PI * 2); ctx.fill()

  drawPoleSprite(ctx, poleIndex, x, groundY, poleH, '#1e3030', scale)

  ctx.fillStyle = '#060f10'
  ctx.strokeStyle = typeRgb(item.type, 0.55)
  ctx.lineWidth = 1.5 * scale
  ctx.beginPath()
  ctx.rect(x - frameW / 2, frameY, frameW, frameH)
  ctx.fill(); ctx.stroke()

  const tagSize = Math.round(15 * scale)
  ctx.font = `700 ${tagSize}px 'Trajan Pro', serif`
  ctx.fillStyle = typeRgb(item.type, 0.80)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(TYPE_LABEL[item.type], x, frameY + frameH * 0.3)

  // Body text — wrapped inside the frame
  ctx.font = `400 ${Math.round(12 * scale)}px 'Perpetua', serif`
  ctx.fillStyle = 'rgba(210,225,220,0.75)'
  const bodyMaxW = frameW - 20 * scale
  const words = (item.review ?? item.title).split(' ')
  const bodyLines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > bodyMaxW && cur) { bodyLines.push(cur); cur = w }
    else { cur = test }
  }
  if (cur) bodyLines.push(cur)
  const bodyLineH = 14 * scale
  bodyLines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, x, frameY + frameH * 0.55 + i * bodyLineH)
  })

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // Title — placard at ground level, matching the poster markers
  const titleSize = Math.round(18 * scale)
  ctx.font = `700 ${titleSize}px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(220,195,110,0.90)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(item.title, x, groundY + 14 * scale)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

function drawActivityMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  item: ActivityItem & { posterUrl: string },
  scale: number,
): void {
  const islandTopY = groundY - ISLAND_OFFSET * scale

  drawIsland(ctx, x, islandTopY, item.type, scale)
  const boxY = drawPosterBox(ctx, x, islandTopY, item, scale)

  // Type + rating tag — small, floats just above the box
  const tagSize = Math.round(14 * scale)
  ctx.font = `700 ${tagSize}px 'Trajan Pro', serif`
  ctx.fillStyle = typeRgb(item.type, 0.85)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const statusLine = TYPE_LABEL[item.type]
    + (item.rating ? ` · ${item.rating}/10` : item.status === 'in_progress' ? ' · In progress' : '')
  ctx.fillText(statusLine, x, boxY - 8 * scale)

  // Title — placard at ground level, below the island
  const titleSize = Math.round(18 * scale)
  ctx.font = `700 ${titleSize}px 'Trajan Pro', serif`
  ctx.fillStyle = 'rgba(220,195,110,0.90)'
  ctx.textBaseline = 'top'
  const maxW = 210 * scale
  const words = item.title.split(' ')
  const titleLines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxW && cur) { titleLines.push(cur); cur = w }
    else { cur = test }
  }
  if (cur) titleLines.push(cur)
  const placardY = groundY + 14 * scale
  const titleLineH = titleSize * 1.2
  titleLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, x, placardY + i * titleLineH)
  })

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

// ─── Public draw ──────────────────────────────────────────────────────────────

export function drawActivityRoom(
  ctx: CanvasRenderingContext2D,
  activity: ActivityItem[],
  roomIndex: number,
  roomOffset: number,
  canvasWidth: number,
  groundY: number,
): void {
  const scale = Math.min(1, groundY / 616)
  const chunks = chunkActivity(activity)
  const chunkIndex = roomIndex - roomOffset
  const items = chunks[chunkIndex] ?? []
  const centers = layoutRow(items, canvasWidth, scale)

  items.forEach((item, i) => {
    const x = centers[i]
    if (item.posterUrl) {
      drawActivityMarker(ctx, x, groundY, { ...item, posterUrl: item.posterUrl }, scale)
    } else {
      drawTextMarker(ctx, x, groundY, item, i % POLE_SRCS.length, scale)
    }
  })
}

// ─── Proximity triggers ───────────────────────────────────────────────────────

export interface ActivityTrigger {
  id: string
  worldX: number
  radius: number
  content: BubbleContent
}

export function getActivityTriggers(
  activity: ActivityItem[],
  roomOffset: number,
  canvasW: number,
  groundY: number,
): ActivityTrigger[] {
  const scale = Math.min(1, groundY / 616)
  const chunks = chunkActivity(activity)
  const triggers: ActivityTrigger[] = []

  chunks.forEach((chunk, chunkIndex) => {
    const roomNum = roomOffset + chunkIndex
    const centers = layoutRow(chunk, canvasW, scale)
    chunk.forEach((item, i) => {
      triggers.push({
        id: item.id,
        worldX: roomNum * canvasW + centers[i],
        radius: 70,
        content: activityToBubble(item),
      })
    })
  })

  return triggers
}
