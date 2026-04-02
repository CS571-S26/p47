import { useState } from 'react'
import { Card, Button, Row, Col } from 'react-bootstrap'

function MapsMarkerPopup({ concerts }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const concert = concerts[currentIndex]

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
    <Card style={{ width: "16rem", padding: "0.75rem" }}>
      {/* Concert Image */}
      <img
        src={concert.image}
        alt={concert.artist}
        style={{
          width: "100%",
          height: "120px",
          objectFit: "cover",
          borderRadius: "0.5rem",
          marginBottom: "0.5rem"
        }}
      />

      {/* Formatted Date */}
      <text style={{ fontSize: "0.9rem", color: "gray" }}>
        {new Date(concert.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </text>

      {/* Artist */}
      <text style={{
        marginTop: "0.25rem",
        fontSize: "24px",
        fontWeight: 700
      }}>
        {concert.artist}
      </text>

      {/* Venue */}
      <text style={{
        marginBottom: "0.25rem",
        lineHeight: 1.05,
        fontSize: "14px",
        fontStyle: "italic",
        color: "gray"
      }}>
        {concert.venue}
      </text>

      {/* Rating Row */}
      <Row className="align-items-center">
        <Col xs="auto">
          <text style={{ color: "orange", fontSize: "24px", lineHeight: "1" }}>
            {'★'.repeat(concert.rating)}
            {'☆'.repeat(5 - concert.rating)}
          </text>
        </Col>
        <Col xs="auto">
          <text style={{ fontSize: "16px", fontWeight: "700" }}>{concert.rating}.0</text>
        </Col>
      </Row>

      {/* Navigation & View Show Buttons */}
      {concerts.length > 1 ? (
        <>
          <Row className="align-items-center">

            <Col xs="auto">
              <Button variant="secondary" onClick={handlePrev} style={styles.navButtonText}>
                ←
              </Button>
            </Col>

            <Col>
              <Button variant="primary" style={styles.navButton}>View Show</Button>
            </Col>

            <Col xs="auto">
              <Button variant="secondary" onClick={handlePrev} style={styles.navButtonText}>
                →
              </Button>
            </Col>

          </Row>

          {concerts.length > 1 && (
            <text style={{ fontSize: "15px", fontWeight: "600", textAlign: "center" }}>
              Show {currentIndex + 1} of {concerts.length}
            </text>
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