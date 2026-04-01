import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'

import { concerts } from '../data/MockConcerts'
import { geocodeVenue } from '../utils/geocode'
import './MapsPage.css'

function MapsPage() {
  const [locations, setLocations] = useState([])

  useEffect(() => {
    async function loadLocations() {
      const results = []

      for (let concert of concerts) {
        const coords = await geocodeVenue(concert.venue, concert.city)

        if (coords) {
          results.push({ ...concert, coords })
        }
      }
      setLocations(results)
    }
    loadLocations()
  }, [])

  return (
    <div className="map-page">
      <h1>Map</h1>
      <div className="map-box">
        <MapContainer center={[39.5, -98.35]} zoom={4} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((concert) => (
            <Marker key={concert.id} position={concert.coords}/>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapsPage