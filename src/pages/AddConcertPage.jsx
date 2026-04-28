import { useContext, useState } from 'react'
import { Row, Col, Button, Card, Form, Alert, Spinner, InputGroup, ListGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Plus, ArrowDown, ArrowUp, Trash, Info } from 'lucide-react'
import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'
import { geocodeVenue, GEOCODE_LOOKUP_FAILED_MESSAGE } from '../utils/geocode.js'
import SectionCard from '../components/SectionCard'
import { ConfirmDialog } from '../components/ConfirmDialog.jsx'
import SetlistSearchDialog from '../components/SetlistSearchDialog.jsx'
import { extractSetlistConcertDetails, extractSetlistSections, searchSetlists } from '../utils/setlistfm.js'
import {
  CITY_STATE_PATTERN,
  formatCityState,
  getRatingLabel,
  normalizeSetlist,
  toTitleCase,
} from '../utils/concertForm.js'
import {
  buildSetlistPersistenceFields,
  isValidStoredSetlistSections,
  normalizeSetlistSections,
  normalizeSetlistSectionsForForm,
} from '../utils/setlistHelpers.js'

function initialSectionsFromLive(liveConcert) {
  if (
    liveConcert?.setlistSections &&
    isValidStoredSetlistSections(liveConcert.setlistSections) &&
    normalizeSetlistSections(liveConcert.setlistSections).length > 0
  ) {
    return normalizeSetlistSectionsForForm(liveConcert.setlistSections)
  }
  const raw = Array.isArray(liveConcert?.setlist) ? liveConcert.setlist : ['']
  return normalizeSetlistSectionsForForm([{ name: 'Setlist', songs: raw.length ? raw : [''] }])
}

function newConcertId() {
  return `c-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function AddConcertPage() {
  const { concerts, addConcert } = useContext(ConcertsContext)
  const { loginStatus } = useAuth()
  const navigate = useNavigate()

  const location = useLocation()
  const liveConcert = location.state?.liveConcert

  const [artist, setArtist] = useState(liveConcert?.artist ?? '')
  const [genre, setGenre] = useState('')
  const [date, setDate] = useState(liveConcert?.date ?? '')
  const [venue, setVenue] = useState(liveConcert?.venue ?? '')
  const [city, setCity] = useState('')
  const [rating, setRating] = useState(5)
  const [attended, setAttended] = useState(true)
  const [favorite, setFavorite] = useState(false)
  const [image, setImage] = useState('')
  const [notes, setNotes] = useState(liveConcert?.notes || '')
  const [sections, setSections] = useState(() => initialSectionsFromLive(liveConcert))
  const [newSongTitle, setNewSongTitle] = useState('')
  const [newSongSectionIndex, setNewSongSectionIndex] = useState(0)

  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [importingSetlist, setImportingSetlist] = useState(false)
  const [importError, setImportError] = useState('')
  const [setlistSearchResults, setSetlistSearchResults] = useState([])
  const [geocodeNoticeOpen, setGeocodeNoticeOpen] = useState(false)
  const [showImportTip, setShowImportTip] = useState(false)
  const [pendingConcert, setPendingConcert] = useState(null)

  const stars = [1, 2, 3, 4, 5]
  const songCountDisplay = sections.reduce((n, s) => n + normalizeSetlist(s.songs).length, 0)
  const selectedNewSongSectionIndex = Math.min(newSongSectionIndex, Math.max(sections.length - 1, 0))

  const styles = {
    formControl: {
      height: '40px',
      border: '1px solid var(--setlog-card-border)',
      backgroundColor: 'var(--setlog-card-bg-secondary)',
      color: 'var(--setlog-card-text)',
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
      setFormError('City must include a region: City, ST or City, Country (e.g. San Francisco, CA or London, England).')
      return
    }

    setSaving(true)
    let coords
    try {
      coords = await geocodeVenue(venue.trim(), city.trim())
    } catch {
      coords = null
    }

    const setlistParts = buildSetlistPersistenceFields(sections)
    const concert = {
      id: newConcertId(),
      date: date.trim(),
      artist: artist.trim(),
      venue: venue.trim(),
      city: cleanedCity,
      genre: toTitleCase(genre.trim()),
      rating,
      setlist: setlistParts.setlist,
      songCount: setlistParts.songCount,
      ...(Object.prototype.hasOwnProperty.call(setlistParts, 'setlistSections')
        ? { setlistSections: setlistParts.setlistSections }
        : {}),
      duration: '',
      image: image.trim(),
      notes: notes.trim(),
      attended,
      favorite,
      ...(coords ? { coords } : {}),
    }

    if (!coords) {
      setPendingConcert(concert)
      setGeocodeNoticeOpen(true)
      setSaving(false)
      return
    }

    saveConcert(concert)
    setSaving(false)
    navigate('/')
  }

  function saveConcert(concertToSave) {
    addConcert(concertToSave)
    setPendingConcert(null)
    setSaving(false)
    navigate('/')
  }

  const canImportFromSetlistFm = !!(artist.trim() || venue.trim() || city.trim() || date.trim())
  const canSearchImages = !!(artist.trim() || venue.trim())

  function handleSearchImages() {
    const queryParts = []
    if (artist.trim()) queryParts.push(artist.trim())
    if (venue.trim()) queryParts.push(venue.trim())
    const cleanedCity = formatCityState(city)
    if (CITY_STATE_PATTERN.test(cleanedCity)) queryParts.push(cleanedCity)

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
      if (concertArtist === target && concertGenre) return concertGenre
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

  function handleSelectSetlist(setlistResult) {
    setImportError('')

    const details = extractSetlistConcertDetails(setlistResult)
    if (details.artist) setArtist(details.artist)
    if (details.venue) setVenue(details.venue)
    if (details.date) setDate(details.date)
    if (details.city) setCity(details.city)
    let filledGenreFromHistory = false
    if (!genre.trim()) {
      const importedArtist = details.artist || artist
      const savedGenre = findGenreForArtist(importedArtist)
      if (savedGenre) {
        setGenre(savedGenre)
        filledGenreFromHistory = true
      }
    }

    const importedSections = extractSetlistSections(setlistResult)
    if (!importedSections.length) {
      setImportError('Concert details imported. No songs are listed on setlist.fm yet.')
      setSetlistSearchResults([])
      return
    }

    setSections(normalizeSetlistSectionsForForm(importedSections))
    setSetlistSearchResults([])
    if (!genre.trim() && !filledGenreFromHistory) {
      setImportError('Imported details from setlist.fm. Add a music genre to save this concert.')
    }
  }

  function handleAddSong() {
    const t = newSongTitle.trim()
    if (!t) return
    setSections((prev) => {
      const next = prev.map((s) => ({ ...s, songs: [...s.songs] }))
      const targetIndex = Math.min(Math.max(newSongSectionIndex, 0), next.length - 1)
      const target = next[targetIndex]
      if (!target) return prev
      target.songs = [...normalizeSetlist(target.songs), t]
      return normalizeSetlistSectionsForForm(next)
    })
    setNewSongTitle('')
  }

  function handleRemoveSong(sectionIndex, songIndex) {
    setSections((prev) => {
      const next = prev.map((s) => ({ ...s, songs: [...s.songs] }))
      const songs = next[sectionIndex]?.songs
      if (!songs) return prev
      songs.splice(songIndex, 1)
      if (songs.length === 0) songs.push('')
      return normalizeSetlistSectionsForForm(next)
    })
  }

  function handleMoveSong(sectionIndex, songIndex, dir) {
    setSections((prev) => {
      const next = prev.map((s) => ({ ...s, songs: normalizeSetlist(s.songs) }))
      const songs = next[sectionIndex]?.songs
      if (!songs) return prev
      if (songIndex < 0 || songIndex >= songs.length) return prev
      const [song] = songs.splice(songIndex, 1)
      if (!song) return prev

      if (dir < 0) {
        if (songIndex > 0) {
          songs.splice(songIndex - 1, 0, song)
        } else if (sectionIndex > 0) {
          next[sectionIndex - 1].songs.push(song)
        } else {
          songs.unshift(song)
        }
      } else if (songIndex < songs.length) {
        songs.splice(songIndex + 1, 0, song)
      } else if (sectionIndex < next.length - 1) {
        next[sectionIndex + 1].songs.unshift(song)
      } else {
        songs.push(song)
      }

      next.forEach((sec) => {
        if (sec.songs.length === 0) sec.songs = ['']
      })
      return normalizeSetlistSectionsForForm(next)
    })
  }

  function handleSectionNameChange(sectionIndex, name) {
    setSections((prev) => {
      const next = prev.map((s, i) => (i === sectionIndex ? { ...s, name } : s))
      return normalizeSetlistSectionsForForm(next)
    })
  }

  function handleAddSet() {
    const nextSectionIndex = sections.length
    setNewSongSectionIndex(nextSectionIndex)
    setSections((prev) => {
      const n = prev.length + 1
      return normalizeSetlistSectionsForForm([...prev.map((s) => ({ ...s, songs: [...s.songs] })), { name: `Set ${n}`, songs: [''] }])
    })
  }

  function handleRemoveSet(sectionIndex) {
    setSections((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.map((s) => ({ ...s, songs: [...s.songs] }))
      const removed = next[sectionIndex]
      const removedSongs = removed?.songs || []
      if (sectionIndex > 0) {
        const into = next[sectionIndex - 1].songs
        next[sectionIndex - 1].songs = [...into, ...removedSongs].length ? [...into, ...removedSongs] : ['']
      } else {
        const into = next[1].songs
        next[1].songs = [...removedSongs, ...into].length ? [...removedSongs, ...into] : ['']
      }
      next.splice(sectionIndex, 1)
      return normalizeSetlistSectionsForForm(next)
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
      <ConfirmDialog
        show={geocodeNoticeOpen}
        onHide={() => {
          setGeocodeNoticeOpen(false)
          setPendingConcert(null)
        }}
        title="Could not look up location"
        confirmLabel="Save Anyway"
        cancelLabel="Cancel"
        confirmVariant="primary"
        onConfirm={() => {
          if (pendingConcert) {
            saveConcert(pendingConcert)
          }
          setGeocodeNoticeOpen(false)
        }}
      >
        {GEOCODE_LOOKUP_FAILED_MESSAGE}
      </ConfirmDialog>
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
            Log a New Concert
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
                          City, State/Country <span style={{ color: 'var(--setlog-required-indicator)' }}>*</span>
                        </Form.Label>
                        <Form.Control
                          id="concert-city"
                          type="text"
                          placeholder="e.g., San Francisco, CA or London, England"
                          style={styles.formControl}
                          value={city}
                          onChange={(ev) => setCity(ev.target.value)}
                          isInvalid={!!city.trim() && !CITY_STATE_PATTERN.test(city.trim())}
                        />
                        <Form.Control.Feedback type="invalid">
                          City, then region (state, province, or country)
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
                            Search
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
                                background: 'var(--setlog-card-bg)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.45rem',
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

                              <Form.Select
                                aria-label="Choose set for new song"
                                value={selectedNewSongSectionIndex}
                                onChange={(ev) => setNewSongSectionIndex(Number(ev.target.value))}
                                style={{ ...styles.formControl, marginTop: '0.45rem' }}
                              >
                                {sections.map((sec, si) => (
                                  <option key={`song-target-${si}`} value={si}>
                                    Add to {sec.name || `Set ${si + 1}`}
                                  </option>
                                ))}
                              </Form.Select>

                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                                    fontSize: '0.92rem',
                                  }}
                                >
                                  {importingSetlist ? (
                                    <>
                                      <Spinner animation="border" size="sm" style={{ marginRight: '0.5rem' }} />
                                      Importing...
                                    </>
                                  ) : (
                                    'Import Setlist'
                                  )}
                                </Button>
                                <OverlayTrigger
                                  placement="top"
                                  show={showImportTip}
                                  overlay={
                                    <Tooltip id="setlist-reimport-tip">
                                      Enter an artist name to search setlist.fm. Adding a date helps find the right show.
                                      Importing can fill the date, venue, city, and setlist for you.
                                    </Tooltip>
                                  }
                                >
                                  <Button
                                    type="button"
                                    variant="outline-secondary"
                                    aria-label="setlist.fm import tip"
                                    onClick={() => setShowImportTip((prev) => !prev)}
                                    onBlur={() => setShowImportTip(false)}
                                    style={{
                                      borderRadius: '10px',
                                      paddingLeft: '10px',
                                      paddingRight: '10px',
                                      borderColor: 'var(--setlog-card-border)',
                                      color: 'var(--setlog-card-text)',
                                      backgroundColor: 'var(--setlog-card-bg)',
                                    }}
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
                                Current setlist ({songCountDisplay})
                              </div>
                              {songCountDisplay > 0 || sections.length > 1 ? (
                                <div style={{ maxHeight: '240px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                                  {sections.map((sec, si) => (
                                    <div key={`sec-${si}`} style={{ marginBottom: si < sections.length - 1 ? '0.85rem' : 0 }}>
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          marginBottom: '6px',
                                          flexWrap: 'wrap',
                                        }}
                                      >
                                        <Form.Control
                                          type="text"
                                          aria-label={`Set ${si + 1} name`}
                                          value={sec.name}
                                          onChange={(ev) => handleSectionNameChange(si, ev.target.value)}
                                          style={{ ...styles.formControl, maxWidth: '220px', flex: '1 1 140px' }}
                                        />
                                        {sections.length > 1 ? (
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleRemoveSet(si)}
                                            aria-label={`Remove set ${si + 1}`}
                                          >
                                            Remove set
                                          </Button>
                                        ) : null}
                                      </div>
                                      <ListGroup>
                                        {sec.songs
                                          .map((title, idx) => ({ title, idx }))
                                          .filter(({ title }) => typeof title === 'string' && title.trim() !== '')
                                          .map(({ title, idx }, displayIdx, visibleSongs) => (
                                            <ListGroup.Item
                                              key={`${si}-${idx}-${title}`}
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
                                                  color: 'var(--setlog-card-text)',
                                                }}
                                              >
                                                {displayIdx + 1}. {typeof title === 'string' ? title : ''}
                                              </div>
                                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', flexShrink: 0 }}>
                                                <Button
                                                  type="button"
                                                  size="sm"
                                                  variant="secondary"
                                                  onClick={() => handleMoveSong(si, displayIdx, -1)}
                                                  disabled={si === 0 && displayIdx === 0}
                                                  aria-label="Move song up"
                                                >
                                                  <ArrowUp size={14} />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  size="sm"
                                                  variant="secondary"
                                                  onClick={() => handleMoveSong(si, displayIdx, 1)}
                                                  disabled={si === sections.length - 1 && displayIdx === visibleSongs.length - 1}
                                                  aria-label="Move song down"
                                                >
                                                  <ArrowDown size={14} />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  size="sm"
                                                  variant="outline-danger"
                                                  onClick={() => handleRemoveSong(si, idx)}
                                                  aria-label="Remove song"
                                                >
                                                  <Trash size={16} />
                                                </Button>
                                              </div>
                                            </ListGroup.Item>
                                          ))}
                                      </ListGroup>
                                    </div>
                                  ))}
                                  <Button
                                    type="button"
                                    variant="outline-secondary"
                                    size="sm"
                                    className="mt-2"
                                    onClick={handleAddSet}
                                  >
                                    Add set
                                  </Button>
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
                        <Form.Label style={styles.formLabel}>
                          Rating <span style={{ color: 'var(--setlog-required-indicator)' }}>*</span>
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