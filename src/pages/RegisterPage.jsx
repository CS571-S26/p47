import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/authContext.js'
import { registerUser } from '../utils/userStore.js'

function RegisterPage() {
  const { setLoggedInUser } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (username.trim() === '' || password.trim() === '') {
      setError('Username and password are required.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    const result = registerUser(username, password)
    if (!result.ok) {
      if (result.reason === 'taken') {
        setError('That username is already taken.')
      } else {
        setError('Invalid username or password.')
      }
      return
    }
    setLoggedInUser(username.trim())
    navigate('/')
  }

  return (
    <section id="center">
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        <h1>Create account</h1>
        <p className="text-secondary mb-4">
          Your account is saved only in this browser (local storage).
        </p>
        {error ? (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        ) : null}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="registerUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="registerPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="registerConfirmPassword">
            <Form.Label>Confirm password</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="me-2">
            Register
          </Button>
          <Button as={Link} to="/login" variant="outline-secondary">
            Back to log in
          </Button>
        </Form>
      </div>
    </section>
  )
}

export default RegisterPage
