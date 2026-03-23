'use client'

import { forwardRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'

interface BackgroundCanvasProps {
  scrollRef: React.RefObject<number>
  mouseRef: React.RefObject<{ x: number; y: number }>
}

export const BackgroundCanvas = forwardRef<HTMLDivElement, BackgroundCanvasProps>(
  function BackgroundCanvas({ scrollRef, mouseRef }, ref) {
    return (
      <div
        ref={ref}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          willChange: 'opacity',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ antialias: false, alpha: true }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
        >
          <Scene scrollRef={scrollRef} mouseRef={mouseRef} />
        </Canvas>
      </div>
    )
  }
)
