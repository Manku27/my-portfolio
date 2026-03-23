import type { Game } from '../types'

// Manual entry only — no PSN API, no Steam scrape.
// Add entries through /admin.

export const games: Game[] = [
  {
    id: 'game-hollow-knight',
    title: 'Hollow Knight',
    platform: 'PC',
    status: 'completed',
    rating: 10,
    review: 'The atmosphere, the music, the movement — all perfect. One of the best games ever made. Also the visual reference for this site.',
    dateStarted: '2023-03-01',
    dateFinished: '2023-04-15',
  },
  {
    id: 'game-elden-ring',
    title: 'Elden Ring',
    platform: 'PC',
    status: 'completed',
    rating: 10,
    review: 'FromSoftware\'s magnum opus. The open world changes everything about how these games feel. Still thinking about the Erdtree.',
    dateStarted: '2022-03-01',
    dateFinished: '2022-06-01',
  },
  {
    id: 'game-cyberpunk',
    title: 'Cyberpunk 2077',
    platform: 'PC',
    status: 'completed',
    rating: 8,
    review: 'Rough launch aside, the 2.0 patch turned this into one of the best RPGs of the decade. Night City is a masterpiece of world design.',
    dateStarted: '2023-10-01',
    dateFinished: '2023-12-01',
  },
  {
    id: 'game-hades',
    title: 'Hades',
    platform: 'PC',
    status: 'completed',
    rating: 9,
    review: 'The best roguelike ever made. The way it uses the genre structure to tell a story is genuinely clever.',
    dateStarted: '2021-09-01',
    dateFinished: '2021-11-01',
  },
]
