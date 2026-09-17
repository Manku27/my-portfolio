'use client'

const SKILL_ICONS = [
  { src: '/sprites/skills/JavaScript.png', label: 'JavaScript' },
  { src: '/sprites/skills/Typescript.png', label: 'TypeScript' },
  { src: '/sprites/skills/React.png',      label: 'React'      },
  { src: '/sprites/skills/Next.png',       label: 'Next.js'    },
  { src: '/sprites/skills/nodejs.jpg',     label: 'Node.js'    },
  { src: '/sprites/skills/contentful.png', label: 'Contentful' },
  { src: '/sprites/skills/cloudinary.png', label: 'Cloudinary' },
]

// Total reserved height (skills row + actions row) — MobileGameCanvas uses
// this to keep the platform stack and speech bubble clear of this bar.
export const SKILLS_HUD_H = 96

interface Props {
  visible: boolean
  onOpenBook: () => void
}

export default function MobileSkillsHUD({ visible, onOpenBook }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(4, 9, 16, 0.82)',
        borderBottom: '1px solid rgba(168, 197, 232, 0.1)',
        zIndex: 50,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Skill icons */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {SKILL_ICONS.map((icon) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={icon.label}
            src={icon.src}
            alt={icon.label}
            style={{
              width: 32,
              height: 32,
              objectFit: 'contain',
              borderRadius: 6,
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* Resume + Book */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '0 18px 10px',
          pointerEvents: 'auto',
        }}
      >
        <a
          href="/resume.pdf"
          download="Mayank_Jhunjhunwala_Resume.pdf"
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: "'Trajan Pro', 'Trajan', serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'rgba(220, 195, 110, 0.95)',
            background: 'rgba(220, 195, 110, 0.08)',
            border: '1px solid rgba(180, 160, 80, 0.45)',
            borderRadius: 20,
            padding: '9px 0',
            textDecoration: 'none',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Resume
        </a>
        <button
          onClick={onOpenBook}
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: "'Trajan Pro', 'Trajan', serif",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'rgba(120, 235, 190, 0.95)',
            background: 'rgba(80, 200, 160, 0.08)',
            border: '1px solid rgba(80, 200, 160, 0.45)',
            borderRadius: 20,
            padding: '9px 0',
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          The Book
        </button>
      </div>
    </div>
  )
}
