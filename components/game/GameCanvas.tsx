'use client'
import { useEffect, useRef } from 'react'

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

    let rafId: number
    let lastTimestamp = 0

    const loop = (timestamp: number) => {
      const delta = timestamp - lastTimestamp
      lastTimestamp = timestamp

      ctx.fillStyle = '#050a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      console.log('frame delta:', delta.toFixed(2), 'ms')

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0" />
}
