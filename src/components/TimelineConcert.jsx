import { useContext } from 'react'
import { Clock, Trash } from 'lucide-react'
import { Row, Col, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { ConcertsContext } from '../contexts/concertsContext.js'

function TimelineConcert({ concert }) {
    const { deleteConcert } = useContext(ConcertsContext)
    const navigate = useNavigate()

    function handleDelete() {
        const ok = window.confirm(
            `Remove "${concert.artist}" (${concert.date}) from your timeline?`,
        )
        if (ok) deleteConcert(concert.id)
    }

    function handleViewDetails() {
        navigate(`/concerts/${concert.id}`)
    }
    const setlistCount = Array.isArray(concert.setlist) ? concert.setlist.length : null
    const songCount = typeof setlistCount === 'number' ? setlistCount : (concert.songCount ?? 0)
    const imageUrl = typeof concert.image === 'string' ? concert.image.trim() : ''

    const [year, month, day] = concert.date.split('-').map(Number)
    const monthLabel = new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
    }).toUpperCase()

    const styles = {
        concertCard: {
            background: 'var(--setlog-card-bg)',
            border: '1px solid var(--setlog-card-border)',
            borderRadius: '16px',
            padding: '14px 16px',
            width: '100%',
            boxShadow: '0 4px 14px var(--setlog-card-bg)',
            display: 'flex',
            gap: '16px'
        },
        dateCard: {
            border: '1px solid var(--setlog-card-border)',
            background: 'var(--setlog-card-bg-secondary)',
            borderRadius: '16px',
            overflow: 'hidden',
            textAlign: 'center',
            width: '115px',
            boxShadow: '0 4px 14px var(--setlog-card-bg)',
        },
        dateMonth: {
            background: 'var(--setlog-primary)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '4px',
            fontSize: '18px'
        },
        dateDay: {
            fontSize: '2rem',
            fontWeight: 800,
            color: "var(--setlog-card-text)",
            lineHeight: 1,
            paddingTop: '10px',
        },

        dateYear: {
            fontSize: '0.8rem',
            color: "var(--setlog-card-text-secondary)",
            padding: '6px 0 10px',
        },
        concertTags: {
            fontSize: "15px",
            fontWeight: "700",
            padding: "4px 10px",
            borderRadius: "32px"
        }
    }

    return (
        <div
            style={{
                ...styles.concertCard,
                cursor: 'pointer',
            }}
            onClick={handleViewDetails}
        >
            { /* Date Card */}
            <Col xs="auto">
                <div style={styles.dateCard}>
                    <div style={styles.dateMonth}>{monthLabel}</div>
                    <div style={styles.dateDay}>{day}</div>
                    <div style={styles.dateYear}>{year}</div>
                </div>
            </Col>

            { /* Concert Image */}
            <Col xs="auto">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={concert.artist}
                        style={{ width: "250px", height: "125px", objectFit: "cover", borderRadius: "10px", marginBottom: "6px" }}
                    />
                ) : (
                    <div
                        aria-hidden
                        style={{
                            width: "250px",
                            height: "125px",
                            borderRadius: "10px",
                            marginBottom: "6px",
                            background: "var(--setlog-card-bg-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--setlog-card-text-secondary)",
                            fontSize: "13px",
                            fontWeight: 600,
                        }}
                    >
                        No image
                    </div>
                )}
            </Col>

            { /* Concert Information */}
            <Col>
                <div style={{ fontSize: "24px", fontWeight: "700", marginBottom: "2px", color: "var(--setlog-card-text)"}}>{concert.artist}</div>
                <div style={{ fontSize: "14px", fontStyle: "italic", color: "var(--setlog-card-text-secondary)", marginBottom: "6px", lineHeight: "1.05" }}>
                    {concert.venue} • {concert.city}
                </div>

                { /* Rating Row */}
                <Row style={{ alignItems: "center", marginBottom: "10px" }}>
                    <Col xs="auto">
                        <span style={{ color: "orange", fontSize: "24px", lineHeight: "1" }}>
                            {'★'.repeat(concert.rating)}
                            {'☆'.repeat(5 - concert.rating)}
                        </span>
                    </Col>
                    <Col>
                        <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--setlog-card-text)" }}>
                            {concert.rating}.0
                        </span>
                    </Col>

                    <Col xs="auto">
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

                { /* Song Count Row */}
                <Row style={{ alignItems: "center" }}>
                    <Col xs="auto">
                        <Clock size={16} style={{color: 'var(--setlog-card-text)'}}/>
                    </Col>
                    <Col xs="auto">
                        <span style={{ fontSize: "14px", fontWeight: "200", color: "var(--setlog-card-text)" }}>{songCount} songs</span>
                    </Col>

                    <Col
                        style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'flex-end',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Button
                            style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '700' }}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleViewDetails()
                            }}
                        >
                            View Details
                        </Button>
                        <Button
                            variant="outline-danger"
                            style={{ padding: '6px 12px', fontSize: '13px', fontWeight: '700', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDelete()
                            }}
                        >
                            <Trash size={16} />
                            Delete
                        </Button>
                    </Col>

                </Row>
            </Col>
        </div>
    )
}

export default TimelineConcert