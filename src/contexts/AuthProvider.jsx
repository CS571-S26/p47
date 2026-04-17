import { useCallback, useEffect, useState } from 'react'

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'

import { AuthContext } from './authContext.js'
import { firebaseAuth } from '../firebase.js'

const loggedOut = { loggedIn: false, username: null }

function labelForUser(user) {
  const displayName = typeof user?.displayName === 'string' ? user.displayName.trim() : ''
  if (displayName) return displayName
  const email = typeof user?.email === 'string' ? user.email.trim() : ''
  return email || null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => firebaseAuth.currentUser ?? null)
  const [loading, setLoading] = useState(() => firebaseAuth.currentUser == null)

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u ?? null)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const loginStatus = user
    ? (() => {
        const label = labelForUser(user)
        return label ? { loggedIn: true, username: label } : loggedOut
      })()
    : loggedOut

  const login = useCallback(async (email, password) => {
    const e = typeof email === 'string' ? email.trim() : ''
    const p = typeof password === 'string' ? password : ''
    if (!e || !p) return { ok: false, reason: 'invalid' }
    try {
      await signInWithEmailAndPassword(firebaseAuth, e, p)
      return { ok: true }
    } catch (err) {
      return { ok: false, reason: err?.code || 'unknown' }
    }
  }, [])

  const register = useCallback(async ({ email, password, displayName }) => {
    const e = typeof email === 'string' ? email.trim() : ''
    const p = typeof password === 'string' ? password : ''
    const d = typeof displayName === 'string' ? displayName.trim() : ''
    if (!e || !p || !d) return { ok: false, reason: 'invalid' }

    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, e, p)
      await updateProfile(cred.user, { displayName: d })
      return { ok: true }
    } catch (err) {
      return { ok: false, reason: err?.code || 'unknown' }
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(firebaseAuth)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginStatus,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
