import { useContext, useEffect, useRef, useState } from 'react'
import { Row, Col, Button, Card, Form, Alert, Spinner, InputGroup, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, ArrowDown, ArrowUp, Trash, Info } from 'lucide-react'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'
import { geocodeVenue, GEOCODE_LOOKUP_FAILED_MESSAGE } from '../utils/geocode.js'
import SectionCard from '../components/SectionCard'
import { ConfirmDialog, MessageDialog } from '../components/ConfirmDialog.jsx'
import SetlistSearchDialog from '../components/SetlistSearchDialog.jsx'
import { extractSetlistConcertDetails, extractSongTitles, searchSetlists } from '../utils/setlistfm.js'
import {
  CITY_STATE_PATTERN,
  formatCityState,
  getRatingLabel,
  normalizeSetlist,
  toTitleCase,
} from '../utils/concertForm.js'

function EditConcertPage() {
  const { id } = useParams()
  const { concerts, updateConcert, getConcert, loading } = useContext(ConcertsContext)
  const { loginStatus } = useAuth()
  const navigate = useNavigate()

  const hydratedIdRef = useRef(null)
  const [formReady, setFormReady] = useState(false)

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
  const [pendingImportTitles, setPendingImportTitles] = useState(null)
  const [pendingImportDetails, setPendingImportDetails] = useState(null)
  const [setlistSearchResults, setSetlistSearchResults] = useState([])
  const [geocodeNoticeOpen, setGeocodeNoticeOpen] = useState(false)

  const stars = [1, 2, 3, 4, 5]
  const normalizedSetlist = normalizeSetlist(setlist)

  useEffect(() => {
    hydratedIdRef.current = null
    setFormReady(false)
  }, [id])

  useEffect(() => {
    if (!loginStatus.loggedIn || loading || !id) return
    const c = getConcert(id)
    if (!c) return
    if (hydratedIdRef.current === id) return

    setArtist(typeof c.artist === 'string' ? c.artist : '')
    setGenre(typeof c.genre === 'string' ? c.genre : '')
    setDate(typeof c.date === 'string' ? c.date : '')
    setVenue(typeof c.venue === 'string' ? c.venue : '')
    setCity(typeof c.city === 'string' ? c.city : '')
    const r = Number(c.rating)
    setRating(Number.isFinite(r) ? Math.min(5, Math.max(1, Math.round(r))) : 5)
    setAttended(!!c.attended)
    setFavorite(!!c.favorite)
    setImage(typeof c.image === 'string' ? c.image : '')
    setNotes(typeof c.notes === 'string' ? c.notes : '')
    setSetlist(Array.isArray(c.setlist) ? c.setlist.filter((s) => typeof s === 'string') : [])
    setNewSongTitle('')

    hydratedIdRef.current = id
    setFormReady(true)
  }, [id, loading, getConcert, loginStatus.loggedIn])

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

    if (!id?.trim()) {
      setFormError('Missing concert id.')
      return
    }

    const cleanedCity = formatCityState(city)

    if (!artist.trim() || !genre.trim() || !date.trim() || !venue.trim() || !city.trim()) {
      setFormError('Artist, genre, date, venue, and city are required.')
      return
    }

    if (!CITY_STATE_PATTERN.test(cleanedCity)) {
      setFormError('City must be in the format City, ST (for example: San Francisco, CA).')
      return
    }

    const existing = getConcert(id)
    if (!existing) {
      setFormError('This concert no longer exists.')
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
      setGeocodeNoticeOpen(true)
    }

    const nextSetlist = normalizeSetlist(setlist)
    const patch = {
      date: date.trim(),
      artist: artist.trim(),
      venue: venue.trim(),
      city: cleanedCity,
      genre: toTitleCase(genre.trim()),
      rating,
      setlist: nextSetlist,
      songCount: nextSetlist.length,
      duration: typeof existing.duration === 'string' ? existing.duration : '',
      image: image.trim(),
      notes: notes.trim(),
      attended,
      favorite,
      ...(coords ? { coords } : {}),
    }

    try {
      await updateConcert(id, patch)
      navigate(`/concerts/${id}`)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const canImportFromSetlistFm = !!(artist.trim() || venue.trim() || city.trim() || date.trim())
  const canSearchImages = !!(artist.trim() || venue.trim())

  function handleSearchImages() {
    const queryParts = []
    if (artist.trim()) queryParts.push(artist.trim())
    if (venue.trim()) queryParts.push(venue.trim())

    const query = encodeURIComponent(queryParts.join(' '))
    const searchWindow = window.open(`https://www.google.com/search?tbm=isch&q=${query}`, '_blank')
    if (searchWindow) searchWindow.opener = null
  }

  function findGenreForArtist(artistName) {
    const target = typeof artistName === 'string' ? artistName.trim().toLowerCase() : ''
    if (!target) return ''

    for (const concert of concerts) {
      const concertArtist = typeof concert?.artist === 'string' ? concert.artist.trim().toLowerCase() : ''
      const concertGenre = typeof concert?.genre === 'string' ? concert.genre.trim() : ''
      if (concert?.id !== id && concertArtist === target && concertGenre) return concertGenre
    }

    return ''
  }

  async function handleImportFromSetlistFm() {
    setImportError('')

    if (!canImportFromSetlistFm) {
      setImportError('Enter an artist name, or another concert detail, to search setlist.fm.')
      return
    }

    setImportingSetlist(true)
    try {
      const results = await searchSetlists({
        artistName: artist,
        venueName: venue,
        cityState: city,
        date,
        limit: 5,
      })

      if (!results.length) {
        setImportError('No setlists found for those details.')
        return
      }

      if (results.length === 1) {
        handleSelectSetlist(results[0])
        return
      }

      setSetlistSearchResults(results)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import setlist from setlist.fm.')
    } finally {
      setImportingSetlist(false)
    }
  }

  function applySetlistImport(titles, details) {
    let filledGenreFromHistory = false
    if (details?.artist) setArtist(details.artist)
    if (details?.venue) setVenue(details.venue)
    if (details?.date) setDate(details.date)
    if (details?.city) setCity(details.city)
    if (!genre.trim()) {
      const importedArtist = details?.artist || artist
      const savedGenre = findGenreForArtist(importedArtist)
      if (savedGenre) {
        setGenre(savedGenre)
        filledGenreFromHistory = true
      }
    }
    if (Array.isArray(titles)) setSetlist(titles)
    return !genre.trim() && !filledGenreFromHistory
  }

  function handleSelectSetlist(setlistResult) {
    setImportError('')

    const details = extractSetlistConcertDetails(setlistResult)
    setSetlistSearchResults([])

    const titles = extractSongTitles(setlistResult)
    if (!titles.length) {
      applySetlistImport(null, details)
      setImportError('Concert details imported. No songs are listed on setlist.fm yet.')
      return
    }

    const current = normalizeSetlist(setlist)
    if (current.length > 0) {
      setPendingImportTitles(titles)
      setPendingImportDetails(details)
      return
    }

    const needsGenre = applySetlistImport(titles, details)
    if (needsGenre) {
      setImportError('Imported details from setlist.fm. Add a music genre to save this concert.')
    }
  }

  function handleAddSong() {
    const t = newSongTitle.trim()
    if (!t) return
    setSetlist((prev) => {
      const base = Array.isArray(prev) ? prev : []
      return [...base, t]
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
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: 'var(--setlog-card-text)', margin: 0 }}>Edit Concert</h1>
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

  if (loginStatus.loggedIn && loading) {
    return (
      <section
        className="page-shell"
        style={{
          flex: 1,
          width: '100%',
          padding: '2rem 1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading concert…</span>
        </Spinner>
      </section>
    )
  }

  if (loginStatus.loggedIn && !loading && id && !getConcert(id)) {
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
              Concert not found
            </h1>
            <p className="mt-3 mb-4" style={{ color: 'var(--setlog-card-text-secondary)' }}>
              This concert doesn’t exist or may have been deleted.
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Back to Timeline
            </Button>
          </Card.Body>
        </Card>
      </section>
    )
  }

  if (loginStatus.loggedIn && id && getConcert(id) && !formReady) {
    return (
      <section
        className="page-shell"
        style={{
          flex: 1,
          width: '100%',
          padding: '2rem 1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Preparing form…</span>
        </Spinner>
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
      <ConfirmDialog
        show={pendingImportTitles != null}
        onHide={() => {
          setPendingImportTitles(null)
          setPendingImportDetails(null)
        }}
        title="Replace setlist?"
        confirmLabel="Replace"
        cancelLabel="Cancel"
        confirmVariant="primary"
        onConfirm={() => {
          const needsGenre = applySetlistImport(pendingImportTitles, pendingImportDetails)
          setPendingImportTitles(null)
          setPendingImportDetails(null)
          if (needsGenre) {
            setImportError('Imported details from setlist.fm. Add a music genre to save this concert.')
          }
        }}
      >
        Replace the current setlist with the imported one?
      </ConfirmDialog>
      <MessageDialog
        show={geocodeNoticeOpen}
        onHide={() => setGeocodeNoticeOpen(false)}
        title="Could not look up location"
      >
        {GEOCODE_LOOKUP_FAILED_MESSAGE}
      </MessageDialog>
      <SetlistSearchDialog
        show={setlistSearchResults.length > 0}
        results={setlistSearchResults}
        onHide={() => setSetlistSearchResults([])}
        onSelect={handleSelectSetlist}
      />
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
            Edit Concert
          </h1>

          {formError ? (
            <Alert variant="danger" className="mb-3" style={{ marginTop: '0.6rem', marginBottom: 0, background: "var(--tag-not-attended-bg)", color: "var(--tag-not-attended-text)" }}>
              {formError}
            </Alert>
          ) : null}

          <div style={{ fontSize: '0.85rem', color: 'var(--setlog-card-text-secondary)', marginBottom: '0.7rem' }}>
            <span style={{ color: 'var(--setlog-required-indicator)', fontWeight: 700 }}>*</span> Required to save concert
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
                      <Form.Group controlId="concert-artist" style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          Artist/Band <span style={{ color: 'var(--setlog-required-indicator)' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          id="concert-artist"
                          type="text"
                          placeholder="e.g., Dead & Company"
                          style={styles.formControl}
                          value={artist}
                          onChange={(ev) => setArtist(ev.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="concert-genre" style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          Music Genre <span style={{ color: 'var(--setlog-required-indicator)' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          id="concert-genre"
                          type="text"
                          placeholder="e.g., Jam Band"
                          style={styles.formControl}
                          value={genre}
                          onChange={(ev) => setGenre(ev.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="concert-date" style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          Date <span style={{ color: 'var(--setlog-required-indicator)' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          id="concert-date"
                          type="date"
                          style={styles.formControl}
                          value={date}
                          onChange={(ev) => setDate(ev.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="concert-venue" style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          Venue <span style={{ color: 'var(--setlog-required-indicator)' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          id="concert-venue"
                          type="text"
                          placeholder="e.g., Oracle Park"
                          style={styles.formControl}
                          value={venue}
                          onChange={(ev) => setVenue(ev.target.value)}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="concert-city" style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>
                          City, State <span style={{ color: 'var(--setlog-required-indicator)' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          id="concert-city"
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
                      <Form.Group controlId="concert-image" style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>Cover image URL</Form.Label>
                        <InputGroup>
                          <Form.Control
                            id="concert-image"
                            type="url"
                            placeholder="https://…"
                            style={styles.formControl}
                            value={image}
                            onChange={(ev) => setImage(ev.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={handleSearchImages}
                            disabled={!canSearchImages}
                            style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                          >
                            Search images
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                </SectionCard>
              </Col>

              <Col lg={6} style={{ display: 'flex' }}>
                <SectionCard
                  title="Setlist"
                  subtitle="Add songs manually or reimport from setlist.fm"
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
                                  aria-label="New song title"
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
                                  aria-label="Add song"
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
                                    flex: 1,
                                    backgroundColor: !canImportFromSetlistFm || importingSetlist ? 'var(--setlog-disabled-btn-bg)' : undefined,
                                    borderColor: !canImportFromSetlistFm || importingSetlist ? 'var(--setlog-disabled-btn-border)' : undefined,
                                    color: !canImportFromSetlistFm || importingSetlist ? 'var(--setlog-disabled-btn-text)' : undefined,
                                    fontSize: '0.90rem',
                                  }}
                                >
                                  {importingSetlist ? (
                                    <>
                                      Reimport from setlist.fm
                                      <Spinner animation="border" size="sm" style={{ marginRight: '0.5rem' }} />
                                      Importing...
                                    </>
                                  ) : (
                                    'Reimport from setlist.fm'
                                  )}
                                </Button>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={(
                                    <Tooltip id="setlist-reimport-tip">
                                      Enter an artist name to search setlist.fm. Adding a date helps find the right show.
                                      Importing can fill the date, venue, city, and setlist for you.
                                    </Tooltip>
                                  )}
                                >
                                  <Button
                                    type="button"
                                    variant="outline-secondary"
                                    aria-label="setlist.fm import tip"
                                    style={{ borderRadius: '10px', paddingLeft: '10px', paddingRight: '10px' }}
                                  >
                                    <Info size={16} />
                                  </Button>
                                </OverlayTrigger>
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
                                            aria-label={`Move "${title}" up`}
                                          >
                                            <ArrowUp size={14} />
                                          </Button>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleMoveSong(idx, 1)}
                                            disabled={idx === normalizedSetlist.length - 1}
                                            aria-label={`Move "${title}" down`}
                                          >
                                            <ArrowDown size={14} />
                                          </Button>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleRemoveSong(idx)}
                                            aria-label={`Remove "${title}"`}
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
                      <Form.Group controlId="concert-notes" style={{ marginBottom: '0.8rem' }}>
                        <Form.Label style={styles.formLabel}>Notes</Form.Label>
                        <Form.Control
                          id="concert-notes"
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
                        <div id="concert-rating-label" style={styles.formLabel}>
                          Rating <span style={{ color: 'var(--setlog-required-indicator)' }}>*</span>
                        </div>
                        <div
                          role="group"
                          aria-labelledby="concert-rating-label"
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
                                aria-label={`Set rating to ${star} out of 5`}
                                aria-pressed={star === rating}
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
                          id="concert-attended"
                          checked={attended}
                          onChange={() => setAttended(!attended)}
                          style={styles.formLabel}
                        />

                        <Form.Check
                          type="switch"
                          label="Add to Favorites"
                          id="concert-favorite"
                          checked={favorite}
                          onChange={() => setFavorite(!favorite)}
                          style={styles.formLabel}
                        />
                      </div>
                    </Col>

                    <Col xs={12}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
                        <Button
                          type="button"
                          variant="outline-danger"
                          disabled={saving}
                          onClick={() => navigate(id ? `/concerts/${id}` : '/')}
                        >
                          Cancel
                        </Button>

                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Spinner animation="border" size="sm" style={{ marginRight: '0.5rem' }} />
                              Saving…
                            </>
                          ) : (
                            'Save changes'
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

export default EditConcertPage
