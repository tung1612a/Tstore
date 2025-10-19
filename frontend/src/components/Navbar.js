import React from 'react';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { FiUser, FiShoppingCart, FiLogOut, FiMapPin, FiSettings, FiBarChart } from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function SiteNavbar() {
  const { items } = useCart();
  const { user, logout, isAdmin, isSeller } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
                  <Dropdown.Item href="/addresses">
                    <FiMapPin className="me-2" />
                    Địa chỉ của tôi
                  </Dropdown.Item>
                  {isAdmin() && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item href="/admin">
                        <FiBarChart className="me-2" />
                        Admin Homepage
                      </Dropdown.Item>
                    </>
                  )}

                  {isSeller() && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item href="/seller">
                        <FiSettings className="me-2" />
                        Seller Homepage
                      </Dropdown.Item>
                    </>
                  )}

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


