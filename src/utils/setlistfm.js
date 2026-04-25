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

const US_STATE_CODES = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
}

const US_STATE_ABBREV_SET = new Set(Object.values(US_STATE_CODES))

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
    if (resp.status === 404) {
      return { setlist: [] }
    }

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

export function extractSetlistConcertDetails(setlist) {
  const eventDate = typeof setlist?.eventDate === 'string' ? setlist.eventDate.trim() : ''
  const dateMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(eventDate)
  const city = setlist?.venue?.city
  const cityName = typeof city?.name === 'string' ? city.name.trim() : ''
  const stateCode = typeof city?.stateCode === 'string' ? city.stateCode.trim() : ''
  const stateName = typeof city?.state === 'string' ? city.state.trim() : ''
  const countryName = typeof city?.country?.name === 'string' ? city.country.name.trim() : ''

  let cityField = ''
  if (cityName) {
    if (stateCode) cityField = `${cityName}, ${stateCode}`
    else if (stateName) cityField = `${cityName}, ${stateName}`
    else if (countryName) cityField = `${cityName}, ${countryName}`
    else cityField = cityName
  }

  return {
    artist: typeof setlist?.artist?.name === 'string' ? setlist.artist.name.trim() : '',
    venue: typeof setlist?.venue?.name === 'string' ? setlist.venue.name.trim() : '',
    date: dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : '',
    city: cityField,
  }
}

/** Region text after comma → ISO 3166-1 alpha-2 for setlist.fm (non-US). */
const REGION_NAME_TO_COUNTRY_CODE = {
  england: 'GB',
  scotland: 'GB',
  wales: 'GB',
  'northern ireland': 'GB',
  'united kingdom': 'GB',
  uk: 'GB',
  britain: 'GB',
  'great britain': 'GB',
  ireland: 'IE',
  france: 'FR',
  germany: 'DE',
  spain: 'ES',
  italy: 'IT',
  netherlands: 'NL',
  belgium: 'BE',
  japan: 'JP',
  australia: 'AU',
  mexico: 'MX',
  canada: 'CA',
  gb: 'GB',
}

function parseCityState(cityState) {
  if (typeof cityState !== 'string') return { cityName: '', stateCode: '', region: '' }

  const t = cityState.trim()
  const match = /^(.+?),\s*(.+)$/.exec(t)
  if (!match) return { cityName: t, stateCode: '', region: '' }

  const statePart = match[2].trim()
  const fromFullName = US_STATE_CODES[statePart.toLowerCase()] || ''
  const twoLetter = /^[A-Za-z]{2}$/.test(statePart) ? statePart.toUpperCase() : ''
  const stateCode =
    fromFullName || (twoLetter && US_STATE_ABBREV_SET.has(twoLetter) ? twoLetter : '')

  return {
    cityName: match[1].trim(),
    stateCode,
    region: statePart,
  }
}

function getSortableEventDate(setlist) {
  const eventDate = typeof setlist?.eventDate === 'string' ? setlist.eventDate.trim() : ''
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(eventDate)
  if (!match) return 0

  return Date.parse(`${match[3]}-${match[2]}-${match[1]}`)
}

function buildSearchParams({ artistName, venueName, cityState, date }) {
  const a = typeof artistName === 'string' ? artistName.trim() : ''
  const v = typeof venueName === 'string' ? venueName.trim() : ''
  const { cityName, stateCode, region } = parseCityState(cityState)
  const d = formatSetlistFmDate(date)

  if (!a && !v && !cityName && !d) {
    throw new Error('Enter at least one concert detail before searching setlist.fm.')
  }

  const params = new URLSearchParams({ p: '1' })
  if (a) params.set('artistName', a)
  if (v) params.set('venueName', v)
  if (cityName) params.set('cityName', cityName)
  if (stateCode) {
    params.set('stateCode', stateCode)
    params.set('countryCode', 'US')
  } else if (region) {
    const cc = REGION_NAME_TO_COUNTRY_CODE[region.toLowerCase()]
    if (cc) params.set('countryCode', cc)
  }
  if (d) params.set('date', d)

  return params
}

export async function searchSetlists({ artistName, venueName, cityState, date, limit = 5 }) {
  const proxyBase = import.meta.env.VITE_SETLISTFM_PROXY_URL
  const apiKey = import.meta.env.VITE_SETLISTFM_API_KEY

  const params = buildSearchParams({ artistName, venueName, cityState, date })

  let url
  let headers

  if (proxyBase) {
    const base = typeof proxyBase === 'string' ? proxyBase.trim().replace(/\/+$/, '') : ''
    if (!base) {
      throw new Error('VITE_SETLISTFM_PROXY_URL is set but empty.')
    }
    url = `${base}/search/setlists?${params.toString()}`
    headers = { Accept: 'application/json' }
  } else {
    if (!apiKey) {
      throw new Error(
        'Missing VITE_SETLISTFM_PROXY_URL (recommended) or VITE_SETLISTFM_API_KEY. Add one to your .env.local and restart the dev server.',
      )
    }
    url = `https://api.setlist.fm/rest/1.0/search/setlists?${params.toString()}`
    headers = {
      Accept: 'application/json',
      'x-api-key': apiKey,
    }
  }

  const data = await fetchJson(url, { headers })

  const list = Array.isArray(data?.setlist) ? data.setlist : []
  const maxResults = Number.isFinite(limit) ? Math.max(1, Math.floor(limit)) : 5
  return [...list]
    .sort((a, b) => getSortableEventDate(b) - getSortableEventDate(a))
    .slice(0, maxResults)
}

export async function searchFirstSetlist({ artistName, venueName, cityState, date }) {
  const results = await searchSetlists({ artistName, venueName, cityState, date, limit: 1 })
  return results.length ? results[0] : null
}
