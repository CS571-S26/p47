import { deleteField } from 'firebase/firestore'

import { normalizeSetlist } from './concertForm.js'

const DEFAULT_SECTION_NAME = 'Setlist'

/**
 * @typedef {{ name: string, encore?: boolean, songs: string[] }} SetlistSection
 */

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim() !== ''
}

/**
 * Raw Firestore / API sections: must be non-empty array of objects with name + songs[].
 */
export function isValidStoredSetlistSections(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return false
  for (const item of raw) {
    if (!item || typeof item !== 'object') return false
    if (!isNonEmptyString(item.name)) return false
    if (!Array.isArray(item.songs)) return false
  }
  return true
}

/**
 * Normalize section names and per-section song lists (trim, drop blank lines).
 * Drops sections with no songs after normalization.
 * @param {unknown[]} sections
 * @returns {SetlistSection[]}
 */
export function normalizeSetlistSections(sections) {
  if (!Array.isArray(sections)) return []
  const out = []
  for (const item of sections) {
    if (!item || typeof item !== 'object') continue
    const name = typeof item.name === 'string' ? item.name.trim() : ''
    if (!name) continue
    const songs = normalizeSetlist(item.songs)
    const encore = item.encore === true || item.encore === 1
    if (songs.length === 0) continue
    out.push({ name, ...(encore ? { encore: true } : {}), songs })
  }
  return out
}

/**
 * @param {SetlistSection[]} normalized
 */
export function flattenNormalizedSetlistSections(normalized) {
  const flat = []
  for (const sec of normalized) {
    for (const s of sec.songs) flat.push(s)
  }
  return flat
}

/**
 * Persist structured `setlistSections` when there is more than one act, or a single non-default / encore block.
 * @param {SetlistSection[]} normalized
 */
export function shouldPersistSetlistSections(normalized) {
  if (!Array.isArray(normalized) || normalized.length === 0) return false
  if (normalized.length > 1) return true
  const one = normalized[0]
  if (one.encore) return true
  const n = typeof one.name === 'string' ? one.name.trim().toLowerCase() : ''
  if (n && n !== DEFAULT_SECTION_NAME.toLowerCase()) return true
  return false
}

/**
 * Sections for display / editing: use stored sections when valid; otherwise one synthetic block from flat `setlist`.
 * @param {Record<string, unknown> | null | undefined} concert
 * @returns {SetlistSection[]}
 */
export function getSetlistSections(concert) {
  const raw = concert?.setlistSections
  if (isValidStoredSetlistSections(raw)) {
    const normalized = normalizeSetlistSections(raw)
    if (normalized.length > 0) return normalized
  }
  return [
    {
      name: DEFAULT_SECTION_NAME,
      songs: normalizeSetlist(concert?.setlist),
    },
  ]
}

/**
 * Ordered songs for search, Spotify, counts — no cross-section deduplication.
 * @param {Record<string, unknown> | null | undefined} concert
 * @returns {string[]}
 */
export function getFlattenedSongs(concert) {
  const raw = concert?.setlistSections
  if (isValidStoredSetlistSections(raw)) {
    const normalized = normalizeSetlistSections(raw)
    if (normalized.length > 0) return flattenNormalizedSetlistSections(normalized)
  }
  return normalizeSetlist(concert?.setlist)
}

/**
 * Form model: always at least one section. Empty placeholder row becomes [] after normalize.
 * @param {SetlistSection[]} sections
 */
export function normalizeSetlistSectionsForForm(sections) {
  const base = Array.isArray(sections) && sections.length > 0 ? sections : [{ name: DEFAULT_SECTION_NAME, songs: [''] }]
  const mapped = base.map((sec) => {
    const name = typeof sec?.name === 'string' && sec.name.trim() ? sec.name : DEFAULT_SECTION_NAME
    const rawSongs = Array.isArray(sec?.songs) ? sec.songs : []
    const songs = rawSongs.length ? rawSongs : ['']
    const encore = sec?.encore === true || sec?.encore === 1
    return { name, ...(encore ? { encore: true } : {}), songs }
  })
  return mapped
}

/**
 * @param {SetlistSection[]} formSections from normalizeSetlistSectionsForForm
 * @param {{ previousConcert?: Record<string, unknown> | null }} opts
 * @returns {{ setlist: string[], songCount: number, setlistSections?: SetlistSection[] | ReturnType<typeof deleteField> }}
 */
export function buildSetlistPersistenceFields(formSections, opts = {}) {
  const normalized = normalizeSetlistSections(formSections)
  const setlist =
    normalized.length > 0 ? flattenNormalizedSetlistSections(normalized) : normalizeSetlist([])
  const songCount = setlist.length
  const persist = shouldPersistSetlistSections(normalized)

  const previous = opts.previousConcert
  const hadStored =
    !!previous &&
    Array.isArray(previous.setlistSections) &&
    previous.setlistSections.length > 0

  if (persist) {
    return { setlist, songCount, setlistSections: normalized }
  }

  if (hadStored) {
    return { setlist, songCount, setlistSections: deleteField() }
  }

  return { setlist, songCount }
}
