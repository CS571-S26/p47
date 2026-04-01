import { MapContainer, TileLayer } from 'react-leaflet'
import './MapsPage.css'

function MapsPage() {
  return (
    <div className="map-page">
      <h1>Map</h1>
      <p>Your concerts on a map (coming soon).</p>
      <div className="map-box">
        <MapContainer center={[39.5, -98.35]} zoom={4} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    </div>
  )
}

export default MapsPage