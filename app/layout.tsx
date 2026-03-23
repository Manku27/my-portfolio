import type { Metadata } from 'next'
import { profile } from '@/lib/data/index'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mayank Jhunjhunwala — Senior Fullstack Engineer',
  description: profile.shortBio,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  )
}
