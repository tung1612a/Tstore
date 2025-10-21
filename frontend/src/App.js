import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";

// Components
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import ProductDetail from "./components/Product/ProductDetail";
import ForgotPassword from "./components/Login/ForgotPassword";
import Cart from "./components/Cart/Cart";
import Profile from "./components/Profile/Profile";
import ChangePassword from "./components/Profile/ChangePassword";
import StorePage from "./components/Store/StorePage";
import Checkout from "./components/Checkout/Checkout";
import OrderHistory from "./components/Orders/OrderHistory";
import OrderDetails from "./components/Orders/OrderDetails";
import AdminDashboard from "./components/Admin/AdminDashboard";
import SellerDashboard from "./components/Seller/SellerDashboard";
import AdminHomepage from "./components/Admin/AdminHomepage";
import SellerHomepage from "./components/Seller/SellerHomepage";
import OrderManagement from "./components/Orders/OrderManagement";
import DevAdmin from "./components/Admin/DevAdmin";
import RoleRedirect from "./components/RoleRedirect";
import AddressPage from "./components/Address/AddressPage";
import AdminUser from "./components/Admin/AdminUser";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgetPass" element={<ForgotPassword />} />
            <Route path="/store/:sellerId" element={<StorePage />} />


            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/redirect" element={<RoleRedirect />} />
            <Route path="/addresses" element={<AddressPage />} />
            
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetails />} />

            {/* Protected routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'devadmin']}><AdminHomepage /></ProtectedRoute>}/>
            <Route path="/dev-admin" element={<DevAdmin />} />

            <Route path="/admin/users" element={<AdminUser />} />

            {/* <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}/> */}

            {/* Seller routes */}
            <Route path="/seller" element={<ProtectedRoute requiredRole="seller"><SellerHomepage /></ProtectedRoute>}/>

            <Route path="/seller/dashboard" element={<ProtectedRoute requiredRole="seller"><SellerDashboard /></ProtectedRoute>}/>
            <Route path="/seller/orders" element={<ProtectedRoute requiredRole="seller"><OrderManagement /></ProtectedRoute>}/>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;