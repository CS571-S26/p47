const STORAGE_KEY = 'p47:concerts'

export function loadConcerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveConcerts(concerts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(concerts))
}
