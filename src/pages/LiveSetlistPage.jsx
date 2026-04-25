import { useEffect, useState } from 'react'
import { Button, Form, Spinner, Alert, Col, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, MapPin } from 'lucide-react'

import SectionCard from '../components/SectionCard.jsx'
import { searchFirstSetlist, extractSongTitles, extractSetlistSections } from '../utils/setlistfm.js'

import './LiveSetlistPage.css'

const LIVE_CONCERT_STORAGE_KEY = 'p47:liveConcert'

function readLiveConcert() {
    try {
        const raw = localStorage.getItem(LIVE_CONCERT_STORAGE_KEY)
        if (!raw) return { artist: '', venue: '', date: new Date().toISOString().slice(0, 10), tracking: false }

        const saved = JSON.parse(raw)

        return {
            artist: typeof saved.artist === 'string' ? saved.artist : '',
            venue: typeof saved.venue === 'string' ? saved.venue : '',
            date: typeof saved.date === 'string' && saved.date ? saved.date : new Date().toISOString().slice(0, 10),
            tracking: saved.tracking === true,
        }
    } catch {
        return { artist: '', venue: '', date: new Date().toISOString().slice(0, 10) }
    }
}

function LiveSetlistPage() {
    const savedLiveConcert = readLiveConcert()

    const [artist, setArtist] = useState(savedLiveConcert.artist)
    const [venue, setVenue] = useState(savedLiveConcert.venue)
    const [date, setDate] = useState(savedLiveConcert.date)
    const [tracking, setTracking] = useState(savedLiveConcert.tracking)

    const [songs, setSongs] = useState([])
    const [sections, setSections] = useState([])
    const [loading, setLoading] = useState(false)
    const [lastChecked, setLastChecked] = useState(null)
    const [message, setMessage] = useState('')

    const navigate = useNavigate()

    const styles = {
        formLabel: {
            fontWeight: '600',
            marginBottom: '0.4rem',
            marginTop: '0rem',
            color: 'var(--setlog-primary-text)',
            fontSize: '0.95rem',
        }
    }

    async function loadSetlist() {
        if (!artist.trim() || !venue.trim()) {
            setMessage('Enter an artist, venue, and date first.')
            return
        }

        setLoading(true)
        setMessage('')

        try {
            const setlist = await searchFirstSetlist({
                artistName: artist.trim(),
                venueName: venue.trim(),
                date,
            })

            if (!setlist) {
                setSongs([])
                setMessage('No setlist found yet. It may appear once someone updates it.')
            } else {
                const foundSongs = extractSongTitles(setlist)
                const foundSections = extractSetlistSections(setlist)

                setSongs(foundSongs)
                setSections(foundSections)
                setMessage('')
            }

            setLastChecked(new Date())
        } catch {
            setMessage('Could not check the live setlist right now.')
        } finally {
            setLoading(false)
        }
    }

    function saveToLogConcert() {
        navigate('/add-concert', {
            state: {
                liveConcert: {
                    artist,
                    venue,
                    date,
                    setlist: songs,
                },
            },
        })
    }

    useEffect(() => {
        if (!artist.trim() && !venue.trim() && !date) {
            localStorage.removeItem(LIVE_CONCERT_STORAGE_KEY)
            return
        }

        const liveConcert = {
            artist,
            venue,
            date,
            tracking,
        }

        localStorage.setItem(LIVE_CONCERT_STORAGE_KEY, JSON.stringify(liveConcert))
    }, [artist, venue, date, tracking])

    useEffect(() => {
        if (!tracking) return undefined

        loadSetlist()

        const interval = setInterval(() => {
            loadSetlist()
        }, 30000)

        return () => clearInterval(interval)
    }, [tracking])

    return (
        <div style={{ padding: '1rem' }}>
            <h1
                style={{
                    fontSize: 'clamp(32px, 8vw, 48px)',
                    fontWeight: 700,
                    color: 'var(--setlog-primary-text)',
                    marginBottom: '0.25rem',
                }}
            >
                Live Setlist
            </h1>

            <p style={{ color: 'var(--setlog-secondary-text)', marginBottom: '1rem' }}>
                Track an ongoing show and refresh the setlist automatically every 30 seconds.
            </p>

            <Row>
                <Col md={4}>
                    {!tracking ? (
                        <SectionCard title="Choose a Show">
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.formLabel}>Artist</Form.Label>
                                    <Form.Control
                                        value={artist}
                                        onChange={(e) => setArtist(e.target.value)}
                                        placeholder="e.g., Dead & Company"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.formLabel}>Venue</Form.Label>
                                    <Form.Control
                                        value={venue}
                                        onChange={(e) => setVenue(e.target.value)}
                                        placeholder="e.g., Sphere"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label style={styles.formLabel}>Show Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </Form.Group>

                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setTracking(true)
                                            loadSetlist()
                                        }}
                                    >
                                        Track Live Setlist
                                    </Button>

                                    {tracking ? (
                                        <Button
                                            type="button"
                                            variant="outline-danger"
                                            onClick={() => setTracking(false)}
                                        >
                                            Stop Tracking
                                        </Button>
                                    ) : null}
                                </div>
                            </Form>
                        </SectionCard>
                    ) : (
                        <SectionCard title="Current Tracking Show">
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.75rem',
                                }}
                            >
                                <div>
                                    <p
                                        style={{
                                            margin: 0,
                                            marginBottom: '0.25rem',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            color: 'var(--setlog-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                        }}
                                    >
                                        <span className="live-dot"></span>
                                        Now Tracking
                                    </p>

                                    <h2
                                        style={{
                                            fontSize: 'clamp(1.9rem, 6vw, 2.75rem)',
                                            fontWeight: 800,
                                            margin: 0,
                                            color: 'var(--setlog-card-text)',
                                            lineHeight: 1.05,
                                        }}
                                    >
                                        {artist}
                                    </h2>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        color: 'var(--setlog-card-text)',
                                    }}
                                >
                                    <MapPin
                                        size={22}
                                        color="var(--setlog-primary)"
                                        style={{ flexShrink: 0 }}
                                    />

                                    <span
                                        style={{
                                            fontSize: '1.05rem',
                                            fontWeight: 600,
                                            lineHeight: 1.25,
                                        }}
                                    >
                                        {venue}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignSelf: 'flex-start',
                                        borderRadius: '999px',
                                        padding: '0.35rem 0.7rem',
                                        backgroundColor: 'var(--setlog-card-bg-secondary)',
                                        color: 'var(--setlog-secondary-text)',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {date}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline-danger"
                                    onClick={() => setTracking(false)}
                                >
                                    Stop Tracking
                                </Button>

                                <Button
                                    type="button"
                                    onClick={saveToLogConcert}
                                    disabled={!artist.trim() || !venue.trim()}
                                >
                                    Save to Concert Log
                                </Button>
                            </div>
                        </SectionCard>
                    )}
                </Col>

                <Col md={8}>
                    <SectionCard title="Current Setlist">
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Spinner size="sm" />
                                Checking setlist...
                            </div>
                        ) : null}

                        {message ? (
                            <Alert variant="info" className="mt-3 mb-0">
                                {message}
                            </Alert>
                        ) : null}

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                                borderBottom: '1px solid var(--setlog-card-border)',
                                paddingBottom: '0.35rem',
                                marginBottom: '0.65rem',
                            }}
                        >
                            {lastChecked ? (
                                <p
                                    style={{
                                        marginTop: '0.75rem',
                                        color: 'var(--setlog-secondary-text)',
                                        fontSize: '14px',
                                    }}
                                >
                                    Last checked: {lastChecked.toLocaleTimeString()}
                                </p>
                            ) : null}

                            <Button
                                type="button"
                                variant="outline-secondary"
                                onClick={loadSetlist}
                                disabled={loading}
                            >
                                <RefreshCw size={16} style={{ marginRight: '0.35rem' }} />
                                Check Now
                            </Button>
                        </div>



                        {sections.length > 0 ? (
                            <div style={{ marginTop: '1rem' }}>
                                {sections.map((section, sectionIndex) => (
                                    <div key={`${section.name}-${sectionIndex}`} style={{ marginBottom: '1.25rem' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '0.75rem',
                                                borderBottom: '1px solid var(--setlog-card-border)',
                                                paddingBottom: '0.35rem',
                                                marginBottom: '0.65rem',
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    fontSize: '1rem',
                                                    fontWeight: 800,
                                                    color: 'var(--setlog-primary)',
                                                    margin: 0,
                                                }}
                                            >
                                                {section.name}
                                            </h3>

                                            {sectionIndex === 0 ? (
                                                <span
                                                    style={{
                                                        fontSize: '0.85rem',
                                                        fontWeight: 700,
                                                        color: 'var(--setlog-secondary-text)',
                                                    }}
                                                >
                                                    {songs.length} song{songs.length === 1 ? '' : 's'}
                                                </span>
                                            ) : null}
                                        </div>

                                        <ol style={{ marginBottom: 0, color: 'var(--setlog-secondary-text)' }}>
                                            {section.songs.map((song, index) => (
                                                <li key={`${song}-${index}`}>{song}</li>
                                            ))}
                                        </ol>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </SectionCard>
                </Col>
            </Row>



        </div>
    )
}

export default LiveSetlistPage