import type { Metadata } from 'next'
import { profile } from '@/lib/data/index'
import './globals.css'

const BASE_URL = 'https://manku27.dev'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Mayank Jhunjhunwala — Senior Fullstack Engineer',
    template: '%s — Mayank Jhunjhunwala',
  },
  description: profile.bio.split('\n')[0].trim(),
  keywords: [
    'Mayank Jhunjhunwala',
    'Senior Fullstack Engineer',
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'Remote',
    'Kolkata',
    'Contentful',
    'Cloudinary',
  ],
  authors: [{ name: 'Mayank Jhunjhunwala', url: BASE_URL }],
  creator: 'Mayank Jhunjhunwala',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Mayank Jhunjhunwala',
    title: 'Mayank Jhunjhunwala — Senior Fullstack Engineer',
    description: profile.shortBio,
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Mayank Jhunjhunwala — Senior Fullstack Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mayank Jhunjhunwala — Senior Fullstack Engineer',
    description: profile.shortBio,
    images: ['/opengraph-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
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
