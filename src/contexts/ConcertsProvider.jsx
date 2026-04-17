import { useEffect, useState } from 'react'

import { ConcertsContext } from './concertsContext.js'
import { useAuth } from './authContext.js'
import { loadConcerts, saveConcerts } from '../utils/concertStore.js'

export function ConcertsProvider({ children }) {
  const { loginStatus } = useAuth()
  const [allConcerts, setAllConcerts] = useState(() => loadConcerts())

  useEffect(() => {
    saveConcerts(allConcerts)
  }, [allConcerts])

  const concerts =
    loginStatus.loggedIn && loginStatus.username
      ? allConcerts.filter((c) => c.ownerUsername === loginStatus.username)
      : []

  function addConcert(concert) {
    if (!loginStatus.loggedIn || !loginStatus.username) return
    setAllConcerts((prev) => [
      ...prev,
      { ...concert, ownerUsername: loginStatus.username },
    ])
  }

  function updateConcert(id, patch) {
    if (!loginStatus.loggedIn || !loginStatus.username) return
    const u = loginStatus.username
    setAllConcerts((prev) =>
      prev.map((c) =>
        c.id === id && c.ownerUsername === u ? { ...c, ...patch } : c,
      ),
    )
  }

  function deleteConcert(id) {
    if (!loginStatus.loggedIn || !loginStatus.username) return
    const u = loginStatus.username
    setAllConcerts((prev) => prev.filter((c) => !(c.id === id && c.ownerUsername === u)))
  }

  function getConcert(id) {
    if (!loginStatus.loggedIn || !loginStatus.username) return undefined
    const c = allConcerts.find((x) => x.id === id)
    if (!c || c.ownerUsername !== loginStatus.username) return undefined
    return c
  }

  return (
    <ConcertsContext.Provider
      value={{
        concerts,
        addConcert,
        updateConcert,
        deleteConcert,
        getConcert,
      }}
    >
      {children}
    </ConcertsContext.Provider>
  )
}
