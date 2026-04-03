export async function geocodeVenue(venue, city) {
  const query = encodeURIComponent(`${venue}, ${city}`)

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`

  const response = await fetch(url)
  const data = await response.json()

  if (data.length === 0) {
    return null
  }

  return [
    parseFloat(data[0].lat),
    parseFloat(data[0].lon)
  ]
}