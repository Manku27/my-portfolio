'use client'
import { useEffect, useRef } from 'react'
import { drawCharacter, CHARACTER_W, CHARACTER_H } from './Character'
import { drawRoomBackground, drawRoomEnvironment, LAMP_X_FACTOR, lampBulbY } from './Room'
import { drawParallaxBackground, drawParallaxForeground, STALK_CONFIGS, MAX_SWAY } from './ParallaxLayer'
import { lerp } from '@/utils/lerp'

const SPEED = 220        // px/s horizontal
const GRAVITY = 1800     // px/s²
const JUMP_VEL = 720     // px/s upward
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
    }
    window.addEventListener('mousemove', onMouseMove)

    // Per-stalk independent sway values (one lerped state per stalk type)
    const swayValues = STALK_CONFIGS.map(() => 0)

    // Lamp glow (0=resting, 1=fully hovered)
    let lampGlow = 0

    // Keys
    const keys = new Set<string>()
    const onKeyDown = (e: KeyboardEvent) => {
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

      // Horizontal
      if (keys.has('ArrowLeft')  || keys.has('KeyA')) charX -= SPEED * delta
      if (keys.has('ArrowRight') || keys.has('KeyD')) charX += SPEED * delta
      charX = Math.max(0, Math.min(ROOM_COUNT * canvas.width - CHARACTER_W, charX))

      // Room snap
      currentRoom = Math.max(0, Math.min(ROOM_COUNT - 1, Math.floor(charX / canvas.width)))

      // Vertical
      velY += GRAVITY * delta
      charY += velY * delta
      const ground = groundY()
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

      // Draw
      drawRoomBackground(ctx, currentRoom, canvas.width, canvas.height)
      drawParallaxBackground(ctx, charX, canvas.width, canvas.height, ground)
      drawRoomEnvironment(ctx, currentRoom, canvas.width, canvas.height, ground, lampGlow)
      drawParallaxForeground(ctx, charX, canvas.width, ground, swayValues)
      drawCharacter(ctx, screenX, charY)

      console.log('frame delta:', (delta * 1000).toFixed(2), 'ms')

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0" />
}
