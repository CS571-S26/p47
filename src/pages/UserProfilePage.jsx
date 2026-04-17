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
          Your account is managed by Firebase. Your logged concerts are stored online under your
          account, so you can access them from other devices when you log in.
        </p>
      </div>
    </section>
  )
}

export default UserProfilePage
