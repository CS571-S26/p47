import { concerts } from '../data/MockConcerts'
import TimelineConcert from '../components/TimelineConcert'

function TimelinePage() {
  return (
    <section id="center">
      <div className="timeline-list">
        {concerts.map((concert) => (
          <TimelineConcert key={concert.id} concert={concert} />
        ))}
      </div>
    </section>
  )
}

export default TimelinePage
