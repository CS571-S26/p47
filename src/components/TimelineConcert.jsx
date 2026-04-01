import { Clock } from 'lucide-react'
import { Container, Row, Col } from 'react-bootstrap'


import './TimelineConcert.css'

function TimelineConcert({ concert }) {
    const date = new Date(concert.date)

    const month = date.toLocaleDateString('en-US', {
        month: 'short',
    }).toUpperCase()

    const day = date.getDate()
    const year = date.getFullYear()

    return (
        <Container className="timeline-concert-card">
            <Row>
                <Col xs="auto">
                    <div className="timeline-concert-date-card">
                        <div className="timeline-concert-date-month">{month}</div>
                        <div className="timeline-concert-date-day">{day}</div>
                        <div className="timeline-concert-date-year">{year}</div>
                    </div>
                </Col>

                <Col xs="auto">
                    <img
                        src={concert.image}
                        alt={concert.artist}
                        className="timeline-concert-image"
                    />
                </Col>

                <Col>
                    <div className="timeline-concert-artist">{concert.artist}</div>
                    <div className="timeline-concert-venue">{concert.venue} • {concert.city}</div>

                    <div className="timeline-concert-rating-row">
                        <div className='timeline-concert-genre'>{concert.genre}</div>
                        <div className="timeline-concert-stars">
                            {'★'.repeat(concert.rating)}
                            {'☆'.repeat(5 - concert.rating)}
                        </div>
                        <div className="timeline-concert-rating">{concert.rating}.0</div>
                    </div>

                    <div className="timeline-concert-stats-row">
                        <Clock size={16} />
                        <div className="timeline-concert-songcount">{concert.songCount} songs</div>

                        <button className="timeline-concert-view-details">
                            View Details
                        </button>
                    </div>
                </Col>
            </Row>
        </Container>




    )
}

export default TimelineConcert