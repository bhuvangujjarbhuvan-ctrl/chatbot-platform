import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function isAuthed() {
  return !!localStorage.getItem("token");
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isAuthed() ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/login" element={isAuthed() ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthed() ? <Navigate to="/" /> : <Register />} />
      </Routes>
    </BrowserRouter>
  );
}
