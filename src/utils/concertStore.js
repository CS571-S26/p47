import { readStoredLoggedInUsername } from './authSession.js'

const STORAGE_KEY = 'p47:concerts'

function assignOrphanOwners(list, username) {
  if (!username) return list
  return list.map((c) =>
    c.ownerUsername == null || c.ownerUsername === ''
      ? { ...c, ownerUsername: username }
      : c,
  )
}

export function loadConcerts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : []
    return assignOrphanOwners(list, readStoredLoggedInUsername())
  } catch {
    return []
  }
}

export function saveConcerts(concerts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(concerts))
}
