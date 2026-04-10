import { useContext, useState } from 'react'
import { Row, Col, Button, Card, Form, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { geocodeVenue } from '../utils/geocode.js'

function newConcertId() {
  return `c-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function AddConcertPage() {
  const { addConcert } = useContext(ConcertsContext)
  const navigate = useNavigate()

  const [artist, setArtist] = useState('')
  const [genre, setGenre] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [city, setCity] = useState('')
  const [rating, setRating] = useState(5)
  const [attended, setAttended] = useState(true)
  const [favorite, setFavorite] = useState(false)
  const [image, setImage] = useState('')
  const [notes, setNotes] = useState('')
  const [songCountInput, setSongCountInput] = useState('')

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

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
      height: '48px',
      borderRadius: '12px',
    },
    formLabel: {
      fontWeight: '600',
      marginBottom: '0.5rem',
      marginTop: '1rem',
      color: '#374151',
    },
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (!artist.trim() || !genre.trim() || !date.trim() || !venue.trim() || !city.trim()) {
      setFormError('Artist, genre, date, venue, and city are required.')
      return
    }

    setSaving(true)
    let coords
    try {
      coords = await geocodeVenue(venue.trim(), city.trim())
    } catch {
      coords = null
    }

    const parsedCount = parseInt(songCountInput, 10)
    const songCount = Number.isFinite(parsedCount) && parsedCount >= 0 ? parsedCount : 0

    const concert = {
      id: newConcertId(),
      date: date.trim(),
      artist: artist.trim(),
      venue: venue.trim(),
      city: city.trim(),
      genre: genre.trim(),
      rating,
      songCount,
      duration: '',
      image: image.trim(),
      notes: notes.trim(),
      attended,
      favorite,
      ...(coords ? { coords } : {}),
    }

    addConcert(concert)
    setSaving(false)
    navigate('/')
  }

  return (
    <section
      id="center"
      style={{
        flex: 1,
        width: '100%',
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
          <div style={{ fontSize: '48px', fontWeight: '700' }}>Log a New Concert</div>

          {formError ? (
            <Alert variant="danger" className="mt-3 mb-0">
              {formError}
            </Alert>
          ) : null}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>Artist/Band</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Dead & Company"
                    style={styles.formControl}
                    value={artist}
                    onChange={(ev) => setArtist(ev.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>Music Genre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Jam Band"
                    style={styles.formControl}
                    value={genre}
                    onChange={(ev) => setGenre(ev.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>Date</Form.Label>
                  <Form.Control
                    type="date"
                    style={styles.formControl}
                    value={date}
                    onChange={(ev) => setDate(ev.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>Venue</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Oracle Park"
                    style={styles.formControl}
                    value={venue}
                    onChange={(ev) => setVenue(ev.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>City, State</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., San Francisco, CA"
                    style={styles.formControl}
                    value={city}
                    onChange={(ev) => setCity(ev.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>Cover image URL (optional)</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://…"
                    style={styles.formControl}
                    value={image}
                    onChange={(ev) => setImage(ev.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>Song count (optional)</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    placeholder="e.g., 18"
                    style={styles.formControl}
                    value={songCountInput}
                    onChange={(ev) => setSongCountInput(ev.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>Notes (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Memories, highlights…"
                    style={{ borderRadius: '12px' }}
                    value={notes}
                    onChange={(ev) => setNotes(ev.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label style={styles.formLabel}>Rating</Form.Label>
                  <div
                    style={{
                      height: '48px',
                      padding: '0 14px',
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #dee2e6',
                      borderRadius: '12px',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ gap: '0.25rem', display: 'flex' }}>
                      {stars.map((star) => (
                        <span
                          key={star}
                          role="button"
                          tabIndex={0}
                          onClick={() => setRating(star)}
                          onKeyDown={(ev) => {
                            if (ev.key === 'Enter' || ev.key === ' ') {
                              ev.preventDefault()
                              setRating(star)
                            }
                          }}
                          style={{
                            fontSize: '1.4rem',
                            cursor: 'pointer',
                            color: star <= rating ? '#f59e0b' : '#d1d5db',
                            lineHeight: 1,
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span style={{ fontWeight: '600', color: '#374151' }}>
                      {getRatingLabel(rating)}
                    </span>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <div
                  style={{
                    paddingTop: '1rem',
                    paddingBottom: '1rem',
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

              <Col md={6}>
                <div
                  style={{
                    paddingTop: '1rem',
                    paddingBottom: '1rem',
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

              <Col xs={12}>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving…
                    </>
                  ) : (
                    'Save Concert'
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </section>
  )
}

export default AddConcertPage
