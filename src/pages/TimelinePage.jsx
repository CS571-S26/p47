import TimelineConcert from '../components/TimelineConcert'
import TimelineStats from '../components/TimelineStats'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { concerts } from '../data/MockConcerts'

function TimelinePage() {
  return (
    <Container fluid style={{ padding: "1rem" }}>
      <Row>
        <Col md={2}>
          <TimelineStats />
        </Col>
        <Col>
          <Row style={{ alignItems: "center", justifyContent: "space-between"}}>
            <Col xs="auto">
              <div style={{ fontSize: "48px", fontWeight: "700" }}>My Concert Timeline</div>
            </Col>
            <Col xs="auto">
              <Button
                as={NavLink}
                to="/add-concert"
                style={{ padding: "6px 12px", fontSize: "16px", fontWeight: "700", marginLeft: "auto", height: "fit-content" }}
              >
                <Plus size={18} /> Log a New Show
              </Button>
            </Col>
          </Row>

          <div style={{ fontSize: "24px", fontWeight: "300", marginBottom: "15px" }}>Your logged shows, newest first</div>
          {concerts.map((concert) => (
            <TimelineConcert key={concert.id} concert={concert} />
          ))}
        </Col>
      </Row>
    </Container>
  )
}

export default TimelinePage
