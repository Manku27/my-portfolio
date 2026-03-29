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

interface Props {
  visible: boolean
}

export default function MobileSkillsHUD({ visible }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: 'rgba(4, 9, 16, 0.82)',
        borderBottom: '1px solid rgba(168, 197, 232, 0.1)',
        zIndex: 50,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
        pointerEvents: 'none',
        paddingTop: 'env(safe-area-inset-top)',
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
  )
}
