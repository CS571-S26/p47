import { Alert, Button, Spinner, Card } from 'react-bootstrap'
import { Music2 } from 'lucide-react'

import SectionCard from '../components/SectionCard.jsx'
import { useSpotify } from '../contexts/spotifyContext.js'

function SettingsPage() {
  const {
    session,
    loading,
    authenticating,
    error,
    configError,
    isConfigured,
    isConnected,
    connect,
    disconnect,
    clearError,
  } = useSpotify()

  async function handleConnect() {
    clearError()
    await connect({ returnTo: '/settings' })
  }

  return (
    <section
      className="page-shell"
      style={{
        flex: 1,
        width: '100%',
        padding: '1rem 0.85rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '1400px',
          borderRadius: '18px',
          border: '1px solid var(--setlog-card-border)',
          background: 'var(--setlog-card-bg)',
          boxShadow: '0 8px 24px var(--setlog-card-bg)',
          padding: '0.5rem',
        }}
      >
        <Card.Body>
          <div style={{ width: '100%', maxWidth: '880px' }}>
            <h1 style={{ color: 'var(--setlog-primary-text)', marginBottom: '0.35rem' }}>Settings</h1>
            <p style={{ color: 'var(--setlog-secondary-text)', marginBottom: '1rem' }}>
              Manage app preferences and connected services.
            </p>

            <SectionCard
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Music2 size={18} color="var(--setlog-primary)" />
                  <span>Spotify Integration</span>
                </div>
              }
              subtitle="Connect Spotify so you can turn saved setlists into playlists."
            >
              {error ? (
                <Alert variant={configError ? 'warning' : 'danger'} style={{ marginBottom: '1rem' }}>
                  {error}
                </Alert>
              ) : null}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--setlog-card-text)',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {isConnected ? 'Spotify connected' : 'Spotify not connected'}
                  </div>
                  <div style={{ color: 'var(--setlog-card-text-secondary)', fontSize: '0.95rem' }}>
                    {isConnected
                      ? `Playlist scope ready: ${session?.scope || 'playlist-modify-private'}`
                      : isConfigured
                        ? 'Authorize your Spotify account to create private playlists from your setlists.'
                        : 'Add the Spotify environment variables before connecting this app.'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="success"
                    onClick={handleConnect}
                    disabled={loading || authenticating || !isConfigured}
                    style={{ fontWeight: 700 }}
                  >
                    {authenticating ? (
                      <>
                        <Spinner animation="border" size="sm" style={{ marginRight: '0.45rem' }} />
                        Connecting...
                      </>
                    ) : isConnected ? (
                      'Reconnect Spotify'
                    ) : (
                      'Connect Spotify'
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    onClick={disconnect}
                    disabled={!isConnected || loading || authenticating}
                    style={{ fontWeight: 700 }}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </SectionCard>
          </div>
        </Card.Body>
      </Card>
    </section>
  )
}

export default SettingsPage
