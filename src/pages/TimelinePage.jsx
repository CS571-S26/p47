import { concerts } from '../data/MockConcerts'
import TimelineConcert from '../components/TimelineConcert'
import TimelineStats from '../components/TimelineStats'
import { Container, Row, Col } from 'react-bootstrap'

function TimelinePage() {
  return (
    <Container className="timeline-page">
      <Row>
        <Col md={2}>
          <TimelineStats />
        </Col>
        <Col md={8}>
        <div className="timeline-title">My Concert Timeline</div>
        <div className="timeline-subtitle">Your logged shows, newest first</div>
          {concerts.map((concert) => (
            <TimelineConcert key={concert.id} concert={concert} />
          ))}
        </Col>
      </Row>
    </Container>
  )
}

export default TimelinePage
