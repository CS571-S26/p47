/** Shown when Nominatim returns no usable coordinates (user can still save without a map pin). */
export const GEOCODE_LOOKUP_FAILED_MESSAGE =
  'We could not find that location on the map. Check the venue and city (including spelling), then try again. The concert will still be saved, but it will not have a map pin until the location can be found.'

export async function geocodeVenue(venue, city) {
  const query = encodeURIComponent(`${venue}, ${city}`)

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`

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