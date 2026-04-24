/** Shown when Nominatim returns no usable coordinates (user can still save without a map pin). */
export const GEOCODE_LOOKUP_FAILED_MESSAGE =
  'We could not find that location on the map. Check the venue and city (including spelling), then try again. The concert will still be saved, but it will not have a map pin until the location can be found.'

/** Shown when hometown lookup fails (no pin until a place is found). */
export const HOMETOWN_GEOCODE_FAILED_MESSAGE =
  'We could not find that place on the map. Check spelling or try a broader location (city, state, or country). Your hometown was not saved.'

async function nominatimSearch(encodedQuery) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}`

  const response = await fetch(url)
  if (!response.ok) {
    return null
  }

  const data = await response.json()

  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  const lat = parseFloat(data[0].lat)
  const lon = parseFloat(data[0].lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null
  }

  return [lat, lon]
}

export async function geocodeVenue(venue, city) {
  const query = encodeURIComponent(`${venue}, ${city}`)
  return nominatimSearch(query)
}

/** Geocode a single freeform place string (e.g. hometown). */
export async function geocodePlace(place) {
  const trimmed = typeof place === 'string' ? place.trim() : ''
  if (!trimmed) {
    return null
  }
  return nominatimSearch(encodeURIComponent(trimmed))
}