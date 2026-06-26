import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api"; // adjust path if needed

export default function Login({ onLogin }) {
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
      if (onLogin) onLogin(res.token);
      navigate("/");
    } catch (err) {
      console.error("LOGIN ERROR", err);
      setMsg(err.message || "Login failed");
    }
  };

  return (
    <div style={styles.page}>
      {/* Premium background glows */}
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.logo}>🤖</div>
          <div>
            <h1 style={styles.brandTitle}>Chatbot Platform</h1>
            <p style={styles.brandSub}>AI assistant workspace</p>
          </div>
        </div>

        <h2 style={styles.formTitle}>Welcome Back</h2>
        <p style={styles.formNote}>Enter your credentials to access your chats.</p>

        {msg && <div style={styles.error}>{msg}</div>}

        <input
          name="email"
          placeholder="Email Address"
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

        <hr style={styles.divider} />
        <button type="submit" style={styles.button}>
          Login
        </button>

        <p style={styles.linkText}>
          No account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "var(--bg-primary)",
    fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
    overflow: "hidden",
  },
  glow1: {
    position: "absolute",
    top: "20%",
    left: "25%",
    width: "450px",
    height: "450px",
    background: "radial-gradient(circle, rgba(0, 102, 80, 0.08) 0%, rgba(0, 102, 80, 0) 70%)",
    filter: "blur(50px)",
    pointerEvents: "none",
  },
  glow2: {
    position: "absolute",
    bottom: "20%",
    right: "25%",
    width: "450px",
    height: "450px",
    background: "radial-gradient(circle, rgba(94, 42, 84, 0.06) 0%, rgba(94, 42, 84, 0) 70%)",
    filter: "blur(50px)",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    width: 330,
    padding: "36px 32px",
    borderRadius: 24,
    background: "#FFFFFF",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    backdropFilter: "blur(24px)",
    boxShadow: "0 20px 50px rgba(42, 27, 61, 0.06)",
    color: "var(--text-body)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    zIndex: 1,
  },
  brand: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 4,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-plum))",
    boxShadow: "0 8px 24px rgba(0, 102, 80, 0.2)",
    fontSize: 20,
    color: "#fff",
  },
  brandTitle: { fontWeight: 800, fontSize: 16, margin: 0, color: "var(--text-heading)" },
  brandSub: { fontSize: 12, color: "var(--text-muted)", margin: 0 },
  formTitle: { fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.5px", color: "var(--text-heading)" },
  formNote: { fontSize: 13, color: "var(--text-body)", opacity: 0.8, margin: "0 0 4px 0", lineHeight: "1.4" },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(0, 0, 0, 0.12)",
    background: "#FFFFFF",
    color: "var(--text-body)",
    fontSize: 14,
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 15,
    color: "#fff",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-plum))",
    boxShadow: "0 4px 20px rgba(0, 102, 80, 0.25)",
  },
  error: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#dc2626",
    padding: "12px",
    borderRadius: 12,
    fontSize: 13,
  },
  linkText: {
    textAlign: "center",
    fontSize: 13.5,
    color: "var(--text-muted)",
    margin: "8px 0 0 0",
  },
  link: {
    color: "var(--accent-primary)",
    textDecoration: "none",
    fontWeight: 600,
  },
  divider: {
    border: "none",
    borderTop: "1.5px solid rgba(0, 0, 0, 0.08)",
    margin: "8px 0",
    width: "100%",
  },
};
