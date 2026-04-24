import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useContext, useEffect, useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import L from 'leaflet'
import { MapPin, Heart, Square, Home } from 'lucide-react'
import { renderToStaticMarkup } from 'react-dom/server'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'
import {
  applyMapFilter,
  getMapFilterOptions,
  isStaleMapFilter,
} from '../utils/mapFilters.js'
import './MapsPage.css'
import MapsMarkerPopup from '../components/MapsMarkerPopup'

const HOMETOWN_STORAGE_PREFIX = 'p47:hometown:'

function readHometownPin(uid) {
  if (!uid) return null
  try {
    const raw = localStorage.getItem(`${HOMETOWN_STORAGE_PREFIX}${uid}`)
    if (!raw) return null
    const o = JSON.parse(raw)
    const label = typeof o?.label === 'string' ? o.label.trim() : ''
    if (!label) return null
    if (!Array.isArray(o.coords) || o.coords.length !== 2) return null
    const lat = Number(o.coords[0])
    const lon = Number(o.coords[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
    return { label, coords: [lat, lon] }
  } catch {
    return null
  }
}

function ZoomMarker({ position, icon, children }) {
  const map = useMap()

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => {
          map.setView(position, 10, {
            animate: true,
            duration: 0.75,
          })

          setTimeout(() => {
            map.panBy([0, -120], {
              animate: true,
              duration: 0.4,
            })
          }, 300)
        },
      }}
    >
      {children}
    </Marker>
  )
}

function MapsPage({ theme }) {
  const { concerts } = useContext(ConcertsContext)
  const { loginStatus, loading: authLoading, user } = useAuth()
  const [hometownPin, setHometownPin] = useState(null)
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
          favoriteOnly: false,
          attendedOnly: false,
        }
      }
      return prev
    })
  }, [concerts])

  useEffect(() => {
    const uid = user?.uid
    if (!loginStatus.loggedIn || !uid) {
      setHometownPin(null)
      return undefined
    }

    function syncHometown() {
      setHometownPin(readHometownPin(uid))
    }

    syncHometown()
    window.addEventListener('hometownUpdated', syncHometown)
    return () => window.removeEventListener('hometownUpdated', syncHometown)
  }, [user?.uid, loginStatus.loggedIn])

  const filteredConcerts = applyMapFilter(concerts, filter)

  const mappable = filteredConcerts.filter((c) => c.coords?.length === 2)
  const skippedCount = filteredConcerts.length - mappable.length

  const isDark = theme === 'dark'

  const concertIcon = new L.DivIcon({
    html: renderToStaticMarkup(
      <MapPin
        size={32}
        color="var(--white)"
        fill='var(--setlog-primary)'
        strokeWidth={1}
      />
    ),
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })

  const homeIcon = new L.DivIcon({
    html: renderToStaticMarkup(
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          backgroundColor: 'var(--setlog-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}
      >
        <Home
          size={20}
          color="var(--white)"
          fill="none"
          strokeWidth={2.25}
        />
      </div>
    ),
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  })

  const styles = {
    filterSelect: {
      width: 'clamp(180px, 22vw, 260px)',
      borderRadius: '999px',
      border: '1px solid var(--setlog-card-border)',
      backgroundColor: 'var(--setlog-card-bg-secondary)',
      color: 'var(--setlog-card-text)',
      fontSize: '14px',
      fontWeight: 600,
      boxShadow: 'none',
    },

    filterButton: {
      width: 'clamp(120px, 14vw, 150px)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.45rem',
      borderRadius: '999px',
      padding: '0.55rem 0.9rem',
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1rem' }} >
      <h1 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '700', color: 'var(--setlog-primary-text)', margin: 0 }}>Concert Map</h1>

      {!authLoading && !loginStatus.loggedIn ? (
        <p className="mb-2" style={{ fontSize: '15px', color: 'var(--setlog-secondary-text)' }}>
          Log in to see your shows on the map. Only concerts logged under your account appear here.
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
        <div>
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
        </div>

        <div>
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
        </div>


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

          {hometownPin ? (
            <ZoomMarker position={hometownPin.coords} icon={homeIcon}>
              <Popup>
                <div
                  style={{
                    margin: 0,
                    padding: '0.35rem 0.25rem',
                    minWidth: '10rem',
                    fontWeight: 600,
                    color: 'var(--setlog-card-text)',
                  }}
                >
                  Hometown: {hometownPin.label}
                </div>
              </Popup>
            </ZoomMarker>
          ) : null}

          {Object.entries(grouped).map(([key, shows]) => {
            const sortedShows = [...shows].sort(
              (a, b) => new Date(a.date) - new Date(b.date)
            )
            return (
              <ZoomMarker key={key} position={sortedShows[0].coords} icon={concertIcon}>
                <Popup>
                  <MapsMarkerPopup concerts={sortedShows} />
                </Popup>
              </ZoomMarker>
            )
          })}
        </MapContainer>
      </div>

      {
        skippedCount > 0 ? (
          <p className="mb-2" style={{ fontSize: '14px', color: 'var(--setlog-secondary-text)' }}>
            {skippedCount} show{skippedCount === 1 ? '' : 's'} in this view has no map pin (geocoding
            failed or venue/city could not be located when saved).
          </p>
        ) : null
      }
    </div >
  )
}

export default MapsPage
