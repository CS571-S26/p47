export const LOGIN_STATUS_SESSION_KEY = 'loginStatus'

const loggedOut = { loggedIn: false, username: null }

export function readStoredLoginStatus() {
  try {
    const stored = sessionStorage.getItem(LOGIN_STATUS_SESSION_KEY)
    if (stored === null) return loggedOut
    const parsed = JSON.parse(stored)
    if (
      parsed &&
      typeof parsed.loggedIn === 'boolean' &&
      (parsed.username === null || typeof parsed.username === 'string')
    ) {
      return parsed.loggedIn && parsed.username
        ? { loggedIn: true, username: parsed.username }
        : loggedOut
    }
    return loggedOut
  } catch {
    return loggedOut
  }
}

/** Current logged-in username from session storage, or null. */
export function readStoredLoggedInUsername() {
  const s = readStoredLoginStatus()
  return s.loggedIn && s.username ? s.username.trim() : null
}
