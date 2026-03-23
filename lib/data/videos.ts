import type { Video } from '../types'

// YouTube videos — auto-pulled via YouTube Data API when admin is built.
// Manually seeded for now from @mankuDevJS channel.

export const videos: Video[] = [
  {
    id: 'video-placeholder-1',
    youtubeId: 'placeholder',
    title: 'Add your YouTube videos here',
    description: 'When the admin is built, paste a YouTube URL and metadata pulls automatically.',
    thumbnailUrl: '',
    publishedAt: '2024-01-01',
    url: 'https://www.youtube.com/@mankuDevJS',
  },
]
