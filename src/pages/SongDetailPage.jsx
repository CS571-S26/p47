import { useContext } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { ArrowLeft, CalendarDays, Clock, Music, Sparkles } from 'lucide-react'

import SectionCard from '../components/SectionCard.jsx'
import { ConcertsContext } from '../contexts/concertsContext.js'
import { getFlattenedSongs } from '../utils/setlistHelpers.js'
import { concertDateToDate, startOfLocalDay } from '../utils/localDate.js'

function normalizeSongIdentity(value) {
  return String(value ?? '').trim().toLowerCase()
}

function formatDate(dateValue) {
  const date = concertDateToDate(dateValue)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatDaysSince(dateValue) {
  const lastDate = startOfLocalDay(concertDateToDate(dateValue))
  const today = startOfLocalDay(new Date())
  if (!lastDate || !today) return 'Date unavailable'

  const days = Math.round((today.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000))
  if (days <= 0) return 'Today'
  return `${days.toLocaleString()} day${days === 1 ? '' : 's'} ago`
}

function SongDetailPage() {
  const { concerts } = useContext(ConcertsContext)
  const { artist: artistParam, title: titleParam } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const artist = String(artistParam ?? '').trim()
  const title = String(titleParam ?? '').trim()
  const normalizedArtist = normalizeSongIdentity(artist)
  const normalizedTitle = normalizeSongIdentity(title)
  const songPagePath = location.pathname
  const backTo = typeof location.state?.from === 'string' ? location.state.from : '/'
  const backLabel = location.state?.backLabel || 'Back to Timeline'

  const artistConcerts = concerts.filter(
    (concert) => normalizeSongIdentity(concert?.artist) === normalizedArtist,
  )
  const matchingConcerts = artistConcerts
    .filter((concert) =>
      getFlattenedSongs(concert).some((song) => normalizeSongIdentity(song) === normalizedTitle),
    )
    .sort((a, b) => concertDateToDate(b?.date).getTime() - concertDateToDate(a?.date).getTime())
  const attendedConcerts = matchingConcerts.filter((concert) => concert?.attended)
  const mostRecentAttended = attendedConcerts[0] ?? null
  const appearanceRate = artistConcerts.length > 0 ? (matchingConcerts.length / artistConcerts.length) * 100 : 0

  if (!artist || !title) {
    return (
      <section className="page-shell" style={{ padding: '1rem' }}>
        <Alert variant="warning">This song link is incomplete.</Alert>
      </section>
    )
  }

  function openConcert(concert) {
    navigate(`/concerts/${concert.id}`, {
      state: {
        from: songPagePath,
        backLabel: `Back to ${title}`,
      },
    })
  }

  return (
    <section className="page-shell" style={{ padding: '1rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <Button
          type="button"
          variant="link"
          onClick={() => navigate(backTo)}
          style={{ padding: 0, marginBottom: '1rem', fontWeight: 700, textDecoration: 'none' }}
        >
          <ArrowLeft size={18} style={{ marginRight: '0.35rem' }} aria-hidden />
          {backLabel}
        </Button>

        <SectionCard
          title={title}
          subtitle={artist}
        >
          <Row style={{ rowGap: '0.75rem' }}>
            <Col xs={12} md={4}>
              <div style={statStyle}>
                <Music size={22} color="var(--setlog-primary)" aria-hidden />
                <div>
                  <div style={statValueStyle}>{attendedConcerts.length}</div>
                  <div style={statLabelStyle}>Times seen</div>
                </div>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div style={statStyle}>
                <Sparkles size={22} color="var(--setlog-primary)" aria-hidden />
                <div>
                  <div style={statValueStyle}>{appearanceRate.toFixed(0)}%</div>
                  <div style={statLabelStyle}>Rarity: of your {artist} shows</div>
                </div>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div style={statStyle}>
                <Clock size={22} color="var(--setlog-primary)" aria-hidden />
                <div>
                  <div style={statValueStyle}>{mostRecentAttended ? formatDaysSince(mostRecentAttended.date) : 'Not seen yet'}</div>
                  <div style={statLabelStyle}>Since last time</div>
                </div>
              </div>
            </Col>
          </Row>
        </SectionCard>

        <SectionCard
          title="Concert appearances"
          subtitle={`${matchingConcerts.length} logged concert${matchingConcerts.length === 1 ? '' : 's'} with this song`}
        >
          {matchingConcerts.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {matchingConcerts.map((concert) => (
                <Button
                  key={concert.id}
                  type="button"
                  variant="outline-secondary"
                  onClick={() => openConcert(concert)}
                  style={{ textAlign: 'left', padding: '0.85rem 1rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: 'var(--setlog-card-text)', fontWeight: 800 }}>{concert.venue || 'Unknown venue'}</div>
                      <div style={{ color: 'var(--setlog-card-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                        {concert.city || 'Unknown location'}
                      </div>
                    </div>
                    <div style={{ color: 'var(--setlog-card-text-secondary)', fontSize: '0.85rem', textAlign: 'right' }}>
                      <CalendarDays size={15} style={{ marginRight: '0.3rem' }} aria-hidden />
                      {formatDate(concert.date)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <Alert variant="secondary" style={{ marginBottom: 0 }}>No logged concerts contain this song.</Alert>
          )}
        </SectionCard>
      </div>
    </section>
  )
}

const statStyle = {
  alignItems: 'center',
  background: 'var(--setlog-card-bg-secondary)',
  border: '1px solid var(--setlog-card-border)',
  borderRadius: '12px',
  display: 'flex',
  gap: '0.65rem',
  height: '100%',
  padding: '0.85rem',
}

const statValueStyle = {
  color: 'var(--setlog-card-text)',
  fontSize: '1.05rem',
  fontWeight: 800,
}

const statLabelStyle = {
  color: 'var(--setlog-card-text-secondary)',
  fontSize: '0.78rem',
  fontWeight: 700,
  marginTop: '0.1rem',
  textTransform: 'uppercase',
}

export default SongDetailPage
