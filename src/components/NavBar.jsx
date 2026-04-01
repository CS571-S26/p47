import { Container, Nav, Navbar, FormControl } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Map, CirclePlus, Settings, List, Search, Moon, User } from 'lucide-react'

import logo from '../assets/setlog_logo.png'
import './NavBar.css'

function NavBar() {
  return (
    <Navbar bg="dark" variant="dark" sticky="top" expand="sm" collapseOnSelect>
      <Container fluid className="navbar-setlog-inner px-3 px-lg-4">
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <img src={logo} alt="SetLog Logo" className="logo" />
          SetLog
        </Navbar.Brand>
        <Nav className="me-auto ms-4">
          <Nav.Link as={Link} to="/" className="d-flex align-items-center gap-2">
            <List size={18} />
            Timeline
          </Nav.Link>
          <Nav.Link as={Link} to="/maps" className="d-flex align-items-center gap-2">
            <Map size={18} />
            Map
          </Nav.Link>
          <Nav.Link as={Link} to="/add-concert" className="d-flex align-items-center gap-2">
            <CirclePlus size={18} />
            Add Concert
          </Nav.Link>
          <Nav.Link as={Link} to="/settings" className="d-flex align-items-center gap-2">
            <Settings size={18} />
            Settings
          </Nav.Link>
        </Nav>

        <div className="d-flex align-items-center gap-3">
          {/* Search bar */}
          <div className="search-bar d-flex align-items-center px-2">
            <Search size={16} className="text-secondary flex-shrink-0" />
            <FormControl
              type="search"
              placeholder="Search artists, venues..."
              className="ms-2 border-0 bg-transparent text-light"
            />
          </div>
        </div>

        <button type="button" className="icon-btn-setlog" aria-label="Dark mode">
            {/* Dark mode toggle */}
            <Moon size={18} />
          </button>
          <button type="button" className="avatar-btn-setlog" aria-label="Profile">
            {/* Profile button */}
            <User size={18} />
          </button>
      </Container>
    </Navbar>
  )
}

export default NavBar
