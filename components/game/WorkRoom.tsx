// Work room — room 0, left of spawn. Walking further left = further back in time.
// First room shows the most recent company (Merkle).
// Data sourced from lib/data/index.ts.

import { workExperience } from '@/lib/data/index'
import { wrapText } from '@/utils/wrapText'

// Most recent company first — nearest to spawn
const company = workExperience[0]

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number
): void {
  const bW = 110   // building width
  const bH = 200   // building height (prominent — current role)
  const bX = cx - bW / 2
  const bY = groundY - bH

  // Ambient glow behind building — amber for Merkle/current
  const glow = ctx.createRadialGradient(cx, bY + bH * 0.3, 0, cx, bY + bH * 0.3, 160)
  glow.addColorStop(0, 'rgba(180,130,40,0.12)')
  glow.addColorStop(1, 'rgba(180,130,40,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, bY + bH * 0.3, 160, 0, Math.PI * 2)
  ctx.fill()

  // Building body
  ctx.fillStyle = '#1e2a20'
  ctx.fillRect(bX, bY, bW, bH)

  // Window grid — 3×4
  ctx.fillStyle = 'rgba(180,200,160,0.18)'
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.fillRect(bX + 14 + col * 32, bY + 16 + row * 44, 18, 28)
    }
  }

  // Roof accent
  ctx.fillStyle = '#c89030'
  ctx.fillRect(bX - 6, bY - 5, bW + 12, 5)

  // Company name above building
  ctx.fillStyle = 'rgba(220,190,100,0.95)'
  ctx.font = 'bold 15px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(company.company, cx, bY - 18)

  // Company description (smaller, faint)
  ctx.fillStyle = 'rgba(180,160,80,0.60)'
  ctx.font = '10px Georgia, serif'
  ctx.fillText(company.companyDescription, cx, bY - 6)
}

function drawRoleText(
  ctx: CanvasRenderingContext2D,
  cx: number,
  groundY: number
): void {
  const bH = 200
  const bY = groundY - bH
  const textX = cx
  let y = bY - 36

  // Role + period
  ctx.fillStyle = 'rgba(200,210,180,0.80)'
  ctx.font = 'bold 11px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${company.role}  ·  ${company.period}`, textX, y)
  y -= 18

  // First 2 bullets
  ctx.fillStyle = 'rgba(160,180,150,0.55)'
  ctx.font = '10px Georgia, serif'
  const bullets = company.bullets.slice(0, 2)
  for (const bullet of bullets) {
    const lines = wrapText(ctx, `· ${bullet}`, 260).slice(0, 2)
    for (const line of lines) {
      ctx.fillText(line, textX, y)
      y -= 13
    }
    y -= 2
  }
}

export function drawWorkRoom(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  groundY: number
): void {
  const cx = canvasWidth * 0.5
  drawBuilding(ctx, cx, groundY)
  drawRoleText(ctx, cx, groundY)
}
