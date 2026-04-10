import { useContext } from 'react'
import { Card } from 'react-bootstrap'
import { Calendar, Users, MapPin, Star } from 'lucide-react'

import { ConcertsContext } from '../contexts/concertsContext.js'
import { colors } from '../data/Colors'

import StatRow from '../components/StatRow'

function TimelineStats() {
  const { concerts } = useContext(ConcertsContext)

  const n = concerts.length
  const artists = new Set(
    concerts
      .map((c) => String(c.artist ?? '').toLowerCase().trim())
      .filter((artist) => artist !== ''),
  )
  const cities = new Set(
    concerts
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
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        width: '100%',
        maxWidth: '320px',
      }}
    >
      <div
        style={{
          fontSize: '20px',
          fontWeight: '500',
          marginBottom: '16px',
          lineHeight: '1.05',
        }}
      >
        Your Stats
      </div>
      <StatRow
        icon={<Calendar size={20} color={colors.setlogPrimary} />}
        value={stats.showsLogged}
        label="Shows Logged"
      />

      <StatRow
        icon={<Users size={20} color={colors.setlogPrimary} />}
        value={stats.artistsSeen}
        label="Artist Seen"
      />

      <StatRow
        icon={<MapPin size={20} color={colors.setlogPrimary} />}
        value={stats.citiesVisited}
        label="Cities Visited"
      />

      <StatRow
        icon={<Star size={20} color={colors.setlogPrimary} />}
        value={stats.avgRating}
        label="Average Rating"
      />
    </Card>
  )
}

export default TimelineStats
