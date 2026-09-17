'use client'

import { useEffect, useState, type FormEvent } from 'react'

type Status = 'idle' | 'submitting' | 'sent' | 'error'

const TOP_ORNAMENT = '/sprites/Controller_Dialogue_0000_top.png'
const AMAZON_URL = 'https://www.amazon.com/dp/B0HJZHYXTM'

const corner: React.CSSProperties = {
  position: 'absolute',
  width: 20,
  height: 20,
  borderColor: 'rgba(48, 180, 140, 0.55)',
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function BookGate({ open, onOpenChange }: Props) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('') // honeypot
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const res = await fetch('/api/book-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong.')
        return
      }
      setStatus('sent')
    } catch {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  if (!open) return null

  return (
    <div
      onClick={() => onOpenChange(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(2, 8, 8, 0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 560,
          maxWidth: '100%',
          background: 'rgba(4, 10, 8, 0.96)',
          border: '1px solid rgba(48, 180, 140, 0.30)',
          borderRadius: 8,
          padding: '36px 44px 40px',
          boxShadow: '0 30px 70px -20px rgba(0,0,0,0.75)',
        }}
      >
        {/* Corner accents — same language as the charm menu panel */}
        <span style={{ ...corner, top: 8, left: 8, borderTop: '2px solid', borderLeft: '2px solid', borderTopLeftRadius: 2 }} />
        <span style={{ ...corner, top: 8, right: 8, borderTop: '2px solid', borderRight: '2px solid', borderTopRightRadius: 2 }} />
        <span style={{ ...corner, bottom: 8, left: 8, borderBottom: '2px solid', borderLeft: '2px solid', borderBottomLeftRadius: 2 }} />
        <span style={{ ...corner, bottom: 8, right: 8, borderBottom: '2px solid', borderRight: '2px solid', borderBottomRightRadius: 2 }} />

        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 12,
            right: 30,
            background: 'none',
            border: 'none',
            color: 'rgba(160, 200, 180, 0.55)',
            fontSize: 30,
            lineHeight: 1,
            cursor: 'pointer',
            padding: 6,
          }}
        >
          ×
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TOP_ORNAMENT}
          alt=""
          style={{ width: '100%', display: 'block', marginBottom: 18, opacity: 0.85 }}
        />

        <div
          style={{
            fontFamily: "'Trajan Pro', serif",
            fontWeight: 700,
            fontSize: 28,
            color: 'rgba(220, 195, 110, 0.95)',
            letterSpacing: '0.14em',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          WHAT RUNS WHEN
        </div>

        <div
          style={{
            fontFamily: "'Perpetua', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 19,
            color: 'rgba(200, 230, 220, 0.75)',
            lineHeight: 1.6,
            textAlign: 'center',
            marginBottom: 26,
          }}
        >
          My book on what actually runs when in a React &amp; Next.js app — client vs. server, build vs. runtime, request vs. render.
        </div>

        <a
          href={AMAZON_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            fontFamily: "'Trajan Pro', serif",
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(120, 235, 190, 0.95)',
            textShadow: '0 0 8px rgba(80,210,165,0.35)',
            textDecoration: 'none',
            border: '1.5px solid rgba(80, 200, 160, 0.45)',
            borderRadius: 6,
            padding: '16px 0',
            marginBottom: 26,
          }}
        >
          Buy on Amazon ↗
        </a>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 26,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
          <span style={{ fontFamily: "'Perpetua', Georgia, serif", fontSize: 15, color: 'rgba(160,200,180,0.55)', letterSpacing: '0.05em' }}>
            OR GET THE PDF FREE
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {status === 'sent' ? (
          <div
            style={{
              fontFamily: "'Perpetua', Georgia, serif",
              fontSize: 21,
              color: 'rgba(120, 235, 190, 0.95)',
              textAlign: 'center',
              textShadow: '0 0 10px rgba(80,210,165,0.45)',
              padding: '8px 0',
            }}
          >
            Sent — check your inbox.
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <input
              id="book-gate-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'submitting'}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: "'Perpetua', Georgia, serif",
                fontSize: 20,
                color: 'rgba(230, 245, 238, 0.95)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1.5px solid rgba(48, 180, 140, 0.30)',
                borderRadius: 6,
                padding: '16px 18px',
                marginBottom: 16,
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(220, 195, 110, 0.65)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 195, 110, 0.12)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(48, 180, 140, 0.30)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
            {/* Honeypot — hidden from real users, bots tend to fill every field */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
              aria-hidden="true"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                width: '100%',
                fontFamily: "'Trajan Pro', serif",
                fontWeight: 700,
                fontSize: 19,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'rgba(6, 14, 11, 0.95)',
                background: 'linear-gradient(180deg, rgba(232, 208, 130, 0.98), rgba(198, 165, 84, 0.98))',
                border: 'none',
                borderRadius: 6,
                padding: '17px 0',
                cursor: status === 'submitting' ? 'default' : 'pointer',
                opacity: status === 'submitting' ? 0.7 : 1,
                boxShadow: '0 2px 10px -2px rgba(220,195,110,0.35)',
                transition: 'filter 0.15s ease',
              }}
              onMouseEnter={(e) => { if (status !== 'submitting') e.currentTarget.style.filter = 'brightness(1.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
            >
              {status === 'submitting' ? 'Sending…' : 'Send Me the PDF'}
            </button>
            {status === 'error' && (
              <div
                style={{
                  fontFamily: "'Perpetua', Georgia, serif",
                  fontSize: 15,
                  color: 'rgba(230, 130, 130, 0.90)',
                  textAlign: 'center',
                  marginTop: 12,
                }}
              >
                {errorMsg}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
