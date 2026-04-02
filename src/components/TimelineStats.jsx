import { Card, Col, Row } from 'react-bootstrap'
import { Calendar } from 'lucide-react'

import { stats } from '../data/MockConcerts'
import { colors } from "../data/Colors"

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
        <div style={{fontSize: "20px", fontWeight: "500", marginBottm: "2px", lineHeight: "1.05"}}>Your Stats</div>
        <Row>
          <Calendar style={{color: colors.setlogPrimary}} />
          <div>gfsdfs</div>
        </Row>
      </Col>
    </Card>
  )
}

export default TimelineStats