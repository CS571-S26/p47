import { useCallback, useEffect, useState } from 'react'
import { demoConcerts } from '../data/DemoConcerts.jsx'

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'

import { firestoreDb } from '../firebase.js'
import { ConcertsContext } from './concertsContext.js'
import { useAuth } from './authContext.js'

const LEGACY_CONCERTS_STORAGE_KEY = 'p47:concerts'
const IMPORT_FLAG_PREFIX = 'p47:firestoreImport:'

function safeParseJsonArray(raw) {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeString(v) {
  return typeof v === 'string' ? v.trim() : ''
}

export function ConcertsProvider({ children }) {
  const { user, loading: authInitializing } = useAuth()
  const [allConcerts, setAllConcerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    const label =
      normalizeString(user.displayName) || normalizeString(user.email) || ''
    if (!label) return

    const importKey = `${IMPORT_FLAG_PREFIX}${user.uid}`
    if (localStorage.getItem(importKey) === 'done') return

    const raw = localStorage.getItem(LEGACY_CONCERTS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(importKey, 'done')
      return
    }

    const legacy = safeParseJsonArray(raw)
    if (legacy.length === 0) {
      localStorage.setItem(importKey, 'done')
      return
    }

    const candidates = legacy
      .filter((c) => c && typeof c === 'object')
      .filter((c) => {
        const owner = normalizeString(c.ownerUsername)
        return owner === '' || owner === label
      })
      .map((c) => {
        const id = normalizeString(c.id)
        if (!id) return null
        const { ownerUsername, ...rest } = c
        return { id, data: rest }
      })
      .filter(Boolean)

    if (candidates.length === 0) {
      localStorage.setItem(importKey, 'done')
      return
    }

    ;(async () => {
      try {
        const batch = writeBatch(firestoreDb)
        for (const item of candidates) {
          const ref = doc(firestoreDb, 'users', user.uid, 'concerts', item.id)
          batch.set(ref, item.data, { merge: false })
        }
        await batch.commit()
      } finally {
        // Mark done even if some writes fail, to avoid infinite retry loops.
        localStorage.setItem(importKey, 'done')
      }
    })()
  }, [user])

  useEffect(() => {
    setError('')

    if (!user) {
      setAllConcerts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const concertsRef = collection(firestoreDb, 'users', user.uid, 'concerts')
    const unsub = onSnapshot(
      concertsRef,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setAllConcerts(next)
        setLoading(false)
      },
      (err) => {
        setError(err?.message || 'Failed to load concerts.')
        setAllConcerts([])
        setLoading(false)
      },
    )

    return () => unsub()
  }, [user])

  // Avoid showing demo concerts until Firebase has settled auth; otherwise logged-in
  // users briefly see the guest sample list on cold load.
  const concerts = user ? allConcerts : authInitializing ? [] : demoConcerts

  const addConcert = useCallback(
    async (concert) => {
      if (!user || !concert || typeof concert !== 'object') return
      const id = typeof concert.id === 'string' && concert.id.trim() ? concert.id.trim() : null
      if (!id) return

      const ref = doc(firestoreDb, 'users', user.uid, 'concerts', id)
      const { ownerUsername, ...rest } = concert
      await setDoc(ref, rest, { merge: false })
    },
    [user],
  )

  const updateConcert = useCallback(
    async (id, patch) => {
      if (!user) return
      const docId = typeof id === 'string' ? id.trim() : ''
      if (!docId || !patch || typeof patch !== 'object') return

      const ref = doc(firestoreDb, 'users', user.uid, 'concerts', docId)
      const { ownerUsername, ...rest } = patch
      await updateDoc(ref, rest)
    },
    [user],
  )

  const deleteConcert = useCallback(
    async (id) => {
      if (!user) return
      const docId = typeof id === 'string' ? id.trim() : ''
      if (!docId) return

      const ref = doc(firestoreDb, 'users', user.uid, 'concerts', docId)
      await deleteDoc(ref)
    },
    [user],
  )

  const getConcert = useCallback(
    (id) => {
      if (!user) return undefined
      const docId = typeof id === 'string' ? id.trim() : ''
      if (!docId) return undefined
      return allConcerts.find((x) => x?.id === docId)
    },
    [allConcerts, user],
  )

  return (
    <ConcertsContext.Provider
      value={{
        concerts,
        loading,
        error,
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
