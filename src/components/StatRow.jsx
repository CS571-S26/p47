import { Row, Col } from 'react-bootstrap'

function StatRow({ icon, value, label }) {
  return (
    <Row className="align-items-center mb-3">
      <Col xs="auto">
        <div
          style={{
            backgroundColor: "var(--setlog-card-bg-secondary)",
            borderRadius: "50%",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {icon}
        </div>
      </Col>

      <Col>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: 'var(--setlog-primary)'
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: "14px",
            color: 'var(--setlog-card-text-secondary)'
          }}
        >
          {label}
        </div>
      </Col>
    </Row>
  )
}

export default StatRow