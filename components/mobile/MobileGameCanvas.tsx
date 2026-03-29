'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ANIM_CONFIG,
  KNIGHT_SPRITE_PATH,
  KNIGHT_COLLISION_W,
  KNIGHT_COLLISION_H,
} from '@/lib/sprites/knight-frames'
import { drawCharacter } from '@/components/game/Character'
import {
  drawParallaxBackground,
  drawParallaxForeground,
  type GrassImages,
} from '@/components/game/ParallaxLayer'
import { drawRoomBackground } from '@/components/game/Room'
import {
  workToBubble,
  pavilionToBubble,
  type BubbleContent,
} from '@/components/game/SpeechBubble'
import { wrapText } from '@/utils/wrapText'
import { loadImage, getImage } from '@/utils/loadAssets'
import { workExperience, consultingEngagements, projects } from '@/lib/data'

// ── Layout constants ──────────────────────────────────────────────────────────
const GROUND_Y_FAC   = 0.84   // ground as fraction of screen height
const DOCK_SCREEN_Y  = 0.62   // active platform surface appears at this fraction when docked
const BUBBLE_TOP     = 60     // px — just below the skills bar
const GRAVITY        = 2100
const JUMP_VY        = -1150  // apex ≈ 315px above launch
const FALL_VY        = 220    // initial downward nudge when falling to lower platform
const SOCIALS_H      = 115    // reserved for socials bar at bottom
const CARD_SCALE     = 0.80
const SURF_H         = 4      // thin collision surface atop island

// World heights above groundY per platform index (0=Merkle at bottom → 3=Projects at top)
const ABOVE_GROUNDS = [140, 295, 450, 605, 760]

// ── Data ──────────────────────────────────────────────────────────────────────
const COMPANY_LOGO: Record<string, string> = {
  'merkle-dentsu':           '/sprites/work/merkle.webp',
  'tech-mahindra-microsoft': '/sprites/work/Tech_Mahindra.png',
  'pwc':                     '/sprites/work/pwc.png',
  'infosys':                 '/sprites/work/Infosys.webp',
}

const CONTENTS: BubbleContent[] = [
  workToBubble(workExperience[0]),                   // Merkle
  workToBubble(workExperience[1]),                   // Tech Mahindra
  workToBubble(workExperience[2]),                   // PwC
  workToBubble(workExperience[3]),                   // Infosys
  pavilionToBubble(projects, consultingEngagements), // Personal Projects
]

// ── Asset paths ───────────────────────────────────────────────────────────────
const FLOOR_SRC   = '/sprites/town_floor_01.png'
const PLAT_SPRITE = '/sprites/wp_plat_float_01.png'
const GRASS_A     = '/sprites/grass_01_idle0000.png'
const GRASS_B     = '/sprites/grass_03_idle0015.png'
const GRASS_C     = '/sprites/simple_grass0007.png'
const DIAL_TOP    = '/sprites/Controller_Dialogue_0000_top.png'
const DIAL_BOT    = '/sprites/Controller_Dialogue_0001_bot.png'

// ── Types ─────────────────────────────────────────────────────────────────────
interface MobilePlatform {
  worldY:    number   // fixed world-space Y of island top surface (never changes)
  visited:   boolean
  isCurrent: boolean
  logoSrc:   string | null
  label:     string
  period:    string
}

// exiting = transitioning to another platform (up or down)
type RunState = 'idle' | 'jumping' | 'docking' | 'docked' | 'exiting'

interface Props {
  onDockedChange: (docked: boolean) => void
}

// ── Mobile speech bubble ──────────────────────────────────────────────────────
function drawMobileBubble(
  ctx: CanvasRenderingContext2D,
  content: BubbleContent,
  progress: number,
  canvasW: number,
  bubTop: number,
  bubBot: number,
  page: number,
): void {
  if (progress <= 0.01) return

  const alpha  = Math.min(1, progress)
  const PAD    = 20
  const innerW = canvasW - PAD * 2
  const H      = bubBot - bubTop

  const TITLE_FS = 22
  const ROLE_FS  = 16
  const META_FS  = 13
  const BODY_FS  = 15

  const topImg = getImage(DIAL_TOP)
  const botImg = getImage(DIAL_BOT)
  const ornH   = Math.round(H * 0.048)

  type Line = {
    text: string; font: string; color: string
    indent: number; lineH: number; isDivider?: boolean
  }
  const bodyLines: Line[] = []

  if (content.role)
    bodyLines.push({
      text: content.role,
      font: `italic 400 ${ROLE_FS}px 'Perpetua', serif`,
      color: 'rgba(255,255,255,0.90)',
      indent: 0, lineH: ROLE_FS * 1.55,
    })

  if (content.meta)
    bodyLines.push({
      text: content.meta,
      font: `400 ${META_FS}px 'Perpetua', serif`,
      color: 'rgba(200,220,215,0.58)',
      indent: 0, lineH: META_FS * 1.65,
    })

  if (content.description) {
    const f = `400 ${META_FS}px 'Perpetua', serif`
    ctx.font = f
    wrapText(ctx, content.description, innerW).forEach(l =>
      bodyLines.push({ text: l, font: f, color: 'rgba(220,235,230,0.70)', indent: 0, lineH: META_FS * 1.65 })
    )
  }

  if (content.bullets.length > 0) {
    bodyLines.push({ text: '', font: '', color: '', indent: 0, lineH: BODY_FS * 0.65, isDivider: true })
    const f = `400 ${BODY_FS}px 'Perpetua', serif`
    ctx.font = f
    content.bullets.forEach(b => {
      if (b === '---') {
        bodyLines.push({ text: '', font: '', color: '', indent: 0, lineH: BODY_FS * 0.65, isDivider: true })
        return
      }
      wrapText(ctx, `· ${b}`, innerW - 8).forEach((l, li) =>
        bodyLines.push({
          text: l, font: f, color: 'rgba(240,248,244,0.88)',
          indent: li > 0 ? BODY_FS * 0.8 : BODY_FS * 0.5, lineH: BODY_FS * 1.62,
        })
      )
    })
  }

  const TITLE_H    = ornH + 10 + TITLE_FS + 14
  const FOOTER_H   = ornH + 26
  const BODY_AVAIL = H - TITLE_H - FOOTER_H - PAD

  const pages: Line[][] = []
  let cur: Line[] = [], curH = 0
  for (const line of bodyLines) {
    if (curH + line.lineH > BODY_AVAIL && cur.length > 0) {
      pages.push(cur); cur = []; curH = 0
    }
    cur.push(line); curH += line.lineH
  }
  if (cur.length) pages.push(cur)

  const maxPage     = Math.max(0, pages.length - 1)
  const clampedPage = Math.max(0, Math.min(page, maxPage))
  const pageLines   = pages[clampedPage] ?? []

  ctx.save()
  ctx.globalAlpha = alpha

  // Background
  ctx.fillStyle = 'rgba(4, 10, 8, 0.92)'
  ctx.fillRect(0, bubTop, canvasW, H)

  // Top ornament
  if (topImg && topImg.naturalWidth > 0) {
    const tW = Math.round((topImg.naturalWidth * ornH) / (topImg.naturalHeight || 1))
    ctx.drawImage(topImg, (canvasW - tW) / 2, bubTop, tW, ornH)
  } else {
    ctx.fillStyle = 'rgba(65, 185, 130, 0.35)'
    ctx.fillRect(PAD, bubTop + 6, innerW, 1)
  }

  // Title
  ctx.font         = `700 ${TITLE_FS}px 'Trajan Pro', serif`
  ctx.fillStyle    = 'rgba(220, 195, 110, 0.97)'
  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor  = 'rgba(210, 175, 80, 0.30)'
  ctx.shadowBlur   = 10
  ctx.fillText(content.title, PAD, bubTop + ornH + 10 + TITLE_FS)
  ctx.shadowBlur   = 0

  // Rule below title
  ctx.fillStyle = 'rgba(255,255,255,0.09)'
  ctx.fillRect(PAD, bubTop + TITLE_H - 6, innerW, 1)

  // Body clip
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, bubTop + TITLE_H, canvasW, BODY_AVAIL)
  ctx.clip()

  let ty = bubTop + TITLE_H + (pageLines[0]?.lineH ?? 0) * 0.78
  pageLines.forEach(line => {
    if (line.isDivider) {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.moveTo(PAD,           ty - line.lineH * 0.4)
      ctx.lineTo(canvasW - PAD, ty - line.lineH * 0.4)
      ctx.stroke()
      ty += line.lineH
      return
    }
    ctx.font      = line.font
    ctx.fillStyle = line.color
    ctx.fillText(line.text, PAD + line.indent, ty)
    ty += line.lineH
  })
  ctx.restore()

  // Bottom ornament
  const botY = bubBot - FOOTER_H
  if (botImg && botImg.naturalWidth > 0) {
    const bW = Math.round((botImg.naturalWidth * ornH) / (botImg.naturalHeight || 1))
    ctx.drawImage(botImg, (canvasW - bW) / 2, botY, bW, ornH)
  } else {
    ctx.fillStyle = 'rgba(65, 185, 130, 0.35)'
    ctx.fillRect(PAD, botY, innerW, 1)
  }

  // Pagination footer
  const indY  = bubBot - 10
  const pulse = 0.55 + 0.45 * Math.sin(Date.now() / 380)
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'

  if (pages.length > 1) {
    // Page counter
    ctx.globalAlpha = alpha * 0.65
    ctx.font        = `400 12px 'Perpetua', serif`
    ctx.fillStyle   = 'rgba(160,200,175,1)'
    ctx.fillText(`${clampedPage + 1} / ${pages.length}`, canvasW / 2, indY)

    // Left / right tap hints
    ctx.globalAlpha = alpha * pulse * 0.70
    ctx.font        = `400 11px 'Perpetua', serif`

    if (clampedPage > 0) {
      ctx.fillStyle = 'rgba(168,197,232,1)'
      ctx.textAlign = 'left'
      ctx.fillText('◀ prev', PAD, indY - 15)
    }
    if (clampedPage < maxPage) {
      ctx.fillStyle = 'rgba(168,197,232,1)'
      ctx.textAlign = 'right'
      ctx.fillText('next ▶', canvasW - PAD, indY - 15)
    } else {
      ctx.fillStyle = 'rgba(100,215,175,1)'
      ctx.textAlign = 'center'
      ctx.fillText('tap  Jump ↑  to continue', canvasW / 2, indY - 15)
    }
  } else {
    ctx.globalAlpha = alpha * pulse * 0.70
    ctx.font        = `400 11px 'Perpetua', serif`
    ctx.fillStyle   = 'rgba(100,215,175,1)'
    ctx.fillText('tap  Jump ↑  to continue', canvasW / 2, indY)
  }

  ctx.restore()
}

// ── Island + logo card ────────────────────────────────────────────────────────
function drawMobileCard(
  ctx: CanvasRenderingContext2D,
  p: MobilePlatform,
  screenY: number,   // island top in screen space (worldY + cameraY)
  cx: number,
  cScale: number,
  showCard: boolean,
): void {
  const iW  = Math.round((p.isCurrent ? 230 : 200) * cScale)
  const iX  = cx - iW / 2

  // Ambient glow
  const glowR = iW * 0.7
  const glow  = ctx.createRadialGradient(cx, screenY, 0, cx, screenY, glowR)
  glow.addColorStop(0, p.isCurrent ? 'rgba(210,165,55,0.10)' : 'rgba(55,165,115,0.07)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, screenY, glowR, 0, Math.PI * 2)
  ctx.fill()

  // Island sprite
  const platImg = getImage(PLAT_SPRITE)
  if (platImg && platImg.naturalWidth > 0) {
    const vH = Math.round((platImg.naturalHeight * iW) / platImg.naturalWidth)
    ctx.drawImage(platImg, iX, screenY, iW, vH)
    const bt = screenY + vH
    const bh = Math.round(18 * cScale)
    ctx.fillStyle = '#0c1910'
    ctx.beginPath()
    ctx.moveTo(iX + 6,       bt)
    ctx.lineTo(iX + iW - 6,  bt)
    ctx.lineTo(iX + iW - 14, bt + bh)
    ctx.lineTo(iX + 14,      bt + bh)
    ctx.closePath()
    ctx.fill()
  } else {
    ctx.fillStyle = p.isCurrent ? '#3a2e18' : '#2e1e10'
    ctx.fillRect(iX, screenY, iW, 18)
    ctx.fillStyle = p.isCurrent ? 'rgba(210,165,55,0.7)' : 'rgba(80,200,150,0.4)'
    ctx.fillRect(iX, screenY, iW, 2)
  }

  if (!showCard) return

  const boxH = Math.round((p.isCurrent ? 100 : 88) * cScale)
  const boxW = iW - 12
  const boxY = screenY - boxH
  const boxX = cx - boxW / 2

  ctx.fillStyle   = 'rgba(250,250,246,0.97)'
  ctx.beginPath()
  ctx.roundRect(boxX, boxY, boxW, boxH, 4)
  ctx.fill()
  ctx.strokeStyle = p.isCurrent ? 'rgba(200,155,45,0.90)' : 'rgba(130,155,125,0.40)'
  ctx.lineWidth   = p.isCurrent ? 2.5 : 1
  ctx.stroke()

  // Amber orb (current role)
  if (p.isCurrent) {
    const t     = Date.now()
    const pulse = 0.7 + 0.3 * Math.sin(t / 600)
    const fy    = boxY - 12 - Math.sin(t / 700) * 4
    const og    = ctx.createRadialGradient(cx, fy, 0, cx, fy, 25)
    og.addColorStop(0, `rgba(240,185,65,${(pulse * 0.5).toFixed(2)})`)
    og.addColorStop(1, 'rgba(200,130,30,0)')
    ctx.fillStyle = og
    ctx.beginPath()
    ctx.arc(cx, fy, 25, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = `rgba(255,220,110,${pulse.toFixed(2)})`
    ctx.beginPath()
    ctx.arc(cx, fy, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Logo
  if (p.logoSrc) {
    const logo = getImage(p.logoSrc)
    if (logo && logo.naturalWidth > 0) {
      const maxH = boxH - 22
      const maxW = boxW - 14
      let lH = maxH
      let lW = Math.round((logo.naturalWidth * lH) / logo.naturalHeight)
      if (lW > maxW) { lW = maxW; lH = Math.round((logo.naturalHeight * lW) / logo.naturalWidth) }
      ctx.drawImage(logo, cx - lW / 2, boxY + 6, lW, lH)
    }
  } else {
    ctx.fillStyle    = 'rgba(30,180,140,0.90)'
    ctx.font         = `700 ${Math.round(13 * cScale)}px 'Trajan Pro', serif`
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Projects', cx, boxY + boxH / 2 - 6)
    ctx.textBaseline = 'alphabetic'
  }

  // Company name
  ctx.fillStyle    = p.isCurrent ? 'rgba(170,120,35,0.95)' : 'rgba(50,70,60,0.85)'
  ctx.font         = `700 ${Math.round(12 * cScale)}px 'Trajan Pro', serif`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(p.label, cx, boxY + boxH - 6)

  // Period above box
  ctx.fillStyle = 'rgba(160,200,175,0.80)'
  ctx.font      = `400 ${Math.round(10 * cScale)}px 'Perpetua', serif`
  ctx.fillText(p.period, cx, boxY - 7)

  ctx.textAlign    = 'left'
  ctx.textBaseline = 'alphabetic'
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function MobileGameCanvas({ onDockedChange }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const jumpUpRef    = useRef<(() => void) | null>(null)
  const fallDownRef  = useRef<(() => void) | null>(null)
  const [loaded,     setLoaded]     = useState(false)
  const [showJumpUp, setShowJumpUp] = useState(false)
  const [showFallDn, setShowFallDn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    const dpr      = window.devicePixelRatio || 1
    const logicalW = window.innerWidth
    const logicalH = window.innerHeight
    canvas.width   = Math.round(logicalW * dpr)
    canvas.height  = Math.round(logicalH * dpr)
    canvas.style.width  = `${logicalW}px`
    canvas.style.height = `${logicalH}px`

    const groundY = logicalH * GROUND_Y_FAC
    const platCX  = logicalW * 0.50
    const knightX = logicalW * 0.50 - KNIGHT_COLLISION_W / 2

    // Surface AABB half-width
    const surfW = Math.round((CARD_SCALE * 200 - 12) * 0.85)

    // When docked the active platform surface appears at this screen Y
    const dockScreenY = Math.round(logicalH * DOCK_SCREEN_Y)
    // Bubble bottom = just above knight standing on docked platform
    const bubBotY = dockScreenY - KNIGHT_COLLISION_H - 10

    // ── Build platforms ────────────────────────────────────────────────────────
    function buildPlatforms(): MobilePlatform[] {
      const work = workExperience.slice(0, 4)   // Merkle, TechM, PwC, Infosys
      const result: MobilePlatform[] = work.map((w, i) => ({
        worldY:    groundY - ABOVE_GROUNDS[i],
        visited:   false,
        isCurrent: !!w.current,
        logoSrc:   COMPANY_LOGO[w.id] ?? null,
        label:     w.company,
        period:    w.period,
      }))
      result.push({
        worldY:    groundY - ABOVE_GROUNDS[4],
        visited:   false,
        isCurrent: false,
        logoSrc:   null,
        label:     'Personal Projects',
        period:    'Side work & open source',
      })
      return result
    }

    // ── Mutable state ──────────────────────────────────────────────────────────
    let platforms = buildPlatforms()
    let platIdx   = 0

    // Camera: cameraY is added to worldY to get screenY.
    // At rest (ground level), cameraY = 0.
    // When docked at platIdx, targetCamY = dockScreenY - platforms[platIdx].worldY.
    let cameraY       = 0
    let targetCamY    = 0

    let runState: RunState = 'idle'
    let targetPlatIdx = 0  // used during 'exiting' to know destination

    let knightWorldY  = groundY - KNIGHT_COLLISION_H
    let velY          = 0
    let onGround      = true
    let jumpsLeft     = 2

    let bubblePage     = 0
    let bubbleProgress = 0

    let animState: 'idle' | 'jump' | 'land' = 'idle'
    let animFrame = 0
    let animTime  = 0
    let landTimer = 0

    let lastTime = performance.now()
    let rafId    = 0

    // ── Buttons ────────────────────────────────────────────────────────────────
    jumpUpRef.current = () => {
      if (runState === 'idle' && onGround) {
        // Initial jump from floor
        velY = JUMP_VY; onGround = false; jumpsLeft = 1
        runState = 'jumping'; animState = 'jump'; animFrame = 0; animTime = 0
        setShowJumpUp(false); setShowFallDn(false)
        return
      }
      if (runState !== 'docked') return
      targetPlatIdx = platIdx + 1
      runState = 'exiting'
      bubbleProgress = 0
      onDockedChange(false)
      setShowJumpUp(false); setShowFallDn(false)
    }

    fallDownRef.current = () => {
      if (runState !== 'docked') return
      // platIdx 0 → return to ground (targetPlatIdx = -1 sentinel)
      targetPlatIdx = platIdx > 0 ? platIdx - 1 : -1
      runState = 'exiting'
      bubbleProgress = 0
      onDockedChange(false)
      setShowJumpUp(false); setShowFallDn(false)
    }

    // ── Preload ────────────────────────────────────────────────────────────────
    const assets = [
      KNIGHT_SPRITE_PATH, FLOOR_SRC, PLAT_SPRITE,
      DIAL_TOP, DIAL_BOT,
      GRASS_A, GRASS_B, GRASS_C,
      ...Object.values(COMPANY_LOGO),
    ]
    Promise.all(assets.map(s => loadImage(s).catch(() => null))).then(() => {
      setLoaded(true)
      setShowJumpUp(true)   // knight starts on ground — show jump button immediately
      lastTime = performance.now()
      rafId = requestAnimationFrame(loop)
    })

    // ── Touch handler ──────────────────────────────────────────────────────────
    function handleTouch(e: TouchEvent) {
      e.preventDefault()
      const touchX = e.changedTouches[0]?.clientX ?? logicalW / 2

      if (runState === 'docked') {
        // Left half = previous bubble page, right half = next bubble page
        if (touchX < logicalW / 2) {
          bubblePage = Math.max(0, bubblePage - 1)
        } else {
          bubblePage++
        }
        return
      }

      if (runState === 'idle' || runState === 'jumping') {
        if (onGround) {
          velY = JUMP_VY; onGround = false; jumpsLeft = 1
          runState = 'jumping'; animState = 'jump'; animFrame = 0; animTime = 0
        } else if (jumpsLeft > 0) {
          velY = JUMP_VY * 0.82; jumpsLeft--; animFrame = 0; animTime = 0
        }
      }
    }

    canvas.addEventListener('touchstart', handleTouch, { passive: false })
    canvas.addEventListener('touchmove',  (e) => e.preventDefault(), { passive: false })

    // ── Main loop ──────────────────────────────────────────────────────────────
    function loop(timestamp: number) {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
      lastTime = timestamp

      const p = platforms[platIdx]

      // ── Physics ──────────────────────────────────────────────────────────────
      if (!onGround && (runState === 'idle' || runState === 'jumping' || runState === 'exiting')) {
        velY += GRAVITY * dt
        knightWorldY += velY * dt
      }

      // Ground collision (world space) — only when not docked / docking
      if (runState !== 'docking' && runState !== 'docked') {
        if (knightWorldY >= groundY - KNIGHT_COLLISION_H) {
          if (!onGround) {
            onGround = true; jumpsLeft = 2; velY = 0
            animState = 'land'; animFrame = 0; animTime = 0; landTimer = 0.18
            if (runState === 'jumping') runState = 'idle'
            if (runState === 'exiting' && targetPlatIdx === -1) {
              runState = 'idle'
              setShowJumpUp(true); setShowFallDn(false)
            }
          }
          knightWorldY = groundY - KNIGHT_COLLISION_H
          velY = 0
        }
      }

      // Platform AABB — only when jumping upward toward current target
      if (runState === 'jumping' && !onGround && velY > 0) {
        const feetWorldY = knightWorldY + KNIGHT_COLLISION_H
        const midX       = knightX + KNIGHT_COLLISION_W / 2
        const pLeft      = platCX - surfW / 2
        const pSurfWorld = p.worldY
        if (
          midX      >= pLeft - 12 && midX      <= pLeft + surfW + 12 &&
          feetWorldY >= pSurfWorld - 8 && feetWorldY <= pSurfWorld + SURF_H + 8
        ) {
          knightWorldY = pSurfWorld - KNIGHT_COLLISION_H
          velY = 0; onGround = true; jumpsLeft = 2
          animState = 'land'; animFrame = 0; animTime = 0; landTimer = 0.18
          runState = 'docking'
        }
      }

      // During exiting — detect landing on target platform (or ground)
      if (runState === 'exiting' && !onGround) {
        if (targetPlatIdx === -1) {
          // Returning to ground — handled by normal ground collision above,
          // which sets runState = 'idle' when knight lands
        } else {
          const dest       = platforms[targetPlatIdx]
          const feetWorldY = knightWorldY + KNIGHT_COLLISION_H
          const midX       = knightX + KNIGHT_COLLISION_W / 2
          const pLeft      = platCX - surfW / 2
          const pSurfWorld = dest.worldY
          const movingDown = targetPlatIdx < platIdx
          const hit =
            midX >= pLeft - 12 && midX <= pLeft + surfW + 12 &&
            feetWorldY >= pSurfWorld - 8 && feetWorldY <= pSurfWorld + SURF_H + 8 &&
            (movingDown ? velY > 0 : velY > 0)

          if (hit) {
            platIdx = targetPlatIdx
            knightWorldY = dest.worldY - KNIGHT_COLLISION_H
            velY = 0; onGround = true; jumpsLeft = 2
            animState = 'land'; animFrame = 0; animTime = 0; landTimer = 0.18
            runState = 'docking'
          }
        }
      }

      // Docking: camera smoothly pans so active platform sits at dockScreenY
      if (runState === 'docking') {
        const p2 = platforms[platIdx]
        targetCamY = dockScreenY - p2.worldY
        cameraY   += (targetCamY - cameraY) * Math.min(1, dt * 6.0)
        knightWorldY = p2.worldY - KNIGHT_COLLISION_H

        if (Math.abs(cameraY - targetCamY) < 0.5) {
          cameraY = targetCamY
          runState = 'docked'
          bubblePage = 0; bubbleProgress = 0
          onDockedChange(true)
          setShowJumpUp(platIdx < platforms.length - 1)
          setShowFallDn(true)   // always: platIdx 0 returns to ground
        }
      }

      // Docked
      if (runState === 'docked') {
        bubbleProgress = Math.min(1, bubbleProgress + dt * 5.0)
        // Keep camera locked
        cameraY = targetCamY
        animState = 'idle'
      }

      // Exiting: camera smoothly pans toward destination
      if (runState === 'exiting') {
        const movingDown = targetPlatIdx <= platIdx
        // targetPlatIdx = -1 → camera returns to ground (cameraY = 0)
        const destDockCam = targetPlatIdx >= 0
          ? dockScreenY - platforms[targetPlatIdx].worldY
          : 0
        cameraY += (destDockCam - cameraY) * Math.min(1, dt * 3.5)

        // Launch knight if still on ground / on current platform
        if (onGround) {
          if (movingDown) {
            // Gentle hop downward — knight falls off platform
            velY = FALL_VY; onGround = false; jumpsLeft = 0
            animState = 'jump'; animFrame = 0; animTime = 0
          } else {
            // Jump upward
            velY = JUMP_VY * 0.90; onGround = false; jumpsLeft = 0
            animState = 'jump'; animFrame = 0; animTime = 0
          }
        }
      }

      // Camera snap back to ground when idle on ground
      if (runState === 'idle' && onGround) {
        targetCamY = 0
        cameraY   += (targetCamY - cameraY) * Math.min(1, dt * 3.0)
      }

      // ── Animation ──────────────────────────────────────────────────────────
      if (animState === 'land') {
        landTimer -= dt
        if (landTimer <= 0) animState = onGround ? 'idle' : 'jump'
      }
      if (!onGround && animState !== 'jump' && animState !== 'land') animState = 'jump'
      if (runState === 'docked' || runState === 'docking') animState = 'idle'

      const cfg = ANIM_CONFIG[animState]
      animTime += dt
      if (animTime >= 1 / cfg.fps) {
        animTime -= 1 / cfg.fps
        animFrame = cfg.loop
          ? (animFrame + 1) % cfg.frames.length
          : Math.min(animFrame + 1, cfg.frames.length - 1)
      }

      // ── Render ──────────────────────────────────────────────────────────────
      ctx.save()
      ctx.scale(dpr, dpr)

      drawRoomBackground(ctx, 1, logicalW, logicalH)
      drawParallaxBackground(ctx, 0, logicalW, logicalH, groundY + cameraY)

      // Ground tiles (camera-shifted)
      const floorImg = getImage(FLOOR_SRC)
      if (floorImg) {
        const tH = Math.round(38 * (logicalW / 390))
        const tW = Math.round((floorImg.naturalWidth * tH) / (floorImg.naturalHeight || 1))
        const gScreenY = groundY + cameraY
        if (tW > 0) for (let x = 0; x < logicalW; x += tW)
          ctx.drawImage(floorImg, x, gScreenY - tH + 4, tW, tH)
        ctx.fillStyle = 'rgba(6, 14, 11, 0.96)'
        ctx.fillRect(0, gScreenY + 4, logicalW, logicalH - gScreenY + Math.abs(cameraY) + 20)
      }

      // All platforms — draw bottom-to-top (higher index on top)
      const isDocked = runState === 'docked' || runState === 'docking'
      for (let i = platforms.length - 1; i >= 0; i--) {
        const pi        = platforms[i]
        const isActive  = i === platIdx
        const showCard  = !(isActive && isDocked)
        const screenY   = pi.worldY + cameraY   // world → screen

        ctx.save()
        if (pi.visited && !isActive) ctx.globalAlpha = 0.35
        else if (isActive)           ctx.globalAlpha = 1.00
        else                         ctx.globalAlpha = 0.52
        drawMobileCard(ctx, pi, screenY, platCX, CARD_SCALE, showCard)
        ctx.restore()
      }

      // Knight (world → screen)
      const knightScreenY = knightWorldY + cameraY
      const sheet = getImage(KNIGHT_SPRITE_PATH)
      const frame = ANIM_CONFIG[animState].frames[animFrame]
      drawCharacter(ctx, knightX, knightScreenY, sheet, frame, false)

      // Foreground grass
      const grassImgs: GrassImages = {
        a: getImage(GRASS_A), b: getImage(GRASS_B), c: getImage(GRASS_C),
      }
      drawParallaxForeground(ctx, logicalW, groundY + cameraY, timestamp / 1000, grassImgs)

      // Tap hint when on ground waiting
      if ((runState === 'idle' || runState === 'jumping') && onGround) {
        ctx.font      = `400 12px 'Perpetua', Georgia, serif`
        ctx.fillStyle = 'rgba(168, 197, 232, 0.42)'
        ctx.textAlign    = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText('tap to jump', logicalW / 2, groundY + cameraY - 14)
      }

      // Speech bubble
      if (bubbleProgress > 0.01) {
        drawMobileBubble(
          ctx, CONTENTS[platIdx], bubbleProgress,
          logicalW, BUBBLE_TOP, bubBotY, bubblePage,
        )
      }

      ctx.restore()
      rafId = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(rafId)
      canvas.removeEventListener('touchstart', handleTouch)
      setShowJumpUp(false)
      setShowFallDn(false)
      onDockedChange(false)
    }
  }, [onDockedChange])

  // Shared button style
  const btnStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    bottom: SOCIALS_H + 12,
    ...(side === 'right' ? { right: 24 } : { left: 24 }),
    fontFamily: 'Perpetua, Georgia, serif',
    fontSize: 15,
    color: 'rgba(210, 245, 230, 0.95)',
    background: 'rgba(8, 24, 18, 0.90)',
    border: '1px solid rgba(100, 190, 150, 0.60)',
    borderRadius: 5,
    padding: '12px 22px',
    cursor: 'pointer',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    zIndex: 20,
    letterSpacing: '0.08em',
  })

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', position: 'absolute', inset: 0, touchAction: 'none' }}
      />

      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, background: '#050a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
        }}>
          <p style={{
            fontFamily: 'Perpetua, Georgia, serif', fontSize: 15,
            color: 'rgba(168, 197, 232, 0.45)', letterSpacing: '0.12em',
          }}>…</p>
        </div>
      )}

      {/* Fall ↓ — go back to previous platform */}
      {showFallDn && (
        <button
          onClick={() => fallDownRef.current?.()}
          onTouchEnd={(e) => { e.preventDefault(); fallDownRef.current?.() }}
          style={btnStyle('left')}
        >
          ↓ Fall
        </button>
      )}

      {/* Jump ↑ — proceed to next platform */}
      {showJumpUp && (
        <button
          onClick={() => jumpUpRef.current?.()}
          onTouchEnd={(e) => { e.preventDefault(); jumpUpRef.current?.() }}
          style={btnStyle('right')}
        >
          Jump ↑
        </button>
      )}
    </div>
  )
}
