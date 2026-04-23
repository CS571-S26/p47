import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useContext, useEffect, useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import L from 'leaflet'
import { MapPin, Heart, Square } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'
import {
  applyMapFilter,
  getMapFilterOptions,
  isStaleMapFilter,
  mapFiltersEqual,
} from '../utils/mapFilters.js'
import './MapsPage.css'
import MapsMarkerPopup from '../components/MapsMarkerPopup'

function MapsPage({ theme }) {
  const { concerts } = useContext(ConcertsContext)
  const { loginStatus, loading: authLoading } = useAuth()
  const [filter, setFilter] = useState({
    year: 'all',
    genre: 'all',
    favoriteOnly: false,
    attendedOnly: false,
  })

  const { years, genres } = getMapFilterOptions(concerts)

  useEffect(() => {
    const { years: yList, genres: gList } = getMapFilterOptions(concerts)
    setFilter((prev) => {
      if (isStaleMapFilter(prev, yList, gList)) {
        return {
          year: 'all',
          genre: 'all',
          favorite: false,
          attended: false,
        }
      }
      return prev
    })
  }, [concerts])

  const filteredConcerts = applyMapFilter(concerts, filter)

  const mappable = filteredConcerts.filter((c) => c.coords?.length === 2)
  const skippedCount = filteredConcerts.length - mappable.length

  const isDark = theme === 'dark'

  const concertIcon = new L.DivIcon({
    html: renderToStaticMarkup(
      <MapPin
        size={32}
        color='var(--setlog-primary-hover)'
        fill='var(--setlog-primary)'
      />,
    ),
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })

  const styles = {
    filterSelect: {
      maxWidth: '260px',
      borderRadius: '999px',
      border: '1px solid var(--setlog-card-border)',
      backgroundColor: 'var(--setlog-card-bg-secondary)',
      color: 'var(--setlog-card-text)',
      fontSize: '14px',
      fontWeight: 600,
      boxShadow: 'none',
    },
    filterButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.45rem',
      borderRadius: '999px',
      padding: '0.5rem 0.9rem',
      border: '1px solid var(--setlog-card-border)',
      backgroundColor: 'var(--setlog-card-bg-secondary)',
      color: 'var(--setlog-card-text)',
      fontSize: '14px',
      fontWeight: 600,
    }
  }

  const grouped = {}
  mappable.forEach((concert) => {
    const key = concert.coords.join(',')
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(concert)
  })

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
      <h1 style={{ fontSize: '48px', fontWeight: '700', color: 'var(--setlog-primary-text)', margin: 0 }}>Concert Map</h1>

      {!authLoading && !loginStatus.loggedIn ? (
        <p className="mb-2" style={{ fontSize: '15px', color: 'var(--setlog-secondary-text)' }}>
          Log in to see your shows on the map. Only concerts logged under your account appear here.
        </p>
      ) : null}

      {skippedCount > 0 ? (
        <p className="mb-2" style={{ fontSize: '14px', color: 'var(--setlog-secondary-text)' }}>
          {skippedCount} show{skippedCount === 1 ? '' : 's'} in this view have no map pin (geocoding
          failed or venue/city could not be located when saved).
        </p>
      ) : null}

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '0.5rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Form.Select
          aria-label="Filter map by year"
          value={filter.year}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, year: e.target.value }))
          }
          style={styles.filterSelect}
        >
          <option value="all">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Form.Select>

        <Form.Select
          aria-label="Filter map by genre"
          value={filter.genre}
          onChange={(e) =>
            setFilter((prev) => ({ ...prev, genre: e.target.value }))
          }
          style={styles.filterSelect}
        >
          <option value="all">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </Form.Select>

        <Button
          type="button"
          onClick={() =>
            setFilter((prev) => ({
              ...prev,
              favoriteOnly: !prev.favoriteOnly,
            }))
          }
          style={styles.filterButton}
        >
          <Heart
            size={16}
            fill={filter.favoriteOnly ? 'currentColor' : 'none'}
          />
          Favorites
        </Button>

        <Button
          type="button"
          onClick={() =>
            setFilter((prev) => ({
              ...prev,
              attendedOnly: !prev.attendedOnly,
            }))
          }
          style={styles.filterButton}
        >
          <Square
            size={16}
            fill={filter.attendedOnly ? 'currentColor' : 'none'}
          />
          Attended
        </Button>
      </div>

      <div className="map-box">
        <MapContainer key={theme} center={[39.5, -98.35]} zoom={4} scrollWheelZoom>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url={
              isDark
                ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
          />

          {Object.entries(grouped).map(([key, shows]) => {
            const sortedShows = [...shows].sort(
              (a, b) => new Date(a.date) - new Date(b.date)
            )
            return (
              <Marker key={key} position={sortedShows[0].coords} icon={concertIcon}>
                <Popup>
                  <MapsMarkerPopup concerts={sortedShows} />
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>
    </div>
  )
}

export default MapsPage
