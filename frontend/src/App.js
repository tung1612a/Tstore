import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Components
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import VerifyEmail from "./components/Register/VerifyEmail";
import ProductDetail from "./components/Product/ProductDetail";
import ForgotPassword from "./components/Login/ForgotPassword";
import Cart from "./components/Cart/Cart";
import Profile from "./components/Profile/Profile";
import ChangePassword from "./components/Profile/ChangePassword";
import StorePage from "./components/Store/StorePage";
import Checkout from "./components/Checkout/Checkout";
import ThankYou from "./components/Checkout/ThankYou";
import OrderHistory from "./components/Orders/OrderHistory";
import OrderDetails from "./components/Orders/OrderDetails";
import AdminDashboard from "./components/Admin/AdminDashboard";
import SellerDashboard from "./components/Seller/SellerDashboard";
import AdminHomepage from "./components/Admin/AdminHomepage";
import SellerHomepage from "./components/Seller/SellerHomepage";
import SellerProducts from "./components/Seller/SellerProducts";
import OrderManagement from "./components/Orders/OrderManagement";
import ShipperHomepage from "./components/Shipper/ShipperHomepage";
import ShipperDashboard from "./components/Shipper/ShipperDashboard";
import ShipperOrders from "./components/Shipper/ShipperOrders";
import DevAdmin from "./components/Admin/DevAdmin";
import RoleRedirect from "./components/RoleRedirect";
import AddressPage from "./components/Address/AddressPage";
import AdminUser from "./components/Admin/AdminUser";
import ListProduct from "./components/DevAdmin/ListProduct";
import SellerReports from "./components/Seller/SellerReport";
import SellerSettings from "./components/Seller/SellerSettings";
import SellerComplaints from "./components/Seller/SellerComplaints";
import SellerApplications from "./components/Admin/SellerApplications";
import ReportAdmin from "./components/DevAdmin/ReportAdmin";
import BuyerComplaints from "./components/Orders/BuyerComplaints";
import AdminComplaints from "./components/Admin/AdminComplaints";
import ChatList from "./components/Chat/ChatList";
import Chat from "./components/Chat/Chat";

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
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgetPass" element={<ForgotPassword />} />
            <Route path="/store/:sellerId" element={<StorePage />} />


            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thank-you" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
            <Route path="/redirect" element={<RoleRedirect />} />
            <Route path="/addresses" element={<AddressPage />} />
            
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/buyer/complaints" element={<ProtectedRoute><BuyerComplaints /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
            <Route path="/chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

            {/* Protected routes */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'devadmin']}><AdminHomepage /></ProtectedRoute>}/>
            {/* <Route path="/dev-admin" element={<DevAdmin />} /> */}

            {/* DevAdmin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="devadmin"><AdminDashboard /></ProtectedRoute>}/>

            <Route path="/admin/users" element={<AdminUser />} />

            <Route path="/admin/products" element={<ListProduct />} />

            <Route path="/admin/reports" element={<ReportAdmin />} />

            <Route path="/admin/seller-applications" element={<ProtectedRoute requiredRole="admin"><SellerApplications /></ProtectedRoute>} />

            <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['admin', 'devadmin']}><AdminComplaints /></ProtectedRoute>} />

            {/* Seller routes */}
            <Route path="/seller" element={<ProtectedRoute requiredRole="seller"><SellerHomepage /></ProtectedRoute>}/>

            {/* <Route path="/seller/dashboard" element={<ProtectedRoute requiredRole="seller"><SellerDashboard /></ProtectedRoute>}/> */}
            <Route path="/seller/products" element={<ProtectedRoute requiredRole="seller"><SellerProducts /></ProtectedRoute>}/>
            <Route path="/seller/orders" element={<ProtectedRoute requiredRole="seller"><OrderManagement /></ProtectedRoute>}/>
            <Route path="/seller/complaints" element={<ProtectedRoute requiredRole="seller"><SellerComplaints /></ProtectedRoute>}/>
            <Route path="/seller/reports" element={<ProtectedRoute requiredRole="seller"><SellerReports /></ProtectedRoute>}/>
            <Route path="/seller/settings" element={<ProtectedRoute requiredRole="seller"><SellerSettings /></ProtectedRoute>}/>

            {/* Shipper routes */}
            <Route path="/shipper" element={<ProtectedRoute requiredRole="shipper"><ShipperHomepage /></ProtectedRoute>}/>
            <Route path="/shipper/dashboard" element={<ProtectedRoute requiredRole="shipper"><ShipperDashboard /></ProtectedRoute>}/>
            <Route path="/shipper/orders" element={<ProtectedRoute requiredRole="shipper"><ShipperOrders /></ProtectedRoute>}/>
            <Route path="/shipper/orders/:id" element={<ProtectedRoute requiredRole="shipper"><ShipperOrders /></ProtectedRoute>}/>

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  );
}

export default App;