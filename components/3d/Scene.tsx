'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { lerp } from '@/utils/lerp'
import { ParticleField } from './ParticleField'

interface SceneProps {
  scrollRef: React.RefObject<number>
  mouseRef: React.RefObject<{ x: number; y: number }>
}

function CameraController({ mouseRef }: { mouseRef: React.RefObject<{ x: number; y: number }> }) {
  const { camera } = useThree()

  useFrame(() => {
    const mouse = mouseRef.current ?? { x: 0.5, y: 0.5 }
    const targetX = (mouse.x - 0.5) * 1.0
    const targetY = (0.5 - mouse.y) * 0.5
    camera.position.x = lerp(camera.position.x, targetX, 0.05)
    camera.position.y = lerp(camera.position.y, targetY, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return null
}

function AdaptiveDpr() {
  const { gl } = useThree()
  const dprRef = useRef(typeof window !== 'undefined' ? window.devicePixelRatio : 1)

  return (
    <PerformanceMonitor
      onDecline={() => {
        gl.setPixelRatio(0.75)
        dprRef.current = 0.75
      }}
      onIncline={() => {
        const target = typeof window !== 'undefined' ? window.devicePixelRatio : 1
        gl.setPixelRatio(target)
        dprRef.current = target
      }}
    >
      {null}
    </PerformanceMonitor>
  )
}

export function Scene({ scrollRef, mouseRef }: SceneProps) {
  return (
    <>
      <AdaptiveDpr />
      <CameraController mouseRef={mouseRef} />
      <ParticleField scrollRef={scrollRef} mouseRef={mouseRef} />
    </>
  )
}
