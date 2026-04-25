import {
  Container,
  Nav,
  Navbar,
  FormControl,
  Row,
  Col,
  Form,
  Button,
} from 'react-bootstrap'
import { useContext, useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Map, CirclePlus, List, Moon, Sun, UserPlus, Search, RefreshCw  } from 'lucide-react'

import logo from '../assets/setlog_logo.png'
import { useAuth } from '../contexts/authContext.js'
import { ConcertsContext } from '../contexts/concertsContext.js'
import { filterConcertsByQuery, normalizeConcertSearchQuery } from '../utils/concertSearch.js'
import './NavBar.css'

const AVATAR_STORAGE_PREFIX = 'p47:profileAvatar:'
const NAV_COLLAPSE_ID = 'setlog-navbar-collapse'
const TIMELINE_SEARCH_ID = 'timeline-search-query'
const DROPDOWN_MAX_RESULTS = 5

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function formatConcertDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function NavBar({ theme, setTheme }) {
  const { loginStatus, user } = useAuth()
  const { concerts } = useContext(ConcertsContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const searchWrapperRef = useRef(null)

  const activeQuery = normalizeConcertSearchQuery(searchInput)
  const allMatches = activeQuery ? filterConcertsByQuery(concerts, searchInput) : []
  const dropdownResults = allMatches.slice(0, DROPDOWN_MAX_RESULTS)

  const iconSize = window.innerWidth < 768 ? 22 : 28

  useEffect(() => {
    function handleMouseDown(e) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  useEffect(() => {
    setSearchInput('')
    setShowDropdown(false)
  }, [location.pathname])

  function handleSearchChange(e) {
    const v = e.target.value
    setSearchInput(v)
    setShowDropdown(v.trim() !== '')
  }

  function handleSearchFocus() {
    if (searchInput.trim() !== '') setShowDropdown(true)
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    setShowDropdown(false)
    const sp = new URLSearchParams()
    if (searchInput.trim() !== '') sp.set('q', searchInput)
    navigate({ pathname: '/', search: sp.toString() ? `?${sp.toString()}` : '' })
  }

  function handleDropdownItemClick(concertId) {
    setShowDropdown(false)
    navigate(`/concerts/${concertId}`)
  }

  function handleSeeAllClick(e) {
    e.preventDefault()
    setShowDropdown(false)
    const sp = new URLSearchParams()
    if (searchInput.trim() !== '') sp.set('q', searchInput)
    navigate({ pathname: '/', search: sp.toString() ? `?${sp.toString()}` : '' })
  }

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

  function accountButton(className, size) {
    return (
      <Button
        as={NavLink}
        to="/login"
        variant="outline-light"
        className={className}
        onClick={() => setExpanded(false)}
        aria-label="Log in or register"
        style={{
          width: size,
          height: size,
          borderRadius: '999px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <UserPlus size={22} aria-hidden />
      </Button>
    )
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
      sticky="top"
      expand="lg"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      style={{
        background: 'linear-gradient(180deg, #252830 0%, #1a1d23 100%)',
      }}>
      <Container fluid>
        <Navbar.Brand as={NavLink} onClick={() => setExpanded(false)} to="/">
          <img src={logo} alt="Setlog Logo" style={{ width: "40px", height: "40px", marginRight: "0.5rem" }} />
          <span style={{ fontWeight: "700" }}>SetLog</span>
        </Navbar.Brand>

        <div className="d-flex d-lg-none align-items-center gap-2">
          <Button
            variant="dark"
            type="button"
            onClick={handleToggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            {theme === 'light' ? <Moon size={iconSize} aria-hidden /> : <Sun size={iconSize} aria-hidden />}
          </Button>

          {loginStatus.loggedIn ? (
            <Button
              as={NavLink}
              to="/user-profile"
              aria-label={`User profile for ${label}`}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '999px',
                padding: 0,
                overflow: 'hidden',
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  aria-hidden
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '999px',
                    background: 'var(--setlog-card-bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--setlog-primary)',
                  }}
                >
                  {initials}
                </div>
              )}
            </Button>
          ) : (
            accountButton('', '42px')
          )}

          <Navbar.Toggle aria-controls={NAV_COLLAPSE_ID} />
        </div>


        <Navbar.Collapse id={NAV_COLLAPSE_ID}>
          {/* Left Side */}
          <Nav className="me-auto">
            <Nav.Link as={NavLink} onClick={() => setExpanded(false)} to="/">
              <List size={18} /> Timeline
            </Nav.Link>

            <Nav.Link as={NavLink} onClick={() => setExpanded(false)} to="/maps">
              <Map size={18} /> Map
            </Nav.Link>

            <Nav.Link as={NavLink} onClick={() => setExpanded(false)} to="/add-concert">
              <CirclePlus size={18} /> Log Concert
            </Nav.Link>

            <Nav.Link as={NavLink} onClick={() => setExpanded(false)} to="/live-concert">
              <RefreshCw size={18} /> Live Concert
            </Nav.Link>
          </Nav>

          {/* Right Side */}
          <Row className="align-items-center">

            {/* Search */}
            <Col xs={12} md="auto">
              <div ref={searchWrapperRef} className="search-wrapper">
                <Form onSubmit={handleSearchSubmit}>
                  <Row className="align-items-center">
                    <Col>
                      <Form.Label htmlFor={TIMELINE_SEARCH_ID} className="visually-hidden">
                        Search concerts
                      </Form.Label>
                      <div style={{ position: 'relative' }}>
                        <Search
                          size={16}
                          aria-hidden
                          style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--setlog-secondary-text)',
                            pointerEvents: 'none',
                          }}
                        />

                        <FormControl
                          id={TIMELINE_SEARCH_ID}
                          type="search"
                          placeholder="Search artists, venues, cities, genres, songs…"
                          value={searchInput}
                          onChange={handleSearchChange}
                          onFocus={handleSearchFocus}
                          onKeyDown={handleSearchKeyDown}
                          className="setlog-nav-search-input"
                          autoComplete="off"
                          style={{
                            borderRadius: '24px',
                            padding: '0.3rem 0.75rem 0.3rem 2.25rem',
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                </Form>

                {showDropdown && (
                  <div className="search-dropdown" role="listbox" aria-label="Search results">
                    {dropdownResults.length === 0 ? (
                      <div className="search-dropdown-empty">No matches found</div>
                    ) : (
                      <>
                        {dropdownResults.map((concert) => (
                          <div
                            key={concert.id}
                            className="search-dropdown-item"
                            role="option"
                            aria-selected="false"
                            tabIndex={0}
                            onClick={() => handleDropdownItemClick(concert.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleDropdownItemClick(concert.id)
                              }
                            }}
                          >
                            <div className="search-dropdown-item-artist">{concert.artist}</div>
                            <div className="search-dropdown-item-meta">
                              {concert.venue} · {concert.city} &mdash; {formatConcertDate(concert.date)}
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="search-dropdown-footer"
                          onClick={handleSeeAllClick}
                          aria-label={`See all ${allMatches.length} search result${allMatches.length === 1 ? '' : 's'}`}
                        >
                          See all {allMatches.length} result{allMatches.length === 1 ? '' : 's'} &rarr;
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Col>

            {/* Icon Buttons */}
            <Col xs="auto" className="d-none d-lg-block">
              <Button
                variant="dark"
                type="button"
                onClick={handleToggleTheme}
                aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
              >
                {theme === 'light' ? <Moon size={iconSize} aria-hidden /> : <Sun size={iconSize} aria-hidden />}
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
                    as={NavLink}
                    to="/user-profile"
                    className="d-none d-lg-flex"
                    onClick={() => setExpanded(false)}
                    aria-label={`User profile for ${label}`}
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
                        alt=""
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        aria-hidden
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
                </div>
              ) : (accountButton('d-none d-lg-flex', '46px'))}
            </Col>
          </Row>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
