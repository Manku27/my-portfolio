'use client'
import { useEffect, useRef } from 'react'
import { drawCharacter, CHARACTER_W, CHARACTER_H } from './Character'
import { drawRoomBackground, drawRoomEnvironment, getNameLayout, LAMP_X_FACTOR, lampBulbY, PIT_X_FAC, PIT_W_FAC } from './Room'
import { drawAboutSection, getAboutPlatforms, ABOUT_SECTION_COUNT, RETURN_SECTION } from './AboutRoom'
import { getWorkTriggers, type WorkTrigger } from './WorkRoom'
import { drawSpeechBubble, type BubbleContent } from './SpeechBubble'
import { drawParallaxBackground, drawParallaxForeground, STALK_CONFIGS, MAX_SWAY } from './ParallaxLayer'
import { lerp } from '@/utils/lerp'
import { createParticles, drawParticles } from './Particles'
import { initBricks, updateBricks, checkBrickCollisions, drawBricks } from './Bricks'
import { drawCharmMenu, CHARM_COUNT, getCharmAtPoint, getCharmId } from './CharmMenu'

const SPEED = 340        // px/s horizontal
const GRAVITY = 1800     // px/s²
const JUMP_VEL = 920     // px/s upward
const GROUND_OFFSET = 64 // px from canvas bottom
const ROOM_COUNT = 3     // 0=work, 1=spawn, 2=timeline
const SPAWN_ROOM = 1

const LAMP_HOVER_RADIUS = 70 // px — distance at which lamp starts glowing

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = window.innerWidth  || 1280
      canvas.height = window.innerHeight || 720
    }
    resize()
    window.addEventListener('resize', resize)

    // Mouse state
    let mouseX = -9999
    let mouseY = -9999
    let mouseNorm = 0 // X normalised -1..1 for sway
    const onMouseMove = (e: MouseEvent) => {
      mouseX    = e.clientX
      mouseY    = e.clientY
      mouseNorm = (e.clientX / (canvas.width || 1280) - 0.5) * 2
      if (charmOpen) {
        const hit = getCharmAtPoint(mouseX, mouseY, canvas.width, canvas.height)
        if (hit !== -1) charmSelected = hit
      }
    }
    const onMouseClick = (e: MouseEvent) => {
      if (!charmOpen) return
      const hit = getCharmAtPoint(e.clientX, e.clientY, canvas.width, canvas.height)
      if (hit !== -1) {
        charmSelected = hit
        window.location.hash = getCharmId(hit)
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('click', onMouseClick)

    // Per-stalk independent sway values (one lerped state per stalk type)
    const swayValues = STALK_CONFIGS.map(() => 0)

    // Ambient particles — created once, drifted via time each frame
    const particles = createParticles()

    // Bricks — interactive world objects
    const bricks = initBricks()

    // Lamp glow (0=resting, 1=fully hovered)
    let lampGlow = 0

    // Name platform glow (0=off, 1=fully lit) — driven by character standing on it
    let nameGlow = 0

    // Speech bubble state
    let bubbleProgress   = 0
    let bubbleContent: BubbleContent | null = null
    let bubbleAnchorX    = 0
    let bubbleAnchorY    = 0

    // Vertical world (About Me) state
    let worldMode      = 'horizontal' as 'horizontal' | 'vertical'
    let charWorldY     = 0     // world-space Y in vertical mode
    let charVX         = 0     // world-space X in vertical mode (canvas-local, 0..canvasW)
    let currentSection = 0

    // Charm menu state
    let charmOpen     = false
    let charmProgress = 0      // 0=closed, 1=fully open (animated)
    let charmSelected = 0      // 0-5

    // Keys
    const keys = new Set<string>()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault()
        charmOpen = !charmOpen
        return
      }
      if (e.code === 'Escape' && charmOpen) {
        charmOpen = false
        return
      }
      if (charmOpen) {
        if (e.code === 'ArrowLeft')  charmSelected = Math.max(0, charmSelected - 1)
        if (e.code === 'ArrowRight') charmSelected = Math.min(CHARM_COUNT - 1, charmSelected + 1)
        if (e.code === 'ArrowUp')    charmSelected = Math.max(0, charmSelected - 3)
        if (e.code === 'ArrowDown')  charmSelected = Math.min(CHARM_COUNT - 1, charmSelected + 3)
        if (e.code === 'Enter')      window.location.hash = getCharmId(charmSelected)
        return // block all other keys when menu is open
      }
      keys.add(e.code)
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        // Return from About Me world when standing on the last platform
        if (worldMode === 'vertical' && currentSection === RETURN_SECTION && isGrounded) {
          worldMode  = 'horizontal'
          charX      = SPAWN_ROOM * canvas.width + canvas.width * PIT_X_FAC - CHARACTER_W - 8
          charY      = groundY() - CHARACTER_H
          velY       = -JUMP_VEL * 0.45
          isGrounded = false
          jumpsLeft  = 1
          return
        }
        if (jumpsLeft > 0) {
          velY = -JUMP_VEL
          isGrounded = false
          jumpsLeft--
        }
      }
    }
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const groundY = () => canvas.height - GROUND_OFFSET

    let charX     = SPAWN_ROOM * canvas.width + canvas.width / 2 - CHARACTER_W / 2
    let charY     = groundY() - CHARACTER_H
    let velY      = 0
    let isGrounded = true
    let jumpsLeft  = 2
    let currentRoom = SPAWN_ROOM

    let rafId = 0
    let lastTimestamp = 0

    const loop = (timestamp: number) => {
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05)
      lastTimestamp = timestamp

      // Animate charm menu open/close
      charmProgress = lerp(charmProgress, charmOpen ? 1 : 0, Math.min(1, delta * 10))

      const ground = groundY()

      if (worldMode === 'horizontal') {
        // ── Horizontal movement ─────────────────────────────────────────────
        if (!charmOpen) {
          if (keys.has('ArrowLeft')  || keys.has('KeyA')) charX -= SPEED * delta
          if (keys.has('ArrowRight') || keys.has('KeyD')) charX += SPEED * delta
        }
        charX = Math.max(0, Math.min(ROOM_COUNT * canvas.width - CHARACTER_W, charX))

        // Room snap
        currentRoom = Math.max(0, Math.min(ROOM_COUNT - 1, Math.floor(charX / canvas.width)))

        // Gravity + position
        velY  += GRAVITY * delta
        charY += velY * delta

        // Brick collision
        const brickResult = checkBrickCollisions(bricks, charX, charY, velY, CHARACTER_W, CHARACTER_H, ground, canvas.width)
        velY  = brickResult.newVelY
        charY = brickResult.newCharY
        if (brickResult.landed) { isGrounded = true; jumpsLeft = 2 }
        updateBricks(bricks, delta)

        // Name platform collision
        const np = currentRoom === 1 ? getNameLayout(ctx, canvas.width, canvas.height) : undefined
        if (np && velY > 0) {
          const npWorldX = SPAWN_ROOM * canvas.width + np.platformX
          const hOverlap = charX + CHARACTER_W > npWorldX && charX < npWorldX + np.platformW
          if (hOverlap) {
            const feet = charY + CHARACTER_H
            if (feet >= np.platformY && feet < np.platformY + 20) {
              velY = 0; charY = np.platformY - CHARACTER_H; isGrounded = true; jumpsLeft = 2
            }
          }
        }

        // Pit detection — skip ground clamp when falling through pit in spawn room
        const pitWorldL = SPAWN_ROOM * canvas.width + canvas.width * PIT_X_FAC
        const pitWorldR = pitWorldL + canvas.width * PIT_W_FAC
        const charMidX  = charX + CHARACTER_W / 2
        const overPit   = currentRoom === 1 && charMidX > pitWorldL && charMidX < pitWorldR

        if (!overPit && charY + CHARACTER_H >= ground) {
          charY = ground - CHARACTER_H; velY = 0; isGrounded = true; jumpsLeft = 2
        } else if (overPit && charY + CHARACTER_H >= ground) {
          // Feet at ground level over the pit — enter the vertical world immediately
          worldMode      = 'vertical'
          charVX         = canvas.width / 2 - CHARACTER_W / 2
          charWorldY     = 0
          currentSection = 0
          velY           = 120
          isGrounded     = false
          jumpsLeft      = 1
        }

        // Name glow
        let nameGlowTarget = 0
        if (np && isGrounded && velY === 0) {
          const npWorldX = SPAWN_ROOM * canvas.width + np.platformX
          const hOverlap = charX + CHARACTER_W > npWorldX && charX < npWorldX + np.platformW
          if (hOverlap && Math.abs((charY + CHARACTER_H) - np.platformY) < 6) nameGlowTarget = 1
        }
        nameGlow = lerp(nameGlow, nameGlowTarget, 0.08)

        // Lamp glow
        if (currentRoom === 1) {
          const dist = Math.hypot(mouseX - canvas.width * LAMP_X_FACTOR, mouseY - lampBulbY(ground))
          lampGlow = lerp(lampGlow, Math.max(0, 1 - dist / LAMP_HOVER_RADIUS), 0.1)
        } else {
          lampGlow = lerp(lampGlow, 0, 0.1)
        }

        // Stalk sway
        for (let i = 0; i < STALK_CONFIGS.length; i++) {
          const { lerpRate, amplitude } = STALK_CONFIGS[i]
          swayValues[i] = lerp(swayValues[i], mouseNorm * MAX_SWAY * amplitude, lerpRate)
        }

        // Speech bubble — proximity to work buildings in room 0
        if (currentRoom === 0) {
          const triggers = getWorkTriggers(canvas.width, ground)
          let hit: WorkTrigger | null = null
          for (const t of triggers) {
            if (Math.abs(charX + CHARACTER_W / 2 - t.worldX) < t.radius) { hit = t; break }
          }
          if (hit) {
            bubbleContent  = hit.content
            bubbleAnchorX  = hit.worldX        // room 0: cameraX=0, world X = screen X
            bubbleAnchorY  = hit.roofY
            bubbleProgress = lerp(bubbleProgress, 1, 0.15)
          } else {
            bubbleProgress = lerp(bubbleProgress, 0, 0.12)
          }
        } else {
          bubbleProgress = lerp(bubbleProgress, 0, 0.18)
        }

      } else {
        // ── Vertical world (About Me) ────────────────────────────────────────
        if (!charmOpen) {
          if (keys.has('ArrowLeft')  || keys.has('KeyA')) charVX -= SPEED * delta
          if (keys.has('ArrowRight') || keys.has('KeyD')) charVX += SPEED * delta
        }
        charVX = Math.max(0, Math.min(canvas.width - CHARACTER_W, charVX))

        velY       += GRAVITY * delta
        charWorldY += velY * delta

        // Ceiling — can't go above the top of the world
        if (charWorldY < 0) { charWorldY = 0; velY = Math.max(0, velY) }

        // Section snap
        currentSection = Math.max(0, Math.min(ABOUT_SECTION_COUNT - 1,
          Math.floor(charWorldY / canvas.height)))

        // Platform collision
        const sectionTopY = currentSection * canvas.height
        const localY      = charWorldY - sectionTopY
        const platforms   = getAboutPlatforms(currentSection, canvas.width, canvas.height)
        isGrounded = false
        for (const plat of platforms) {
          if (velY > 0) {
            const feet = localY + CHARACTER_H
            if (feet >= plat.y && feet < plat.y + 20) {
              const inX = charVX + CHARACTER_W > plat.x && charVX < plat.x + plat.w
              if (inX) {
                velY       = 0
                charWorldY = sectionTopY + plat.y - CHARACTER_H
                isGrounded = true
                jumpsLeft  = 2
              }
            }
          }
        }
      }

      // time in seconds for particle drift
      const time = timestamp / 1000

      // ── Draw ──────────────────────────────────────────────────────────────
      if (worldMode === 'horizontal') {
        const cameraX = currentRoom * canvas.width
        const screenX = charX - cameraX
        drawRoomBackground(ctx, currentRoom, canvas.width, canvas.height)
        drawParallaxBackground(ctx, charX, canvas.width, canvas.height, ground)
        drawRoomEnvironment(ctx, currentRoom, canvas.width, canvas.height, ground, lampGlow, nameGlow,
          currentRoom === 1 ? getNameLayout(ctx, canvas.width, canvas.height) : undefined)
        drawBricks(ctx, bricks, cameraX, ground, canvas.width)
        if (currentRoom === 1) drawParticles(ctx, particles, canvas.width, canvas.height, time)
        drawParallaxForeground(ctx, charX, canvas.width, ground, swayValues)
        drawCharacter(ctx, screenX, charY)
      } else {
        const sectionTopY = currentSection * canvas.height
        const vertScreenY = charWorldY - sectionTopY
        drawAboutSection(ctx, currentSection, canvas.width, canvas.height)
        drawCharacter(ctx, charVX, vertScreenY)
      }

      // Speech bubble — drawn above world, below charm menu
      if (bubbleContent && bubbleProgress > 0.01) {
        drawSpeechBubble(ctx, bubbleAnchorX, bubbleAnchorY, bubbleContent, bubbleProgress, canvas.width, canvas.height)
      }

      // Charm menu — drawn last so it sits on top of everything
      if (charmProgress > 0.01) {
        drawCharmMenu(ctx, canvas.width, canvas.height, charmProgress, charmSelected)
      }

      rafId = requestAnimationFrame(loop)
    }

    // Preload Trajan Pro Bold via FontFace API so ctx.measureText is reliable.
    // CSS @font-face alone doesn't guarantee OTF fonts appear in document.fonts.
    const preloadFonts = async () => {
      try {
        const bold = new FontFace('Trajan Pro', 'url(/fonts/Trajan-Pro-Bold.otf)', { weight: '700', style: 'normal' })
        await bold.load()
        document.fonts.add(bold)
      } catch {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Game] Trajan Pro Bold failed to preload — falling back to serif for measurements')
        }
      }
      rafId = requestAnimationFrame(loop)
    }
    preloadFonts()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click', onMouseClick)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" />
}
