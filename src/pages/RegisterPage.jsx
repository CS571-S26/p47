import { useState } from 'react'
import { Alert, Button, Form, Card } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../contexts/authContext.js'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (displayName.trim() === '' || email.trim() === '' || password.trim() === '') {
      setError('Display name, email, and password are required.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    const result = await register({ email, password, displayName })
    if (!result.ok) {
      if (result.reason === 'auth/email-already-in-use') {
        setError('That email is already in use.')
      } else if (result.reason === 'auth/invalid-email') {
        setError('Enter a valid email address.')
      } else if (result.reason === 'auth/weak-password') {
        setError('Password is too weak.')
      } else {
        setError('Registration failed. Please try again.')
      }
      return
    }
    navigate('/')
  }

  return (
    <section
      id="center"
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
          <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--setlog-card-text)' }}>Create account</div>
          <p style={{ color: 'var(--setlog-card-text-secondary)' }} className="mt-3 mb-4">
            Create an account to sync your concerts across devices.
          </p>
          {error ? (
            <Alert variant="danger" className="mb-3" style={{ marginTop: '0.6rem', marginBottom: 0, background: "var(--tag-not-attended-bg)", color: "var(--tag-not-attended-text)" }}>
              {error}
            </Alert>
          ) : null}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="registerDisplayName">
              <Form.Label style={{ color: 'var(--setlog-primary-text)' }}>Display name</Form.Label>
              <Form.Control
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="nickname"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerEmail">
              <Form.Label style={{ color: 'var(--setlog-primary-text)' }}>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerPassword">
              <Form.Label style={{ color: 'var(--setlog-primary-text)' }}>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="registerConfirmPassword">
              <Form.Label style={{ color: 'var(--setlog-primary-text)' }}>Confirm password</Form.Label>
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
        </Card.Body>
      </Card>
    </section>

    // <section id="center">
    //   <div style={{ maxWidth: '420px', margin: '0 auto' }}>
    //     <h1 style={{color: 'var(--setlog-primary-text)'}}>Create account</h1>
    //     <p  style={{color: 'var(--setlog-secondary-text)'}}>
    //       Create an account to sync your concerts across devices.
    //     </p>
    //     {error ? (
    //       <Alert variant="danger" className="mb-3" style={{ marginTop: '0.6rem', marginBottom: 0, background: "var(--tag-not-attended-bg)", color: "var(--tag-not-attended-text)" }}>
    //         {error}
    //       </Alert>
    //     ) : null}
    //     <Form onSubmit={handleSubmit}>
    //       <Form.Group className="mb-3" controlId="registerDisplayName">
    //         <Form.Label style={{color: 'var(--setlog-primary-text)'}}>Display name</Form.Label>
    //         <Form.Control
    //           value={displayName}
    //           onChange={(e) => setDisplayName(e.target.value)}
    //           autoComplete="nickname"
    //         />
    //       </Form.Group>
    //       <Form.Group className="mb-3" controlId="registerEmail">
    //         <Form.Label style={{color: 'var(--setlog-primary-text)'}}>Email</Form.Label>
    //         <Form.Control
    //           type="email"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //           autoComplete="email"
    //         />
    //       </Form.Group>
    //       <Form.Group className="mb-3" controlId="registerPassword">
    //         <Form.Label style={{color: 'var(--setlog-primary-text)'}}>Password</Form.Label>
    //         <Form.Control
    //           type="password"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           autoComplete="new-password"
    //         />
    //       </Form.Group>
    //       <Form.Group className="mb-3" controlId="registerConfirmPassword">
    //         <Form.Label style={{color: 'var(--setlog-primary-text)'}}>Confirm password</Form.Label>
    //         <Form.Control
    //           type="password"
    //           value={confirmPassword}
    //           onChange={(e) => setConfirmPassword(e.target.value)}
    //           autoComplete="new-password"
    //         />
    //       </Form.Group>
    //       <Button type="submit" variant="primary" className="me-2">
    //         Register
    //       </Button>
    //       <Button as={Link} to="/login" variant="outline-secondary">
    //         Back to log in
    //       </Button>
    //     </Form>
    //   </div>
    // </section>
  )
}

export default RegisterPage
