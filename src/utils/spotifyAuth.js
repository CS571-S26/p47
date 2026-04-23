const SPOTIFY_AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_SCOPES = ['playlist-modify-private']

const SPOTIFY_SESSION_KEY = 'p47:spotify:session'
const SPOTIFY_PENDING_AUTH_KEY = 'p47:spotify:pending-auth'
const SPOTIFY_PENDING_ACTION_KEY = 'p47:spotify:pending-action'

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function safeParseJson(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function readSessionJson(key) {
  try {
    const raw = sessionStorage.getItem(key)
    return raw == null ? null : safeParseJson(raw)
  } catch {
    return null
  }
}

function writeSessionJson(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

function removeSessionKey(key) {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // Ignore storage failures and continue without persistence.
  }
}

function isValidTokenPayload(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.accessToken === 'string' &&
    value.accessToken.trim() &&
    (value.refreshToken == null || typeof value.refreshToken === 'string') &&
    Number.isFinite(value.expiresAt) &&
    typeof value.scope === 'string' &&
    typeof value.tokenType === 'string'
  )
}

function isValidPendingAuth(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.codeVerifier === 'string' &&
    value.codeVerifier.trim() &&
    typeof value.state === 'string' &&
    value.state.trim() &&
    (value.returnTo == null || typeof value.returnTo === 'string')
  )
}

function isValidPendingAction(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    value.type.trim() &&
    (value.concertId == null || typeof value.concertId === 'string')
  )
}

function normalizeHashRoute(value) {
  const route = normalizeString(value)
  if (!route) return '#/'
  if (route.startsWith('#')) return route
  if (route.startsWith('/')) return `#${route}`
  return `#/${route.replace(/^#?\/?/, '')}`
}

function randomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let out = ''
  for (const value of bytes) {
    out += chars[value % chars.length]
  }
  return out
}

async function sha256(value) {
  const data = new TextEncoder().encode(value)
  return crypto.subtle.digest('SHA-256', data)
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function parseTokenResponse(resp) {
  const contentType = resp.headers.get('content-type') || ''
  let data = null
  let text = ''

  try {
    if (contentType.includes('application/json')) {
      data = await resp.json()
    } else {
      text = await resp.text()
    }
  } catch {
    // Ignore parse failures; the status code is still useful.
  }

  if (!resp.ok) {
    const details =
      (data &&
        (data.error_description ||
          data.error?.message ||
          data.error ||
          data.message)) ||
      normalizeString(text)
    const suffix = details ? ` (${details})` : ''
    throw new Error(`Spotify auth failed: ${resp.status} ${resp.statusText}${suffix}`)
  }

  return data
}

function normalizeTokenData(data, previousRefreshToken = '') {
  const accessToken = normalizeString(data?.access_token)
  const refreshToken = normalizeString(data?.refresh_token) || normalizeString(previousRefreshToken)
  const expiresIn = Number(data?.expires_in)
  const tokenType = normalizeString(data?.token_type) || 'Bearer'
  const scope = normalizeString(data?.scope) || SPOTIFY_SCOPES.join(' ')

  if (!accessToken || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new Error('Spotify auth response did not include a valid access token.')
  }

  return {
    accessToken,
    refreshToken: refreshToken || null,
    expiresAt: Date.now() + expiresIn * 1000,
    tokenType,
    scope,
  }
}

export function getSpotifyConfig() {
  const clientId = normalizeString(import.meta.env.VITE_SPOTIFY_CLIENT_ID)
  const redirectUri = normalizeString(import.meta.env.VITE_SPOTIFY_REDIRECT_URI)
  const missing = []

  if (!clientId) missing.push('VITE_SPOTIFY_CLIENT_ID')
  if (!redirectUri) missing.push('VITE_SPOTIFY_REDIRECT_URI')

  return {
    clientId,
    redirectUri,
    scopes: [...SPOTIFY_SCOPES],
    isConfigured: missing.length === 0,
    missing,
    error:
      missing.length > 0
        ? `Missing required env var${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`
        : '',
  }
}

export function readStoredSpotifySession() {
  const parsed = readSessionJson(SPOTIFY_SESSION_KEY)
  return isValidTokenPayload(parsed) ? parsed : null
}

export function writeStoredSpotifySession(value) {
  if (!isValidTokenPayload(value)) {
    throw new Error('Cannot store an invalid Spotify session payload.')
  }
  writeSessionJson(SPOTIFY_SESSION_KEY, value)
}

export function clearStoredSpotifySession() {
  removeSessionKey(SPOTIFY_SESSION_KEY)
}

export function readStoredSpotifyPendingAuth() {
  const parsed = readSessionJson(SPOTIFY_PENDING_AUTH_KEY)
  return isValidPendingAuth(parsed)
    ? {
        codeVerifier: parsed.codeVerifier.trim(),
        state: parsed.state.trim(),
        returnTo: normalizeHashRoute(parsed.returnTo),
      }
    : null
}

export function writeStoredSpotifyPendingAuth(value) {
  if (!isValidPendingAuth(value)) {
    throw new Error('Cannot store an invalid Spotify pending auth payload.')
  }
  writeSessionJson(SPOTIFY_PENDING_AUTH_KEY, {
    codeVerifier: value.codeVerifier.trim(),
    state: value.state.trim(),
    returnTo: normalizeHashRoute(value.returnTo),
  })
}

export function clearStoredSpotifyPendingAuth() {
  removeSessionKey(SPOTIFY_PENDING_AUTH_KEY)
}

export function readStoredSpotifyPendingAction() {
  const parsed = readSessionJson(SPOTIFY_PENDING_ACTION_KEY)
  if (!isValidPendingAction(parsed)) return null
  return {
    type: parsed.type.trim(),
    concertId: normalizeString(parsed.concertId) || null,
  }
}

export function writeStoredSpotifyPendingAction(value) {
  if (!isValidPendingAction(value)) {
    throw new Error('Cannot store an invalid Spotify pending action payload.')
  }
  writeSessionJson(SPOTIFY_PENDING_ACTION_KEY, {
    type: value.type.trim(),
    concertId: normalizeString(value.concertId) || null,
  })
}

export function clearStoredSpotifyPendingAction() {
  removeSessionKey(SPOTIFY_PENDING_ACTION_KEY)
}

export function isSpotifySessionExpired(session, bufferMs = 30_000) {
  if (!isValidTokenPayload(session)) return true
  return session.expiresAt <= Date.now() + bufferMs
}

export function hasSpotifyConnection(session) {
  return Boolean(normalizeString(session?.refreshToken) || !isSpotifySessionExpired(session, 0))
}

export async function createSpotifyAuthorizeUrl({ returnTo } = {}) {
  const config = getSpotifyConfig()
  if (!config.isConfigured) {
    throw new Error(config.error)
  }

  const codeVerifier = randomString(64)
  const codeChallenge = base64UrlEncode(await sha256(codeVerifier))
  const state = randomString(24)

  writeStoredSpotifyPendingAuth({
    codeVerifier,
    state,
    returnTo: normalizeHashRoute(returnTo),
  })

  const authUrl = new URL(SPOTIFY_AUTHORIZE_URL)
  authUrl.search = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: config.scopes.join(' '),
    state,
  }).toString()

  return authUrl.toString()
}

export async function beginSpotifyAuth(options = {}) {
  const authUrl = await createSpotifyAuthorizeUrl(options)
  window.location.assign(authUrl)
}

export async function exchangeSpotifyCodeForSession({ code, codeVerifier }) {
  const config = getSpotifyConfig()
  if (!config.isConfigured) {
    throw new Error(config.error)
  }

  const resp = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      grant_type: 'authorization_code',
      code: normalizeString(code),
      redirect_uri: config.redirectUri,
      code_verifier: normalizeString(codeVerifier),
    }),
  })

  return normalizeTokenData(await parseTokenResponse(resp))
}

export async function refreshSpotifySession(refreshToken) {
  const config = getSpotifyConfig()
  if (!config.isConfigured) {
    throw new Error(config.error)
  }

  const token = normalizeString(refreshToken)
  if (!token) {
    throw new Error('A Spotify refresh token is required.')
  }

  const resp = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      grant_type: 'refresh_token',
      refresh_token: token,
    }),
  })

  return normalizeTokenData(await parseTokenResponse(resp), token)
}

export function getSpotifyCallbackParams() {
  const params = new URLSearchParams(window.location.search)
  return {
    code: normalizeString(params.get('code')),
    state: normalizeString(params.get('state')),
    error: normalizeString(params.get('error')),
    hasParams: params.has('code') || params.has('error'),
  }
}

export function clearSpotifyCallbackParams({ returnTo } = {}) {
  const hash = normalizeHashRoute(returnTo || window.location.hash)
  window.history.replaceState({}, document.title, `${window.location.pathname}${hash}`)
}
