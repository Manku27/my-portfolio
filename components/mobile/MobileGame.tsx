'use client'

import { useState } from 'react'
import MobileGameCanvas from './MobileGameCanvas'
import MobileSocialsHUD from './MobileSocialsHUD'
import MobileSkillsHUD from './MobileSkillsHUD'
import { profile } from '@/lib/data'

// Kept for compatibility with ModeSelect.tsx and EndScreen.tsx
export type GameMode = 'career' | 'timeline' | 'about'

export default function MobileGame() {
  const [docked, setDocked] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#050a0a',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      <MobileSkillsHUD visible={true} />
      <MobileGameCanvas onDockedChange={setDocked} />
      <MobileSocialsHUD socials={profile.socials} />
    </div>
  )
}
