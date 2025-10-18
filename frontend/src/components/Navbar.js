import React from 'react';
import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { FiUser, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';

function SiteNavbar() {
  const { items } = useCart();
  
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand href="/">WDP Shop</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div className="me-auto" />
          <Nav>
            <Nav.Link href="/login">
              <FiUser className="me-1" />
              Đăng nhập
            </Nav.Link>
            <Nav.Link href="/cart" className="position-relative">
              <FiShoppingCart className="me-1" />
              Giỏ hàng
              {!!items.length && (
                <Badge 
                  bg="danger" 
                  className="position-absolute top-0 start-100 translate-middle rounded-pill"
                  style={{ fontSize: '0.7rem', minWidth: '18px', height: '18px' }}
                >
                  {items.length}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default SiteNavbar;


