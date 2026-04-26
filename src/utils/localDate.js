export function parseLocalYyyyMmDd(dateStr) {
  const raw = typeof dateStr === 'string' ? dateStr.trim() : ''
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  const parsed = new Date(year, month - 1, day)
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

export function concertDateToDate(dateStr) {
  return parseLocalYyyyMmDd(dateStr) ?? new Date(String(dateStr ?? ''))
}

export function startOfLocalDay(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function daysUntilLocalDate(dateStr, today = new Date()) {
  const targetDay = startOfLocalDay(concertDateToDate(dateStr))
  const todayStart = startOfLocalDay(today)
  if (!targetDay || !todayStart) return null

  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((targetDay.getTime() - todayStart.getTime()) / msPerDay)
}

