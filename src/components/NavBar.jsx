import { Container, Nav, Navbar, FormControl } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import { Map, CirclePlus, Settings, List, Search, Moon, User } from 'lucide-react'

import logo from '../assets/setlog_logo.png'
import './NavBar.css'

function NavBar() {
  return (
    <Navbar variant="dark" sticky="top" expand="lg">
      <Container fluid>
        <Navbar.Brand as={NavLink} to="/">
          <img src={logo} alt="Setlog Logo" className="logo" />
          SetLog
        </Navbar.Brand>

        <Navbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end className="nav-item-custom">
              <List size={18} /> 
              Timeline
            </Nav.Link>

            <Nav.Link as={NavLink} to="/maps" className="nav-item-custom">
              <Map size={18} /> 
              Map
            </Nav.Link>

            <Nav.Link as={NavLink} to="/add-concert" className="nav-item-custom">
              <CirclePlus size={18} /> 
              Add Concert
            </Nav.Link>
          </Nav>

          <div className="nav-actions">
            <div className="search-bar">
              <Search size={16} className="search-icon"/>
              <FormControl type="search" placeholder="Search..." className="search-input"/>
            </div>

            <button type="button" className="icon-btn" aria-label="Dark mode">
              <Moon size={18} />
            </button>

            <button type="button" className="icon-btn " aria-label="Settings">
              <Settings size={18} />
            </button>
            
            <button type="button" className="icon-btn icon-btn-round" aria-label="Profile">
              <User size={18} />
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
