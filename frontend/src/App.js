import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store/store';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import ProductDetail from "./components/Product/ProductDetail"
import ForgotPassword from "./components/Login/ForgotPassword";
import Cart from "./components/Cart/Cart";


function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          {/* <Route path="/login" element={<Login />}></Route> */}
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/forgetPass" element={<ForgotPassword />}></Route>
          <Route path="/cart" element={<Cart />}></Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App
