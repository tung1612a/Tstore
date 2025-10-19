import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import ProductDetail from "./components/Product/ProductDetail"
import ForgotPassword from "./components/Login/ForgotPassword";
import Cart from "./components/Cart/Cart";
import Profile from './components/Profile/Profile';
import StorePage from './components/Store/StorePage';
import AdminDashboard from './components/Admin/AdminDashboard';
import SellerDashboard from './components/Seller/SellerDashboard';
import AdminHomepage from './components/Admin/AdminHomepage';
import SellerHomepage from './components/Seller/SellerHomepage';
import RoleRedirect from './components/RoleRedirect';

import AddressPage from './components/Address/AddressPage';
import AdminUser from "./components/Admin/AdminUser";
function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/forgetPass" element={<ForgotPassword />}></Route>
            <Route path="/store/:sellerId" element={<StorePage />}></Route>
            <Route path="/cart" element={<Cart />}></Route>
            <Route path="/redirect" element={<RoleRedirect />}></Route>
            <Route path="/addresses" element={<AddressPage />} />
            {/* Protected Routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}></Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminHomepage /></ProtectedRoute>}></Route>

            <Route path="/admin/users" element={<AdminUser/>}></Route>

            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}></Route>
            
            {/* Seller Routes */}
            <Route path="/seller" element={<ProtectedRoute requiredRole="seller"><SellerHomepage /></ProtectedRoute>}></Route>

            <Route path="/seller/dashboard" element={<ProtectedRoute requiredRole="seller"><SellerDashboard /></ProtectedRoute>}></Route>
            
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  )
}

export default App
