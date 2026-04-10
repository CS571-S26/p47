import { useEffect, useState } from 'react'

import { ConcertsContext } from './concertsContext.js'
import { loadConcerts, saveConcerts } from '../utils/concertStore.js'

export function ConcertsProvider({ children }) {
  const [concerts, setConcerts] = useState(() => loadConcerts())

  useEffect(() => {
    saveConcerts(concerts)
  }, [concerts])

  function addConcert(concert) {
    setConcerts((prev) => [...prev, concert])
  }

  function updateConcert(id, patch) {
    setConcerts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    )
  }

  function deleteConcert(id) {
    setConcerts((prev) => prev.filter((c) => c.id !== id))
  }

  function getConcert(id) {
    return concerts.find((c) => c.id === id)
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
