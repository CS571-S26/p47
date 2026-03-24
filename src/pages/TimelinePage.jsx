import { useState } from 'react'
import { Button } from 'react-bootstrap'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'

function TimelinePage() {
  const [count, setCount] = useState(0)

  return (
    <section id="center">
      <div className="hero">
        <img src={heroImg} className="base" width="170" height="179" alt="" />
        <img src={reactLogo} className="framework" alt="React logo" />
        <img src={viteLogo} className="vite" alt="Vite logo" />
      </div>
      <div>
        <h1>SetLog</h1>
        <p>
          Capture concerts, relive setlists, and build your personal live music
          journal.
        </p>
      </div>
      <Button
        className="counter"
        onClick={() => setCount((currentCount) => currentCount + 1)}
      >
        Shows logged: {count}
      </Button>
    </section>
  )
}

export default TimelinePage
