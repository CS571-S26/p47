import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Row, Col, Button } from 'react-bootstrap'
import { ArrowLeft, Trash, Edit, MapPin } from 'lucide-react'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { colors } from '../data/Colors'

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
      fontSize: "24px",
      fontWeight: "700",
      padding: "12px 40px",
      borderRadius: "16px"
    }
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
          padding: '0.75rem',
        }}
      >
        <Card.Body>
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

            <Col lg={8}>
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

                  <Row>
                    <Col xs="auto">
                      <span style={{ color: "orange", fontSize: "3.5rem" }}>
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
                      <span style={{ fontSize: "3.5rem", fontWeight: "700" }}>
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
          </Row>
        </Card.Body>
      </Card>
    </section>
  )
}

export default ConcertDetailPage

