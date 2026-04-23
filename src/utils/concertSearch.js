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

  if (Array.isArray(concert.setlist)) {
    for (const song of concert.setlist) {
      if (song != null && typeof song === 'object' && typeof song.title === 'string') {
        parts.push(song.title.trim().toLowerCase())
      } else if (typeof song === 'string') {
        parts.push(song.trim().toLowerCase())
      }
    }
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
