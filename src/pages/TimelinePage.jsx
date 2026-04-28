import { useContext, useState } from 'react'
import TimelineConcert from '../components/TimelineConcert'
import TimelineStats from '../components/TimelineStats'
import { Container, Row, Col, Button, Spinner, Dropdown } from 'react-bootstrap'
import { Plus, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { NavLink, useSearchParams } from 'react-router-dom'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'
import {
  filterConcertsByQuery,
  normalizeConcertSearchQuery,
} from '../utils/concertSearch.js'
import { concertDateToDate, daysUntilLocalDate } from '../utils/localDate.js'

const TIMELINE_SORT_KEY = 'setlog:timelineSort'

function TimelinePage() {
  const { concerts, loading: concertsLoading } = useContext(ConcertsContext)
  const [showMobileStats, setShowMobileStats] = useState(false)
  const { loginStatus, loading: authLoading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryRaw = searchParams.get('q') ?? ''
  const hasActiveQuery = normalizeConcertSearchQuery(queryRaw) !== ''

  const sortRaw =
    searchParams.get('sort') ??
    localStorage.getItem(TIMELINE_SORT_KEY) ??
    ''

  const sortKey = sortRaw.trim() === '' ? 'date_desc' : sortRaw.trim()

  const styles = {
    sortToggle: {
      minWidth: '260px',
      borderRadius: '999px',
      border: '1px solid var(--setlog-card-border)',
      backgroundColor: 'var(--setlog-card-bg-secondary)',
      color: 'var(--setlog-card-text)',
      fontSize: '14px',
      fontWeight: 700,
      boxShadow: 'none',
      padding: '8px 14px',
      textAlign: 'left',
    },
    sortMenu: {
      borderRadius: '14px',
      border: '1px solid var(--setlog-card-border)',
      backgroundColor: 'var(--setlog-card-bg)',
      padding: '0.4rem',
    },
    sortItem: {
      color: 'var(--setlog-card-text)',
      fontSize: '14px',
      fontWeight: 600,
      borderRadius: '10px',
      padding: '0.55rem 0.75rem',
    },
  }

  const strField = (v) => (typeof v === 'string' ? v.trim() : '')
  const today = new Date()
  const dateMs = (c) => {
    const t = concertDateToDate(strField(c?.date)).getTime()
    return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY
  }
  const daysUntil = (c) => daysUntilLocalDate(strField(c?.date), today)

  const cmpStringAsc = (field) => (a, b) =>
    strField(a?.[field]).localeCompare(strField(b?.[field]), undefined, {
      sensitivity: 'base',
    })

  const sortComparators = {
    date_asc: (a, b) => dateMs(a) - dateMs(b),
    date_desc: (a, b) => dateMs(b) - dateMs(a),

    artist_asc: cmpStringAsc('artist'),
    artist_desc: (a, b) => cmpStringAsc('artist')(b, a),

    venue_asc: cmpStringAsc('venue'),
    venue_desc: (a, b) => cmpStringAsc('venue')(b, a),

    city_asc: cmpStringAsc('city'),
    city_desc: (a, b) => cmpStringAsc('city')(b, a),

    genre_asc: cmpStringAsc('genre'),
    genre_desc: (a, b) => cmpStringAsc('genre')(b, a),

    rating_asc: (a, b) => (Number(a?.rating) || 0) - (Number(b?.rating) || 0),
    rating_desc: (a, b) => (Number(b?.rating) || 0) - (Number(a?.rating) || 0),

    favorites_first: (a, b) =>
      Number(Boolean(b?.favorite)) - Number(Boolean(a?.favorite)),
    favorites_last: (a, b) =>
      Number(Boolean(a?.favorite)) - Number(Boolean(b?.favorite)),

    attended_first: (a, b) =>
      Number(Boolean(b?.attended)) - Number(Boolean(a?.attended)),
    attended_last: (a, b) =>
      Number(Boolean(a?.attended)) - Number(Boolean(b?.attended)),

    upcoming_first: (a, b) => {
      const aDays = daysUntil(a)
      const bDays = daysUntil(b)
      const aIsFuture = aDays !== null && aDays > 0
      const bIsFuture = bDays !== null && bDays > 0

      if (aIsFuture !== bIsFuture) return aIsFuture ? -1 : 1
      if (aIsFuture && bIsFuture && aDays !== bDays) return aDays - bDays

      return dateMs(b) - dateMs(a)
    },

    upcoming_last: (a, b) => {
      const aDays = daysUntil(a)
      const bDays = daysUntil(b)
      const aIsFuture = aDays !== null && aDays > 0
      const bIsFuture = bDays !== null && bDays > 0

      if (aIsFuture !== bIsFuture) return aIsFuture ? 1 : -1
      if (aIsFuture && bIsFuture && aDays !== bDays) return aDays - bDays

      return dateMs(b) - dateMs(a)
    },
  }

  const filtered = filterConcertsByQuery(concerts, queryRaw)
  const comparator =
    sortComparators[sortKey] ?? sortComparators.date_desc
  const sorted = [...filtered].sort((a, b) => {
    const primary = comparator(a, b)
    if (primary !== 0) return primary

    const fallbackDate = sortComparators.date_desc(a, b)
    if (fallbackDate !== 0) return fallbackDate

    return strField(a?.id).localeCompare(strField(b?.id))
  })

  const sortDirections = {
    date: ['date_desc', 'date_asc'],
    artist: ['artist_asc', 'artist_desc'],
    venue: ['venue_asc', 'venue_desc'],
    city: ['city_asc', 'city_desc'],
    genre: ['genre_asc', 'genre_desc'],
    rating: ['rating_desc', 'rating_asc'],
    favorites: ['favorites_first', 'favorites_last'],
    attended: ['attended_first', 'attended_last'],
    upcoming: ['upcoming_first', 'upcoming_last'],
  }

  const getSortBase = (key) => {
    if (key.startsWith('date_')) return 'date'
    if (key.startsWith('artist_')) return 'artist'
    if (key.startsWith('venue_')) return 'venue'
    if (key.startsWith('city_')) return 'city'
    if (key.startsWith('genre_')) return 'genre'
    if (key.startsWith('rating_')) return 'rating'
    if (key.startsWith('favorites_')) return 'favorites'
    if (key.startsWith('attended_')) return 'attended'
    if (key.startsWith('upcoming_')) return 'upcoming'
    return key
  }

  const getSortLabel = (key) => {
    const iconStyle = { marginLeft: '6px', verticalAlign: 'middle' }

    const map = {
      date_desc: <>Concert date <ArrowDown size={14} style={iconStyle} /></>,
      date_asc: <>Concert date <ArrowUp size={14} style={iconStyle} /></>,

      artist_asc: <>Artist <ArrowUp size={14} style={iconStyle} /></>,
      artist_desc: <>Artist <ArrowDown size={14} style={iconStyle} /></>,

      venue_asc: <>Venue <ArrowUp size={14} style={iconStyle} /></>,
      venue_desc: <>Venue <ArrowDown size={14} style={iconStyle} /></>,

      city_asc: <>City <ArrowUp size={14} style={iconStyle} /></>,
      city_desc: <>City <ArrowDown size={14} style={iconStyle} /></>,

      genre_asc: <>Genre <ArrowUp size={14} style={iconStyle} /></>,
      genre_desc: <>Genre <ArrowDown size={14} style={iconStyle} /></>,

      rating_desc: <>Rating <ArrowDown size={14} style={iconStyle} /></>,
      rating_asc: <>Rating <ArrowUp size={14} style={iconStyle} /></>,

      favorites_first: <>Favorites <ArrowUp size={14} style={iconStyle} /></>,
      favorites_last: <>Favorites <ArrowDown size={14} style={iconStyle} /></>,

      attended_first: <>Attended <ArrowUp size={14} style={iconStyle} /></>,
      attended_last: <>Attended <ArrowDown size={14} style={iconStyle} /></>,

      upcoming_first: <>Upcoming <ArrowUp size={14} style={iconStyle} /></>,
      upcoming_last: <>Upcoming <ArrowDown size={14} style={iconStyle} /></>,
    }

    return map[key] ?? <>Concert date <ArrowUpDown size={14} style={iconStyle} /></>
  }

  const onClickSort = (selectedBase) => {
    const currentBase = getSortBase(sortKey)

    let next = selectedBase

    if (sortDirections[selectedBase]) {
      const [normal, reversed] = sortDirections[selectedBase]
      next = currentBase === selectedBase && sortKey === normal ? reversed : normal
    }

    localStorage.setItem(TIMELINE_SORT_KEY, next || 'date_desc')

    const nextParams = new URLSearchParams(searchParams)
    if (next === 'date_desc') {
      nextParams.delete('sort')
    } else {
      nextParams.set('sort', next)
    }

    setSearchParams(nextParams)
  }

  if (authLoading) {
    return (
      <Container fluid style={{ padding: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '45vh',
          }}
        >
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading session…</span>
          </Spinner>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid style={{ padding: '1rem' }}>
      <Row className="align-items-start">
        <Col md={10} className="order-1 order-md-2">
          <Row style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Col xs="auto">
              <h1 style={{ fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '700', color: 'var(--setlog-primary-text)', margin: 0 }}>
                {!loginStatus.loggedIn ? 'Demo Concert Timeline' : 'My Concert Timeline'}
              </h1>
            </Col>
            <Col xs={12} md="auto" style={{ marginTop: '0.75rem' }} className="d-none d-md-block">
              {loginStatus.loggedIn ? (
                <Button
                  as={NavLink}
                  to="/add-concert"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '16px',
                    fontWeight: '700',
                  }}
                >
                  <Plus size={18} /> Log a New Show
                </Button>
              ) : (
                <Button
                  as={NavLink}
                  to="/login"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '16px',
                    fontWeight: '700',
                  }}
                >
                  Log in to add shows
                </Button>
              )}
            </Col>
          </Row>

          <div className="d-md-none" style={{ marginBottom: '1rem', width: '100%' }}>
            <Button
              type="button"
              variant="outline-primary"
              onClick={() => setShowMobileStats((prev) => !prev)}
              style={{
                width: '100%',
                fontWeight: '700',
                marginBottom: showMobileStats ? '0.75rem' : '0.75rem',
                marginTop: showMobileStats ? '0.75rem' : '0.75rem',
              }}
            >
              {showMobileStats ? 'Hide Stats' : 'Show Stats'}
            </Button>

            {showMobileStats ? (
              <div style={{ marginBottom: !loginStatus.loggedIn ? '0.75rem' : 0 }}>
                <TimelineStats compact />
              </div>
            ) : null}

            {!loginStatus.loggedIn ? (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  border: '1px solid var(--setlog-card-border)',
                  background: 'var(--setlog-card-bg)',
                }}
              >
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: 'var(--setlog-card-text)',
                    marginTop: 0,
                  }}
                >
                  Want your own timeline?
                </h2>

                <p
                  style={{
                    fontSize: '14px',
                    marginBottom: '1rem',
                    color: 'var(--setlog-card-text-secondary)',
                  }}
                >
                  Log in or register to save your own concerts.
                </p>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <Button as={NavLink} to="/login" variant="primary">
                    Log in
                  </Button>

                  <Button as={NavLink} to="/register" variant="outline-primary">
                    Register
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '0.5rem',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-primary"
                style={styles.sortToggle}
              >
                Sort: {getSortLabel(sortKey)}
              </Dropdown.Toggle>

              <Dropdown.Menu className="timeline-sort-menu" style={styles.sortMenu}>
                <Dropdown.Item style={styles.sortItem} onClick={() => onClickSort('date')}>
                  {getSortBase(sortKey) === 'date' ? getSortLabel(sortKey) : 'Concert date'}
                </Dropdown.Item>

                <Dropdown.Item style={styles.sortItem} onClick={() => onClickSort('artist')}>
                  {getSortBase(sortKey) === 'artist' ? getSortLabel(sortKey) : 'Artist'}
                </Dropdown.Item>

                <Dropdown.Item style={styles.sortItem} onClick={() => onClickSort('venue')}>
                  {getSortBase(sortKey) === 'venue' ? getSortLabel(sortKey) : 'Venue'}
                </Dropdown.Item>

                <Dropdown.Item style={styles.sortItem} onClick={() => onClickSort('city')}>
                  {getSortBase(sortKey) === 'city' ? getSortLabel(sortKey) : 'City'}
                </Dropdown.Item>

                <Dropdown.Item style={styles.sortItem} onClick={() => onClickSort('genre')}>
                  {getSortBase(sortKey) === 'genre' ? getSortLabel(sortKey) : 'Genre'}
                </Dropdown.Item>

                <Dropdown.Item style={styles.sortItem} onClick={() => onClickSort('favorites')}>
                  {getSortBase(sortKey) === 'favorites' ? getSortLabel(sortKey) : 'Favorites'}
                </Dropdown.Item>

                <Dropdown.Item style={styles.sortItem} onClick={() => onClickSort('attended')}>
                  {getSortBase(sortKey) === 'attended' ? getSortLabel(sortKey) : 'Attended'}
                </Dropdown.Item>

                <Dropdown.Item style={styles.sortItem} onClick={() => onClickSort('upcoming')}>
                  {getSortBase(sortKey) === 'upcoming' ? getSortLabel(sortKey) : 'Upcoming'}
                </Dropdown.Item>

                <Dropdown.Item style={styles.sortItem} onClick={() => onClickSort('rating')}>
                  {getSortBase(sortKey) === 'rating' ? getSortLabel(sortKey) : 'Rating'}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {hasActiveQuery ? (
            <div
              style={{
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '12px',
                color: 'var(--setlog-card-text-secondary)',
              }}
            >
              Showing {sorted.length} of {concerts.length} show{concerts.length === 1 ? '' : 's'}
            </div>
          ) : null}

          {!loginStatus.loggedIn ? (
            <>
              {sorted.length === 0 && concerts.length > 0 && hasActiveQuery ? (
                <div
                  style={{
                    maxWidth: '520px',
                    padding: '2rem',
                    borderRadius: '16px',
                    border: '1px solid var(--setlog-card-border)',
                    background: 'var(--setlog-card-bg)',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--setlog-card-text)',
                      marginTop: 0,
                    }}
                  >
                    No shows match your search
                  </h2>
                  <p style={{ marginBottom: '1rem', color: 'var(--setlog-card-text-secondary)' }}>
                    Try another artist, venue, city, genre, or song title. Use the search box above to
                    change or clear your query.
                  </p>
                  <Button as={NavLink} to="/" variant="primary">
                    Clear search
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sorted.map((concert) => (
                    <TimelineConcert key={concert.id} concert={concert} />
                  ))}
                </div>
              )}
            </>

          ) : concertsLoading && concerts.length === 0 ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading your shows…</span>
              </Spinner>
            </div>
          ) : concerts.length === 0 ? (
            <div
              style={{
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid var(--setlog-card-border)',
                background: 'var(--setlog-card-bg)',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--setlog-card-text)', marginTop: 0 }}>
                No shows yet
              </h2>
              <p style={{ marginBottom: '1rem', color: 'var(--setlog-card-text-secondary)' }}>
                Log a concert to build your timeline. Data is saved in this browser only
                (local storage).
              </p>
              <Button as={NavLink} to="/add-concert" variant="primary">
                <Plus size={18} className="me-1" />
                Log a New Show
              </Button>
            </div>
          ) : sorted.length === 0 && hasActiveQuery ? (
            <div
              style={{
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid var(--setlog-card-border)',
                background: 'var(--setlog-card-bg)',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--setlog-card-text)',
                  marginTop: 0,
                }}
              >
                No shows match your search
              </h2>
              <p style={{ marginBottom: '1rem', color: 'var(--setlog-card-text-secondary)' }}>
                Try another artist, venue, city, genre, or song title. Use the search box above to
                change or clear your query.
              </p>
              <Button as={NavLink} to="/" variant="primary">
                Clear search
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sorted.map((concert) => (
                <TimelineConcert key={concert.id} concert={concert} />
              ))}
            </div>
          )}
        </Col>
        <Col md={2} className="order-2 order-md-1" style={{ marginTop: '1rem' }}>
          <div className="d-none d-md-block" style={{ position: 'sticky', top: '1rem' }}>
            <TimelineStats />

            {!loginStatus.loggedIn ? (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '16px',
                  border: '1px solid var(--setlog-card-border)',
                  background: 'var(--setlog-card-bg)',
                  marginTop: '1rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: 'var(--setlog-card-text)',
                    marginTop: 0,
                  }}
                >
                  Want your own timeline?
                </h2>

                <p
                  style={{
                    marginBottom: '1rem',
                    color: 'var(--setlog-card-text-secondary)',
                    fontSize: '14px',
                  }}
                >
                  Log in or create an account to save your own concerts.
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button as={NavLink} to="/login" variant="primary" size="sm">
                    Log in
                  </Button>

                  <Button as={NavLink} to="/register" variant="outline-primary" size="sm">
                    Register
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default TimelinePage
