'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ANIM_CONFIG,
  KNIGHT_COLLISION_H,
  KNIGHT_COLLISION_W,
  KNIGHT_SPRITE_PATH,
} from '@/lib/sprites/knight-frames'
import { drawCharacter } from '@/components/game/Character'
import {
  drawParallaxBackground,
  drawParallaxForeground,
  type GrassImages,
} from '@/components/game/ParallaxLayer'
import {
  drawRoomBackground,
  drawRoomEnvironment,
  drawSpawnBench,
  spawnScale,
} from '@/components/game/Room'
import { loadImage, getImage } from '@/utils/loadAssets'
import type { GameMode } from './MobileGame'

// ─── Spawn room assets ────────────────────────────────────────────────────────
const BENCH_SRC  = '/sprites/Town_bench.webp'
const POLE_SRC   = '/sprites/station_pole.png'
const FLOOR_SRC  = '/sprites/town_floor_01.png'
const GRASS_A    = '/sprites/grass_01_idle0000.png'
const GRASS_B    = '/sprites/grass_03_idle0015.png'
const GRASS_C    = '/sprites/simple_grass0007.png'
const DIALOGUE_TOP = '/sprites/Controller_Dialogue_0000_top.png'
const DIALOGUE_BOT = '/sprites/Controller_Dialogue_0001_bot.png'
const GROUND_Y_FAC = 0.88

const MODES: { id: GameMode; label: string }[] = [
  { id: 'career',   label: 'Career'   },
  { id: 'timeline', label: 'Timeline' },
]

interface Props {
  onSelect: (mode: GameMode) => void
}

export default function ModeSelect({ onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [selected, setSelected] = useState<number>(0)

  // ── Room canvas ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    if (!ctx) return

    const dpr     = window.devicePixelRatio || 1
    const logicalW = window.innerWidth
    const logicalH = window.innerHeight
    canvas.width  = Math.round(logicalW * dpr)
    canvas.height = Math.round(logicalH * dpr)
    canvas.style.width  = `${logicalW}px`
    canvas.style.height = `${logicalH}px`

    const assets = [
      KNIGHT_SPRITE_PATH, BENCH_SRC, POLE_SRC, FLOOR_SRC,
      GRASS_A, GRASS_B, GRASS_C, DIALOGUE_TOP, DIALOGUE_BOT,
    ]

    let animFrame = 0
    let animTime  = 0
    let rafId     = 0
    let lastTime  = performance.now()

    Promise.all(assets.map((s) => loadImage(s).catch(() => null))).then(() => {
      setLoaded(true)
      lastTime = performance.now()
      rafId = requestAnimationFrame(loop)
    })

    function loop(timestamp: number) {
      const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
      lastTime = timestamp

      const groundY = logicalH * GROUND_Y_FAC
      const uiScale = spawnScale(logicalW, logicalH)

      // Advance idle animation
      animTime += dt
      const cfg = ANIM_CONFIG.idle
      if (animTime >= 1 / cfg.fps) {
        animTime -= 1 / cfg.fps
        animFrame = (animFrame + 1) % cfg.frames.length
      }

      ctx.save()
      ctx.scale(dpr, dpr)

      // Background tint + spawn atmosphere
      drawRoomBackground(ctx, 1, logicalW, logicalH)

      // Parallax (mid vines + far bloom)
      drawParallaxBackground(ctx, 0, logicalW, logicalH, groundY)

      // Ground + lamp + signposts
      drawRoomEnvironment(
        ctx, 1, logicalW, logicalH, groundY,
        0.6, 0, undefined,
        {
          groundImg: getImage(FLOOR_SRC),
          poleImg:   getImage(POLE_SRC),
          benchImg:  getImage(BENCH_SRC),
          sign1Img:  null,
          sign2Img:  null,
        }
      )

      // Foreground grass
      const grassImgs: GrassImages = {
        a: getImage(GRASS_A),
        b: getImage(GRASS_B),
        c: getImage(GRASS_C),
      }
      drawParallaxForeground(ctx, logicalW, groundY, timestamp / 1000, grassImgs)

      // Bench — drawn in front of foreground
      drawSpawnBench(ctx, logicalW, logicalH, groundY, getImage(BENCH_SRC))

      // Knight idle — positioned left-of-bench
      const knightDisplayX = logicalW * 0.33
      const knightY        = groundY - KNIGHT_COLLISION_H
      const sheet = getImage(KNIGHT_SPRITE_PATH)
      const frame = ANIM_CONFIG.idle.frames[animFrame]
      drawCharacter(ctx, knightDisplayX, knightY, sheet, frame, false)

      ctx.restore()
      rafId = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [])

  // ── Keyboard nav (desktop fallback) ──────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowUp')   setSelected((s) => (s + MODES.length - 1) % MODES.length)
      if (e.key === 'ArrowDown') setSelected((s) => (s + 1) % MODES.length)
      if (e.key === 'Enter')     onSelect(MODES[selected].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, onSelect])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Room canvas */}
      <canvas
        ref={canvasRef}
        style={{ display: 'block', position: 'absolute', inset: 0 }}
      />

      {/* Loading fade */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: '#050a0a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 5,
        }}>
          <p style={{
            fontFamily: 'Perpetua, Georgia, serif',
            fontSize: 15, color: 'rgba(168,197,232,0.45)',
            letterSpacing: '0.12em',
          }}>
            …
          </p>
        </div>
      )}

      {/* HK-style pause menu — floats over the room, no full-screen dim */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          width: '100%',
          maxWidth: 320,
          padding: '24px 32px',
          background: 'rgba(4, 9, 16, 0.72)',
          pointerEvents: 'auto',
        }}>

          {/* Top ornament */}
          {getImage(DIALOGUE_TOP) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={DIALOGUE_TOP}
              alt=""
              style={{ width: 'auto', maxWidth: 240, marginBottom: 8, opacity: 0.85 }}
            />
          ) : (
            <div style={{ height: 2, width: 180, background: 'rgba(168,197,232,0.3)', marginBottom: 16 }} />
          )}

          {/* Menu items */}
          {MODES.map((m, i) => {
            const isSelected = i === selected
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                onTouchStart={() => setSelected(i)}
                onTouchEnd={(e) => { e.preventDefault(); onSelect(m.id) }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '14px 0',
                  width: '100%',
                  textAlign: 'center',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                }}
              >
                <span style={{
                  fontFamily: 'Perpetua, Georgia, serif',
                  fontSize: isSelected ? 26 : 22,
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? '#e8edf5' : 'rgba(168,197,232,0.5)',
                  letterSpacing: '0.06em',
                  transition: 'all 0.1s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  {isSelected && <span style={{ opacity: 0.7, fontSize: 18 }}>❧</span>}
                  {m.label}
                  {isSelected && <span style={{ opacity: 0.7, fontSize: 18 }}>❧</span>}
                </span>
              </button>
            )
          })}

          {/* Bottom ornament */}
          {getImage(DIALOGUE_BOT) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={DIALOGUE_BOT}
              alt=""
              style={{ width: 'auto', maxWidth: 240, marginTop: 8, opacity: 0.85 }}
            />
          ) : (
            <div style={{ height: 2, width: 180, background: 'rgba(168,197,232,0.3)', marginTop: 16 }} />
          )}

          {/* Hint */}
          <p style={{
            fontFamily: 'Perpetua, Georgia, serif',
            fontSize: 11,
            color: 'rgba(168,197,232,0.28)',
            marginTop: 20,
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}>
            Tap to select · Tap to jump during run
          </p>
        </div>
      </div>
    </div>
  )
}
