export const DEFAULT_IMAGE_SEARCH_FORMAT = '{artist} {venue} {location}'

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getLocationParts(cityState) {
  const parts = normalizeString(cityState).split(',').map((part) => part.trim())
  return {
    city: parts[0] || '',
    state: parts.slice(1).join(', '),
  }
}

/**
 * Builds an image-search query from the user's tokenized format.
 * Supported tokens: artist, venue, location, city, state, date, year, month, day, and genre.
 */
export function buildConcertImageSearchQuery(concert, format = DEFAULT_IMAGE_SEARCH_FORMAT) {
  const date = normalizeString(concert?.date)
  const [year = '', month = '', day = ''] = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)?.slice(1) ?? []
  const location = normalizeString(concert?.city)
  const { city, state } = getLocationParts(location)
  const tokens = {
    artist: normalizeString(concert?.artist),
    venue: normalizeString(concert?.venue),
    location,
    city,
    state,
    date,
    year,
    month,
    day,
    genre: normalizeString(concert?.genre),
  }
  const template = normalizeString(format) || DEFAULT_IMAGE_SEARCH_FORMAT

  return template
    .replace(/\{(artist|venue|location|city|state|date|year|month|day|genre)\}/gi, (_, token) => tokens[token.toLowerCase()])
    .replace(/\s+/g, ' ')
    .trim()
}
