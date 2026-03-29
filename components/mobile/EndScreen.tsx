'use client'

import type { GameMode } from './MobileGame'

const MODE_LABELS: Record<GameMode, string> = {
  career:   'Career Journey',
  timeline: 'Timeline',
  about:    'The Story',
}

interface Props {
  mode: GameMode
  onRestart: () => void
  onChooseMode: () => void
}

export default function EndScreen({ mode, onRestart, onChooseMode }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: '0 32px 96px',
        background: 'var(--color-bg, #080c14)',
        animation: 'fadeIn 0.5s ease forwards',
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>

      <p
        style={{
          fontFamily: 'Perpetua, Georgia, serif',
          fontSize: 36,
          fontWeight: 400,
          color: '#a8c5e8',
          margin: 0,
          letterSpacing: '0.04em',
        }}
      >
        ~ Fin ~
      </p>

      <p
        style={{
          fontFamily: 'Perpetua, Georgia, serif',
          fontSize: 16,
          color: 'rgba(168, 197, 232, 0.6)',
          margin: 0,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {MODE_LABELS[mode]}
      </p>

      <p
        style={{
          fontFamily: 'Perpetua, Georgia, serif',
          fontSize: 15,
          color: 'rgba(168, 197, 232, 0.45)',
          margin: '4px 0 12px',
          textAlign: 'center',
          lineHeight: 1.6,
          maxWidth: 280,
        }}
      >
        That&apos;s the run.
      </p>

      <button
        onClick={onRestart}
        style={buttonStyle('#a8c5e8', 'rgba(168, 197, 232, 0.12)')}
      >
        Run Again
      </button>

      <button
        onClick={onChooseMode}
        style={buttonStyle('rgba(168, 197, 232, 0.55)', 'transparent')}
      >
        Back To Start
      </button>
    </div>
  )
}

function buttonStyle(color: string, bg: string): React.CSSProperties {
  return {
    fontFamily: 'Perpetua, Georgia, serif',
    fontSize: 16,
    color,
    background: bg,
    border: `1px solid ${color}`,
    borderRadius: 4,
    padding: '14px 40px',
    cursor: 'pointer',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    letterSpacing: '0.06em',
    width: '100%',
    maxWidth: 280,
  }
}
