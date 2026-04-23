function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeComparable(value) {
  return normalizeString(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(the|a|an)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function spotifyFetchJson(url, { accessToken, method = 'GET', body } = {}) {
  const resp = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const contentType = resp.headers.get('content-type') || ''
  let data = null
  let text = ''

  try {
    if (contentType.includes('application/json')) {
      data = await resp.json()
    } else {
      text = await resp.text()
    }
  } catch {
    // Ignore body parse failures; the status code is still actionable.
  }

  if (!resp.ok) {
    const details =
      (data &&
        (data.error?.message ||
          data.error_description ||
          data.error?.reason ||
          data.message)) ||
      normalizeString(text)
    const suffix = details ? ` (${details})` : ''
    throw new Error(`Spotify request failed: ${resp.status} ${resp.statusText}${suffix}`)
  }

  return data
}

function buildSearchQuery({ title, artist }) {
  const parts = []
  if (normalizeString(title)) parts.push(`track:"${normalizeString(title)}"`)
  if (normalizeString(artist)) parts.push(`artist:"${normalizeString(artist)}"`)
  return parts.join(' ')
}

function scoreTrackCandidate(track, title, artist) {
  const targetTitle = normalizeComparable(title)
  const targetArtist = normalizeComparable(artist)

  const trackName = normalizeComparable(track?.name)
  const artistNames = Array.isArray(track?.artists)
    ? track.artists.map((item) => normalizeComparable(item?.name)).filter(Boolean)
    : []

  let score = 0

  if (trackName === targetTitle) {
    score += 50
  } else if (trackName.startsWith(targetTitle) || targetTitle.startsWith(trackName)) {
    score += 30
  } else if (trackName.includes(targetTitle) || targetTitle.includes(trackName)) {
    score += 15
  }

  if (targetArtist) {
    if (artistNames.includes(targetArtist)) {
      score += 40
    } else if (artistNames.some((name) => name.includes(targetArtist) || targetArtist.includes(name))) {
      score += 20
    }
  }

  const popularity = Number(track?.popularity)
  if (Number.isFinite(popularity)) {
    score += Math.min(popularity / 10, 10)
  }

  return score
}

export function buildSpotifyPlaylistName(concert) {
  const artist = normalizeString(concert?.artist) || 'Concert'
  const venue = normalizeString(concert?.venue)
  const date = normalizeString(concert?.date)
  return [artist, venue, date].filter(Boolean).join(' - ')
}

export function buildSpotifyPlaylistDescription(concert) {
  const parts = []
  const artist = normalizeString(concert?.artist)
  const venue = normalizeString(concert?.venue)
  const city = normalizeString(concert?.city)
  const date = normalizeString(concert?.date)

  if (artist) parts.push(`${artist} setlist exported from SetLog`)
  if (venue) parts.push(`Venue: ${venue}`)
  if (city) parts.push(`City: ${city}`)
  if (date) parts.push(`Date: ${date}`)

  return parts.join(' | ')
}

export async function searchSpotifyTrackCandidates({
  accessToken,
  title,
  artist,
  limit = 5,
}) {
  const q = buildSearchQuery({ title, artist })
  if (!q) return []

  const params = new URLSearchParams({
    q,
    type: 'track',
    limit: String(Math.max(1, Math.min(10, Number(limit) || 5))),
  })

  const data = await spotifyFetchJson(`https://api.spotify.com/v1/search?${params.toString()}`, {
    accessToken,
  })

  return Array.isArray(data?.tracks?.items) ? data.tracks.items : []
}

export async function resolveSpotifyTrackMatches({
  accessToken,
  songs,
  artist,
  limit = 5,
}) {
  const matched = []
  const unmatched = []

  for (const rawSong of songs) {
    const song = normalizeString(rawSong)
    if (!song) continue

    const candidates = await searchSpotifyTrackCandidates({
      accessToken,
      title: song,
      artist,
      limit,
    })

    const ranked = candidates
      .map((track) => ({
        track,
        score: scoreTrackCandidate(track, song, artist),
      }))
      .sort((a, b) => b.score - a.score)

    const best = ranked[0]
    if (!best || best.score < 35 || !normalizeString(best.track?.uri)) {
      unmatched.push({ song })
      continue
    }

    matched.push({
      song,
      uri: best.track.uri,
      trackName: normalizeString(best.track.name),
      artistNames: Array.isArray(best.track.artists)
        ? best.track.artists.map((item) => normalizeString(item?.name)).filter(Boolean)
        : [],
      externalUrl: normalizeString(best.track?.external_urls?.spotify) || null,
    })
  }

  return { matched, unmatched }
}

export async function createSpotifyPlaylist({
  accessToken,
  name,
  description,
  isPublic = false,
}) {
  return spotifyFetchJson('https://api.spotify.com/v1/me/playlists', {
    accessToken,
    method: 'POST',
    body: {
      name: normalizeString(name) || 'SetLog Playlist',
      description: normalizeString(description),
      public: Boolean(isPublic),
    },
  })
}

export async function addItemsToSpotifyPlaylist({ accessToken, playlistId, uris }) {
  const cleanPlaylistId = normalizeString(playlistId)
  if (!cleanPlaylistId) {
    throw new Error('A Spotify playlist ID is required.')
  }

  const cleanUris = Array.isArray(uris) ? uris.map((item) => normalizeString(item)).filter(Boolean) : []
  if (cleanUris.length === 0) {
    return null
  }

  let lastSnapshot = null
  for (let idx = 0; idx < cleanUris.length; idx += 100) {
    const chunk = cleanUris.slice(idx, idx + 100)
    lastSnapshot = await spotifyFetchJson(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(cleanPlaylistId)}/tracks`,
      {
        accessToken,
        method: 'POST',
        body: { uris: chunk },
      },
    )
  }

  return lastSnapshot
}
