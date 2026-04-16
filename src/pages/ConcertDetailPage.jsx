import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Row, Col, Button } from 'react-bootstrap'
import { ArrowLeft, Trash, Edit } from 'lucide-react'

import { ConcertsContext } from '../contexts/concertsContext.js'

function ConcertDetailPage() {
  const { concerts, deleteConcert } = useContext(ConcertsContext)
  const navigate = useNavigate()
  const { id } = useParams()

  const concert = concerts.find((c) => c.id === id)

  function handleDelete() {
    const ok = window.confirm(
      `Remove "${concert.artist}" (${concert.date}) from your timeline?`,
    )
    if (ok) {
      deleteConcert(concert.id)
      navigate('/')
    }
  }

  if (!concert) {
    return (
      <Card>
        <Card.Body>
          NO CONCERT TODO
        </Card.Body>
      </Card>
    )
  }

  const styles = {
    topButton: {
      fontWeight: '700',
      borderRadius: '12px',
      padding: '6px 12px',
      fontSize: '18px',
      display: 'inline-flex',
      gap: '6px',
      alignItems: 'center'
    }
  }

  return (
    <section
      id="center"
      style={{
        flex: 1,
        width: '100%',
        padding: '1.25rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '1600px',
          borderRadius: '20px',
          border: '1px solid #dbe3ea',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          padding: '0.75rem',
        }}
      >
        <Card.Body>
          <Row style={{ marginBottom: '1rem', alignItems: 'center' }}>
            <Col>
              <Button
                variant="link"
                onClick={() => navigate('/')}
                style={{
                  padding: 0,
                  textDecoration: 'none',
                  fontWeight: 700,
                  color: '#4338ca',
                }}
              >
                <ArrowLeft size={18} style={{ marginRight: '6px' }} />
                Back to Timeline
              </Button>
            </Col>
            <Col xs="auto" style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline-primary" style={styles.topButton}>
                <Edit size={16} />
                Edit Concert
              </Button>
              <Button
                variant="outline-danger"
                style={styles.topButton}
                onClick={handleDelete}
              >
                <Trash size={16} />
                Delete
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </section>
  )
}

export default ConcertDetailPage

