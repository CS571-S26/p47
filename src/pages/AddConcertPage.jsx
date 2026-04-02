import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap'
import { useState } from 'react'

function AddConcertPage() {
  const [rating, setRating] = useState(5)
  const [attended, setAttended] = useState(true)
  const [favorite, setFavorite] = useState(false)

  const stars = [1, 2, 3, 4, 5]

  function getRatingLabel(value) {
    if (value === 5) return 'Amazing'
    if (value === 4) return 'Great'
    if (value === 3) return 'Good'
    if (value === 2) return 'Okay'
    return 'Rough'
  }


  const styles = {
    formControl: {
      height: "48px",
      borderRadius: "12px"
    },
    formLabel: {
      fontWeight: '600',
      marginBottom: '0.5rem',
      marginTop: '1rem',
      color: '#374151',
    }
  }

  return (
    <section
      id="center"
      style={{
        minHeight: '100%',
        padding: '2rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '760px',
          borderRadius: '20px',
          border: '1px solid #dbe3ea',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          padding: '1rem',
        }}
      >
        <Card.Body>
          <div style={{ fontSize: "48px", fontWeight: "700" }}>Log a New Concert</div>

          <Form>
            <Row>
              {/* Artist Form */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>
                    Artist/Band
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Dead & Company"
                    style={styles.formControl}
                  />
                </Form.Group>
              </Col>

              {/* Genre Form */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>
                    Music Genre
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Jam Band"
                    style={styles.formControl}
                  />
                </Form.Group>
              </Col>

              {/* Date Form */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>
                    Date
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="mm/dd/yyyy"
                    style={styles.formControl}
                  />
                </Form.Group>
              </Col>

              {/* Venue Form */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>
                    Venue
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Oracle Park"
                    style={styles.formControl}
                  />
                </Form.Group>
              </Col>

              {/* Location Form */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>
                    City, State
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., San Francisco, CA"
                    style={styles.formControl}
                  />
                </Form.Group>
              </Col>

              {/* Rating Form */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>
                    Rating
                  </Form.Label>
                  <div
                    style={{
                      height: '48px',
                      padding: "0 14px",
                      display: "flex",
                      alignItems: "center",
                      border: '1px solid #dee2e6',
                      borderRadius: '12px',
                      justifyContent: "space-between"
                    }}
                  >
                    <div
                      style={{
                        gap: "0.25rem",
                        display: "flex"
                      }}
                    >
                      {stars.map((star) => (
                        <span
                          key={star}
                          onClick={() => setRating(star)}
                          style={{
                            fontSize: "1.4rem",
                            cursor: 'pointer',
                            color: star <= rating ? '#f59e0b' : '#d1d5db',
                            lineHeight: 1,
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <span
                      style={{
                        fontWeight: '600',
                        color: '#374151',
                      }}
                    >
                      {getRatingLabel(rating)}
                    </span>
                  </div>
                </Form.Group>
              </Col>

              {/* Attended Switch */ }
              <Col md={6}>
                <div
                  style={{
                    alignItems: "center",
                    paddingTop: "1rem",
                    paddingBottom: "1rem"
                  }}
                >
                  <Form.Check
                    type="switch"
                    label="I Attended"
                    checked={attended}
                    onChange={() => setAttended(!attended)}
                    style={styles.formLabel}
                  />
                </div>
              </Col>

              {/* Favorite Switch */ }
              <Col md={6}>
                <div
                  style={{
                    alignItems: "center",
                    paddingTop: "1rem",
                    paddingBottom: "1rem"
                  }}
                >
                  <Form.Check
                    type="switch"
                    label="Add to Favorites"
                    checked={favorite}
                    onChange={() => setFavorite(!favorite)}
                    style={styles.formLabel}
                  />
                </div>
              </Col>

              <Button>
                Save Concert
              </Button>

            </Row>
          </Form>
        </Card.Body>
      </Card>
    </section >
  )
}

export default AddConcertPage
