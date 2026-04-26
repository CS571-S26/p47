import { useContext, useState } from 'react'
import { Clock, Trash } from 'lucide-react'
import { Row, Col, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { getFlattenedSongs } from '../utils/setlistHelpers.js'
import { useAuth } from '../contexts/authContext.js'
import { ConfirmDialog } from './ConfirmDialog.jsx'
import { concertDateToDate, daysUntilLocalDate } from '../utils/localDate.js'

function TimelineConcert({ concert }) {
    const { deleteConcert } = useContext(ConcertsContext)
    const navigate = useNavigate()

    const { loginStatus } = useAuth()
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

    function confirmDelete() {
        deleteConcert(concert.id)
        setDeleteConfirmOpen(false)
    }

    function handleViewDetails() {
        navigate(`/concerts/${concert.id}`, {
            state: { from: '/', backLabel: 'Back to Timeline' },
        })
    }

    const flat = getFlattenedSongs(concert)
    const songCount = flat.length > 0 ? flat.length : (Number.isFinite(Number(concert.songCount)) ? Number(concert.songCount) : 0)
    const imageUrl = typeof concert.image === 'string' ? concert.image.trim() : ''

    const concertDate = concertDateToDate(concert.date)
    const hasValidDate = !Number.isNaN(concertDate.getTime())
    const year = hasValidDate ? concertDate.getFullYear() : ''
    const day = hasValidDate ? concertDate.getDate() : ''
    const dateLabel = hasValidDate ? concertDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }) : 'date unavailable'
    const daysUntil = daysUntilLocalDate(concert.date)
    const countdownLabel = daysUntil > 0 ? `In ${daysUntil} day${daysUntil === 1 ? '' : 's'}` : ''
    const cardAriaLabel = `View details for ${concert.artist}, ${dateLabel}${countdownLabel ? `, ${countdownLabel}` : ''}`
    const monthLabel = hasValidDate ? concertDate.toLocaleDateString('en-US', {
        month: 'short',
    }).toUpperCase() : ''

    return (
        <>
            <ConfirmDialog
                show={deleteConfirmOpen}
                onHide={() => setDeleteConfirmOpen(false)}
                title="Remove concert?"
                confirmLabel="Remove"
                cancelLabel="Cancel"
                confirmVariant="danger"
                onConfirm={confirmDelete}
            >
                Remove &quot;{concert.artist}&quot; ({concert.date}) from your timeline?
            </ConfirmDialog>
            <div
                className="timeline-concert-card"
                role="article"
                aria-label={cardAriaLabel}
                style={{ cursor: 'pointer' }}
                onClick={handleViewDetails}
            >
                { /* Date Card */}
                <Col xs="auto" className="timeline-date-column">
                    <div className="timeline-date-card">
                        <div className="timeline-date-month">{monthLabel}</div>
                        <div className="timeline-date-day">{day}</div>
                        <div className="timeline-date-year">{year}</div>
                    </div>
                </Col>

                { /* Concert Image */}
                <Col xs="auto" className="timeline-image-column">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt=""
                            className="timeline-concert-image"
                        />
                    ) : (
                        <div
                            aria-hidden
                            className="timeline-concert-image"
                            style={{
                                background: 'var(--setlog-no-image-bg)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                border: '1px solid var(--setlog-card-border)',
                                color: 'var(--white)',
                                fontWeight: 800,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: '0.72rem',
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    opacity: 0.85,
                                    marginBottom: '0.25rem',
                                }}
                            >
                                SetLog
                            </div>

                            <div
                                style={{
                                    fontSize: '1.15rem',
                                    lineHeight: 1.15,
                                    maxWidth: '90%',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {concert.artist || 'Unknown Artist'}
                            </div>

                            <div
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                    maxWidth: '85%',
                                    opacity: 0.85,
                                    marginTop: '0.5rem',
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                }}
                            >
                                {concert.venue || 'Unknown Venue'}
                            </div>
                        </div>
                    )}
                </Col>

                { /* Concert Information */}
                <Col className="timeline-details-column">
                    <div className="timeline-concert-title-row">
                        <div className="timeline-concert-title">{concert.artist}</div>
                        {countdownLabel && (
                            <span className="timeline-concert-tag timeline-concert-tag-countdown timeline-concert-title-countdown">
                                {countdownLabel}
                            </span>
                        )}
                    </div>
                    <div className="timeline-concert-venue">
                        {concert.venue} • {concert.city}
                    </div>

                    { /* Rating Row */}
                    <Row className="timeline-rating-row">
                        <Col xs="auto">
                            <span
                                className="timeline-rating-stars"
                                aria-hidden
                            >
                                <span style={{ color: 'var(--setlog-rating-filled)' }}>{'★'.repeat(concert.rating)}</span>
                                {'☆'.repeat(5 - concert.rating)}
                            </span>
                        </Col>
                        <Col>
                            <span className="timeline-rating-value">
                                {concert.rating}.0
                            </span>
                        </Col>

                        <Col
                            xs={12}
                            md="auto"
                            className="timeline-tags-column"
                        >
                            <span className="timeline-concert-tag timeline-concert-tag-genre">
                                {concert.genre}
                            </span>

                            {concert.attended && (
                                <span className="timeline-concert-tag timeline-concert-tag-attended">
                                    Attended
                                </span>
                            )}

                            {concert.favorite && (
                                <span className="timeline-concert-tag timeline-concert-tag-favorite">
                                    ★
                                </span>
                            )}
                        </Col>


                    </Row>

                    { /* Song Count Row */}
                    <Row className="timeline-song-row">
                        <Col xs="auto">
                            <Clock size={16} style={{ color: 'var(--setlog-card-text)' }} aria-hidden />
                        </Col>
                        <Col xs="auto">
                            <span className="timeline-song-count">{songCount} songs</span>
                        </Col>

                        <Col
                            className="timeline-actions-column"
                        >
                            <Button
                                type="button"
                                className="timeline-action-button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetails()
                                }}
                            >
                                View Details
                            </Button>
                            {loginStatus.loggedIn && (
                                <Button
                                    type="button"
                                    variant="outline-danger"
                                    className="timeline-action-button timeline-delete-button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDeleteConfirmOpen(true)
                                    }}
                                >
                                    <Trash size={16} aria-hidden />
                                    Delete
                                </Button>)}
                        </Col>

                    </Row>
                </Col>
            </div>
        </>
    )
}

export default TimelineConcert