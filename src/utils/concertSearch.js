import { getFlattenedSongs } from './setlistHelpers.js'

function asLowerString(value) {
  if (value == null) return ''
  return String(value).trim().toLowerCase()
}

function haystackForConcert(concert) {
  const parts = [
    concert.artist,
    concert.venue,
    concert.city,
    concert.genre,
    concert.notes,
    concert.date,
  ].map(asLowerString)

  for (const song of getFlattenedSongs(concert)) {
    if (typeof song === 'string') parts.push(song.trim().toLowerCase())
  }

  return parts.filter(Boolean).join('\u0000')
}

export function normalizeConcertSearchQuery(query) {
  return typeof query === 'string' ? query.trim().toLowerCase() : ''
}

export function matchesConcertQuery(concert, query) {
  const term = normalizeConcertSearchQuery(query)
  if (term === '') return true
  return haystackForConcert(concert).includes(term)
}

export function filterConcertsByQuery(concerts, query) {
  if (!Array.isArray(concerts)) return []
  return concerts.filter((c) => matchesConcertQuery(c, query))
}
