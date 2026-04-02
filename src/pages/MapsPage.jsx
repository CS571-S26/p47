import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useState } from 'react'
import { Button, Row, Col } from 'react-bootstrap'

import { concerts } from '../data/MockConcerts'
import { colors } from "../data/Colors"
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

  // Return style of the current button based upon if it's selected
  function getButtonStyle(value) {
    return filter === value ? styles.selectedButton : styles.unselectedButton
  }

  // Group concerts together so they can be viewed via one marker
  const grouped = {}
  concerts.forEach((concert) => {
    const key = concert.coords.join(",")

    if (!grouped[key]) {
      grouped[key] = []
    }

    grouped[key].push(concert)
  })

  const styles = {
    selectedButton: {
      width: '100%',
      backgroundColor: colors.setlogPrimary,
      border: 'none',
      borderRadius: '32px',
      padding: '6px',
      fontSize: '13px',
      fontWeight: 700,
    },
    unselectedButton: {
      width: '100%',
      backgroundColor: 'white',
      color: 'gray',
      border: 'none',
      borderRadius: '32px',
      padding: '6px',
      fontSize: '13px',
      fontWeight: 700,
    },
    mapBox: {
      height: '70vh',
      width: '100%',
      border: '1px solid #ccc',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    filterCol: {
      padding: "12px",
      width: "10%"
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "1rem" }}>
      <span style={{ fontSize: "48px", fontWeight: "700" }}>Concert Map</span>

      {/* TODO: MAKE FILTERS WORK */}
      <Row style={{ gap: '8px' }}>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle("all")}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle("2025")}
            onClick={() => setFilter("2025")}
          >
            2025
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle("2024")}
            onClick={() => setFilter("2024")}
          >
            2024
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle("Rock")}
            onClick={() => setFilter("Rock")}
          >
            Rock
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle("Pop")}
            onClick={() => setFilter("Pop")}
          >
            Pop
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={styles.unselectedButton}>
            More
          </Button>
        </Col>
      </Row>

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