import { Container, Nav, Navbar, FormControl, Row, Col, Form, Button } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { Map, CirclePlus, Settings, List, Search, Moon, User, LogOut } from 'lucide-react'

import logo from '../assets/setlog_logo.png'
import { useAuth } from '../contexts/authContext.js'
import './NavBar.css'

function NavBar() {
  const { loginStatus, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

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
              <Button variant="dark">
                <Moon size={32} />
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
                <>
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
                    className="me-1"
                  >
                    <User size={32} />
                  </Button>
                  <Button variant="outline-light" onClick={handleLogout} title="Log out">
                    <LogOut size={28} />
                  </Button>
                </>
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
