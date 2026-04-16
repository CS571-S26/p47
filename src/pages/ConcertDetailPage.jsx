import { useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card } from 'react-bootstrap'

import { ConcertsContext } from '../contexts/concertsContext.js'

function ConcertDetailPage() {
  const { concerts } = useContext(ConcertsContext)
  const navigate = useNavigate()
  const { id } = useParams()

  const concert = concerts.find((c) => c.id === id)

  if (!concert) {
    return (
        <Card>
        </Card>
    )
  }

  return (
      <Card>
      </Card>
  )
}

export default ConcertDetailPage

