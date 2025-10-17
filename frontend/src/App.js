import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  createRoutesFromElements,
  ScrollRestoration, BrowserRouter, Route, Routes
} from "react-router-dom";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import ProductDetail from "./components/Product/ProductDetail"
import ForgotPassword from "./components/Login/ForgotPassword";
import Profile from './components/Profile/Profile';
import StorePage from './components/Store/StorePage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        {/* <Route path="/login" element={<Login />}></Route> */}
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/forgetPass" element={<ForgotPassword />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="/store/:sellerId" element={<StorePage />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
