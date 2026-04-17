import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Row, Col, Button, ListGroup } from 'react-bootstrap'
import { ArrowLeft, Trash, Edit, MapPin, FileText, Music, CalendarDays, ListMusic, Info } from 'lucide-react'

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

  if (!concert) {
    return (
      <section
        id="center"
        style={{
          flex: 1,
          width: '100%',
          padding: '0.85rem 0.75rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Card
          style={{
            width: '100%',
            maxWidth: '1280px',
            borderRadius: '16px',
            border: '1px solid #dbe3ea',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            padding: '0.35rem',
          }}
        >
          <Card.Body
            style={{
              minHeight: '420px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              Concert not found
            </div>

            <div
              style={{
                fontSize: '1rem',
                color: '#6b7280',
                marginBottom: '1.25rem',
              }}
            >
              This concert doesn’t exist or may have been deleted.
            </div>

            <Button
              variant="primary"
              onClick={() => navigate('/')}
              style={{
                fontWeight: 700,
                borderRadius: '10px',
                padding: '8px 14px',
              }}
            >
              Back to Timeline
            </Button>
          </Card.Body>
        </Card>
      </section>
    )
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

  const styles = {
    topButton: {
      fontWeight: '700',
      borderRadius: '9px',
      padding: '4px 9px',
      fontSize: '14px',
      display: 'inline-flex',
      gap: '5px',
      alignItems: 'center'
    },
    concertTags: {
      fontSize: '0.85rem',
      fontWeight: '700',
      padding: '7px 12px',
      borderRadius: '12px'
    },
    dateCard: {
      border: '1px solid var(--setlog-card-border)',
      background: 'var(--setlog-card-bg-secondary)',
      borderRadius: '12px',
      overflow: 'hidden',
      textAlign: 'center',
      width: '8.75rem',
      boxShadow: '0 4px 14px var(--setlog-card-bg)',
    },
    dateMonth: {
      background: 'var(--setlog-primary)',
      color: 'white',
      fontWeight: 800,
      padding: '3px',
      fontSize: '1.25rem'
    },
    dateDay: {
      fontSize: '2.5rem',
      fontWeight: 800,
      lineHeight: 1,
      paddingTop: '6px',
      color: "var(--setlog-card-text)",
    },

    dateYear: {
      fontSize: '1.25rem',
      color: "var(--setlog-card-text-secondary)",
      padding: '4px 0 6px',
    },
    infoLabel: {
      fontSize: '0.9rem',
      fontWeight: 700,
      color: 'var(--setlog-card-text-secondary)',
      marginBottom: '2px',
    },
    infoValue: {
      fontSize: '0.95rem',
      color: 'var(--setlog-card-text)',
      marginBottom: '10px',
      lineHeight: 1.25,
    }
  }

  return (
    <section
      id="center"
      style={{
        flex: 1,
        width: '100%',
        padding: '0.85rem 0.75rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '1280px',
          borderRadius: '16px',
          border: '1px solid var(--setlog-card-border)',
          boxShadow: '0 4px 14px var(--setlog-card-bg)',
          padding: '0.35rem',
          background: 'var(--setlog-card-bg)',
        }}
      >
        <Card.Body>
          { /* Top Buttons */}
          <Row style={{ marginBottom: '0.7rem', alignItems: 'center' }}>
            <Col>
              <Button
                variant="link"
                onClick={() => navigate('/')}
                style={{
                  padding: 0,
                  textDecoration: 'none',
                  fontWeight: 700,
                  color: '#4338ca',
                  fontSize: '0.9rem',
                }}
              >
                <ArrowLeft size={14} style={{ marginRight: '5px' }} />
                Back to Timeline
              </Button>
            </Col>
            <Col xs="auto" style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline-primary" style={styles.topButton}>
                <Edit size={13} />
                Edit Concert
              </Button>
              <Button
                variant="outline-danger"
                style={styles.topButton}
                onClick={handleDelete}
              >
                <Trash size={13} />
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
                    maxWidth: '360px',
                    height: '290px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    display: 'block',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '360px',
                    height: '290px',
                    borderRadius: '12px',
                    background: "var(--setlog-card-bg-secondary)",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--setlog-card-border)',
                    color: "var(--setlog-card-text-secondary)",
                    fontSize: "13px",
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
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2px', color: 'var(--setlog-card-text)' }}>{concert.artist}</div>

                  { /* Location Segment */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '7px',
                      marginBottom: '1.1rem',
                    }}
                  >
                    <MapPin size={22} color='var(--setlog-primary)' style={{ marginTop: '3px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '500', lineHeight: 1.2, color: 'var(--setlog-card-text)' }}>{concert.venue}</div>

                      <div
                        style={{
                          fontSize: '0.95rem',
                          color: 'var(--setlog-card-text-secondary)',
                          lineHeight: 1.2,
                          marginTop: '0.25rem',
                        }}
                      >
                        {concert.city}
                      </div>
                    </div>
                  </div>

                  { /* Tags Row */}
                  <Row>
                    <Col xs="auto" style={{ gap: '12px', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ ...styles.concertTags, background: "var(--tag-genre-bg)", color: "var(--tag-genre-text)" }}>
                        {concert.genre}
                      </span>

                      {concert.attended && (
                        <span style={{ ...styles.concertTags, background: "var(--tag-attended-bg)", color: "var(--tag-attended-text)" }}>
                          Attended
                        </span>
                      )}

                      {concert.favorite && (
                        <span style={{ ...styles.concertTags, background: "var(--tag-favorite-bg)", color: "var(--tag-favorite-text)" }}>
                          Favorite
                        </span>
                      )}
                    </Col>
                  </Row>

                  { /* Stars Row */}
                  <Row>
                    <Col xs="auto">
                      <span style={{ color: 'orange', fontSize: '1.55rem' }}>
                        {'★'.repeat(concert.rating)}
                        {'☆'.repeat(5 - concert.rating)}
                      </span>
                    </Col>
                    <Col
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <span style={{ fontSize: '1.55rem', fontWeight: '700', color: "var(--setlog-card-text)" }}>
                        {concert.rating}.0
                      </span>
                      <span style={{ fontSize: '1rem', color: "var(--setlog-card-text-secondary)" }}>
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
          <div style={{ marginTop: '0.85rem' }}>
            <SectionCard>
              <Row style={{ alignItems: 'stretch' }}>
                <Col
                  md={4}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    borderRight: '1px solid var(--setlog-card-border)',
                    padding: '0 0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Music size={22} color='var(--setlog-primary)' />
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--setlog-card-text)' }}>{concert.songCount}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--setlog-card-text-secondary)' }}>
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
                    borderRight: '1px solid var(--setlog-card-border)',
                    padding: '0 0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarDays size={22} color='var(--setlog-primary)' />
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--setlog-card-text)' }}>
                        {dayOfWeek}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--setlog-card-text-secondary)' }}>
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
                    padding: '0 0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={22} color='var(--setlog-primary)' />
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--setlog-card-text)' }}>
                        {concert.coords
                          ? `${concert.coords[0]}, ${concert.coords[1]}`
                          : 'No coords'}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--setlog-card-text-secondary)' }}>
                        COORDINATES
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </SectionCard>
          </div>

          <div style={{ marginTop: '0.85rem' }}>
            <SectionCard
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <FileText size={16} color={colors.setlogPrimary} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--setlog-card-text)' }}>
                    NOTES
                  </span>
                </div>
              }
            >
              <div
                style={{
                  background: "var(--setlog-card-bg-secondary)",
                  border: '1px solid var(--setlog-card-border)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    fontWeight: 500,
                    color: concert.notes?.trim() ? '#var(--setlog-card-text)' : 'var(--setlog-card-text-secondary)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {concert.notes?.trim() ? concert.notes : 'No notes for this concert yet.'}
                </div>
              </div>
            </SectionCard>
          </div>

          <Row>
            <Col lg={8}>
              <div style={{ marginTop: '0.85rem' }}>
                <SectionCard
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%' }}>
                      <ListMusic size={16} color='var(--setlog-primary)' />
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--setlog-card-text)' }}>
                        SETLIST
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--setlog-card-text-secondary)', marginLeft: 'auto' }}>
                        {concert.songCount} songs
                      </span>
                    </div>
                  }
                >
                  {Array.isArray(concert.setlist) && concert.setlist.length > 0 ? (
                    <ListGroup variant="flush">
                      {concert.setlist.map((song, idx) => (
                        <ListGroup.Item
                          key={`${song}-${idx}`}
                          style={{
                            padding: '8px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'var(--setlog-card-bg-secondary)',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span
                            style={{
                              width: '22px',
                              color: 'var(--setlog-card-text-secondary)',
                              fontWeight: 700,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span style={{ color: 'var(--setlog-card-text)' }}>{song}</span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div style={{ color: 'var(--setlog-card-text-secondary' }}>No setlist available.</div>
                  )}
                </SectionCard>
              </div>
            </Col>
            <Col lg={4}>
              <div style={{ marginTop: '0.85rem' }}>
                <SectionCard
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Info size={16} color='var(--setlog-primary)' />
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--setlog-card-text)' }}>
                        AT A GLANCE
                      </span>
                    </div>
                  }
                >
                  <div style={styles.infoLabel}>Artist</div>
                  <div style={styles.infoValue}>{concert.artist}</div>

                  <div style={styles.infoLabel}>Venue</div>
                  <div style={styles.infoValue}>{concert.venue}</div>

                  <div style={styles.infoLabel}>City, State</div>
                  <div style={styles.infoValue}>{concert.city}</div>

                  <div style={styles.infoLabel}>Genre</div>
                  <div style={styles.infoValue}>{concert.genre}</div>

                  <div style={styles.infoLabel}>Date</div>
                  <div style={styles.infoValue}>{fullDateLabel}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', marginBottom: '0.9rem' }}>
                    <div style={styles.infoLabel}>Attendance</div>
                    <div style={styles.infoValue}>
                      {concert.attended ? (
                        <span style={{ ...styles.concertTags, background: "var(--tag-attended-bg)", color: "var(--tag-attended-text)" }}>
                          Attended
                        </span>
                      ) : (
                        <span style={{ ...styles.concertTags, background: "var(--tag-not-attended-bg)", color: "var(--tag-not-attended-text)" }}>
                          Not Attended
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
                    <div style={styles.infoLabel}>Favorite</div>
                    <div style={styles.infoValue}>
                      {concert.favorite ? (
                        <span style={{ ...styles.concertTags, background: "var(--tag-favorite-bg)", color: "var(--tag-favorite-text)" }}>
                          Yes
                        </span>
                      ) : (
                        <span style={{ ...styles.concertTags, background: "var(--tag-favorite-bg)", color: "var(--tag-favorite-text)" }}>
                          No
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        ...styles.infoLabel,
                        marginBottom: 0,
                        lineHeight: 1,
                      }}
                    >
                      Rating
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          color: 'orange',
                          fontSize: '0.9rem',
                          lineHeight: 1,
                          letterSpacing: '1px',
                        }}
                      >
                        {'★'.repeat(concert.rating)}
                        {'☆'.repeat(5 - concert.rating)}
                      </span>

                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: '#111827',
                          lineHeight: 1.6,
                        }}
                      >
                        {concert.rating}.0
                      </span>

                      <span
                        style={{
                          fontSize: '0.9rem',
                          color: '#6b7280',
                          lineHeight: 1,
                        }}
                      >
                        ({getRatingLabel(concert.rating)})
                      </span>
                    </div>
                  </div>
                </SectionCard>
              </div>
            </Col>
          </Row>

        </Card.Body>
      </Card>
    </section >
  )
}

export default ConcertDetailPage