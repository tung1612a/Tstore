import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { FiUser, FiShoppingCart } from 'react-icons/fi';

function SiteNavbar() {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand href="#">WDP Shop</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div className="me-auto" />
          <Nav>
            <Nav.Link href="/login">
              <FiUser className="me-1" />
              Đăng nhập
            </Nav.Link>
            <Nav.Link href="#">
              <FiShoppingCart className="me-1" />
              Giỏ hàng
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default SiteNavbar;


