// Work room — room 0, single room showing all work history.
// Left → right = oldest → most recent (spawn is to the right).
// Data sourced from lib/data/index.ts — never hardcoded.

import { workExperience, consultingEngagements, projects } from '@/lib/data/index'
import { getImage } from '@/utils/loadAssets'
import { wrapText } from '@/utils/wrapText'
import type { WorkExperience } from '@/lib/types'
import { workToBubble, pavilionToBubble, type BubbleContent } from './SpeechBubble'

// workExperience is most-recent-first; reverse for left=oldest layout
const COMPANIES = [...workExperience].reverse()
// [Infosys, PwC, TechMahindra, Merkle]

// Logo sprite paths by company id
const COMPANY_LOGO: Record<string, string> = {
  'merkle-dentsu':           '/sprites/work/merkle.webp',
  'tech-mahindra-microsoft': '/sprites/work/Tech_Mahindra.png',
  'pwc':                     '/sprites/work/pwc.png',
  'infosys':                 '/sprites/work/Infosys.webp',
}

// Building heights by id
const BUILDING_H: Record<string, number> = {
  'merkle-dentsu':           190,
  'tech-mahindra-microsoft': 155,
  'pwc':                     168,
  'infosys':                 110,
}

// Layout: pavilion far-left, then 4 company buildings left→right (oldest→newest)
// x positions as fractions of canvas width
const PAVILION_X  = 0.06
const COMPANY_X   = [0.22, 0.40, 0.60, 0.80]

const ELEV_LIFT_SPRITE = '/sprites/work/elev_lift.png'

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

  // Logo pill + image
  const logoSrc      = COMPANY_LOGO[company.id]
  const logoImg      = logoSrc ? getImage(logoSrc) : null
  const pillW        = bW - 12
  const pillH        = 32
  const pillX        = bX + 6
  const pillY        = bY + bH * 0.30
  const pillCentreY  = pillY + 16
  ctx.fillStyle      = 'rgba(8,18,16,0.80)'
  ctx.fillRect(pillX, pillY, pillW, pillH)
  if (logoImg && logoImg.naturalWidth > 0) {
    const maxLogoH = 24
    const logoH    = Math.min(maxLogoH, pillH - 4)
    const logoW    = Math.round(logoImg.naturalWidth * logoH / logoImg.naturalHeight)
    ctx.drawImage(logoImg, cx - logoW / 2, pillCentreY - logoH / 2, logoW, logoH)
  }
  // Merkle acquisition chain plaque
  if (company.id === 'merkle-dentsu') {
    ctx.fillStyle    = 'rgba(180,160,100,0.50)'
    ctx.font         = `400 8px 'Perpetua', serif`
    ctx.textAlign    = 'center'
    ctx.fillText('Extentia → Merkle → Dentsu', cx, bY + bH * 0.30 + 40)
  }

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

// ─── Personal projects pavilion ────────────────────────────────────────────────

function drawPavilion(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number,
  canvasWidth: number
): void {
  const img = getImage(ELEV_LIFT_SPRITE)

  // Draw elev_lift sprite — scale to a reasonable size
  const targetH = Math.round(canvasWidth * 0.18)
  let drawW = targetH
  let drawH = targetH

  if (img) {
    drawW = Math.round(img.naturalWidth * targetH / (img.naturalHeight || targetH))
    drawH = targetH
    const drawX = cx - drawW / 2
    const drawY = groundY - drawH
    ctx.drawImage(img, drawX, drawY, drawW, drawH)
  } else {
    // Fallback: simple domed structure
    const dW = 90
    const dH = 110
    const dX = cx - dW / 2
    const dY = groundY - dH
    ctx.fillStyle = '#12242a'
    ctx.fillRect(dX, dY + 20, dW, dH - 20)
    ctx.fillStyle = '#1a3840'
    ctx.beginPath()
    ctx.arc(cx, dY + 20, dW / 2, Math.PI, 0)
    ctx.fill()
    // Teal accent
    ctx.fillStyle = '#2abca0'
    ctx.fillRect(dX - 2, dY + 20, dW + 4, 3)
  }

  // Ambient teal glow
  const glowR = Math.max(drawW, 80)
  const glow = ctx.createRadialGradient(cx, groundY - drawH * 0.5, 0, cx, groundY - drawH * 0.5, glowR)
  glow.addColorStop(0, 'rgba(30,180,140,0.10)')
  glow.addColorStop(1, 'rgba(30,180,140,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, groundY - drawH * 0.5, glowR, 0, Math.PI * 2)
  ctx.fill()

  // Header label
  ctx.fillStyle = 'rgba(100,215,175,0.90)'
  ctx.font = `700 11px 'Trajan Pro', serif`
  ctx.textAlign = 'center'
  ctx.fillText('Projects & Consulting', cx, groundY - drawH - 10)

  // Project + consulting names listed below header
  const allItems = [
    ...consultingEngagements.map(c => `${c.client} — consulting`),
    ...projects.map(p => p.name),
  ]
  ctx.fillStyle = 'rgba(80,195,155,0.55)'
  ctx.font = `400 8px 'Perpetua', serif`
  const lineH = 11
  const startY = groundY - drawH - 24
  // Draw two columns if many items
  const mid = Math.ceil(allItems.length / 2)
  const col1 = allItems.slice(0, mid)
  const col2 = allItems.slice(mid)
  const colGap = Math.round(drawW * 0.28)
  col1.forEach((label, i) => {
    ctx.textAlign = 'right'
    ctx.fillText(label, cx - 4, startY - i * lineH)
  })
  col2.forEach((label, i) => {
    ctx.textAlign = 'left'
    ctx.fillText(label, cx + 4, startY - i * lineH)
  })
  ctx.textAlign = 'left'
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

  // Single pavilion trigger — covers all projects + consulting
  const pavilionContent = pavilionToBubble(projects, consultingEngagements)
  triggers.push({
    id:      'pavilion',
    worldX:  canvasW * PAVILION_X,
    roofY:   groundY - Math.round(canvasW * 0.18),
    radius:  canvasW * 0.07,
    content: pavilionContent,
  })

  return triggers
}

// ─── Public draw function ──────────────────────────────────────────────────────

export function drawWorkRoom(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  groundY: number
): void {
  // Floor tiles — tiled across full width
  const floorImg = getImage('/sprites/town_floor_01.png')
  if (floorImg && floorImg.naturalWidth > 0) {
    const tileH = 50
    const tileW = Math.round(floorImg.naturalWidth * tileH / floorImg.naturalHeight)
    if (tileW > 0) {
      for (let tx = 0; tx < canvasWidth; tx += tileW) {
        ctx.drawImage(floorImg, tx, groundY, tileW, tileH)
      }
    }
  }

  // Pavilion — personal projects + consulting — far left
  drawPavilion(ctx, canvasWidth * PAVILION_X, groundY, canvasWidth)

  // Company buildings
  COMPANIES.forEach((company, i) => {
    const cx = canvasWidth * COMPANY_X[i]
    drawCompanyBuilding(ctx, company, cx, groundY)
    drawCompanyText(ctx, company, cx, groundY)
  })
}
