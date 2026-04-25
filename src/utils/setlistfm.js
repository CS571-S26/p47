function uniqPreserveOrder(items) {
  const seen = new Set()
  const out = []
  for (const item of items) {
    if (seen.has(item)) continue
    seen.add(item)
    out.push(item)
  }
  return out
}

export function formatSetlistFmDate(yyyyMmDd) {
  // input from <input type="date" /> is "YYYY-MM-DD"
  if (typeof yyyyMmDd !== 'string') return null
  const t = yyyyMmDd.trim()
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t)
  if (!m) return null
  const [, yyyy, mm, dd] = m
  return `${dd}-${mm}-${yyyy}`
}

export function extractSongTitles(setlist) {
  const titles = []
  const sets = setlist?.sets?.set
  const setArr = Array.isArray(sets) ? sets : []

  for (const oneSet of setArr) {
    const songs = oneSet?.song
    const songArr = Array.isArray(songs) ? songs : []
    for (const song of songArr) {
      const name = typeof song?.name === 'string' ? song.name.trim() : ''
      if (name) titles.push(name)
    }
  }

  return uniqPreserveOrder(titles)
}

async function fetchJson(url, { headers } = {}) {
  const resp = await fetch(url, { headers })
  const contentType = resp.headers.get('content-type') || ''

  let bodyText = ''
  let bodyJson = null
  try {
    if (contentType.includes('application/json')) {
      bodyJson = await resp.json()
    } else {
      bodyText = await resp.text()
    }
  } catch {
    // ignore parse errors; we'll still surface status
  }

  if (!resp.ok) {
    const details =
      (bodyJson && (bodyJson.message || bodyJson.error)) ||
      (typeof bodyText === 'string' ? bodyText.trim() : '')
    const suffix = details ? ` (${details})` : ''
    throw new Error(`setlist.fm request failed: ${resp.status} ${resp.statusText}${suffix}`)
  }

  return bodyJson
}

export function extractSetlistSections(setlist) {
  const sections = []
  const sets = setlist?.sets?.set
  const setArr = Array.isArray(sets) ? sets : []

  for (let i = 0; i < setArr.length; i++) {
    const oneSet = setArr[i]
    const songs = Array.isArray(oneSet?.song) ? oneSet.song : []

    const isEncore = oneSet?.encore === 1 || oneSet?.encore === true

    const sectionName =
      typeof oneSet?.name === 'string' && oneSet.name.trim()
        ? oneSet.name.trim()
        : isEncore
          ? 'Encore'
          : `Set ${i + 1}`

    const titles = []

    for (const song of songs) {
      const name = typeof song?.name === 'string' ? song.name.trim() : ''
      if (name) titles.push(name)
    }

    if (titles.length > 0) {
      sections.push({
        name: sectionName,
        encore: isEncore,
        songs: titles,
      })
    }
  }

  return sections
}

export async function searchFirstSetlist({ artistName, venueName, date }) {
  const proxyBase = import.meta.env.VITE_SETLISTFM_PROXY_URL
  const apiKey = import.meta.env.VITE_SETLISTFM_API_KEY

  const a = typeof artistName === 'string' ? artistName.trim() : ''
  const v = typeof venueName === 'string' ? venueName.trim() : ''
  const d = formatSetlistFmDate(date)

  if (!a || !v || !d) {
    throw new Error('Artist, venue, and date are required to import from setlist.fm.')
  }

  let url
  let headers

  if (proxyBase) {
    const base = typeof proxyBase === 'string' ? proxyBase.trim().replace(/\/+$/, '') : ''
    if (!base) {
      throw new Error('VITE_SETLISTFM_PROXY_URL is set but empty.')
    }
    const params = new URLSearchParams({
      artistName: a,
      venueName: v,
      date: d,
      p: '1',
    })
    url = `${base}/search/setlists?${params.toString()}`
    headers = { Accept: 'application/json' }
  } else {
    if (!apiKey) {
      throw new Error(
        'Missing VITE_SETLISTFM_PROXY_URL (recommended) or VITE_SETLISTFM_API_KEY. Add one to your .env.local and restart the dev server.',
      )
    }
    const params = new URLSearchParams({
      artistName: a,
      venueName: v,
      date: d,
      p: '1',
    })
    url = `https://api.setlist.fm/rest/1.0/search/setlists?${params.toString()}`
    headers = {
      Accept: 'application/json',
      'x-api-key': apiKey,
    }
  }

  const data = await fetchJson(url, { headers })

  const list = Array.isArray(data?.setlist) ? data.setlist : []
  return list.length ? list[0] : null
}
