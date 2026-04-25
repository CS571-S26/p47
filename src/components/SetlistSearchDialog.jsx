import { Badge, Button, ListGroup, Modal } from 'react-bootstrap'

import { extractSongTitles } from '../utils/setlistfm.js'

function getArtistName(setlist) {
  return typeof setlist?.artist?.name === 'string' && setlist.artist.name.trim()
    ? setlist.artist.name.trim()
    : 'Unknown artist'
}

function getVenueName(setlist) {
  return typeof setlist?.venue?.name === 'string' && setlist.venue.name.trim()
    ? setlist.venue.name.trim()
    : 'Unknown venue'
}

function getLocationLabel(setlist) {
  const city = setlist?.venue?.city
  const parts = [
    typeof city?.name === 'string' ? city.name.trim() : '',
    typeof city?.stateCode === 'string' ? city.stateCode.trim() : '',
    typeof city?.country?.name === 'string' ? city.country.name.trim() : '',
  ].filter(Boolean)

  return parts.join(', ')
}

function getEventDate(setlist) {
  const eventDate = typeof setlist?.eventDate === 'string' ? setlist.eventDate.trim() : ''
  const parts = eventDate.split('-')

  if (parts.length === 3) {
    return `${parts[1]}/${parts[0]}/${parts[2]}`
  }

  return eventDate || 'Date unknown'
}

function getSongSummary(setlist) {
  const titles = extractSongTitles(setlist)
  if (!titles.length) return 'No songs listed yet'

  const preview = titles.slice(0, 3).join(', ')
  const suffix = titles.length > 3 ? '...' : ''
  return `${titles.length} song${titles.length === 1 ? '' : 's'}: ${preview}${suffix}`
}

function SetlistSearchDialog({ show, results, onHide, onSelect }) {
  const safeResults = Array.isArray(results) ? results : []

  return (
    <Modal show={show} onHide={onHide} centered size="lg" backdrop="static" keyboard>
      <Modal.Header closeButton>
        <Modal.Title as="h2" style={{ fontSize: '1.15rem' }}>
          Choose a setlist
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p style={{ color: 'var(--setlog-card-text-secondary)', marginBottom: '0.85rem' }}>
          Select the concert that best matches what you remember. Showing up to 5 results from
          setlist.fm.
        </p>

        <ListGroup>
          {safeResults.map((setlist, index) => {
            const locationLabel = getLocationLabel(setlist)
            const songSummary = getSongSummary(setlist)
            const key = setlist?.id || `${getArtistName(setlist)}-${getVenueName(setlist)}-${index}`

            return (
              <ListGroup.Item
                key={key}
                as="button"
                type="button"
                action
                onClick={() => onSelect(setlist)}
                style={{
                  textAlign: 'left',
                  background: 'var(--setlog-card-bg)',
                  borderColor: 'var(--setlog-card-border)',
                  color: 'var(--setlog-card-text)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{getArtistName(setlist)}</div>
                    <div style={{ fontWeight: 600 }}>{getVenueName(setlist)}</div>
                    {locationLabel ? (
                      <div style={{ color: 'var(--setlog-card-text-secondary)', fontSize: '0.9rem' }}>
                        {locationLabel}
                      </div>
                    ) : null}
                  </div>

                  <Badge bg="secondary" style={{ alignSelf: 'flex-start' }}>
                    {getEventDate(setlist)}
                  </Badge>
                </div>

                <div style={{ color: 'var(--setlog-card-text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  {songSummary}
                </div>
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SetlistSearchDialog
