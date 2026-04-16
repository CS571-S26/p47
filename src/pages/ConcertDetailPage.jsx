import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Row, Col, Button } from 'react-bootstrap'
import { ArrowLeft, Trash, Edit, MapPin, FileText, Music, CalendarDays } from 'lucide-react'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { colors } from '../data/Colors'
import SectionCard from '../components/SectionCard'

function ConcertDetailPage() {
  const { concerts, deleteConcert } = useContext(ConcertsContext)
  const navigate = useNavigate()
  const { id } = useParams()

  const concert = concerts.find((c) => c.id === id)

  function handleDelete() {
    const ok = window.confirm(
      `Remove "${concert.artist}" (${concert.date}) from your timeline?`,
    )
    if (ok) {
      deleteConcert(concert.id)
      navigate('/')
    }
  }

  function getRatingLabel(value) {
    if (value === 5) return 'Amazing'
    if (value === 4) return 'Great'
    if (value === 3) return 'Good'
    if (value === 2) return 'Okay'
    return 'Rough'
  }


  const imageUrl = typeof concert.image === 'string' ? concert.image.trim() : ''

  const [year, month, day] = concert.date.split('-').map(Number)
  const monthLabel = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
  }).toUpperCase()
  const fullDateLabel = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const dayOfWeek = new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
  })


  const songCount = typeof setlistCount === 'number' ? setlistCount : (concert.songCount ?? 0)

  if (!concert) {
    return (
      <Card>
        <Card.Body>
          NO CONCERT TODO
        </Card.Body>
      </Card>
    )
  }

  const styles = {
    topButton: {
      fontWeight: '700',
      borderRadius: '12px',
      padding: '6px 12px',
      fontSize: '18px',
      display: 'inline-flex',
      gap: '6px',
      alignItems: 'center'
    },
    concertTags: {
      fontSize: "1.1rem",
      fontWeight: "700",
      padding: "12px 20px",
      borderRadius: "16px"
    },
    dateCard: {
      border: '1px solid lightgray',
      borderRadius: '16px',
      overflow: 'hidden',
      textAlign: 'center',
      width: '12rem',
      boxShadow: '0 4px 14px lightgray',
    },
    dateMonth: {
      background: colors.setlogPrimary,
      color: 'white',
      fontSize: '0.75rem',
      fontWeight: 800,
      padding: '4px',
      fontSize: '2rem'
    },
    dateDay: {
      fontSize: '4rem',
      fontWeight: 800,
      color: "black",
      lineHeight: 1,
      paddingTop: '10px',
    },

    dateYear: {
      fontSize: '2rem',
      color: "gray",
      padding: '6px 0 10px',
    },
  }

  return (
    <section
      id="center"
      style={{
        flex: 1,
        width: '100%',
        padding: '1.25rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '1600px',
          borderRadius: '20px',
          border: '1px solid #dbe3ea',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          padding: '0.75rem'
        }}
      >
        <Card.Body>
          { /* Top Buttons */}
          <Row style={{ marginBottom: '1rem', alignItems: 'center' }}>
            <Col>
              <Button
                variant="link"
                onClick={() => navigate('/')}
                style={{
                  padding: 0,
                  textDecoration: 'none',
                  fontWeight: 700,
                  color: '#4338ca',
                }}
              >
                <ArrowLeft size={18} style={{ marginRight: '6px' }} />
                Back to Timeline
              </Button>
            </Col>
            <Col xs="auto" style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline-primary" style={styles.topButton}>
                <Edit size={16} />
                Edit Concert
              </Button>
              <Button
                variant="outline-danger"
                style={styles.topButton}
                onClick={handleDelete}
              >
                <Trash size={16} />
                Delete
              </Button>
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={concert.artist}
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '420px',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    display: 'block',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '420px',
                    borderRadius: '16px',
                    background: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    fontWeight: 700,
                  }}
                >
                  No image
                </div>
              )}
            </Col>

            <Col lg={6}>
              <Row>
                <Col>
                  <div style={{ fontSize: "4rem", fontWeight: "700", marginBottom: "2px", }}>{concert.artist}</div>

                  { /* Location Segment */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      marginBottom: '2rem',
                    }}
                  >
                    <MapPin size={32} color={colors.setlogPrimary} style={{ marginTop: '4px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '1.7rem', fontWeight: '500', lineHeight: 1.2 }}>{concert.venue}</div>

                      <div
                        style={{
                          fontSize: '1.3rem',
                          color: '#6b7280',
                          lineHeight: 1.2,
                          marginTop: '0.5rem',
                        }}
                      >
                        {concert.city}
                      </div>
                    </div>
                  </div>

                  { /* Tags Row */}
                  <Row>
                    <Col xs="auto" style={{ gap: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ ...styles.concertTags, background: "#eef2ff", color: "#4f46e5" }}>
                        {concert.genre}
                      </span>

                      {concert.attended && (
                        <span style={{ ...styles.concertTags, background: '#dcfce7', color: '#166534' }}>
                          Attended
                        </span>
                      )}

                      {concert.favorite && (
                        <span style={{ ...styles.concertTags, background: '#fef3c7', color: '#92400e' }}>
                          Favorite
                        </span>
                      )}
                    </Col>
                  </Row>

                  { /* Stars Row */}
                  <Row>
                    <Col xs="auto">
                      <span style={{ color: "orange", fontSize: "2.5rem" }}>
                        {'★'.repeat(concert.rating)}
                        {'☆'.repeat(5 - concert.rating)}
                      </span>
                    </Col>
                    <Col
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                      }}
                    >
                      <span style={{ fontSize: "2.5rem", fontWeight: "700" }}>
                        {concert.rating}.0
                      </span>
                      <span style={{ fontSize: "1.5rem", color: "gray" }}>
                        ({getRatingLabel(concert.rating)})
                      </span>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

            <Col lg={2}>
              <div style={styles.dateCard}>
                <div style={styles.dateMonth}>{monthLabel}</div>
                <div style={styles.dateDay}>{day}</div>
                <div style={styles.dateYear}>{year}</div>
              </div>
            </Col>
          </Row>
          <div style={{ marginTop: '1.25rem' }}>
            <SectionCard>
              <Row style={{ alignItems: 'stretch' }}>
                <Col
                  md={4}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    borderRight: '1px solid #e5e7eb',
                    padding: '0 1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Music size={32} color={colors.setlogPrimary} />
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>{songCount}</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6b7280' }}>
                        SONGS
                      </div>
                    </div>
                  </div>
                </Col>

                <Col
                  md={4}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    borderRight: '1px solid #e5e7eb',
                    padding: '0 1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CalendarDays size={32} color={colors.setlogPrimary} />
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                        {dayOfWeek}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6b7280' }}>
                        {fullDateLabel}
                      </div>
                    </div>
                  </div>
                </Col>

                <Col
                  md={4}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '0 1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin size={32} color={colors.setlogPrimary} />
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>
                        {concert.coords
                          ? `${concert.coords[0]}, ${concert.coords[1]}`
                          : 'No coords'}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6b7280' }}>
                        COORDINATES
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </SectionCard>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <SectionCard
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={22} color={colors.setlogPrimary} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1f2937' }}>
                    Notes
                  </span>
                </div>
              }
            >
              <div
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '14px',
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    fontSize: '1.05rem',
                    lineHeight: 1.7,
                    fontWeight: 500,
                    color: concert.notes?.trim() ? '#1f2937' : '#6b7280',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {concert.notes?.trim() ? concert.notes : 'No notes for this concert yet.'}
                </div>
              </div>
            </SectionCard>
          </div>
        </Card.Body>
      </Card>
    </section >
  )
}

export default ConcertDetailPage

