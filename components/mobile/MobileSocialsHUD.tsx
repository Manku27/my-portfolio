'use client'

import type { SocialLink } from '@/lib/types'

const ICON_SRCS: Record<string, string> = {
  LinkedIn:  '/sprites/social_linkedin.webp',
  GitHub:    '/sprites/social_github.png',
  Gmail:     '/sprites/social_gmail.webp',
  YouTube:   '/sprites/social_youtube.png',
  Medium:    '/sprites/social_medium.webp',
  WhatsApp:  '/sprites/social_whatsapp.png',
  Discord:   '/sprites/social_discord.webp',
}

// Icons whose source images have heavy internal padding — bump them up
const ICON_SIZE: Record<string, number> = {
  LinkedIn: 32,
  GitHub:   30,
  Discord:  34,
}

function handleSocialTap(e: React.TouchEvent | React.MouseEvent, social: SocialLink) {
  if (social.platform === 'Gmail') {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(social.handle).catch(() => {})
    return
  }
  e.stopPropagation()
}

interface Props {
  socials: SocialLink[]
}

export default function MobileSocialsHUD({ socials }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(4, 9, 16, 0.90)',
        borderTop: '1px solid rgba(168, 197, 232, 0.10)',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Name + title row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '8px 18px 2px',
        }}
      >
        <span
          style={{
            fontFamily: "'Trajan Pro', 'Trajan', serif",
            fontSize: 13,
            color: 'rgba(220, 195, 110, 0.95)',
            letterSpacing: '0.05em',
          }}
        >
          Mayank Jhunjhunwala
        </span>
        <span
          style={{
            fontFamily: 'Perpetua, Georgia, serif',
            fontSize: 11,
            color: 'rgba(100, 215, 175, 0.80)',
            letterSpacing: '0.06em',
            flexShrink: 0,
            marginLeft: 10,
          }}
        >
          5+ yrs
        </span>
      </div>

      {/* Subtitle row */}
      <div style={{ padding: '0 18px 6px' }}>
        <span
          style={{
            fontFamily: 'Perpetua, Georgia, serif',
            fontSize: 11,
            color: 'rgba(168, 197, 232, 0.50)',
            letterSpacing: '0.05em',
          }}
        >
          Senior Fullstack Engineer · Kolkata · Open to remote
        </span>
      </div>

      {/* Social icons — all 7 in one row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 7,
          padding: '0 12px 4px',
          pointerEvents: 'auto',
        }}
      >
        {socials.map((social) => {
          const iconSrc = ICON_SRCS[social.platform]
          if (!iconSrc) return null
          return (
            <a
              key={social.platform}
              href={social.platform === 'Gmail' ? undefined : social.url}
              target={social.platform === 'Gmail' ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={social.platform}
              onTouchStart={(e) => handleSocialTap(e, social)}
              onClick={(e) => handleSocialTap(e, social)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(168, 197, 232, 0.08)',
                border: '1px solid rgba(168, 197, 232, 0.16)',
                cursor: 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={iconSrc}
                alt={social.platform}
                style={{
                  width:  ICON_SIZE[social.platform] ?? 26,
                  height: ICON_SIZE[social.platform] ?? 26,
                  objectFit: 'contain',
                }}
              />
            </a>
          )
        })}
      </div>
    </div>
  )
}
