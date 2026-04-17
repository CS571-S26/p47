import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { useAuth } from '../contexts/authContext.js'

function UserProfilePage() {
  const { loginStatus } = useAuth()

  if (!loginStatus.loggedIn) {
    return (
      <section id="center">
        <div>
          <h1>User profile</h1>
          <p className="text-secondary">You are not logged in.</p>
          <Button as={Link} to="/login" variant="primary" className="me-2">
            Log in
          </Button>
          <Button as={Link} to="/register" variant="outline-secondary">
            Create account
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section id="center">
      <div>
        <h1>User profile</h1>
        <p>
          Signed in as <strong>{loginStatus.username}</strong>
        </p>
        <p className="text-secondary">
          This account exists only in this browser (local storage). Clearing site data will remove
          it. Your logged concerts are stored under your username on this device.
        </p>
      </div>
    </section>
  )
}

export default UserProfilePage
