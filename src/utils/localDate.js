export function parseLocalYyyyMmDd(dateStr) {
  const raw = typeof dateStr === 'string' ? dateStr.trim() : ''
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  return new Date(year, month - 1, day)
}

export function concertDateToDate(dateStr) {
  return parseLocalYyyyMmDd(dateStr) ?? new Date(String(dateStr ?? ''))
}

