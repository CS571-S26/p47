export const CITY_STATE_PATTERN = /^[A-Za-z .'-]+,\s[A-Za-z]{2}$/

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
