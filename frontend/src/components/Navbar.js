import React, { useEffect, useState } from 'react';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { FiUser, FiShoppingCart, FiLogOut, FiPackage, FiSettings, FiMapPin, FiBarChart } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../store/cartSlice';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function SiteNavbar() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const { user, logout, isAdmin, isDevAdmin, isSeller, hasPermission } = useAuth();
  const navigate = useNavigate();

  // Load cart khi component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

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
                  <Dropdown.Item href="/orders">
                    <FiUser className="me-2" />
                    {user?.role === 'seller' ? 'Quản lý đơn hàng' : 'Lịch sử đơn hàng'}
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
                        Admin Bussiness Dashboard
                      </Dropdown.Item>
                      {/* <Dropdown.Item href="/admin/products">
                        <FiPackage className="me-2" />
                        Quản lý sản phẩm
                      </Dropdown.Item> */}
                      {/* <Dropdown.Item href="/admin/orders">
                        <FiPackage className="me-2" />
                        Quản lý đơn hàng
                      </Dropdown.Item> */}
                      {/* <Dropdown.Item href="/admin/users">
                        <FiUser className="me-2" />
                        Quản lý người dùng
                      </Dropdown.Item> */}
                    </>
                  )}

                  {/* {isDevAdmin() && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item href="/dev-admin">
                        <FiBarChart className="me-2" />
                        Dev Admin
                      </Dropdown.Item>
                      <Dropdown.Item href="/admin/system">
                        <FiSettings className="me-2" />
                        Hệ thống
                      </Dropdown.Item>
                      <Dropdown.Item href="/admin/logs">
                        <FiBarChart className="me-2" />
                        Logs & Monitoring
                      </Dropdown.Item>
                      <Dropdown.Item href="/admin/database">
                        <FiSettings className="me-2" />
                        Database
                      </Dropdown.Item>
                    </>
                  )} */}

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
            {/* <Nav.Link href="/orders">
              <FiPackage className="me-1" />
              Đơn hàng
            </Nav.Link> */}
            <Nav.Link href="/cart" className="position-relative">
              <FiShoppingCart className="me-1" />
              Giỏ hàng
              {!!items.length && (
                <span
                  className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.7rem', minWidth: '18px', height: '18px' }}
                >
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