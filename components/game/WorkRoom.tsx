// Work room — room 0, single room showing all work history.
// Left → right = oldest → most recent (spawn is to the right).
// Data sourced from lib/data/index.ts — never hardcoded.

import { workExperience, consultingEngagements } from '@/lib/data/index'
import { wrapText } from '@/utils/wrapText'
import type { WorkExperience, ConsultingEngagement } from '@/lib/types'
import { workToBubble, consultingToBubble, type BubbleContent } from './SpeechBubble'

// workExperience is most-recent-first; reverse for left=oldest layout
const COMPANIES = [...workExperience].reverse()
// [Infosys, PwC, TechMahindra, Merkle]

const WOHANA       = consultingEngagements[0]  // Oct 2024–present
const RAISEMATTERS = consultingEngagements[1]  // Sept 2023–Jul 2024

// Building heights by id
const BUILDING_H: Record<string, number> = {
  'merkle-dentsu':           190,
  'tech-mahindra-microsoft': 155,
  'pwc':                     168,
  'infosys':                 110,
}

// Layout: 4 company buildings + 2 consulting structures = 6 objects
// x positions as fractions of canvas width, left=oldest, right=most recent
const COMPANY_X   = [0.08, 0.24, 0.50, 0.72]
const CONSULTING_X = {
  'raisematters': 0.62,   // overlaps Tech Mahindra era — sits right of it
  'wohana':       0.85,   // overlaps Merkle era — sits right of it
}

// ─── Company building ──────────────────────────────────────────────────────────

function drawCompanyBuilding(
  ctx: CanvasRenderingContext2D,
  company: WorkExperience,
  cx: number,
  groundY: number
): void {
  const bH = BUILDING_H[company.id] ?? 140
  const bW = company.current ? 100 : 80
  const bX = cx - bW / 2
  const bY = groundY - bH

  // Amber glow — brighter for current role
  const glowR = company.current ? 140 : 95
  const glow = ctx.createRadialGradient(cx, bY + bH * 0.35, 0, cx, bY + bH * 0.35, glowR)
  glow.addColorStop(0, company.current ? 'rgba(180,130,40,0.14)' : 'rgba(150,110,30,0.08)')
  glow.addColorStop(1, 'rgba(180,130,40,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, bY + bH * 0.35, glowR, 0, Math.PI * 2)
  ctx.fill()

  // Building body
  ctx.fillStyle = '#1e2a20'
  ctx.fillRect(bX, bY, bW, bH)

  // Window grid
  const cols = bW > 90 ? 3 : 2
  const rows = Math.max(2, Math.floor(bH / 46))
  const winW = 14
  const winH = 20
  const colGap = (bW - cols * winW) / (cols + 1)
  const rowGap = (bH - rows * winH) / (rows + 1)
  ctx.fillStyle = 'rgba(180,200,160,0.18)'
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillRect(
        bX + colGap + c * (winW + colGap),
        bY + rowGap + r * (winH + rowGap),
        winW, winH
      )
    }
  }

  // Roof accent
  ctx.fillStyle = company.current ? '#c89030' : '#a07828'
  ctx.fillRect(bX - 4, bY - 4, bW + 8, 4)

  // Company name
  ctx.fillStyle = company.current ? 'rgba(220,190,100,0.95)' : 'rgba(200,170,80,0.85)'
  ctx.font = `700 ${company.current ? 13 : 12}px 'Trajan Pro', serif`
  ctx.textAlign = 'center'
  ctx.fillText(company.company, cx, bY - 14)

  // Period
  ctx.fillStyle = 'rgba(160,140,60,0.55)'
  ctx.font = `400 9px 'Perpetua', serif`
  ctx.fillText(company.period, cx, bY - 4)
}

function drawCompanyText(
  ctx: CanvasRenderingContext2D,
  company: WorkExperience,
  cx: number,
  groundY: number
): void {
  const bH = BUILDING_H[company.id] ?? 140
  const bY = groundY - bH
  let y = bY - 26

  // Role
  ctx.fillStyle = 'rgba(200,210,180,0.75)'
  ctx.font = `700 10px 'Trajan Pro', serif`
  ctx.textAlign = 'center'
  ctx.fillText(company.role, cx, y)
  y -= 14

  // First bullet (one wrapped line)
  ctx.fillStyle = 'rgba(160,180,150,0.50)'
  ctx.font = `400 9px 'Perpetua', serif`
  const line = wrapText(ctx, `· ${company.bullets[0]}`, 200)[0]
  if (line) ctx.fillText(line, cx, y)
}

// ─── Consulting structure ──────────────────────────────────────────────────────

function drawConsultingStructure(
  ctx: CanvasRenderingContext2D,
  engagement: ConsultingEngagement,
  cx: number,
  groundY: number
): void {
  const bW = 64
  const bH = 80
  const bX = cx - bW / 2
  const bY = groundY - bH

  // Teal glow
  const glow = ctx.createRadialGradient(cx, bY + bH * 0.4, 0, cx, bY + bH * 0.4, 70)
  glow.addColorStop(0, 'rgba(40,180,140,0.10)')
  glow.addColorStop(1, 'rgba(40,180,140,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, bY + bH * 0.4, 70, 0, Math.PI * 2)
  ctx.fill()

  // Structure body
  ctx.fillStyle = '#162828'
  ctx.fillRect(bX, bY, bW, bH)

  // Windows — 2×2
  ctx.fillStyle = 'rgba(60,200,160,0.14)'
  ctx.fillRect(bX + 8,  bY + 12, 14, 18)
  ctx.fillRect(bX + 42, bY + 12, 14, 18)
  ctx.fillRect(bX + 8,  bY + 42, 14, 18)
  ctx.fillRect(bX + 42, bY + 42, 14, 18)

  // Teal roof accent
  ctx.fillStyle = '#40a090'
  ctx.fillRect(bX - 3, bY - 3, bW + 6, 3)

  // Client name
  ctx.fillStyle = 'rgba(80,210,170,0.85)'
  ctx.font = `700 11px 'Trajan Pro', serif`
  ctx.textAlign = 'center'
  ctx.fillText(engagement.client, cx, bY - 22)

  // Period
  ctx.fillStyle = 'rgba(80,200,160,0.55)'
  ctx.font = `400 9px 'Perpetua', serif`
  ctx.fillText(engagement.period, cx, bY - 12)

  // Description (truncated)
  ctx.fillStyle = 'rgba(60,180,140,0.40)'
  ctx.font = `400 8px 'Perpetua', serif`
  const desc = engagement.clientDescription.length > 30
    ? engagement.clientDescription.slice(0, 30) + '…'
    : engagement.clientDescription
  ctx.fillText(desc, cx, bY - 3)
}

// ─── Trigger zones ────────────────────────────────────────────────────────────

export interface WorkTrigger {
  id:      string
  worldX:  number   // screen X in room 0 (cameraX = 0 in work room)
  roofY:   number   // Y of building roof
  radius:  number   // horizontal proximity in px
  content: BubbleContent
}

export function getWorkTriggers(canvasW: number, groundY: number): WorkTrigger[] {
  const triggers: WorkTrigger[] = COMPANIES.map((company, i) => ({
    id:      company.id,
    worldX:  canvasW * COMPANY_X[i],
    roofY:   groundY - (BUILDING_H[company.id] ?? 140),
    radius:  70,
    content: workToBubble(company),
  }))

  triggers.push({
    id:      RAISEMATTERS.id,
    worldX:  canvasW * CONSULTING_X['raisematters'],
    roofY:   groundY - 80,
    radius:  55,
    content: consultingToBubble(RAISEMATTERS),
  })

  triggers.push({
    id:      WOHANA.id,
    worldX:  canvasW * CONSULTING_X['wohana'],
    roofY:   groundY - 80,
    radius:  55,
    content: consultingToBubble(WOHANA),
  })

  return triggers
}

// ─── Public draw function ──────────────────────────────────────────────────────

export function drawWorkRoom(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  groundY: number
): void {
  COMPANIES.forEach((company, i) => {
    const cx = canvasWidth * COMPANY_X[i]
    drawCompanyBuilding(ctx, company, cx, groundY)
    drawCompanyText(ctx, company, cx, groundY)
  })

  drawConsultingStructure(ctx, RAISEMATTERS, canvasWidth * CONSULTING_X['raisematters'], groundY)
  drawConsultingStructure(ctx, WOHANA,       canvasWidth * CONSULTING_X['wohana'],       groundY)
}
