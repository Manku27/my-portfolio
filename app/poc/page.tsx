'use client'

import dynamic from 'next/dynamic'
import { useRef, useEffect } from 'react'

const BackgroundCanvas = dynamic(
  () => import('@/components/3d/BackgroundCanvas').then((m) => m.BackgroundCanvas),
  { ssr: false, loading: () => null }
)

export default function PocPage() {
  const scrollRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const canvasWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const progress = window.scrollY / window.innerHeight
      scrollRef.current = progress
      if (canvasWrapperRef.current) {
        canvasWrapperRef.current.style.opacity = String(Math.max(0, 1 - progress))
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <>
      {/* Fixed 3D canvas — sits behind everything */}
      <BackgroundCanvas ref={canvasWrapperRef} scrollRef={scrollRef} mouseRef={mouseRef} />

      {/* Scrollable content — z-index above canvas */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* First section — transparent, canvas shows through */}
        <div
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingBottom: '4rem',
          }}
        >
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '0.875rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            scroll
          </p>
        </div>

        {/* Handoff section — canvas has faded, content takes over */}
        <div
          style={{
            minHeight: '100vh',
            background: 'var(--color-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid var(--color-surface)',
          }}
        >
          <p
            style={{
              color: 'var(--color-text-primary)',
              fontSize: '1.5rem',
              fontWeight: 300,
              letterSpacing: '0.05em',
            }}
          >
            The timeline begins here.
          </p>
        </div>
      </div>
    </>
  )
}
