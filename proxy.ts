import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MOBILE_UA = /android|iphone|ipad|ipod|mobile|blackberry|iemobile|opera mini/i

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== '/') return NextResponse.next()

  const ua = request.headers.get('user-agent') ?? ''
  // sec-ch-ua-mobile catches iPadOS 13+ which sends a desktop Safari UA
  const mobileHint = request.headers.get('sec-ch-ua-mobile') === '?1'

  if (MOBILE_UA.test(ua) || mobileHint) {
    return NextResponse.rewrite(new URL('/mobile', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
