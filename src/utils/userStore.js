const STORAGE_KEY = 'p47:users'

export function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (u) =>
        u &&
        typeof u.username === 'string' &&
        typeof u.password === 'string',
    )
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

/**
 * @returns {{ ok: true } | { ok: false, reason: 'taken' }}}
 */
export function registerUser(username, password) {
  const u = username.trim()
  const p = password.trim()
  if (u === '' || p === '') {
    return { ok: false, reason: 'invalid' }
  }
  const users = loadUsers()
  if (users.some((entry) => entry.username === u)) {
    return { ok: false, reason: 'taken' }
  }
  saveUsers([...users, { username: u, password: p }])
  return { ok: true }
}

export function verifyCredentials(username, password) {
  const u = username.trim()
  const p = password.trim()
  const users = loadUsers()
  return users.some((entry) => entry.username === u && entry.password === p)
}
