import { useContext } from 'react'
import TimelineConcert from '../components/TimelineConcert'
import TimelineStats from '../components/TimelineStats'
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap'
import { Plus } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { useAuth } from '../contexts/authContext.js'

function TimelinePage() {
  const { concerts, loading: concertsLoading } = useContext(ConcertsContext)
  const { loginStatus, loading: authLoading } = useAuth()

  const sorted = [...concerts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  if (authLoading) {
    return (
      <Container fluid style={{ padding: '1rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '45vh',
          }}
        >
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading session…</span>
          </Spinner>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid style={{ padding: '1rem' }}>
      <Row>
        <Col md={2}>
          <TimelineStats />
          {!loginStatus.loggedIn ? (
            <div
              style={{
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid var(--setlog-card-border)',
                background: 'var(--setlog-card-bg)',
                marginTop: '3rem'
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--setlog-card-text)' }}>
                Log in to see your shows
              </div>
              <p style={{ marginBottom: '1rem', color: 'var(--setlog-card-text-secondary' }}>
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
          ) : null}
        </Col>
        <Col>
          <Row style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Col xs="auto">
              <div style={{ fontSize: '48px', fontWeight: '700', color: 'var(--setlog-primary-text)' }}>
                {!loginStatus.loggedIn ? "Demo Concert Timeline" : "My Concert Timeline"}
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
              color: 'var(--setlog-secondary-text)'
            }}
          >
            {loginStatus.loggedIn ? 'Your logged shows, newest first' : 'Sample concerts, newest first'}
          </div>

          {!loginStatus.loggedIn ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sorted.map((concert) => (
                  <TimelineConcert key={concert.id} concert={concert} />
                ))}
              </div>

            </>

          ) : concertsLoading && sorted.length === 0 ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading your shows…</span>
              </Spinner>
            </div>
          ) : sorted.length === 0 ? (
            <div
              style={{
                maxWidth: '520px',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid var(--setlog-card-border)',
                background: 'var(--setlog-card-bg)',
              }}
            >
              <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--setlog-card-text)' }}>
                No shows yet
              </div>
              <p style={{ marginBottom: '1rem', color: 'var(--setlog-card-text-secondary' }}>
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
