import { useContext } from 'react'
import TimelineConcert from '../components/TimelineConcert'
import TimelineStats from '../components/TimelineStats'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'

function TimelinePage() {
  const { concerts } = useContext(ConcertsContext)
  const { loginStatus } = useAuth()

  const sorted = [...concerts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <Container fluid style={{ padding: '1rem' }}>
      <Row>
        <Col md={2}>
          <TimelineStats />
        </Col>
        <Col>
          <Row style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Col xs="auto">
              <div style={{ fontSize: '48px', fontWeight: '700' }}>
                My Concert Timeline
              </div>
            </Col>
            <Col xs="auto">
              {loginStatus.loggedIn ? (
                <Button
                  as={NavLink}
                  to="/add-concert"
                  style={{
                    padding: '6px 12px',
                    fontSize: '16px',
                    fontWeight: '700',
                    marginLeft: 'auto',
                    height: 'fit-content',
                  }}
                >
                  <Plus size={18} /> Log a New Show
                </Button>
              ) : (
                <Button
                  as={NavLink}
                  to="/login"
                  style={{
                    padding: '6px 12px',
                    fontSize: '16px',
                    fontWeight: '700',
                    marginLeft: 'auto',
                    height: 'fit-content',
                  }}
                >
                  Log in to add shows
                </Button>
              )}
            </Col>
          </Row>

          <div
            style={{
              fontSize: '24px',
              fontWeight: '300',
              marginBottom: '15px',
            }}
          >
            Your logged shows, newest first
          </div>

          {!loginStatus.loggedIn ? (
            <div
              style={{
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                Log in to see your shows
              </div>
              <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                Your logged concerts are tied to your account on this device. Create an account or
                log in to view and add shows.
              </p>
              <Button as={NavLink} to="/login" variant="primary" className="me-2">
                Log in
              </Button>
              <Button as={NavLink} to="/register" variant="outline-primary">
                Register
              </Button>
            </div>
          ) : sorted.length === 0 ? (
            <div
              style={{
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: '#f9fafb',
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                No shows yet
              </div>
              <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
                Log a concert to build your timeline. Data is saved in this browser only
                (local storage).
              </p>
              <Button as={NavLink} to="/add-concert" variant="primary">
                <Plus size={18} className="me-1" />
                Log a New Show
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sorted.map((concert) => (
                <TimelineConcert key={concert.id} concert={concert} />
              ))}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default TimelinePage
