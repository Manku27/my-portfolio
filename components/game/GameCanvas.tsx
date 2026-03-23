'use client'
import { useEffect, useRef } from 'react'
import { drawCharacter, CHARACTER_W, CHARACTER_H } from './Character'
import { drawRoom } from './Room'

const SPEED = 220        // px/s horizontal
const GRAVITY = 1800     // px/s² — heavy Hollow Knight feel
const JUMP_VEL = 720     // px/s upward
const GROUND_OFFSET = 64 // px from bottom of canvas
const ROOM_COUNT = 3     // rooms: 0=work, 1=spawn, 2=timeline
const SPAWN_ROOM = 1     // character starts in this room

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

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

    // World-space position — room 1 is the spawn room
    let charX = SPAWN_ROOM * canvas.width + canvas.width / 2 - CHARACTER_W / 2
    let charY = groundY() - CHARACTER_H
    let velY = 0
    let isGrounded = true
    let jumpsLeft = 2
    let currentRoom = SPAWN_ROOM

    let rafId: number
    let lastTimestamp = 0

    const loop = (timestamp: number) => {
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05)
      lastTimestamp = timestamp

      // Horizontal movement in world space
      const movingLeft = keys.has('ArrowLeft') || keys.has('KeyA')
      const movingRight = keys.has('ArrowRight') || keys.has('KeyD')
      if (movingLeft) charX -= SPEED * delta
      if (movingRight) charX += SPEED * delta
      charX = Math.max(0, Math.min(ROOM_COUNT * canvas.width - CHARACTER_W, charX))

      // Room snap — which room is the character in?
      currentRoom = Math.floor(charX / canvas.width)
      currentRoom = Math.max(0, Math.min(ROOM_COUNT - 1, currentRoom))

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

      // Camera offset — snaps to current room
      const cameraX = currentRoom * canvas.width

      // Screen-space character position
      const screenX = charX - cameraX

      // Draw
      drawRoom(ctx, currentRoom, canvas.width, canvas.height, ground)
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
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0" />
}
