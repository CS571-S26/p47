import { Card, Col, Row } from 'react-bootstrap'
import { Calendar } from 'lucide-react'

import { stats } from '../data/MockConcerts'
import './TimelineStats.css'

function TimelineStats() {

  return (
    <Card
      style={{
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        width: '100%',
        maxWidth: '320px',
      }}
    >
      <Col>
        <div className="timeline-stats-title">Your Stats</div>
        <Row>
          <Calendar className="timeline-stats-icon" />
          <div>gfsdfs</div>
        </Row>

      </Col>
    </Card>
  )
}

export default TimelineStats