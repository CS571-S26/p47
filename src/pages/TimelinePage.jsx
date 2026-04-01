import { concerts } from '../data/MockConcerts'
import TimelineConcert from '../components/TimelineConcert'
import TimelineStats from '../components/TimelineStats'
import { Container, Row, Col } from 'react-bootstrap'

function TimelinePage() {
  return (
    <Container>
      <Row>
        <Col md={2}>
          <TimelineStats />
        </Col>
        <Col md={8}>
          {concerts.map((concert) => (
            <TimelineConcert key={concert.id} concert={concert} />
          ))}
        </Col>
      </Row>
    </Container>
  )
}

export default TimelinePage
