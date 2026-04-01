import { Card, Col, Row } from 'react-bootstrap'

import { Calendar, CirclePlus, Settings, List, Search, Moon, User } from 'lucide-react'

import './TimelineStats.css'

function TimelineStats() {

  return (
    <Card className="timeline-stats-card">
      <Col>
        <div className="timeline-stats-title">Your Stats</div>
        <Row>
          <Calendar className="timeline-stats-icon"/>
        </Row>

      </Col>
    </Card>
  )
}

export default TimelineStats