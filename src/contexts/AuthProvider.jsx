import { useCallback, useState } from 'react'

import { AuthContext } from './authContext.js'
import { ConcertsProvider } from './ConcertsProvider.jsx'
import {
  LOGIN_STATUS_SESSION_KEY,
  readStoredLoginStatus,
} from '../utils/authSession.js'
import { verifyCredentials } from '../utils/userStore.js'

const loggedOut = { loggedIn: false, username: null }

export function AuthProvider({ children }) {
  const [loginStatus, setLoginStatus] = useState(() => readStoredLoginStatus())

  const persist = useCallback((status) => {
    sessionStorage.setItem(LOGIN_STATUS_SESSION_KEY, JSON.stringify(status))
  }, [])

  const login = useCallback(
    (username, password) => {
      if (!verifyCredentials(username, password)) {
        return false
      }
      const next = { loggedIn: true, username: username.trim() }
      setLoginStatus(next)
      persist(next)
      return true
    },
    [persist],
  )

  const setLoggedInUser = useCallback(
    (username) => {
      const next = { loggedIn: true, username: username.trim() }
      setLoginStatus(next)
      persist(next)
    },
    [persist],
  )

  const logout = useCallback(() => {
    setLoginStatus(loggedOut)
    persist(loggedOut)
  }, [persist])

  const concertsKey =
    loginStatus.loggedIn && loginStatus.username ? loginStatus.username : 'guest'

  return (
    <AuthContext.Provider
      value={{
        loginStatus,
        login,
        setLoggedInUser,
        logout,
      }}
    >
      <ConcertsProvider key={concertsKey}>{children}</ConcertsProvider>
    </AuthContext.Provider>
  )
}
