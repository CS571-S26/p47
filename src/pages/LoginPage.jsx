import { useState } from 'react'
import { Alert, Button, Form, Card } from 'react-bootstrap'
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
    <section
      className="page-shell"
      style={{
        flex: 1,
        width: '100%',
        padding: '2rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: '20px',
          border: '1px solid var(--setlog-card-border)',
          background: 'var(--setlog-card-bg)',
          boxShadow: '0 8px 24px var(--setlog-card-bg)',
          padding: '1rem',
        }}
      >
        <Card.Body>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: 'var(--setlog-card-text)', margin: 0 }}>Log in</h1>
          <p style={{ color: 'var(--setlog-card-text-secondary)' }} className="mt-3 mb-4">
            Log in to sync your concerts across devices.
          </p>
          {error ? (
            <Alert variant="danger" className="mb-3" style={{ marginTop: '0.6rem', marginBottom: 0, background: "var(--tag-not-attended-bg)", color: "var(--tag-not-attended-text)" }}>
              {error}
            </Alert>
          ) : null}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="loginEmail">
              <Form.Label style={{ color: 'var(--setlog-primary-text)' }}>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="loginPassword">
              <Form.Label style={{ color: 'var(--setlog-primary-text)' }}>Password</Form.Label>
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
        </Card.Body>
      </Card>
    </section>
  )
}

export default LoginPage
