import { useContext, useState } from 'react'
import { Clock, Trash } from 'lucide-react'
import { Row, Col, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'
import { ConfirmDialog } from './ConfirmDialog.jsx'

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

    const setlistCount = Array.isArray(concert.setlist) ? concert.setlist.length : null
    const songCount = typeof setlistCount === 'number' ? setlistCount : (concert.songCount ?? 0)
    const imageUrl = typeof concert.image === 'string' ? concert.image.trim() : ''

    const [year, month, day] = concert.date.split('-').map(Number)
    const dateLabel = new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
    const cardAriaLabel = `View details for ${concert.artist}, ${dateLabel}`
    const monthLabel = new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
    }).toUpperCase()

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
                        className="timeline-concert-image timeline-concert-image-placeholder"
                    >
                        No image
                    </div>
                )}
            </Col>

            { /* Concert Information */}
            <Col className="timeline-details-column">
                <div className="timeline-concert-title">{concert.artist}</div>
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