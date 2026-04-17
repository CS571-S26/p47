import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/authContext.js'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (username.trim() === '' || password.trim() === '') {
      setError('Enter both username and password.')
      return
    }
    if (!login(username, password)) {
      setError('Incorrect username or password.')
      return
    }
    navigate('/')
  }

  return (
    <section id="center">
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        <h1>Log in</h1>
        <p className="text-secondary mb-4">
          SetLog accounts are stored only on this device.
        </p>
        {error ? (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        ) : null}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="me-2">
            Log in
          </Button>
          <Button as={Link} to="/register" variant="outline-secondary">
            Create account
          </Button>
        </Form>
      </div>
    </section>
  )
}

export default LoginPage
