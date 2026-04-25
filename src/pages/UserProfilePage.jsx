import { useContext, useEffect, useState } from 'react'
import { Calendar, Heart, MapPin, Music, Music2, Star, Users, LogOut } from 'lucide-react'
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { useNavigate, Link } from 'react-router-dom'

import SectionCard from '../components/SectionCard'
import { useAuth } from '../contexts/authContext.js'
import { ConcertsContext } from '../contexts/concertsContext.js'
import { useSpotify } from '../contexts/spotifyContext.js'
import { useUserProfile } from '../contexts/userProfileContext.js'
import { parseConcertCalendarDate } from '../utils/concertForm.js'
import { getFlattenedSongs } from '../utils/setlistHelpers.js'
import {
  geocodePlace,
  HOMETOWN_GEOCODE_FAILED_MESSAGE,
} from '../utils/geocode.js'

function normalizeString(v) {
  return typeof v === 'string' ? v.trim() : ''
}

function createInitials(label) {
  const clean = normalizeString(label)
  if (!clean) return '?'
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function statCard(icon, label, value, helpText = '') {
  return { icon, label, value, helpText }
}

function UserProfilePage() {
  const { loginStatus, logout, user } = useAuth()
  const { profile, setAvatarUrlOverride, clearAvatarUrlOverride, setHometown, clearHometown } =
    useUserProfile()
  const { concerts } = useContext(ConcertsContext)
  const {
    session,
    loading,
    authenticating,
    error,
    configError,
    isConfigured,
    isConnected,
    connect,
    disconnect,
    clearError,
  } = useSpotify()
  const [avatarDraft, setAvatarDraft] = useState('')
  const [avatarOverride, setAvatarOverride] = useState('')
  const [hometownDraft, setHometownDraft] = useState('')
  const [hometownSaving, setHometownSaving] = useState(false)
  const [hometownError, setHometownError] = useState('')
  const navigate = useNavigate()

  const iconSize = window.innerWidth < 768 ? 22 : 28

  function handleLogout() {
    logout()
    navigate('/')
  }

  useEffect(() => {
    if (!user?.uid) {
      setAvatarOverride('')
      setAvatarDraft('')
      setHometownDraft('')
      setHometownError('')
      return
    }
  }, [user?.uid])

  useEffect(() => {
    const saved = normalizeString(profile?.avatarUrlOverride)
    setAvatarOverride(saved)
    setAvatarDraft(saved)
  }, [profile?.avatarUrlOverride])

  useEffect(() => {
    const label = normalizeString(profile?.hometown?.label)
    setHometownDraft(label)
  }, [profile?.hometown])

  const stats = (() => {
    const totalShows = concerts?.length ?? 0
    const attendedShows = (concerts ?? []).filter((c) => c?.attended).length
    const favorites = (concerts ?? []).filter((c) => c?.favorite).length

    const artistSet = new Set(
      (concerts ?? [])
        .map((c) => normalizeString(c?.artist).toLowerCase())
        .filter(Boolean),
    )

    const citySet = new Set(
      (concerts ?? [])
        .map((c) => normalizeString(c?.city).toLowerCase())
        .filter(Boolean),
    )

    const ratingValues = (concerts ?? [])
      .map((c) => Number(c?.rating))
      .filter((value) => Number.isFinite(value) && value > 0)

    const avgRating = ratingValues.length
      ? Math.round((ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length) * 10) / 10
      : 'n/a'

    const songTotal = (concerts ?? []).reduce((sum, c) => {
      const flat = getFlattenedSongs(c)
      const fallbackCount = Number.isFinite(Number(c?.songCount)) ? Number(c.songCount) : 0
      const count = flat.length > 0 ? flat.length : fallbackCount
      return sum + (count > 0 ? count : 0)
    }, 0)

    const validDates = (concerts ?? [])
      .map((c) => parseConcertCalendarDate(c?.date))
      .filter(Boolean)
      .sort((a, b) => a.getTime() - b.getTime())

    const firstShowDate = validDates[0] ?? null
    const latestShowDate = validDates[validDates.length - 1] ?? null

    return {
      totalShows,
      attendedShows,
      favorites,
      uniqueArtists: artistSet.size,
      uniqueCities: citySet.size,
      avgRating,
      songTotal,
      firstShowDate,
      latestShowDate,
    }
  })()

  if (!loginStatus.loggedIn) {
    return (
      <section className="page-shell">
        <div>
          <h1 style={{ color: 'var(--setlog-primary-text)' }}>User Profile</h1>
          <p style={{ color: 'var(--setlog-secondary-text)' }}>You are not logged in.</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button as={Link} to="/login" variant="primary">
              Log in
            </Button>
            <Button as={Link} to="/register" variant="outline-secondary">
              Create account
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const label = loginStatus.username ?? 'User'
  const initials = createInitials(label)
  const photoFromAuth = normalizeString(user?.photoURL)
  const avatarUrl = avatarOverride || photoFromAuth

  const statCards = [
    statCard(<Calendar size={18} color="var(--setlog-card-text)" aria-hidden />, 'Shows Logged', stats.totalShows),
    statCard(<Users size={18} color="var(--setlog-card-text)" aria-hidden />, 'Artists Tracked', stats.uniqueArtists),
    statCard(<MapPin size={18} color="var(--setlog-card-text)" aria-hidden />, 'Cities', stats.uniqueCities),
    statCard(<Heart size={18} color="var(--setlog-card-text)" aria-hidden />, 'Favorites', stats.favorites),
    statCard(<Music size={18} color="var(--setlog-card-text)" aria-hidden />, 'Songs Logged', stats.songTotal),
    statCard(<Star size={18} color="var(--setlog-card-text)" aria-hidden />, 'Avg Rating', stats.avgRating),
  ]

  const joinedText = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : 'Unknown'

  const firstShowText = stats.firstShowDate ? stats.firstShowDate.toLocaleDateString() : 'No shows yet'
  const latestShowText = stats.latestShowDate ? stats.latestShowDate.toLocaleDateString() : 'No shows yet'

  function handleSaveAvatar(event) {
    event.preventDefault()

    const clean = normalizeString(avatarDraft)
    if (!clean) return

    setAvatarUrlOverride(clean)
  }

  function handleClearAvatar() {
    clearAvatarUrlOverride()
  }

  async function handleSaveHometown(event) {
    event.preventDefault()

    const clean = normalizeString(hometownDraft)
    if (!clean) return

    setHometownSaving(true)
    setHometownError('')
    const coords = await geocodePlace(clean)
    setHometownSaving(false)

    if (!coords) {
      setHometownError(HOMETOWN_GEOCODE_FAILED_MESSAGE)
      return
    }

    await setHometown({ label: clean, coords })
  }

  function handleClearHometown() {
    setHometownDraft('')
    setHometownError('')
    clearHometown()
  }

  async function handleSpotifyConnect() {
    clearError()
    await connect({ returnTo: '/user-profile' })
  }

  return (
    <section style={{ padding: '1rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <SectionCard>
          <Row style={{ alignItems: 'center', rowGap: '16px' }}>
            <Col xs="auto">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${label} avatar`}
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '999px',
                    objectFit: 'cover',
                    border: '2px solid var(--setlog-card-border)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '999px',
                    border: '2px solid var(--setlog-card-border)',
                    background: 'var(--setlog-card-bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--setlog-primary)',
                  }}
                >
                  {initials}
                </div>
              )}
            </Col>
            <Col>
              <h1 style={{ margin: 0, color: 'var(--setlog-primary-text)' }}>User Profile</h1>
              <p style={{ margin: '6px 0 0', color: 'var(--setlog-primary-text)' }}>
                Signed in as <strong>{label}</strong>
              </p>
              <p style={{ margin: '6px 0 0', color: 'var(--setlog-secondary-text)' }}>
                Member since {joinedText}
              </p>

              <Button
                variant="outline-danger"
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  marginTop: '1rem'
                }}
              >
                <LogOut size={iconSize} aria-hidden />
                <span>Log out</span>
              </Button>
            </Col>
          </Row>
        </SectionCard>

        <SectionCard
          title="SetLog Statistics"
          subtitle="Your concert activity at a glance"
        >
          <Row>
            {statCards.map((card) => (
              <Col key={card.label} sm={6} lg={4} style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    border: '1px solid var(--setlog-card-border)',
                    background: 'var(--setlog-card-bg-secondary)',
                    borderRadius: '12px',
                    padding: '12px',
                    height: '100%',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {card.icon}
                    <span style={{ color: 'var(--setlog-card-text-secondary)', fontSize: '14px' }}>
                      {card.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--setlog-card-text)' }}>
                    {card.value}
                  </div>
                  {card.helpText ? (
                    <small style={{ color: 'var(--setlog-card-text-secondary)' }}>{card.helpText}</small>
                  ) : null}
                </div>
              </Col>
            ))}
          </Row>
        </SectionCard>

        <Row style={{ rowGap: '16px' }}>
          <Col md={12}>
            <SectionCard
              title="Timeline Highlights"
              subtitle="Key moments from your concert timeline"
            >
              <p style={{ marginBottom: '8px', color: 'var(--setlog-card-text-secondary)' }}>
                First logged show: <strong style={{ color: 'var(--setlog-card-text)' }}>{firstShowText}</strong>
              </p>
              <p style={{ marginBottom: '8px', color: 'var(--setlog-card-text-secondary)' }}>
                Most recent show:{' '}
                <strong style={{ color: 'var(--setlog-card-text)' }}>{latestShowText}</strong>
              </p>
              <p style={{ marginBottom: 0, color: 'var(--setlog-card-text-secondary)' }}>
                Attendance ratio:{' '}
                <strong style={{ color: 'var(--setlog-card-text)' }}>
                  {stats.totalShows > 0
                    ? `${Math.round((stats.attendedShows / stats.totalShows) * 100)}% attended`
                    : 'No shows yet'}
                </strong>
              </p>
            </SectionCard>
          </Col>
        </Row>

        <SectionCard
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Music2 size={18} color="var(--setlog-primary)" />
              <span>Spotify Integration</span>
            </div>
          }
          subtitle="Connect Spotify so you can turn saved setlists into playlists."
        >
          {error ? (
            <Alert variant={configError ? 'warning' : 'danger'} style={{ marginBottom: '1rem' }}>
              {error}
            </Alert>
          ) : null}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--setlog-card-text)',
                  marginBottom: '0.35rem',
                }}
              >
                {isConnected ? 'Spotify connected' : 'Spotify not connected'}
              </div>
              <div style={{ color: 'var(--setlog-card-text-secondary)', fontSize: '0.95rem' }}>
                {isConnected
                  ? `Playlist scope ready: ${session?.scope || 'playlist-modify-private'}`
                  : isConfigured
                    ? 'Authorize your Spotify account to create private playlists from your setlists.'
                    : 'Add the Spotify environment variables before connecting this app.'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button
                variant="success"
                onClick={handleSpotifyConnect}
                disabled={loading || authenticating || !isConfigured}
                style={{ fontWeight: 700 }}
              >
                {authenticating ? (
                  <>
                    <Spinner animation="border" size="sm" style={{ marginRight: '0.45rem' }} />
                    Connecting...
                  </>
                ) : isConnected ? (
                  'Reconnect Spotify'
                ) : (
                  'Connect Spotify'
                )}
              </Button>

              <Button
                variant="outline-secondary"
                onClick={disconnect}
                disabled={!isConnected || loading || authenticating}
                style={{ fontWeight: 700 }}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </SectionCard>

        <Row style={{ alignItems: 'stretch', rowGap: '16px' }}>
          <Col md={6} style={{ display: 'flex' }}>
            <div style={{ width: '100%', display: 'flex' }}>
              <SectionCard
                title="Hometown"
                subtitle="Shows as a home pin on your concert map after the place is found"
              >
                {hometownError ? (
                  <Alert variant="warning" style={{ marginBottom: '0.75rem' }}>
                    {hometownError}
                  </Alert>
                ) : null}
                <Form onSubmit={handleSaveHometown}>
                  <Form.Group style={{ marginBottom: '8px' }}>
                    <Form.Control
                      type="text"
                      placeholder="City, state, or country"
                      value={hometownDraft}
                      onChange={(event) => {
                        setHometownDraft(event.target.value)
                        if (hometownError) setHometownError('')
                      }}
                      disabled={hometownSaving}
                    />
                  </Form.Group>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button type="submit" variant="primary" disabled={hometownSaving}>
                      {hometownSaving ? (
                        <>
                          <Spinner animation="border" size="sm" style={{ marginRight: '0.45rem' }} />
                          Looking up…
                        </>
                      ) : (
                        'Save hometown'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={handleClearHometown}
                      disabled={hometownSaving}
                    >
                      Clear hometown
                    </Button>
                  </div>
                </Form>
              </SectionCard>
            </div>
          </Col>

          <Col md={6} style={{ display: 'flex' }}>
            <div style={{ width: '100%', display: 'flex' }}>
              <SectionCard
                title="Profile Picture"
                subtitle="Add a custom avatar URL for this device"
              >
                <Form onSubmit={handleSaveAvatar}>
                  <Form.Group style={{ marginBottom: '8px' }}>
                    <Form.Control
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatarDraft}
                      onChange={(event) => setAvatarDraft(event.target.value)}
                    />
                  </Form.Group>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button type="submit" variant="primary">
                      Save avatar
                    </Button>
                    <Button type="button" variant="outline-secondary" onClick={handleClearAvatar}>
                      Reset avatar
                    </Button>
                  </div>
                </Form>
              </SectionCard>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  )
}

export default UserProfilePage