'use client'
import { useEffect, useRef } from 'react'
import { drawCharacter, CHARACTER_W, CHARACTER_H } from './Character'
import { drawRoomBackground, drawRoomEnvironment, LAMP_X_FACTOR, lampBulbY } from './Room'
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
      if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && jumpsLeft > 0) {
        velY = -JUMP_VEL
        isGrounded = false
        jumpsLeft--
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

    let rafId: number
    let lastTimestamp = 0

    const loop = (timestamp: number) => {
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05)
      lastTimestamp = timestamp

      // Animate charm menu open/close
      charmProgress = lerp(charmProgress, charmOpen ? 1 : 0, Math.min(1, delta * 10))

      // Horizontal — blocked while charm menu is open
      if (!charmOpen) {
      if (keys.has('ArrowLeft')  || keys.has('KeyA')) charX -= SPEED * delta
      if (keys.has('ArrowRight') || keys.has('KeyD')) charX += SPEED * delta
      }
      charX = Math.max(0, Math.min(ROOM_COUNT * canvas.width - CHARACTER_W, charX))

      // Room snap
      currentRoom = Math.max(0, Math.min(ROOM_COUNT - 1, Math.floor(charX / canvas.width)))

      // Vertical
      velY += GRAVITY * delta
      charY += velY * delta
      const ground = groundY()

      // Brick collision — head hits underside or feet land on top
      const brickResult = checkBrickCollisions(bricks, charX, charY, velY, CHARACTER_W, CHARACTER_H, ground, canvas.width)
      velY  = brickResult.newVelY
      charY = brickResult.newCharY
      if (brickResult.landed) {
        isGrounded = true
        jumpsLeft  = 2
      }
      updateBricks(bricks, delta)

      if (charY + CHARACTER_H >= ground) {
        charY = ground - CHARACTER_H
        velY = 0
        isGrounded = true
        jumpsLeft = 2
      }

      // Camera
      const cameraX = currentRoom * canvas.width
      const screenX = charX - cameraX

      // Independent stalk sway — each lerps at its own rate toward cursor target
      for (let i = 0; i < STALK_CONFIGS.length; i++) {
        const { lerpRate, amplitude } = STALK_CONFIGS[i]
        swayValues[i] = lerp(swayValues[i], mouseNorm * MAX_SWAY * amplitude, lerpRate)
      }

      // Lamp glow — compute hover distance only in spawn room
      if (currentRoom === 1) {
        const lampScreenX = canvas.width * LAMP_X_FACTOR
        const lampBY      = lampBulbY(ground)
        const dist = Math.hypot(mouseX - lampScreenX, mouseY - lampBY)
        const glowTarget = Math.max(0, 1 - dist / LAMP_HOVER_RADIUS)
        lampGlow = lerp(lampGlow, glowTarget, 0.1)
      } else {
        lampGlow = lerp(lampGlow, 0, 0.1)
      }

      // time in seconds for particle drift
      const time = timestamp / 1000

      // Draw order: bg → parallax bg → room env → bricks → particles → parallax fg → character
      drawRoomBackground(ctx, currentRoom, canvas.width, canvas.height)
      drawParallaxBackground(ctx, charX, canvas.width, canvas.height, ground)
      drawRoomEnvironment(ctx, currentRoom, canvas.width, canvas.height, ground, lampGlow)
      drawBricks(ctx, bricks, cameraX, ground, canvas.width)
      if (currentRoom === 1) {
        drawParticles(ctx, particles, canvas.width, canvas.height, time)
      }
      drawParallaxForeground(ctx, charX, canvas.width, ground, swayValues)
      drawCharacter(ctx, screenX, charY)

      // Charm menu — drawn last so it sits on top of everything
      if (charmProgress > 0.01) {
        drawCharmMenu(ctx, canvas.width, canvas.height, charmProgress, charmSelected)
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click', onMouseClick)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0" />
}
