'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { lerp } from '@/utils/lerp'

const PRIMARY_COUNT = 900
const ACCENT_COUNT = 100
const TOTAL_COUNT = PRIMARY_COUNT + ACCENT_COUNT

interface ParticleFieldProps {
  scrollRef: React.RefObject<number>
  mouseRef: React.RefObject<{ x: number; y: number }>
}

function buildAlphaMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.6)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

function initParticles(count: number) {
  const positions = new Float32Array(count * 3)
  const origins = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 20
    const y = (Math.random() - 0.5) * 12
    const z = (Math.random() - 0.5) * 2

    positions[i * 3] = x
    positions[i * 3 + 1] = y
    positions[i * 3 + 2] = z
    origins[i * 3] = x
    origins[i * 3 + 1] = y
    origins[i * 3 + 2] = z

    phases[i] = Math.random() * Math.PI * 2
    speeds[i] = 0.5 + Math.random() * 1.0
  }

  return { positions, origins, phases, speeds }
}

export function ParticleField({ scrollRef, mouseRef }: ParticleFieldProps) {
  const { camera } = useThree()

  const primaryRef = useRef<THREE.Points>(null)
  const accentRef = useRef<THREE.Points>(null)
  const clockRef = useRef(0)

  // Pre-allocated vectors — never new inside useFrame
  const ndcVec = useRef(new THREE.Vector3())
  const mouseWorld = useRef(new THREE.Vector3())

  const primaryData = useMemo(() => initParticles(PRIMARY_COUNT), [])
  const accentData = useMemo(() => initParticles(ACCENT_COUNT), [])
  const alphaMap = useMemo(() => buildAlphaMap(), [])

  const primaryPositions = useRef(primaryData.positions)
  const accentPositions = useRef(accentData.positions)

  useFrame((_, delta) => {
    clockRef.current += delta

    const t = clockRef.current
    const scroll = scrollRef.current ?? 0
    const mouse = mouseRef.current ?? { x: 0.5, y: 0.5 }

    // Project mouse NDC to world Z=0
    ndcVec.current.set(mouse.x * 2 - 1, -(mouse.y * 2 - 1), 0.5)
    ndcVec.current.unproject(camera)
    ndcVec.current.sub(camera.position).normalize()
    const dist = -camera.position.z / ndcVec.current.z
    mouseWorld.current.copy(camera.position).addScaledVector(ndcVec.current, dist)

    const mwx = mouseWorld.current.x
    const mwy = mouseWorld.current.y

    const REPEL_RADIUS = 4
    const REPEL_RADIUS_SQ = REPEL_RADIUS * REPEL_RADIUS
    const scrollOffsetY = scroll * -3

    // Animate primary particles
    const pp = primaryPositions.current
    const po = primaryData.origins
    const pph = primaryData.phases
    const psp = primaryData.speeds

    for (let i = 0; i < PRIMARY_COUNT; i++) {
      const i3 = i * 3
      const ox = po[i3]
      const oy = po[i3 + 1]
      const oz = po[i3 + 2]
      const phase = pph[i]
      const speed = psp[i]

      const driftX = Math.sin(t * 0.3 * speed + phase) * 0.15
      const driftY = Math.cos(t * 0.2 * speed + phase * 1.3) * 0.1

      const cx = ox + driftX
      const cy = oy + driftY

      const dx = cx - mwx
      const dy = cy - mwy
      const distSq = dx * dx + dy * dy

      let repelX = 0
      let repelY = 0
      if (distSq < REPEL_RADIUS_SQ && distSq > 0.001) {
        const d = Math.sqrt(distSq)
        const strength = (1 - d / REPEL_RADIUS) * 0.8
        repelX = (dx / d) * strength
        repelY = (dy / d) * strength
      }

      pp[i3] = cx + repelX
      pp[i3 + 1] = cy + repelY + scrollOffsetY
      pp[i3 + 2] = oz
    }

    // Animate accent particles
    const ap = accentPositions.current
    const ao = accentData.origins
    const aph = accentData.phases
    const asp = accentData.speeds

    for (let i = 0; i < ACCENT_COUNT; i++) {
      const i3 = i * 3
      const ox = ao[i3]
      const oy = ao[i3 + 1]
      const oz = ao[i3 + 2]
      const phase = aph[i]
      const speed = asp[i]

      const driftX = Math.sin(t * 0.3 * speed + phase) * 0.15
      const driftY = Math.cos(t * 0.2 * speed + phase * 1.3) * 0.1

      const cx = ox + driftX
      const cy = oy + driftY

      const dx = cx - mwx
      const dy = cy - mwy
      const distSq = dx * dx + dy * dy

      let repelX = 0
      let repelY = 0
      if (distSq < REPEL_RADIUS_SQ && distSq > 0.001) {
        const d = Math.sqrt(distSq)
        const strength = (1 - d / REPEL_RADIUS) * 1.2
        repelX = (dx / d) * strength
        repelY = (dy / d) * strength
      }

      ap[i3] = cx + repelX
      ap[i3 + 1] = cy + repelY + scrollOffsetY
      ap[i3 + 2] = oz
    }

    if (primaryRef.current) {
      const attr = primaryRef.current.geometry.attributes.position as THREE.BufferAttribute
      attr.needsUpdate = true
    }
    if (accentRef.current) {
      const attr = accentRef.current.geometry.attributes.position as THREE.BufferAttribute
      attr.needsUpdate = true
    }

    // Fade opacity on scroll — lerp material opacity
    const targetOpacity = lerp(0.55, 0, Math.min(scroll, 1))
    if (primaryRef.current) {
      const mat = primaryRef.current.material as THREE.PointsMaterial
      mat.opacity = lerp(mat.opacity, targetOpacity, 0.1)
    }
    if (accentRef.current) {
      const mat = accentRef.current.material as THREE.PointsMaterial
      mat.opacity = lerp(mat.opacity, targetOpacity * 1.3, 0.1)
    }
  })

  return (
    <>
      {/* Primary dim particles — #6b7a8d */}
      <points ref={primaryRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[primaryPositions.current, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#6b7a8d"
          size={0.12}
          sizeAttenuation
          transparent
          opacity={0.55}
          alphaMap={alphaMap}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Accent brighter particles — #a8c5e8 */}
      <points ref={accentRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[accentPositions.current, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#a8c5e8"
          size={0.1}
          sizeAttenuation
          transparent
          opacity={0.7}
          alphaMap={alphaMap}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}
