import type { Book } from '../types'

// Seed from Goodreads scrape when ready.
// Add entries through /admin after that.

export const books: Book[] = [
  {
    id: 'book-berserk',
    title: 'Berserk',
    author: 'Kentaro Miura',
    rating: 10,
    review: 'The definitive dark fantasy manga. Guts is one of the most compelling protagonists ever written. The art alone is worth it.',
    dateRead: '2024-11-01',
    genre: ['manga', 'dark fantasy', 'action'],
  },
  {
    id: 'book-vagabond',
    title: 'Vagabond',
    author: 'Takehiko Inoue',
    rating: 10,
    review: 'A masterpiece. Based on the life of Miyamoto Musashi — but really about what it means to be alive and to keep seeking.',
    dateRead: '2024-08-01',
    genre: ['manga', 'historical', 'philosophy'],
  },
  {
    id: 'book-atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    rating: 8,
    review: 'Practical and well-structured. The 1% improvement framing is genuinely useful as a mental model.',
    dateRead: '2023-04-01',
    genre: ['non-fiction', 'self-improvement'],
  },
  {
    id: 'book-pragmatic-programmer',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas, Andrew Hunt',
    rating: 9,
    review: 'Every working programmer should read this. The career advice holds up decades later.',
    dateRead: '2022-06-01',
    genre: ['non-fiction', 'programming', 'career'],
  },
  {
    id: 'book-one-piece',
    title: 'One Piece',
    author: 'Eiichiro Oda',
    rating: 10,
    review: 'The greatest long-running story in manga. Oda\'s world-building and character work are unmatched.',
    dateRead: '2023-12-01',
    genre: ['manga', 'adventure', 'shounen'],
  },
]
