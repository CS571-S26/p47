import { Row, Col } from 'react-bootstrap'
import { colors } from "../data/Colors"

function StatRow({ icon, value, label }) {
  return (
    <Row className="align-items-center mb-3">
      <Col xs="auto">
        <div
          style={{
            backgroundColor: "#f1f5f9",
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
            color: colors.setlogPrimary
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: "14px",
            color: "#64748b"
          }}
        >
          {label}
        </div>
      </Col>
    </Row>
  )
}

export default StatRow