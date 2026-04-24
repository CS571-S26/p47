import { useContext } from 'react'
import { Card } from 'react-bootstrap'
import { Calendar, Users, MapPin, Star } from 'lucide-react'

import { ConcertsContext } from '../contexts/concertsContext.js'

import StatRow from '../components/StatRow'

function TimelineStats({ compact = false }) {
  const { concerts } = useContext(ConcertsContext)

  const n = concerts.length
  const artists = new Set(
    concerts
      .filter((c) => c.attended)
      .map((c) => String(c.artist ?? '').toLowerCase().trim())
      .filter((artist) => artist !== ''),
  )
  const cities = new Set(
    concerts
      .filter((c) => c.attended)
      .map((c) => String(c.city ?? '').toLowerCase().trim())
      .filter((city) => city !== ''),
  )
  const ratings = concerts
    .map((c) => Number(c.rating))
    .filter((r) => !Number.isNaN(r) && r > 0)
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0

  const stats = {
    showsLogged: n,
    artistsSeen: artists.size,
    citiesVisited: cities.size,
    avgRating: Math.round(avgRating * 10) / 10,
  }

  return (
    <Card
      style={{
        padding: compact ? '14px' : '20px',
        borderRadius: '16px',
        border: '1px solid var(--setlog-card-border)',
        width: '100%',
        maxWidth: compact ? '100%' : '320px',
        background: 'var(--setlog-card-bg)',
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: compact ? '15px' : '20px',
          fontWeight: '500',
          marginBottom: compact ? '10px' : '16px',
          lineHeight: '1.05',
          color: 'var(--setlog-card-text)',
        }}
      >
        Your Stats
      </h2>
      <StatRow
        icon={<Calendar size={compact ? '15px' : '20px'} color="var(--setlog-card-text)" aria-hidden />}
        value={stats.showsLogged}
        label="Shows Logged"
        compact={compact}
      />

      <StatRow
        icon={<Users size={compact ? '15px' : '20px'} color="var(--setlog-card-text)" aria-hidden />}
        value={stats.artistsSeen}
        label="Artists Seen"
        compact={compact}
      />

      <StatRow
        icon={<MapPin size={compact ? '15px' : '20px'} color="var(--setlog-card-text)" aria-hidden />}
        value={stats.citiesVisited}
        label="Cities Visited"
        compact={compact}
      />

      <StatRow
        icon={<Star size={compact ? '15px' : '20px'} color="var(--setlog-card-text)" aria-hidden />}
        value={stats.avgRating}
        label="Average Rating"
        compact={compact}
      />
    </Card>
  )
}

export default TimelineStats
