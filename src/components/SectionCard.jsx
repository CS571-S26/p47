import { Card } from 'react-bootstrap'

function SectionCard({ title, subtitle, children }) {
  return (
    <Card
      style={{
        width: '100%',
        borderRadius: '18px',
        border: '1px solid #e7ebf0',
        boxShadow: '0 3px 12px rgba(0,0,0,0.04)',
        marginBottom: '0.5rem',
      }}
    >
      <Card.Body style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '0.9rem' }}>
          <div
            style={{
              fontSize: '1.20rem',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                fontSize: '0.92rem',
                color: '#6b7280',
                marginTop: '0.1rem',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {children}
      </Card.Body>
    </Card>
  )
}

export default SectionCard