'use client'
import { useEffect, useRef } from 'react'
import { drawCharacter, CHARACTER_W, CHARACTER_H } from './Character'

const SPEED = 220       // px/s horizontal
const GRAVITY = 1800    // px/s² — heavy Hollow Knight feel
const JUMP_VEL = 720    // px/s upward
const GROUND_OFFSET = 64 // px from bottom of canvas

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

    let charX = canvas.width / 2 - CHARACTER_W / 2
    let charY = groundY() - CHARACTER_H
    let velY = 0
    let isGrounded = true
    let jumpsLeft = 2

    let rafId: number
    let lastTimestamp = 0

    const loop = (timestamp: number) => {
      const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.05) // cap at 50ms
      lastTimestamp = timestamp

      // Horizontal
      const movingLeft = keys.has('ArrowLeft') || keys.has('KeyA')
      const movingRight = keys.has('ArrowRight') || keys.has('KeyD')
      if (movingLeft) charX -= SPEED * delta
      if (movingRight) charX += SPEED * delta
      charX = Math.max(0, Math.min(canvas.width - CHARACTER_W, charX))

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

      // Draw
      ctx.fillStyle = '#050a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Ground plane
      ctx.fillStyle = '#1a3a3a'
      ctx.fillRect(0, ground, canvas.width, canvas.height - ground)

      drawCharacter(ctx, charX, charY)

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
