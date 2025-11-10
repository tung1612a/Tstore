import React, { useEffect, useState } from 'react';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import {
  FiUser,
  FiShoppingCart,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiMapPin,
  FiBarChart,
  FiTruck,
  FiAlertTriangle,
  FiMessageSquare,
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart } from '../store/cartSlice';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BecomeSellerButton from './BecomeSellerButton';
import LanguageSelector from './LanguageSelector';

function SiteNavbar() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const { user, logout, isAdmin, isDevAdmin, isSeller, isShipper, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Load cart khi component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleLogout = () => {
    logout();
    navigate('/', { state: { logoutSuccess: true } });
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand href="/">WDP Shop</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div className="me-auto" />
          <Nav>
            {/* Language Selector */}
            <div className="me-2 d-flex align-items-center">
              <LanguageSelector />
            </div>

            {/* Become Seller Button - chỉ hiển thị khi user đã đăng nhập và role là 'customer' */}
            {user && user.role === 'customer' && (
              <div className="me-3 d-flex align-items-center">
                <BecomeSellerButton compact={true} />
              </div>
            )}

            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center">
                  <FiUser className="me-1" />
                  {t('navbar.greeting')}, {user.fullName || 'Tài khoản'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="/profile">
                    <FiUser className="me-2" />
                    {t('profile.title')}
                  </Dropdown.Item>
                  <Dropdown.Item href="/orders">
                    <FiPackage className="me-2" />
                    Lịch sử đơn hàng
                  </Dropdown.Item>
                  {user?.role === 'seller' && (
                    <Dropdown.Item href="/seller/orders">
                      <FiPackage className="me-2" />
                      {t('seller.manageOrders')}
                    </Dropdown.Item>
                  )}
                  {user?.role === 'shipper' && (
                    <Dropdown.Item href="/shipper/orders">
                      <FiTruck className="me-2" />
                      {t('shipper.deliveryOrders')}
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item href="/addresses">
                    <FiMapPin className="me-2" />
                    {t('navbar.addresses')}
                  </Dropdown.Item>
                  {(user?.role === 'customer' || user?.role === 'seller') && (
                    <Dropdown.Item href="/chat">
                      <FiMessageSquare className="me-2" />
                      Tin nhắn
                    </Dropdown.Item>
                  )}
                  {(user?.role === 'buyer' || user?.role === 'customer') && (
                    <Dropdown.Item href="/buyer/complaints">
                      <FiAlertTriangle className="me-2" />
                      Khiếu nại của tôi
                    </Dropdown.Item>
                  )}
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
                      <Dropdown.Item href="/seller/settings">
                        <FiSettings className="me-2" />
                        Store Settings
                      </Dropdown.Item>
                      <Dropdown.Item href="/orders">
                        <FiPackage className="me-2" />
                        Lịch sử đơn hàng
                      </Dropdown.Item>
                    </>
                  )}

                  {isShipper() && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item href="/shipper">
                        <FiTruck className="me-2" />
                        Shipper Dashboard
                      </Dropdown.Item>
                    </>
                  )}

                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FiLogOut className="me-2" />
                    {t('navbar.logout')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link href="/login">
                <FiUser className="me-1" />
                {t('navbar.login')}
              </Nav.Link>
            )}
            {/* <Nav.Link href="/orders">
              <FiPackage className="me-1" />
              Đơn hàng
            </Nav.Link> */}
            <Nav.Link href="/cart" className="position-relative">
              <FiShoppingCart className="me-1" />
              {t('navbar.cart')}
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
