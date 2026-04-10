import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useContext, useState } from 'react'
import { Button, Row, Col } from 'react-bootstrap'
import L from 'leaflet'
import { MapPin } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { colors } from '../data/Colors'
import './MapsPage.css'
import MapsMarkerPopup from '../components/MapsMarkerPopup'


// TODO: Improve filtering (e.g. dynamic years/genres from stored concerts, partial genre match).
function applyFilter(list, filter) {
  if (filter === 'all') return list
  if (filter === '2025' || filter === '2024') {
    return list.filter((c) => String(c.date ?? '').startsWith(filter))
  }
  if (filter === 'Rock' || filter === 'Pop') {
    return list.filter(
      (c) => String(c.genre ?? '').toLowerCase() === filter.toLowerCase(),
    )
  }
  return list
}

function MapsPage() {
  const { concerts } = useContext(ConcertsContext)
  const [filter, setFilter] = useState('all')

  const filteredConcerts = applyFilter(concerts, filter)

  const mappable = filteredConcerts.filter((c) => c.coords?.length === 2)
  const skippedCount = filteredConcerts.length - mappable.length

  const concertIcon = new L.DivIcon({
    html: renderToStaticMarkup(
      <MapPin
        size={32}
        color={colors.setlogPrimaryHover}
        fill={colors.setlogPrimary}
      />,
    ),
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })

  function getButtonStyle(value) {
    return filter === value ? styles.selectedButton : styles.unselectedButton
  }

  const grouped = {}
  mappable.forEach((concert) => {
    const key = concert.coords.join(',')
    if (!grouped[key]) grouped[key] = []
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
      backgroundColor: 'lightgray',
      color: 'gray',
      border: 'none',
      borderRadius: '32px',
      padding: '6px',
      fontSize: '13px',
      fontWeight: 700,
    },
    filterCol: {
      padding: '12px',
      width: '10%',
    },
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
      <span style={{ fontSize: '48px', fontWeight: '700' }}>Concert Map</span>

      {skippedCount > 0 ? (
        <p className="text-muted mb-2" style={{ fontSize: '14px' }}>
          {skippedCount} show{skippedCount === 1 ? '' : 's'} in this view have no map pin (geocoding
          failed or venue/city could not be located when saved).
        </p>
      ) : null}

      <Row style={{ gap: '8px' }}>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle('all')}
            onClick={() => setFilter('all')}
            variant="light"
          >
            All
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle('2025')}
            onClick={() => setFilter('2025')}
            variant="light"
          >
            2025
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle('2024')}
            onClick={() => setFilter('2024')}
            variant="light"
          >
            2024
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle('Rock')}
            onClick={() => setFilter('Rock')}
            variant="light"
          >
            Rock
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button
            style={getButtonStyle('Pop')}
            onClick={() => setFilter('Pop')}
            variant="light"
          >
            Pop
          </Button>
        </Col>
        <Col xs="auto" style={styles.filterCol}>
          <Button style={styles.unselectedButton}>More</Button>
        </Col>
      </Row>

      <div className="map-box">
        <MapContainer center={[39.5, -98.35]} zoom={4} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {Object.entries(grouped).map(([key, shows]) => (
            <Marker key={key} position={shows[0].coords} icon={concertIcon}>
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
