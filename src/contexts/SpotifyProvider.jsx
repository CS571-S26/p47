import { useCallback, useEffect, useMemo, useState } from 'react'

import { SpotifyContext } from './spotifyContext.js'
import {
  beginSpotifyAuth,
  clearSpotifyCallbackParams,
  clearStoredSpotifyPendingAction,
  clearStoredSpotifyPendingAuth,
  clearStoredSpotifySession,
  getSpotifyCallbackParams,
  getSpotifyConfig,
  exchangeSpotifyCodeForSession,
  hasSpotifyConnection,
  isSpotifySessionExpired,
  readStoredSpotifyPendingAuth,
  readStoredSpotifySession,
  refreshSpotifySession,
  writeStoredSpotifyPendingAction,
  writeStoredSpotifySession,
} from '../utils/spotifyAuth.js'

export function SpotifyProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSpotifySession())
  const [loading, setLoading] = useState(true)
  const [authenticating, setAuthenticating] = useState(false)
  const [error, setError] = useState('')

  const config = getSpotifyConfig()

  useEffect(() => {
    let active = true

    async function maybeHandleCallback() {
      const callback = getSpotifyCallbackParams()
      const pendingAuth = readStoredSpotifyPendingAuth()

      if (!callback.hasParams) {
        if (active) setLoading(false)
        return
      }

      if (active) {
        setAuthenticating(true)
        setError('')
      }

      const returnTo = pendingAuth?.returnTo || '#/'

      try {
        if (callback.error) {
          throw new Error(`Spotify authorization failed: ${callback.error}`)
        }

        if (!pendingAuth) {
          throw new Error('Spotify authorization could not be completed because the saved PKCE state is missing.')
        }

        if (!callback.code) {
          throw new Error('Spotify did not return an authorization code.')
        }

        if (callback.state !== pendingAuth.state) {
          throw new Error('Spotify authorization state mismatch. Please try connecting again.')
        }

        const nextSession = await exchangeSpotifyCodeForSession({
          code: callback.code,
          codeVerifier: pendingAuth.codeVerifier,
        })

        writeStoredSpotifySession(nextSession)
        clearStoredSpotifyPendingAuth()

        if (!active) return
        setSession(nextSession)
      } catch (err) {
        clearStoredSpotifyPendingAction()
        clearStoredSpotifySession()
        clearStoredSpotifyPendingAuth()

        if (!active) return
        setSession(null)
        setError(err?.message || 'Failed to connect to Spotify.')
      } finally {
        clearSpotifyCallbackParams({ returnTo })
        if (active) {
          setAuthenticating(false)
          setLoading(false)
        }
      }
    }

    maybeHandleCallback()

    return () => {
      active = false
    }
  }, [])

  const disconnect = useCallback(() => {
    clearStoredSpotifySession()
    setSession(null)
    setError('')
  }, [])

  const connect = useCallback(
    async ({ returnTo, action } = {}) => {
      if (!config.isConfigured) {
        setError(config.error)
        return null
      }

      setError('')

      if (action) {
        writeStoredSpotifyPendingAction(action)
      } else {
        clearStoredSpotifyPendingAction()
      }

      await beginSpotifyAuth({ returnTo })
      return null
    },
    [config.error, config.isConfigured],
  )

  const ensureAccessToken = useCallback(
    async ({ interactive = false, returnTo, action } = {}) => {
      if (!config.isConfigured) {
        const err = new Error(config.error)
        setError(err.message)
        throw err
      }

      const saved = readStoredSpotifySession()
      if (saved && !isSpotifySessionExpired(saved)) {
        if (saved !== session) setSession(saved)
        return saved.accessToken
      }

      if (saved?.refreshToken) {
        try {
          const refreshed = await refreshSpotifySession(saved.refreshToken)
          writeStoredSpotifySession(refreshed)
          setSession(refreshed)
          setError('')
          return refreshed.accessToken
        } catch (err) {
          clearStoredSpotifySession()
          setSession(null)
          if (!interactive) {
            setError(err?.message || 'Spotify session refresh failed.')
            throw err
          }
        }
      }

      if (!interactive) return null
      return connect({ returnTo, action })
    },
    [config.error, config.isConfigured, connect, session],
  )

  const value = useMemo(
    () => ({
      session,
      loading,
      authenticating,
      error: error || config.error,
      configError: config.error,
      isConfigured: config.isConfigured,
      isConnected: hasSpotifyConnection(session),
      connect,
      disconnect,
      ensureAccessToken,
      clearError: () => setError(''),
    }),
    [
      authenticating,
      config.error,
      config.isConfigured,
      connect,
      ensureAccessToken,
      error,
      loading,
      session,
      disconnect,
    ],
  )

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>
}
