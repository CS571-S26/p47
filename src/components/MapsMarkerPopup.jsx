import { useState } from 'react'
import { Card, Button, Row, Col } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'

function MapsMarkerPopup({ concerts }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const navigate = useNavigate()

  const concert = concerts[currentIndex]
  const imageUrl = typeof concert.image === 'string' ? concert.image.trim() : ''

  function handlePrev() {
    setCurrentIndex((prev) =>
      prev === 0 ? concerts.length - 1 : prev - 1
    )
  }

  function handleNext() {
    setCurrentIndex((prev) =>
      prev === concerts.length - 1 ? 0 : prev + 1
    )
  }

  function handleViewDetails() {
    navigate(`/concerts/${concert.id}`, {
      state: { from: '/maps', backLabel: 'Back to Map' },
    })
  }

  const styles = {
    navButtonText: {
      padding: "6px 10px",
      border: "none"
    },
    navButton: {
      width: "100%",
      padding: "6px",
      fontSize: "16px",
      fontWeight: "700",
      border: "none"
    }
  }

  return (
    <Card style={{ width: "16rem", padding: "0.75rem", border: "none", background: "var(--setlog-card-bg)" }}>
      {/* Concert Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={concert.artist}
          style={{
            width: "100%",
            height: "120px",
            objectFit: "cover",
            borderRadius: "0.5rem",
            marginBottom: "0.5rem",
          }}
        />
      ) : (
        <div
          aria-hidden
          style={{
            width: "100%",
            height: "120px",
            borderRadius: "0.5rem",
            marginBottom: "0.5rem",
            background: "var(--setlog-card-bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--setlog-card-text-secondary)",
            border: '1px solid var(--setlog-card-border)',
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          No image
        </div>
      )}

      {/* Formatted Date */}
      <span style={{ fontSize: "0.9rem", color: "var(--setlog-card-text-secondary)" }}>
        {new Date(concert.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>

      {/* Artist */}
      <span style={{
        marginTop: "0.25rem",
        fontSize: "24px",
        fontWeight: 700,
        color: "var(--setlog-card-text)"
      }}>
        {concert.artist}
      </span>

      {/* Venue */}
      <span style={{
        marginBottom: "0.25rem",
        lineHeight: 1.05,
        fontSize: "14px",
        fontStyle: "italic",
        color: "var(--setlog-card-text-secondary)"
      }}>
        {concert.venue}
      </span>

      {/* Rating Row */}
      <Row className="align-items-center">
        <Col xs="auto">
          <span style={{ color: "orange", fontSize: "24px", lineHeight: "1" }}>
            {'★'.repeat(concert.rating)}
            {'☆'.repeat(5 - concert.rating)}
          </span>
        </Col>
        <Col xs="auto">
          <span style={{ fontSize: "16px", fontWeight: "700", color: "var(--setlog-card-text)" }}>{concert.rating}.0</span>
        </Col>
      </Row>

      {/* Navigation & View Show Buttons */}
      {concerts.length > 1 ? (
        <>
          <Row className="align-items-center">

            <Col xs="auto">
              <Button variant="secondary" onClick={handlePrev} style={styles.navButtonText}>
                <ArrowLeft size={14} style={{ marginRight: '5px' }} />
              </Button>
            </Col>

            <Col>
              <Button variant="primary" style={styles.navButton} onClick={() => { handleViewDetails() }}>View Details</Button>
            </Col>

            <Col xs="auto">
              <Button variant="secondary" onClick={handleNext} style={styles.navButtonText}>
                <ArrowRight size={14} style={{ marginRight: '5px' }} />
              </Button>
            </Col>

          </Row>

          {concerts.length > 1 && (
            <span style={{ fontSize: "15px", fontWeight: "600", textAlign: "center", color: "var(--setlog-card-text-secondary)" }}>
              Show {currentIndex + 1} of {concerts.length}
            </span>
          )}
        </>
      ) : (
        <Button variant="primary" style={styles.navButton}>View Show</Button>
      )
      }
    </Card>
  )
}

export default MapsMarkerPopup