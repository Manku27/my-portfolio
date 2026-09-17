'use client'

import { useState } from 'react'
import { GameCanvas } from '@/components/game/GameCanvas'
import { GameErrorBoundary } from '@/components/ErrorBoundary'
import BookGate from '@/components/BookGate'
import type { ActivityItem } from '@/lib/types'

interface Props {
  activity: ActivityItem[]
}

// Bridges the canvas-drawn "book" HUD button (click handling lives inside
// GameCanvas's render loop) to the DOM BookGate panel — the two are siblings
// that otherwise have no way to talk to each other.
export default function GameShell({ activity }: Props) {
  const [bookGateOpen, setBookGateOpen] = useState(false)

  return (
    <>
      <GameErrorBoundary>
        <GameCanvas activity={activity} onOpenBookGate={() => setBookGateOpen(true)} />
      </GameErrorBoundary>
      <BookGate open={bookGateOpen} onOpenChange={setBookGateOpen} />
    </>
  )
}
