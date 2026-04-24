import { useContext, useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Calendar, Heart, MapPin, Music, Star, Users, LogOut } from 'lucide-react'

import SectionCard from '../components/SectionCard'
import { useAuth } from '../contexts/authContext.js'
import { ConcertsContext } from '../contexts/concertsContext.js'

const AVATAR_STORAGE_PREFIX = 'p47:profileAvatar:'

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

function safeDate(value) {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function statCard(icon, label, value, helpText = '') {
  return { icon, label, value, helpText }
}

function UserProfilePage() {
  const { loginStatus, logout, user } = useAuth()
  const { concerts } = useContext(ConcertsContext)
  const [avatarDraft, setAvatarDraft] = useState('')
  const [avatarOverride, setAvatarOverride] = useState('')
  const navigate = useNavigate()

  const iconSize = window.innerWidth < 768 ? 22 : 28

  function handleLogout() {
    logout()
    navigate('/')
  }

  useEffect(() => {
    const uid = user?.uid
    if (!uid) {
      setAvatarOverride('')
      setAvatarDraft('')
      return
    }

    const saved = normalizeString(localStorage.getItem(`${AVATAR_STORAGE_PREFIX}${uid}`))
    setAvatarOverride(saved)
    setAvatarDraft(saved)
  }, [user?.uid])

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
      const setlistCount = Array.isArray(c?.setlist) ? c.setlist.length : 0
      const fallbackCount = Number.isFinite(Number(c?.songCount)) ? Number(c.songCount) : 0
      const count = setlistCount > 0 ? setlistCount : fallbackCount
      return sum + (count > 0 ? count : 0)
    }, 0)

    const validDates = (concerts ?? [])
      .map((c) => safeDate(c?.date))
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
  const avatarStorageKey = user?.uid ? `${AVATAR_STORAGE_PREFIX}${user.uid}` : ''
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
    if (!avatarStorageKey) return

    const clean = normalizeString(avatarDraft)
    if (!clean) return

    localStorage.setItem(avatarStorageKey, clean)
    setAvatarOverride(clean)
    setAvatarDraft(clean)
    window.dispatchEvent(new Event('avatarUpdated'))
  }

  function handleClearAvatar() {
    if (!avatarStorageKey) return
    localStorage.removeItem(avatarStorageKey)
    setAvatarOverride('')
    setAvatarDraft('')
    window.dispatchEvent(new Event('avatarUpdated'))
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
          <Col md={6}>
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

          <Col md={6}>
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
          </Col>
        </Row>
      </div>
    </section>
  )
}

export default UserProfilePage