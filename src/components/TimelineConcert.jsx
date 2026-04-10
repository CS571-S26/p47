import { Clock } from 'lucide-react'
import { Container, Row, Col, Button } from 'react-bootstrap'

import { colors } from "../data/Colors"

function TimelineConcert({ concert }) {
    const date = new Date(concert.date)
    const songCount = concert.songCount ?? 0
    const imageUrl = typeof concert.image === 'string' ? concert.image.trim() : ''

    const month = date.toLocaleDateString('en-US', {
        month: 'short',
    }).toUpperCase()

    const day = date.getDate()
    const year = date.getFullYear()

    const styles = {
        concertCard: {
            background: 'white',
            border: '1px solid lightgray',
            borderRadius: '16px',
            padding: '14px 16px',
            width: '75vw',
            boxShadow: '0 4px 14px lightgray',
        },
        dateCard: {
            border: '1px solid lightgray',
            borderRadius: '16px',
            overflow: 'hidden',
            textAlign: 'center',
            width: '100px',
            boxShadow: '0 4px 14px lightgray',
        },
        dateMonth: {
            background: colors.setlogPrimary,
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '4px',
        },
        dateDay: {
            fontSize: '2rem',
            fontWeight: 800,
            color: "black",
            lineHeight: 1,
            paddingTop: '10px',
        },

        dateYear: {
            fontSize: '0.8rem',
            color: "gray",
            padding: '6px 0 10px',
        },
    }

    return (
        <Container style={styles.concertCard}>
            <Row>
                { /* Date Card */}
                <Col xs="auto">
                    <div style={styles.dateCard}>
                        <div style={styles.dateMonth}>{month}</div>
                        <div style={styles.dateDay}>{day}</div>
                        <div style={styles.dateYear}>{year}</div>
                    </div>
                </Col>

                { /* Concert Image */}
                <Col xs="auto">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={concert.artist}
                            style={{ width: "250px", height: "125px", objectFit: "cover", borderRadius: "10px", marginBottom: "6px" }}
                        />
                    ) : (
                        <div
                            aria-hidden
                            style={{
                                width: "250px",
                                height: "125px",
                                borderRadius: "10px",
                                marginBottom: "6px",
                                background: "#e5e7eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#9ca3af",
                                fontSize: "13px",
                                fontWeight: 600,
                            }}
                        >
                            No image
                        </div>
                    )}
                </Col>

                { /* Concert Information */}
                <Col>
                    <div style={{ fontSize: "24px", fontWeight: "700", marginBottom: "2px", }}>{concert.artist}</div>
                    <div style={{ fontSize: "14px", fontStyle: "italic", color: "gray", marginBottom: "6px", lineHeight: "1.05" }}>{concert.venue} • {concert.city}</div>

                    { /* Rating Row */}
                    <Row style={{ alignItems: "center" }}>
                        <Col xs="auto">
                            <span style={{ background: "#eef2ff", color: "#4f46e5", fontSize: "15px", fontWeight: "700", padding: "4px 10px", borderRadius: "32px" }}>{concert.genre}</span>
                        </Col>
                        <Col xs="auto">
                            <span style={{ color: "orange", fontSize: "24px", lineHeight: "1" }}>
                                {'★'.repeat(concert.rating)}
                                {'☆'.repeat(5 - concert.rating)}
                            </span>
                        </Col>
                        <Col>
                            <span style={{ fontSize: "16px", fontWeight: "700" }}>{concert.rating}.0</span>
                        </Col>
                    </Row>

                    { /* Song Count Row */}
                    <Row style={{ alignItems: "center" }}>
                        <Col xs="auto">
                            <Clock size={16} />
                        </Col>
                        <Col xs="auto">
                            <span style={{ fontSize: "14px", fontWeight: "200" }}>{songCount} songs</span>
                        </Col>

                        <Col style={{ display: "flex" }}>
                            <Button style={{ padding: "6px 12px", fontSize: "13px", fontWeight: "700", marginLeft: "auto" }}>
                                View Details
                            </Button>
                        </Col>

                    </Row>
                </Col>
            </Row>
        </Container>
    )
}

export default TimelineConcert