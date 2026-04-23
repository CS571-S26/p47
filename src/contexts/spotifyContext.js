import { createContext, useContext } from 'react'

export const SpotifyContext = createContext(null)

export function useSpotify() {
  const ctx = useContext(SpotifyContext)
  if (ctx == null) {
    throw new Error('useSpotify must be used within a SpotifyProvider')
  }
  return ctx
}
