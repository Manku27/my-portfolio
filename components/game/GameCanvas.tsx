'use client'
import { useEffect, useRef } from 'react'
import { drawCharacter, CHARACTER_W, CHARACTER_H } from './Character'

const SPEED = 220 // px per second

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
    const onKeyDown = (e: KeyboardEvent) => keys.add(e.code)
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.code)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let charX = canvas.width / 2 - CHARACTER_W / 2
    const charY = canvas.height / 2 - CHARACTER_H / 2

    let rafId: number
    let lastTimestamp = 0

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000 // seconds
      lastTimestamp = timestamp

      const movingLeft = keys.has('ArrowLeft') || keys.has('KeyA')
      const movingRight = keys.has('ArrowRight') || keys.has('KeyD')

      if (movingLeft) charX -= SPEED * delta
      if (movingRight) charX += SPEED * delta

      charX = Math.max(0, Math.min(canvas.width - CHARACTER_W, charX))

      ctx.fillStyle = '#050a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

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
