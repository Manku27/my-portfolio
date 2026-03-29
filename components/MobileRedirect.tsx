'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Client-side fallback for devices the server-side proxy can't detect —
 * primarily iPadOS 13+ on Safari, which sends a desktop User-Agent.
 *
 * `pointer: coarse` = primary pointing device is touch/stylus (not a mouse).
 * This correctly returns false on touchscreen laptops (primary pointer is still
 * a mouse) while returning true on phones, tablets, and stylus-only devices.
 */
export default function MobileRedirect() {
  const router = useRouter()

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      router.replace('/mobile')
    }
  }, [router])

  return null
}
