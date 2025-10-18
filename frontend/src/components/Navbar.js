import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { FiUser, FiShoppingCart, FiLogOut } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';

function SiteNavbar() {
  const { items } = useCart();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand href="/">WDP Shop</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div className="me-auto" />
          <Nav>
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center">
                  <FiUser className="me-1" />
                  Hello, {user.fullName || 'Tài khoản'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/profile">
                    <FiUser className="me-2" />
                    Thông tin cá nhân
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FiLogOut className="me-2" />
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link href="/login">
                <FiUser className="me-1" />
                Đăng nhập
              </Nav.Link>
            )}
            <Nav.Link href="/cart" className="position-relative">
              <FiShoppingCart className="me-1" />
              Giỏ hàng
              {!!items.length && (
                <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.7rem', minWidth: '18px', height: '18px' }}>
                  {items.length}
                </span>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default SiteNavbar;


