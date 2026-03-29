'use client'
import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class GameErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[GameErrorBoundary]', error)
    }
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI />
    }
    return this.props.children
  }
}

function FallbackUI() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: "'Trajan Pro', serif",
        fontWeight: 700,
        fontSize: 'clamp(22px, 4vw, 42px)',
        letterSpacing: '0.04em',
        margin: 0,
      }}>
        Mayank Jhunjhunwala
      </h1>

      <p style={{
        fontFamily: "'Perpetua', Georgia, serif",
        fontSize: 'clamp(14px, 2vw, 18px)',
        color: 'var(--color-text-muted)',
        margin: '0 0 16px',
      }}>
        Something went wrong loading the portfolio.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '8px' }}>
        <a href="https://www.linkedin.com/in/mayankc137/" target="_blank" rel="noopener noreferrer" style={linkStyle}>LinkedIn</a>
        <a href="https://github.com/Manku27" target="_blank" rel="noopener noreferrer" style={linkStyle}>GitHub</a>
        <a href="mailto:jjmayank98@gmail.com" style={linkStyle}>jjmayank98@gmail.com</a>
        <a href="/resume.pdf" download="Mayank_Jhunjhunwala_Resume.pdf" style={linkStyle}>Download Resume</a>
      </div>

      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '8px',
          padding: '9px 24px',
          background: 'transparent',
          border: '1px solid var(--color-text-muted)',
          color: 'var(--color-text-muted)',
          fontFamily: "'Perpetua', Georgia, serif",
          fontSize: '14px',
          borderRadius: '3px',
          cursor: 'pointer',
          letterSpacing: '0.05em',
        }}
      >
        Reload
      </button>
    </div>
  )
}

const linkStyle: React.CSSProperties = {
  fontFamily: "'Perpetua', Georgia, serif",
  fontSize: '15px',
  color: '#50d2a5',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(80,210,165,0.3)',
  paddingBottom: '2px',
}
