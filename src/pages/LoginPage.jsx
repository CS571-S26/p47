import { useState } from 'react'
import { Alert, Button, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/authContext.js'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (email.trim() === '' || password.trim() === '') {
      setError('Enter both email and password.')
      return
    }
    const res = await login(email, password)
    if (!res.ok) {
      if (res.reason === 'auth/invalid-credential') {
        setError('Incorrect email or password.')
      } else if (res.reason === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.')
      } else {
        setError('Login failed. Please try again.')
      }
      return
    }
    navigate('/')
  }

  return (
    <section id="center">
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        <h1 style={{color: 'var(--setlog-primary-text)'}}>Log in</h1>
        <p  style={{color: 'var(--setlog-secondary-text)'}}>
          Log in to sync your concerts across devices.
        </p>
        {error ? (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        ) : null}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label style={{color: 'var(--setlog-primary-text)'}}>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label style={{color: 'var(--setlog-primary-text)'}}>Password</Form.Label>
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
