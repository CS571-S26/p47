import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'

import { firestoreDb } from '../firebase.js'
import { useAuth } from './authContext.js'
import { UserProfileContext } from './userProfileContext.js'

const AVATAR_STORAGE_PREFIX = 'p47:profileAvatar:'
const HOMETOWN_STORAGE_PREFIX = 'p47:hometown:'
const IMPORT_FLAG_PREFIX = 'p47:firestoreProfileImport:'

function normalizeString(v) {
  return typeof v === 'string' ? v.trim() : ''
}

function safeParseJson(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function readLegacyAvatar(uid) {
  const cleanUid = normalizeString(uid)
  if (!cleanUid) return ''
  return normalizeString(localStorage.getItem(`${AVATAR_STORAGE_PREFIX}${cleanUid}`))
}

function readLegacyHometown(uid) {
  const cleanUid = normalizeString(uid)
  if (!cleanUid) return null
  const raw = localStorage.getItem(`${HOMETOWN_STORAGE_PREFIX}${cleanUid}`)
  if (!raw) return null
  const parsed = safeParseJson(raw)
  const label = normalizeString(parsed?.label)
  const coords = parsed?.coords
  if (!label) return null
  if (!Array.isArray(coords) || coords.length !== 2) return null
  const lat = Number(coords[0])
  const lon = Number(coords[1])
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  return { label, coords: [lat, lon] }
}

export function UserProfileProvider({ children }) {
  const { user } = useAuth()
  const uid = user?.uid ?? ''

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(uid))
  const [error, setError] = useState('')

  const cleanUid = normalizeString(uid)

  useEffect(() => {
    setError('')

    if (!cleanUid) {
      setProfile(null)
      setLoading(false)
      return undefined
    }

    setLoading(true)
    const profileRef = doc(firestoreDb, 'users', cleanUid)
    const unsub = onSnapshot(
      profileRef,
      (snap) => {
        const data = snap.exists() ? snap.data() : {}
        setProfile({
          avatarUrlOverride: normalizeString(data?.avatarUrlOverride),
          hometown: data?.hometown ?? null,
        })
        setLoading(false)
      },
      (err) => {
        setError(err?.message || 'Failed to load profile.')
        setProfile(null)
        setLoading(false)
      },
    )

    return () => unsub()
  }, [cleanUid])

  // One-time migration from legacy localStorage keys (per uid).
  useEffect(() => {
    if (!cleanUid) return

    const importKey = `${IMPORT_FLAG_PREFIX}${cleanUid}`
    if (localStorage.getItem(importKey) === 'done') return

    const legacyAvatar = readLegacyAvatar(cleanUid)
    const legacyHometown = readLegacyHometown(cleanUid)
    if (!legacyAvatar && !legacyHometown) {
      localStorage.setItem(importKey, 'done')
      return
    }

    ;(async () => {
      try {
        const profileRef = doc(firestoreDb, 'users', cleanUid)
        const snap = await getDoc(profileRef)
        const existing = snap.exists() ? snap.data() : {}

        const next = {}
        if (!normalizeString(existing?.avatarUrlOverride) && legacyAvatar) {
          next.avatarUrlOverride = legacyAvatar
        }
        if (!existing?.hometown && legacyHometown) {
          next.hometown = legacyHometown
        }

        if (Object.keys(next).length > 0) {
          await setDoc(profileRef, { ...next, updatedAt: serverTimestamp() }, { merge: true })
        }
      } finally {
        // Mark done even if writes fail to avoid infinite loops.
        localStorage.setItem(importKey, 'done')
      }
    })()
  }, [cleanUid])

  const setAvatarUrlOverride = useCallback(
    async (avatarUrlOverride) => {
      if (!cleanUid) return
      const profileRef = doc(firestoreDb, 'users', cleanUid)
      await setDoc(
        profileRef,
        {
          avatarUrlOverride: normalizeString(avatarUrlOverride),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    },
    [cleanUid],
  )

  const clearAvatarUrlOverride = useCallback(async () => {
    if (!cleanUid) return
    const profileRef = doc(firestoreDb, 'users', cleanUid)
    await setDoc(
      profileRef,
      {
        avatarUrlOverride: '',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }, [cleanUid])

  const setHometown = useCallback(
    async (hometown) => {
      if (!cleanUid) return
      const label = normalizeString(hometown?.label)
      const coords = hometown?.coords
      if (!label || !Array.isArray(coords) || coords.length !== 2) return
      const lat = Number(coords[0])
      const lon = Number(coords[1])
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return

      const profileRef = doc(firestoreDb, 'users', cleanUid)
      await setDoc(
        profileRef,
        {
          hometown: { label, coords: [lat, lon] },
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    },
    [cleanUid],
  )

  const clearHometown = useCallback(async () => {
    if (!cleanUid) return
    const profileRef = doc(firestoreDb, 'users', cleanUid)
    await setDoc(
      profileRef,
      {
        hometown: null,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }, [cleanUid])

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        setAvatarUrlOverride,
        clearAvatarUrlOverride,
        setHometown,
        clearHometown,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  )
}

