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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
