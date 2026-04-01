import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'

import { concerts } from '../data/MockConcerts'
import { geocodeVenue } from '../utils/geocode'
import './MapsPage.css'
import MapsMarkerPopup from '../components/MapsMarkerPopup'

function MapsPage() {
  // const [locations, setLocations] = useState([])
  const [filter, setFilter] = useState("all")

  // useEffect(() => {
  //   async function loadLocations() {
  //     const results = []

  //     for (let concert of concerts) {
  //       const coords = await geocodeVenue(concert.venue, concert.city)

  //       if (coords) {
  //         results.push({ ...concert, coords })
  //       }
  //     }
  //     setLocations(results)
  //   }
  //   loadLocations()
  // }, [])

  // Group concerts together so they can be viewed via one marker
  const grouped = {}
  concerts.forEach((concert) => {
    const key = concert.coords.join(",")

    if (!grouped[key]) {
      grouped[key] = []
    }

    grouped[key].push(concert)
  })

  return (
    <div className="map-page">
      <span className="map-title">Concert Map</span>

      <div className="map-filter-row">
        <button
          className={filter === "all" ? "map-filter-button-select" : "map-filter-button-unselect"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "2025" ? "map-filter-button-select" : "map-filter-button-unselect"}
          onClick={() => setFilter("2025")}
        >
          2025
        </button>
        <button
          className={filter === "2024" ? "map-filter-button-select" : "map-filter-button-unselect"}
          onClick={() => setFilter("2024")}
        >
          2024
        </button>
        <button
          className={filter === "Rock" ? "map-filter-button-select" : "map-filter-button-unselect"}
          onClick={() => setFilter("Rock")}
        >
          Rock
        </button>
        <button
          className={filter === "Pop" ? "map-filter-button-select" : "map-filter-button-unselect"}
          onClick={() => setFilter("Pop")}
        >
          Pop
        </button>
        <button
          className="map-filter-button-unselect">More</button>
      </div>

      <div className="map-box">
        <MapContainer center={[39.5, -98.35]} zoom={4} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {Object.entries(grouped).map(([key, shows]) => (
            <Marker key={key} position={shows[0].coords}>
              <Popup>
                <MapsMarkerPopup concerts={shows} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapsPage