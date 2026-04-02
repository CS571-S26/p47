import { concerts } from '../data/MockConcerts'
import TimelineConcert from '../components/TimelineConcert'
import TimelineStats from '../components/TimelineStats'
import { Container, Row, Col } from 'react-bootstrap'

function TimelinePage() {
  return (
    <Container style={{padding: "1rem"}}>
      <Row>
        <Col md={2}>
          <TimelineStats/>
        </Col>
        <Col md={8}>
        <div style={{fontSize: "48px", fontWeight: "700"}}>My Concert Timeline</div>
        <div style={{fontSize: "24px", fontWeight: "300", marginBottom: "15px"}}>Your logged shows, newest first</div>
          {concerts.map((concert) => (
            <TimelineConcert key={concert.id} concert={concert} />
          ))}
        </Col>
      </Row>
    </Container>
  )
}

export default TimelinePage
