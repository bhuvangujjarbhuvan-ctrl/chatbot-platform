import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Dashboard onLogout={handleLogout} /> : <Landing />} />
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
      </Routes>
    </BrowserRouter>
  );
}
