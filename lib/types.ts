// ============================================================
// lib/types.ts
// Single source of truth for all content types.
// The DB schema will be derived from these — not the other way around.
// ============================================================

// ------------------------------------------------------------
// Shared primitives
// ------------------------------------------------------------

export type Rating = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type TimelineCategory =
  | 'work'
  | 'projects'
  | 'books'
  | 'movies'
  | 'writing'
  | 'videos'
  | 'fitness'
  | 'gaming'
  | 'personal'

export type TimelineEntryType = 'short' | 'rich' | 'milestone'

// ------------------------------------------------------------
// Timeline
// ------------------------------------------------------------

export interface TimelineEntry {
  id: string
  date: string           // ISO date string — YYYY-MM-DD
  category: TimelineCategory
  entryType: TimelineEntryType
  title: string
  body?: string
  rating?: Rating
  url?: string           // external link
  imageUrl?: string      // Vercel Blob URL when wired
  tags?: string[]
  isMilestone?: boolean
  // If this entry was auto-generated from another content type
  refId?: string
  refType?: 'book' | 'movie' | 'post' | 'game' | 'video'
}

// ------------------------------------------------------------
// Work — /work page
// ------------------------------------------------------------

export interface WorkExperience {
  id: string
  company: string
  companyDescription: string   // one line context for international readers
  role: string
  period: string               // e.g. "April 2025 – Present"
  location: string
  ctc?: string                 // optional, not shown publicly
  bullets: string[]
  current?: boolean
}

export interface ConsultingEngagement {
  id: string
  client: string
  clientDescription: string
  location: string
  period: string
  ratePerMonth?: string        // optional, not shown publicly
  bullets: string[]
  ongoing?: boolean
}

export interface Project {
  id: string
  name: string
  description: string
  url?: string
  githubUrl?: string
  tech: string[]
  highlights?: string[]        // notable stats e.g. "250+ downloads"
  imageUrl?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year?: number
}

export interface Award {
  id: string
  name: string
  issuer: string
  year?: number
}

export interface Education {
  id: string
  institution: string
  institutionDescription: string
  degree: string
  period: string
  location: string
}

// ------------------------------------------------------------
// Content — /content
// ------------------------------------------------------------

export interface Post {
  id: string
  slug: string
  title: string
  body: string                 // markdown — stored as text in DB
  excerpt: string              // short summary for cards and SEO
  coverUrl?: string
  tags: string[]
  published: boolean
  publishedAt: string          // ISO date string
  readingTime?: number         // minutes, computed on save
  mediumUrl?: string           // mirror link if cross-posted
}

export interface Video {
  id: string
  youtubeId: string
  title: string
  description?: string
  thumbnailUrl: string
  publishedAt: string          // ISO date string
  duration?: number            // seconds
  url: string                  // full YouTube URL
}

// ------------------------------------------------------------
// Books — /books
// ------------------------------------------------------------

export interface Book {
  id: string
  title: string
  author: string
  coverUrl?: string
  rating?: Rating
  review?: string
  dateRead?: string            // ISO date string
  genre: string[]
  goodreadsId?: string         // for dedup during scrape
}

// ------------------------------------------------------------
// Movies — /movies
// ------------------------------------------------------------

export interface Movie {
  id: string
  title: string
  year: number
  posterUrl?: string
  rating?: Rating
  review?: string
  dateWatched?: string         // ISO date string
  genre: string[]
  director?: string
  imdbId?: string              // for dedup during scrape
}

// ------------------------------------------------------------
// Games — /games
// ------------------------------------------------------------

export type GameStatus = 'playing' | 'completed' | 'dropped'

export interface Game {
  id: string
  title: string
  platform: string
  coverUrl?: string
  status: GameStatus
  rating?: Rating
  review?: string
  dateStarted?: string         // ISO date string
  dateFinished?: string        // ISO date string
}

// ------------------------------------------------------------
// Profile — personal info used across the site
// ------------------------------------------------------------

export interface SocialLink {
  platform: string
  url: string
  handle: string
}

export interface Profile {
  name: string
  title: string
  tagline: string
  location: string
  email: string
  bio: string                  // longer form, for /work summary
  shortBio: string             // one-liner for hero
  socials: SocialLink[]
  skills: SkillGroup[]
  availability: string         // e.g. "Open to remote contracts — 50 LPA"
}

export interface SkillGroup {
  category: string
  items: string[]
}
