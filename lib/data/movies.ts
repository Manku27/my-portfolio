import type { Movie } from '../types'

// Seed from IMDB scrape when ready.
// Add entries through /admin after that.

export const movies: Movie[] = [
  {
    id: 'movie-interstellar',
    title: 'Interstellar',
    year: 2014,
    rating: 10,
    review: 'The physics nerd in me and the person who loves emotional gut-punches are both fully satisfied. Nolan at his best.',
    dateWatched: '2023-08-01',
    genre: ['sci-fi', 'drama'],
    director: 'Christopher Nolan',
    imdbId: 'tt0816692',
  },
  {
    id: 'movie-dark-knight',
    title: 'The Dark Knight',
    year: 2008,
    rating: 10,
    review: 'Heath Ledger\'s Joker is the best villain performance in cinema history. Full stop.',
    dateWatched: '2022-01-01',
    genre: ['action', 'superhero', 'crime'],
    director: 'Christopher Nolan',
    imdbId: 'tt0468569',
  },
  {
    id: 'movie-everything-everywhere',
    title: 'Everything Everywhere All at Once',
    year: 2022,
    rating: 9,
    review: 'Completely unhinged in the best way. A film about grief, family, and laundry receipts that somehow made me cry.',
    dateWatched: '2023-01-01',
    genre: ['sci-fi', 'comedy', 'drama'],
    director: 'Daniel Kwan, Daniel Scheinert',
    imdbId: 'tt6710474',
  },
  {
    id: 'movie-3-idiots',
    title: '3 Idiots',
    year: 2009,
    rating: 9,
    review: 'Personally resonant in ways I didn\'t expect when I first watched it. The exam system critique hits different when you\'ve lived it.',
    dateWatched: '2021-06-01',
    genre: ['comedy', 'drama', 'bollywood'],
    director: 'Rajkumar Hirani',
    imdbId: 'tt1187043',
  },
  {
    id: 'movie-spider-man-across',
    title: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    rating: 10,
    review: 'The best animated film ever made. The art direction alone is worth the price of admission three times over.',
    dateWatched: '2023-06-15',
    genre: ['animation', 'superhero', 'sci-fi'],
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    imdbId: 'tt9362722',
  },
]
