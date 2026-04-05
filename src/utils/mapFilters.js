export function getMapFilterOptions(concerts) {
  if (!Array.isArray(concerts)) return { years: [], genres: [] }

  const yearSet = new Set()
  const genreByLower = new Map()

  for (const c of concerts) {
    if (!c || typeof c !== 'object') continue

    const dateStr = String(c.date ?? '').trim()
    const yMatch = dateStr.match(/^(\d{4})-\d{2}-\d{2}/)
    if (yMatch) yearSet.add(yMatch[1])

    const g = typeof c.genre === 'string' ? c.genre.trim() : ''
    if (g) {
      const k = g.toLowerCase()
      if (!genreByLower.has(k)) genreByLower.set(k, g)
    }
  }

  const years = [...yearSet].sort((a, b) => Number(b) - Number(a))
  const genres = [...genreByLower.values()].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  )

  return { years, genres }
}

export function applyMapFilter(list, filter) {
  return list.filter((c) => {
    const matchesYear =
      filter.year === 'all' || String(c.date ?? '').startsWith(filter.year)

    const matchesGenre =
      filter.genre === 'all' ||
      String(c.genre ?? '').trim().toLowerCase() === filter.genre.toLowerCase()

    const matchesFavorite =
      !filter.favoriteOnly || c.favorite === true

    const matchesAttended =
      !filter.attendedOnly || c.attended === true

    return (
      matchesYear &&
      matchesGenre &&
      matchesFavorite &&
      matchesAttended
    )
  })
}

export function mapFiltersEqual(a, b) {
  return (
    a.year === b.year &&
    a.genre === b.genre &&
    a.favorite === b.favorite &&
    a.attended === b.attended
  )
}

export function isStaleMapFilter(filter, years, genres) {
  if (filter.year !== 'all' && !years.includes(filter.year)) return true

  if (filter.genre !== 'all') {
    const ok = genres.some((g) => g.toLowerCase() === filter.genre.toLowerCase())
    if (!ok) return true
  }

  return false
}