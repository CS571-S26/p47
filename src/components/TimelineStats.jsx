import { Card } from 'react-bootstrap'
import { Calendar, Users, MapPin, Star } from 'lucide-react'

import { stats } from '../data/MockConcerts'
import { colors } from "../data/Colors"

import StatRow from '../components/StatRow'

function TimelineStats() {
  {/* TODO Get real stats data from the user's shows */}
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
      <div style={{ fontSize: "20px", fontWeight: "500", marginBottom: "16px", lineHeight: "1.05" }}>Your Stats</div>
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
        value={stats.showsLogged}
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