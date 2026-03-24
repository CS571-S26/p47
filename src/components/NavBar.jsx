import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function NavBar() {
  return (
    <Navbar bg="dark" variant="dark" sticky="top" expand="sm" collapseOnSelect>
      <Container>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Brand as={Link} to="/">
          SetLog
        </Navbar.Brand>
        <Navbar.Collapse id="main-nav" className="me-auto">
          <Nav>
            <Nav.Link as={Link} to="/">
              Timeline
            </Nav.Link>
            <Nav.Link as={Link} to="/maps">
              Maps
            </Nav.Link>
            <Nav.Link as={Link} to="/settings">
              Settings
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
