import { createContext, useContext } from 'react'

export const UserProfileContext = createContext(null)

export function useUserProfile() {
  const ctx = useContext(UserProfileContext)
  if (ctx == null) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  return ctx
}

