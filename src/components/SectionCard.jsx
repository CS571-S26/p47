import { Card } from 'react-bootstrap'

function SectionCard({ title, subtitle, children }) {
  return (
    <Card
      style={{
        width: '100%',
        borderRadius: '18px',
        background: 'var(--setlog-card-bg)',
        border: '1px solid var(--setlog-card-border)',
        boxShadow: '0 3px 12px var(--setlog-card-bg)',
        marginBottom: '0.5rem',
      }}
    >
      <Card.Body style={{ padding: '1.25rem' }}>
        <div style={{ marginBottom: '0.9rem' }}>
          <div
            style={{
              fontSize: '1.20rem',
              fontWeight: 700,
              color: 'var(--setlog-card-text)',
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                fontSize: '0.92rem',
                color: 'var(--setlog-card-text-secondary)',
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