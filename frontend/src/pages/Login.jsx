import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {api} from "../api"; // adjust path if needed

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔴 REQUIRED
    console.log("Submitting login", form); // 🔥 MUST appear in console

    try {
      const res = await api.login(form);

      console.log("LOGIN RESPONSE", res);

      localStorage.setItem("token", res.token);
      navigate("/app");
    } catch (err) {
      console.error("LOGIN ERROR", err);
      setMsg(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        {msg && <div style={styles.error}>{msg}</div>}

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          required
        />

        {/* 🔴 IMPORTANT */}
        <button type="submit" style={styles.button}>
          Login
        </button>

        <p style={styles.link}>
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #0f172a, #111827)",
  },
  card: {
    width: 320,
    padding: 24,
    borderRadius: 16,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: { textAlign: "center", fontWeight: 800 },
  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.3)",
    color: "#fff",
    outline: "none",
  },
  button: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    color: "#fff",
    background: "linear-gradient(135deg, #22c55e, #3b82f6)",
  },
  error: {
    background: "rgba(239,68,68,0.2)",
    padding: 10,
    borderRadius: 10,
    fontSize: 13,
  },
  link: {
    textAlign: "center",
    fontSize: 13,
    opacity: 0.8,
  },
};
