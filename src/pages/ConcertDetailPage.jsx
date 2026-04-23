import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Alert, Card, Row, Col, Button, ListGroup, Spinner } from 'react-bootstrap'
import { ArrowLeft, Trash, Edit, MapPin, FileText, Music, CalendarDays, ListMusic, Info } from 'lucide-react'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'
import { useSpotify } from '../contexts/spotifyContext.js'
import SectionCard from '../components/SectionCard'
import {
  addItemsToSpotifyPlaylist,
  buildSpotifyPlaylistDescription,
  buildSpotifyPlaylistName,
  createSpotifyPlaylist,
  resolveSpotifyTrackMatches,
} from '../utils/spotifyApi.js'
import {
  clearStoredSpotifyPendingAction,
  readStoredSpotifyPendingAction,
} from '../utils/spotifyAuth.js'

function ConcertDetailPage() {
  const { concerts, deleteConcert, updateConcert } = useContext(ConcertsContext)
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { loginStatus } = useAuth()
  const {
    ensureAccessToken,
    loading: spotifyLoading,
    authenticating: spotifyAuthenticating,
  } = useSpotify()
  const [playlistStatus, setPlaylistStatus] = useState({
    busy: false,
    error: '',
    result: null,
  })

  const concert = concerts.find((c) => c.id === id)
  const setlistSongs = useMemo(
    () =>
      Array.isArray(concert?.setlist)
        ? concert.setlist
            .map((song) => (typeof song === 'string' ? song.trim() : ''))
            .filter(Boolean)
        : [],
    [concert?.setlist],
  )

  const backLabel = location.state?.backLabel || 'Back to Timeline'
  const backTo = typeof location.state?.from === 'string' ? location.state.from : '/'
  const storedPlaylistUrl =
    typeof concert?.spotifyPlaylistUrl === 'string' ? concert.spotifyPlaylistUrl.trim() : ''
  const storedPlaylistName =
    typeof concert?.spotifyPlaylistName === 'string' ? concert.spotifyPlaylistName.trim() : ''
  const currentPlaylistUrl = storedPlaylistUrl || playlistStatus.result?.playlistUrl || ''
  const currentPlaylistName =
    storedPlaylistName || playlistStatus.result?.playlistName || 'Spotify Playlist'

  function handleBack() {
    navigate(backTo)
  }

  function handleDelete() {
    const ok = window.confirm(
      `Remove "${concert.artist}" (${concert.date}) from your timeline?`,
    )
    if (ok) {
      deleteConcert(concert.id)
      navigate(backTo)
    }
  }

  function getRatingLabel(value) {
    if (value === 5) return 'Amazing'
    if (value === 4) return 'Great'
    if (value === 3) return 'Good'
    if (value === 2) return 'Okay'
    return 'Rough'
  }

  useEffect(() => {
    setPlaylistStatus({ busy: false, error: '', result: null })
  }, [concert?.id])

  const exportSetlistToSpotify = useCallback(async () => {
    if (!concert) return

    if (setlistSongs.length === 0) {
      setPlaylistStatus({
        busy: false,
        error: 'Add at least one song to this setlist before exporting to Spotify.',
        result: null,
      })
      return
    }

    setPlaylistStatus({ busy: true, error: '', result: null })

    try {
      const accessToken = await ensureAccessToken({
        interactive: true,
        returnTo: `/concerts/${concert.id}`,
        action: { type: 'create-playlist', concertId: concert.id },
      })

      if (!accessToken) {
        setPlaylistStatus({ busy: false, error: '', result: null })
        return
      }

      clearStoredSpotifyPendingAction()

      const { matched, unmatched } = await resolveSpotifyTrackMatches({
        accessToken,
        songs: setlistSongs,
        artist: concert.artist,
        limit: 5,
      })

      if (matched.length === 0) {
        throw new Error('Spotify could not match any songs from this setlist.')
      }

      const playlist = await createSpotifyPlaylist({
        accessToken,
        name: buildSpotifyPlaylistName(concert),
        description: buildSpotifyPlaylistDescription(concert),
        isPublic: false,
      })

      await addItemsToSpotifyPlaylist({
        accessToken,
        playlistId: playlist.id,
        uris: matched.map((item) => item.uri),
      })

      let saveWarning = ''
      if (loginStatus.loggedIn) {
        try {
          await updateConcert(concert.id, {
            spotifyPlaylistId: playlist.id,
            spotifyPlaylistName: playlist.name,
            spotifyPlaylistUrl: playlist.external_urls?.spotify || '',
            spotifyPlaylistCreatedAt: new Date().toISOString(),
          })
        } catch (err) {
          saveWarning =
            err?.message || 'The playlist was created, but the link could not be saved to this concert.'
        }
      }

      setPlaylistStatus({
        busy: false,
        error: '',
        result: {
          playlistName: playlist.name,
          playlistUrl: playlist.external_urls?.spotify || '',
          matchedCount: matched.length,
          unmatchedSongs: unmatched.map((item) => item.song),
          warning: saveWarning,
        },
      })
    } catch (err) {
      setPlaylistStatus({
        busy: false,
        error: err?.message || 'Spotify playlist export failed.',
        result: null,
      })
    }
  }, [concert, ensureAccessToken, loginStatus.loggedIn, setlistSongs, updateConcert])

  useEffect(() => {
    if (!concert || spotifyLoading || spotifyAuthenticating || playlistStatus.busy) return
    const pendingAction = readStoredSpotifyPendingAction()
    if (
      pendingAction?.type === 'create-playlist' &&
      pendingAction.concertId === concert.id
    ) {
      void exportSetlistToSpotify()
    }
  }, [
    concert,
    exportSetlistToSpotify,
    playlistStatus.busy,
    spotifyAuthenticating,
    spotifyLoading,
  ])

  if (!concert) {
    return (
      <section
        className="page-shell"
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
            boxShadow: '0 8px 24px var(--setlog-card-bg)',
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
            <h1
              style={{
                fontSize: '1.8rem',
                fontWeight: 800,
                color: 'var(--setlog-card-text)',
                marginBottom: '0.5rem',
                marginTop: 0,
              }}
            >
              Concert not found
            </h1>

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
              onClick={handleBack}
              style={{
                fontWeight: 700,
                borderRadius: '10px',
                padding: '8px 14px',
              }}
            >
              {backLabel}
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
      alignItems: 'center',
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
      className="page-shell"
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
                onClick={handleBack}
                style={{
                  padding: 0,
                  textDecoration: 'none',
                  fontWeight: 700,
                  color: 'var(--setlog-blue-text)',
                  fontSize: '0.9rem',
                }}
              >
                <ArrowLeft size={14} style={{ marginRight: '5px' }} />
                {backLabel}
              </Button>
            </Col>
            <Col xs="auto" style={{ display: 'flex', gap: '8px' }}>
              {loginStatus.loggedIn && (
                <Button
                  variant="outline-primary"
                  style={styles.topButton}
                  onClick={() => navigate(`/concerts/${concert.id}/edit`)}
                >
                  <Edit size={13} />
                  Edit Concert
                </Button>
              )}
              {loginStatus.loggedIn && (
                <Button
                  variant="outline-danger"
                  style={styles.topButton}
                  onClick={handleDelete}
                >
                  <Trash size={13} />
                  Delete
                </Button>
              )}
            </Col>
          </Row>

          <Row>
            <Col lg={4}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  style={{
                    width: '100%',
                    maxWidth: '360px',
                    height: '290px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    display: 'block',
                    boxShadow: '0 6px 18px var(--setlog-card-bg)',
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
                  <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2px', marginTop: 0, color: 'var(--setlog-card-text)' }}>{concert.artist}</h1>

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
                      <span
                        style={{
                          fontSize: '1.55rem',
                          color: 'var(--setlog-rating-empty)',
                        }}
                        aria-hidden
                      >
                        <span style={{ color: 'var(--setlog-rating-filled)' }}>{'★'.repeat(concert.rating)}</span>
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
                  <FileText size={16} color='var(--setlog-primary)' />
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
                    color: concert.notes?.trim() ? 'var(--setlog-card-text)' : 'var(--setlog-card-text-secondary)',
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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        width: '100%',
                        flexWrap: 'wrap',
                      }}
                    >
                      <ListMusic size={16} color='var(--setlog-primary)' />
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--setlog-card-text)' }}>
                        SETLIST
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--setlog-card-text-secondary)', marginLeft: 'auto' }}>
                        {setlistSongs.length} songs
                      </span>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => void exportSetlistToSpotify()}
                        disabled={playlistStatus.busy || spotifyLoading || spotifyAuthenticating || setlistSongs.length === 0}
                        style={{ fontWeight: 700 }}
                      >
                        {playlistStatus.busy || spotifyAuthenticating ? (
                          <>
                            <Spinner animation="border" size="sm" style={{ marginRight: '0.4rem' }} />
                            Creating...
                          </>
                        ) : (
                          currentPlaylistUrl ? 'Recreate Spotify Playlist' : 'Create Spotify Playlist'
                        )}
                      </Button>
                      {currentPlaylistUrl ? (
                        <Button
                          as="a"
                          href={currentPlaylistUrl}
                          target="_blank"
                          rel="noreferrer"
                          variant="success"
                          size="sm"
                          style={{ fontWeight: 700 }}
                        >
                          Open Playlist
                        </Button>
                      ) : null}
                    </div>
                  }
                >
                  {playlistStatus.error ? (
                    <Alert variant="danger" style={{ marginBottom: '0.9rem' }}>
                      {playlistStatus.error}
                    </Alert>
                  ) : null}

                  {playlistStatus.result ? (
                    <Alert variant="success" style={{ marginBottom: '0.9rem' }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                        Playlist created in Spotify.
                      </div>
                      <div>
                        Added {playlistStatus.result.matchedCount} song
                        {playlistStatus.result.matchedCount === 1 ? '' : 's'} to{' '}
                        {playlistStatus.result.playlistName}.
                      </div>
                      {playlistStatus.result.unmatchedSongs.length > 0 ? (
                        <div style={{ marginTop: '0.45rem' }}>
                          Could not match: {playlistStatus.result.unmatchedSongs.join(', ')}
                        </div>
                      ) : null}
                      {playlistStatus.result.warning ? (
                        <div style={{ marginTop: '0.45rem' }}>
                          {playlistStatus.result.warning}
                        </div>
                      ) : null}
                      {playlistStatus.result.playlistUrl ? (
                        <div style={{ marginTop: '0.55rem' }}>
                          <a
                            href={playlistStatus.result.playlistUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open playlist in Spotify
                          </a>
                        </div>
                      ) : null}
                    </Alert>
                  ) : null}

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
                    <div style={{ color: 'var(--setlog-card-text-secondary)' }}>No setlist available.</div>
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

                  <div style={styles.infoLabel}>Spotify Playlist</div>
                  <div style={styles.infoValue}>
                    {currentPlaylistUrl ? (
                      <a href={currentPlaylistUrl} target="_blank" rel="noreferrer">
                        {currentPlaylistName}
                      </a>
                    ) : (
                      'No playlist saved yet.'
                    )}
                  </div>

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
                          fontSize: '0.9rem',
                          lineHeight: 1,
                          letterSpacing: '1px',
                          color: 'var(--setlog-rating-empty)',
                        }}
                        aria-hidden
                      >
                        <span style={{ color: 'var(--setlog-rating-filled)' }}>{'★'.repeat(concert.rating)}</span>
                        {'☆'.repeat(5 - concert.rating)}
                      </span>

                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--setlog-card-text)',
                          lineHeight: 1.6,
                        }}
                      >
                        {concert.rating}.0
                      </span>

                      <span
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--setlog-card-text-secondary)',
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
    </section>
  )
}

export default ConcertDetailPage