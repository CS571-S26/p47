import { Container, Nav, Navbar, FormControl, Row, Col, Form, Button } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Map, CirclePlus, Settings, List, Search, Moon, Sun, User, LogOut } from 'lucide-react'

import logo from '../assets/setlog_logo.png'
import { useAuth } from '../contexts/authContext.js'
import './NavBar.css'

const AVATAR_STORAGE_PREFIX = 'p47:profileAvatar:'

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function NavBar({ theme, setTheme }) {
  const { loginStatus, logout, user } = useAuth()
  const navigate = useNavigate()
  const [avatarUrl, setAvatarUrl] = useState('')

  function loadAvatar() {
    const uid = user?.uid

    if (!uid) {
      setAvatarUrl('')
      return
    }

    const savedAvatar = normalizeString(localStorage.getItem(`${AVATAR_STORAGE_PREFIX}${uid}`))
    const authAvatar = normalizeString(user?.photoURL)

    if (savedAvatar) {
      setAvatarUrl(savedAvatar)
    } else if (authAvatar) {
      setAvatarUrl(authAvatar)
    } else {
      setAvatarUrl('')
    }
  }

  useEffect(() => {
    loadAvatar()
  }, [user])

  useEffect(() => {
    function handleAvatarUpdated() {
      loadAvatar()
    }
    window.addEventListener('avatarUpdated', handleAvatarUpdated)

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdated)
    }
  }, [user])

  function handleToggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  function createInitials(label) {
    const clean = normalizeString(label)
    if (!clean) return '?'
    const parts = clean.split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }

  const label = loginStatus.username ?? 'User'
  const initials = createInitials(label)

  return (
    <Navbar
      variant="dark"
      sticky="top" expand="sm"
      style={{
        background: 'linear-gradient(180deg, #252830 0%, #1a1d23 100%)',
      }}>
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/">
          <img src={logo} alt="Setlog Logo" style={{ width: "40px", height: "40px", marginRight: "0.5rem" }} />
          <span style={{ marginRight: "50px", fontWeight: "700" }}>SetLog</span>
        </Navbar.Brand>

        <Navbar.Collapse>
          {/* Left Side */}
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/">
              <List size={18} /> Timeline
            </Nav.Link>

            <Nav.Link as={NavLink} to="/maps">
              <Map size={18} /> Map
            </Nav.Link>

            <Nav.Link as={NavLink} to="/add-concert">
              <CirclePlus size={18} /> Log Concert
            </Nav.Link>
          </Nav>

          {/* Right Side */}
          <Row className="align-items-center">

            {/* Search */}
            <Col xs="auto">
              <Form>
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Button variant="dark">
                      <Search size={24} className="search-icon" />
                    </Button>
                  </Col>
                  <Col>
                    <FormControl
                      type="search"
                      placeholder="Search artists, venues, cities..."
                      style={{
                        borderRadius: "24px",
                        padding: "0.3rem 0.75rem",
                        minWidth: "400px",
                      }}
                    />
                  </Col>
                </Row>
              </Form>
            </Col>

            {/* Icon Buttons */}
            <Col xs="auto">
              {/* Dark Mode */}
              <Button variant="dark" onClick={handleToggleTheme}>
                {theme === 'light' ? <Moon size={32} /> : <Sun size={32} />}
              </Button>
            </Col>

            <Col xs="auto">
              {/* Settings */}
              <Button
                as={NavLink}
                to="/settings"
                variant="dark"
              >
                <Settings size={32} />
              </Button>
            </Col>

            <Col xs="auto">
              {loginStatus.loggedIn ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="text-light small me-2 d-none d-md-inline"
                    style={{ verticalAlign: 'middle' }}
                  >
                    {loginStatus.username}
                  </span>
                  <Button
                    variant="outline-light"
                    as={NavLink}
                    to="/user-profile"
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '999px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="User avatar"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '88px',
                          height: '88px',
                          borderRadius: '999px',
                          border: '2px solid var(--setlog-card-border)',
                          background: 'var(--setlog-card-bg-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: 'var(--setlog-primary)',
                        }}
                      >
                        {initials}
                      </div>
                    )}
                  </Button>
                  <Button variant="outline-light" onClick={handleLogout} title="Log out">
                    <LogOut size={28} />
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="outline-light" as={NavLink} to="/login" className="me-1">
                    Log in
                  </Button>
                  <Button variant="outline-light" as={NavLink} to="/register">
                    Register
                  </Button>
                </>
              )}
            </Col>
          </Row>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
