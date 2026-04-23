import { useContext, useState } from 'react'
import { Row, Col, Button, Card, Form, Alert, Spinner, InputGroup, ListGroup } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, ArrowDown, ArrowUp, Trash } from 'lucide-react'
import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'
import { geocodeVenue, GEOCODE_LOOKUP_FAILED_MESSAGE } from '../utils/geocode.js'
import SectionCard from '../components/SectionCard'
import { extractSongTitles, searchFirstSetlist } from '../utils/setlistfm.js'
import {
  CITY_STATE_PATTERN,
  formatCityState,
  getRatingLabel,
  normalizeSetlist,
  toTitleCase,
} from '../utils/concertForm.js'

function newConcertId() {
  return `c-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function AddConcertPage() {
  const { addConcert } = useContext(ConcertsContext)
  const { loginStatus } = useAuth()
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
  const [setlist, setSetlist] = useState([])
  const [newSongTitle, setNewSongTitle] = useState('')

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [importingSetlist, setImportingSetlist] = useState(false)
  const [importError, setImportError] = useState('')

  const stars = [1, 2, 3, 4, 5]
  const normalizedSetlist = normalizeSetlist(setlist)

  const styles = {
    formControl: {
      height: '40px',
      borderRadius: '10px',
      fontSize: '0.95rem',
    },
    formLabel: {
      fontWeight: '600',
      marginBottom: '0.4rem',
      marginTop: '0rem',
      color: 'var(--setlog-primary-text)',
      fontSize: '0.95rem',
    },
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const cleanedCity = formatCityState(city)

    if (!artist.trim() || !genre.trim() || !date.trim() || !venue.trim() || !city.trim()) {
      setFormError('Artist, genre, date, venue, and city are required.')
      return
    }

    if (!CITY_STATE_PATTERN.test(cleanedCity)) {
      setFormError('City must be in the format City, ST (for example: San Francisco, CA).')
      return
    }

    setSaving(true)
    let coords
    try {
      coords = await geocodeVenue(venue.trim(), city.trim())
    } catch {
      coords = null
    }

    if (!coords) {
      window.alert(GEOCODE_LOOKUP_FAILED_MESSAGE)
    }

    const normalizedSetlist = normalizeSetlist(setlist)
    const concert = {
      id: newConcertId(),
      date: date.trim(),
      artist: artist.trim(),
      venue: venue.trim(),
      city: cleanedCity,
      genre: toTitleCase(genre.trim()),
      rating,
      setlist: normalizedSetlist,
      songCount: normalizedSetlist.length,
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

  const canImportFromSetlistFm = !!(artist.trim() && venue.trim() && date.trim())

  async function handleImportFromSetlistFm() {
    setImportError('')

    if (!canImportFromSetlistFm) {
      setImportError('Enter an artist, venue, and date before importing from setlist.fm.')
      return
    }

    setImportingSetlist(true)
    try {
      const first = await searchFirstSetlist({
        artistName: artist,
        venueName: venue,
        date,
      })

      if (!first) {
        setImportError(`No setlists found for "${artist.trim()}" at "${venue.trim()}" on ${date.trim()}.`)
        return
      }

      const titles = extractSongTitles(first)
      if (!titles.length) {
        setImportError('A matching setlist was found, but it contained no songs.')
        return
      }

      setSetlist(titles)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import setlist from setlist.fm.')
    } finally {
      setImportingSetlist(false)
    }
  }

  function handleAddSong() {
    const t = newSongTitle.trim()
    if (!t) return
    setSetlist((prev) => {
      const base = Array.isArray(prev) ? prev : []
      const next = [...base]
      next.push(t)
      return next
    })
    setNewSongTitle('')
  }

  function handleRemoveSong(index) {
    setSetlist((prev) => {
      const base = Array.isArray(prev) ? prev : []
      const next = []
      for (let i = 0; i < base.length; i++) {
        if (i !== index) next.push(base[i])
      }
      return next
    })
  }

  function handleMoveSong(index, dir) {
    setSetlist((prev) => {
      const arr = Array.isArray(prev) ? [...prev] : []
      const nextIndex = index + dir
      if (index < 0 || index >= arr.length) return arr
      if (nextIndex < 0 || nextIndex >= arr.length) return arr
      const tmp = arr[index]
      arr[index] = arr[nextIndex]
      arr[nextIndex] = tmp
      return arr
    })
  }

  if (!loginStatus.loggedIn) {
    return (
      <section
        className="page-shell"
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
            maxWidth: '560px',
            borderRadius: '20px',
            border: '1px solid var(--setlog-card-border)',
            background: 'var(--setlog-card-bg)',
            boxShadow: '0 8px 24px var(--setlog-card-bg)',
            padding: '1rem',
          }}
        >
          <Card.Body>
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: 'var(--setlog-card-text)', margin: 0 }}>Log a New Concert</h1>
            <p style={{ color: 'var(--setlog-card-text-secondary)' }} className="mt-3 mb-4">
              Concerts you log are tied to your account on this device. Log in or register to
              continue.
            </p>
            <Button as={Link} to="/login" variant="primary" className="me-2">
              Log in
            </Button>
            <Button as={Link} to="/register" variant="outline-primary">
              Register
            </Button>
          </Card.Body>
        </Card>
      </section>
    )
  }

  return (
    <section
      className="page-shell"
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
          border: '1px solid var(--setlog-card-border)',
          background: 'var(--setlog-card-bg)',
          boxShadow: '0 8px 24px var(--setlog-card-bg)',
          padding: '0.5rem',
        }}
      >
        <Card.Body>
          <h1
            style={{
              fontSize: '2.15rem',
              lineHeight: 1.1,
              fontWeight: '700',
              marginBottom: '0.6rem',
              marginTop: 0,
              color: 'var(--setlog-card-text)',
            }}
          >
            Log a New Concert
          </h1>

          {formError ? (
            <Alert variant="danger" className="mb-3" style={{ marginTop: '0.6rem', marginBottom: 0, background: "var(--tag-not-attended-bg)", color: "var(--tag-not-attended-text)" }}>
              {formError}
            </Alert>
          ) : null}

          <div style={{ fontSize: '0.85rem', color: 'var(--setlog-card-text-secondary)', marginBottom: '0.7rem' }}>
            <span style={{ color: '#dc3545', fontWeight: 700 }}>*</span> Required fields
          </div>

          <Form onSubmit={handleSubmit}>
            <Row style={{ alignItems: 'stretch', rowGap: '1rem' }}>
              <Col lg={6} style={{ display: 'flex' }}>
                <SectionCard
                  title="Basic Details"
                  subtitle="The main information about the concert"
                >
                  <Row>
                    <Col md={6}>
                      <Form.Group style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          Artist/Band <span style={{ color: '#dc3545' }}>*</span>
                        </Form.Label>
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
                      <Form.Group style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          Music Genre <span style={{ color: '#dc3545' }}>*</span>
                        </Form.Label>
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
                      <Form.Group style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          Date <span style={{ color: '#dc3545' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          style={styles.formControl}
                          value={date}
                          onChange={(ev) => setDate(ev.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          Venue <span style={{ color: '#dc3545' }}>*</span>
                        </Form.Label>
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
                      <Form.Group style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          City, State <span style={{ color: '#dc3545' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., San Francisco, CA"
                          style={styles.formControl}
                          value={city}
                          onChange={(ev) => setCity(ev.target.value)}
                          isInvalid={!!city.trim() && !CITY_STATE_PATTERN.test(city.trim())}
                        />
                        <Form.Control.Feedback type="invalid">
                          Use Format: City, ST
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>Cover image URL</Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://…"
                          style={styles.formControl}
                          value={image}
                          onChange={(ev) => setImage(ev.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </SectionCard>
              </Col>

              <Col lg={6} style={{ display: 'flex' }}>
                <SectionCard
                  title="Setlist"
                  subtitle="Add songs manually or import them from setlist.fm"
                >
                  <Row>
                    <Col md={12}>
                      <Form.Group style={{ marginBottom: '0.8rem' }}>
                        <Row style={{ rowGap: '0.7rem' }}>
                          <Col lg={5}>
                            <div
                              style={{
                                border: '1px solid var(--setlog-card-border)',
                                borderRadius: '10px',
                                padding: '10px',
                                background: 'var(--setlog-card-bg-secondary)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }}
                            >
                              <InputGroup>
                                <Form.Control
                                  type="text"
                                  placeholder="Add a song title..."
                                  style={styles.formControl}
                                  value={newSongTitle}
                                  onChange={(ev) => setNewSongTitle(ev.target.value)}
                                  onKeyDown={(ev) => {
                                    if (ev.key === 'Enter') {
                                      ev.preventDefault()
                                      handleAddSong()
                                    }
                                  }}
                                />
                                <Button
                                  variant="primary"
                                  style={{ borderRadius: '10px', paddingLeft: '12px', paddingRight: '12px' }}
                                  onClick={handleAddSong}
                                  disabled={!newSongTitle.trim()}
                                  type="button"
                                >
                                  <Plus size={14} />
                                </Button>
                              </InputGroup>

                              <div style={{ marginTop: '0.45rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <Button
                                  type="button"
                                  variant="success"
                                  onClick={handleImportFromSetlistFm}
                                  disabled={!canImportFromSetlistFm || importingSetlist}
                                  style={{
                                    width: '100%',
                                    opacity: !canImportFromSetlistFm || importingSetlist ? 0.55 : 1,
                                    backgroundColor: !canImportFromSetlistFm || importingSetlist ? '#d1d5db' : undefined,
                                    borderColor: !canImportFromSetlistFm || importingSetlist ? '#d1d5db' : undefined,
                                    color: !canImportFromSetlistFm || importingSetlist ? '#6b7280' : undefined,
                                    fontSize: '0.92rem',
                                  }}
                                >
                                  {importingSetlist ? (
                                    <>Import from setlist.fm
                                      <Spinner animation="border" size="sm" style={{ marginRight: '0.5rem' }} />
                                      Importing...
                                    </>
                                  ) : (
                                    'Import from setlist.fm'
                                  )}
                                </Button>
                              </div>

                              {importError ? (
                                <Alert variant="warning" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                                  {importError}
                                </Alert>
                              ) : null}
                            </div>
                          </Col>

                          <Col lg={7}>
                            <div
                              style={{
                                border: '1px solid var(--setlog-card-border)',
                                borderRadius: '10px',
                                padding: '10px',
                                background: 'var(--setlog-card-bg-secondary)',
                              }}
                            >
                              <div style={{ fontWeight: 600, color: 'var(--setlog-card-text)', marginBottom: '8px', fontSize: '0.95rem' }}>
                                Current setlist ({normalizedSetlist.length})
                              </div>
                              {normalizedSetlist.length ? (
                                <div style={{ maxHeight: '190px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                                  <ListGroup>
                                    {normalizedSetlist.map((title, idx) => (
                                      <ListGroup.Item
                                        key={`${title}-${idx}`}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: '10px',
                                          background: 'var(--setlog-card-bg)',
                                          border: '1px solid var(--setlog-card-border)',
                                          paddingTop: '0.55rem',
                                          paddingBottom: '0.55rem',
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontWeight: 500,
                                            fontSize: '0.95rem',
                                            color: 'var(--setlog-card-text)'
                                          }}
                                        >
                                          {idx + 1}. {title}
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', flexShrink: 0 }}>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleMoveSong(idx, -1)}
                                            disabled={idx === 0}
                                          >
                                            <ArrowUp size={14} />
                                          </Button>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleMoveSong(idx, 1)}
                                            disabled={idx === normalizedSetlist.length - 1}
                                          >
                                            <ArrowDown size={14} />
                                          </Button>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleRemoveSong(idx)}
                                          >
                                            <Trash size={16} />
                                          </Button>
                                        </div>
                                      </ListGroup.Item>
                                    ))}
                                  </ListGroup>
                                </div>
                              ) : (
                                <div style={{ marginTop: '0.45rem', color: 'var(--setlog-card-text-secondary)', fontSize: '0.85rem' }}>
                                  No songs yet. Add one on the left or import from setlist.fm.
                                </div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Form.Group>
                    </Col>
                  </Row>
                </SectionCard>
              </Col>
            </Row>

            <Row style={{ alignItems: 'stretch', rowGap: '1rem' }}>
              <Col lg={4} style={{ display: 'flex' }}>
                <SectionCard
                  title="Image Preview"
                  subtitle="Preview the concert cover image"
                >
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        width: '100%',
                        minHeight: '270px',
                        border: '1px solid var(--setlog-card-border)',
                        borderRadius: '10px',
                        background: "var(--setlog-card-bg-secondary)",
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {image.trim() ? (
                        <img
                          src={image.trim()}
                          alt="Concert preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            color: "var(--setlog-card-text-secondary)",
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            padding: '1rem',
                          }}
                        >
                          Add a cover image URL to preview it here.
                        </div>
                      )}
                    </div>
                  </div>
                </SectionCard>
              </Col>

              <Col lg={8} style={{ display: 'flex' }}>
                <SectionCard
                  title="Notes & Extras"
                  subtitle="Rating, attendance, favorites, and memories"
                >
                  <Row>
                    <Col md={12}>
                      <Form.Group style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Memories, highlights…"
                          style={{ borderRadius: '10px', fontSize: '0.95rem' }}
                          value={notes}
                          onChange={(ev) => setNotes(ev.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group style={{ marginBottom: '1rem' }}>
                        <Form.Label style={styles.formLabel}>
                          Rating <span style={{ color: '#dc3545' }}>*</span>
                        </Form.Label>
                        <div
                          style={{
                            height: '44px',
                            padding: '0 12px',
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid var(--setlog-card-border)',
                            borderRadius: '10px',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ gap: '0.2rem', display: 'flex' }}>
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
                                  fontSize: '1.2rem',
                                  cursor: 'pointer',
                                  color: star <= rating ? 'var(--setlog-rating-filled)' : 'var(--setlog-rating-empty)',
                                  lineHeight: 1,
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span style={{ fontWeight: '600', color: 'var(--setlog-card-text-secondary)', fontSize: '0.92rem' }}>
                            {getRatingLabel(rating)}
                          </span>
                        </div>
                      </Form.Group>
                    </Col>

                    <Col md={8}>
                      <div
                        style={{
                          paddingTop: '1.75rem',
                          paddingBottom: '0.6rem',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '1.2rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <Form.Check
                          type="switch"
                          label="I Attended"
                          checked={attended}
                          onChange={() => setAttended(!attended)}
                          style={styles.formLabel}
                        />

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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
                        <Button type="button" variant="outline-danger" disabled={saving} onClick={() => navigate("/")}>
                          Cancel
                        </Button>

                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Spinner animation="border" size="sm" style={{ marginRight: '0.5rem' }} />
                              Saving…
                            </>
                          ) : (
                            'Save Concert'
                          )}
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </SectionCard>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </section>
  )
}

export default AddConcertPage