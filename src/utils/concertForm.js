export const CITY_STATE_PATTERN = /^[A-Za-z .'-]+,\s[A-Za-z]{2}$/

/**
 * Parse a concert date string (YYYY-MM-DD) as a local calendar date.
 * Avoids `new Date("YYYY-MM-DD")`, which is UTC midnight and can display/sort as the prior day in western timezones.
 */
export function parseConcertCalendarDate(value) {
  const s = typeof value === 'string' ? value.trim() : ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  if (!m) {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const y = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (![y, month, day].every((n) => Number.isFinite(n))) return null
  const d = new Date(y, month - 1, day)
  return Number.isNaN(d.getTime()) ? null : d
}

export function normalizeSetlist(list) {
  return (Array.isArray(list) ? list : [])
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter((s) => s !== '')
}

export function toTitleCase(str) {
  return str.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
}

export function formatCityState(value) {
  const parts = value.split(',')

  if (parts.length !== 2) return value.trim()

  const cityPart = toTitleCase(parts[0].trim())
  const statePart = parts[1].trim().toUpperCase()

  return `${cityPart}, ${statePart}`
}

export function getRatingLabel(value) {
  if (value === 5) return 'Amazing'
  if (value === 4) return 'Great'
  if (value === 3) return 'Good'
  if (value === 2) return 'Okay'
  return 'Rough'
}
