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
      <Card>
        <Card.Body>
          NO CONCERT TODO
        </Card.Body>
      </Card>
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
      borderRadius: '10px',
      padding: '5px 10px',
      fontSize: '15px',
      display: 'inline-flex',
      gap: '5px',
      alignItems: 'center'
    },
    concertTags: {
      fontSize: "0.95rem",
      fontWeight: "700",
      padding: "9px 15px",
      borderRadius: "14px"
    },
    dateCard: {
      border: '1px solid lightgray',
      borderRadius: '14px',
      overflow: 'hidden',
      textAlign: 'center',
      width: '10rem',
      boxShadow: '0 4px 14px lightgray',
    },
    dateMonth: {
      background: colors.setlogPrimary,
      color: 'white',
      fontWeight: 800,
      padding: '4px',
      fontSize: '1.5rem'
    },
    dateDay: {
      fontSize: '3rem',
      fontWeight: 800,
      color: "black",
      lineHeight: 1,
      paddingTop: '8px',
    },

    dateYear: {
      fontSize: '1.5rem',
      color: "gray",
      padding: '5px 0 8px',
    },
    infoLabel: {
      fontSize: '1rem',
      fontWeight: 700,
      color: '#6b7280',
      marginBottom: '2px',
    },
    infoValue: {
      fontSize: '1.05rem',
      color: '#1f2937',
      marginBottom: '12px',
      lineHeight: 1.25,
    }
  }

  return (
    <section
      id="center"
      style={{
        flex: 1,
        width: '100%',
        padding: '1rem 0.85rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '1400px',
          borderRadius: '18px',
          border: '1px solid #dbe3ea',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          padding: '0.5rem'
        }}
      >
        <Card.Body>
          { /* Top Buttons */}
          <Row style={{ marginBottom: '0.85rem', alignItems: 'center' }}>
            <Col>
              <Button
                variant="link"
                onClick={() => navigate('/')}
                style={{
                  padding: 0,
                  textDecoration: 'none',
                  fontWeight: 700,
                  color: '#4338ca',
                  fontSize: '0.95rem',
                }}
              >
                <ArrowLeft size={16} style={{ marginRight: '5px' }} />
                Back to Timeline
              </Button>
            </Col>
            <Col xs="auto" style={{ display: 'flex', gap: '10px' }}>
              <Button variant="outline-primary" style={styles.topButton}>
                <Edit size={14} />
                Edit Concert
              </Button>
              <Button
                variant="outline-danger"
                style={styles.topButton}
                onClick={handleDelete}
              >
                <Trash size={14} />
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
                    maxWidth: '420px',
                    height: '340px',
                    objectFit: 'cover',
                    borderRadius: '14px',
                    display: 'block',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    maxWidth: '420px',
                    height: '340px',
                    borderRadius: '14px',
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
                  <div style={{ fontSize: "3rem", fontWeight: "700", marginBottom: "2px", }}>{concert.artist}</div>

                  { /* Location Segment */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <MapPin size={26} color={colors.setlogPrimary} style={{ marginTop: '3px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '1.35rem', fontWeight: '500', lineHeight: 1.2 }}>{concert.venue}</div>

                      <div
                        style={{
                          fontSize: '1.05rem',
                          color: '#6b7280',
                          lineHeight: 1.2,
                          marginTop: '0.35rem',
                        }}
                      >
                        {concert.city}
                      </div>
                    </div>
                  </div>

                  { /* Tags Row */}
                  <Row>
                    <Col xs="auto" style={{ gap: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
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
                      <span style={{ color: "orange", fontSize: "2rem" }}>
                        {'★'.repeat(concert.rating)}
                        {'☆'.repeat(5 - concert.rating)}
                      </span>
                    </Col>
                    <Col
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '18px',
                      }}
                    >
                      <span style={{ fontSize: "2rem", fontWeight: "700" }}>
                        {concert.rating}.0
                      </span>
                      <span style={{ fontSize: "1.2rem", color: "gray" }}>
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
          <div style={{ marginTop: '1rem' }}>
            <SectionCard>
              <Row style={{ alignItems: 'stretch' }}>
                <Col
                  md={4}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    borderRight: '1px solid #e5e7eb',
                    padding: '0 1.1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Music size={26} color={colors.setlogPrimary} />
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{concert.songCount}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6b7280' }}>
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
                    padding: '0 1.1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CalendarDays size={26} color={colors.setlogPrimary} />
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                        {dayOfWeek}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6b7280' }}>
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
                    padding: '0 1.1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={26} color={colors.setlogPrimary} />
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>
                        {concert.coords
                          ? `${concert.coords[0]}, ${concert.coords[1]}`
                          : 'No coords'}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6b7280' }}>
                        COORDINATES
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </SectionCard>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <SectionCard
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color={colors.setlogPrimary} />
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937' }}>
                    NOTES
                  </span>
                </div>
              }
            >
              <div
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              >
                <div
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
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

          <Row>
            <Col lg={8}>
              <div style={{ marginTop: '1rem' }}>
                <SectionCard
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <ListMusic size={18} color={colors.setlogPrimary} />
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937' }}>
                        SETLIST
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginLeft: 'auto' }}>
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
                            padding: '10px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontSize: '0.95rem',
                          }}
                        >
                          <span
                            style={{
                              width: '24px',
                              color: '#6b7280',
                              fontWeight: 700,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span style={{ color: '#1f2937' }}>{song}</span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div style={{ color: '#6b7280' }}>No setlist available.</div>
                  )}
                </SectionCard>
              </div>
            </Col>
            <Col lg={4}>
              <div style={{ marginTop: '1rem' }}>
                <SectionCard
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info size={18} color={colors.setlogPrimary} />
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.1rem' }}>
                    <div style={styles.infoLabel}>Attendance</div>
                    <div style={styles.infoValue}>
                      {concert.attended ? (
                        <span style={{ ...styles.concertTags, background: '#dcfce7', color: '#166534' }}>
                          Attended
                        </span>
                      ) : (
                        <span style={{ ...styles.concertTags, background: '#fcdcdc', color: '#651616' }}>
                          Not Attended
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={styles.infoLabel}>Favorite</div>
                    <div style={styles.infoValue}>
                      {concert.favorite ? (
                        <span style={{ ...styles.concertTags, background: '#fef3c7', color: '#92400e' }}>
                          Yes
                        </span>
                      ) : (
                        <span style={{ ...styles.concertTags, background: '#fef3c7', color: '#92400e' }}>
                          No
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '10px',
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
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          color: 'orange',
                          fontSize: '1rem',
                          lineHeight: 1,
                          letterSpacing: '1px',
                        }}
                      >
                        {'★'.repeat(concert.rating)}
                        {'☆'.repeat(5 - concert.rating)}
                      </span>

                      <span
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          color: '#111827',
                          lineHeight: 1.8,
                        }}
                      >
                        {concert.rating}.0
                      </span>

                      <span
                        style={{
                          fontSize: '1rem',
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