import { useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    try {
      await api.register(form);
      setMsg({
        text: "Account created successfully! Redirecting to login...",
        type: "success",
      });
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      setMsg({
        text: err.message || "Register failed",
        type: "danger",
      });
    }
  }

  return (
    <div style={styles.page}>
      {/* Back Navigation Arrow */}
      <Link to="/" style={styles.backButton} title="Back to Home">
        ←
      </Link>

      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.logo}>🤖</div>
          <div>
            <h1 style={styles.brandTitle}>Chatbot Platform</h1>
            <p style={styles.brandSub}>Create a new account</p>
          </div>
        </div>

        <h2 style={styles.formTitle}>Get started 🚀</h2>
        <p style={styles.formNote}>
          Create your account and build your own AI projects.
        </p>

        <form style={{ display: "flex", flexDirection: "column", gap: 12 }} onSubmit={submit}>
          <input
            style={styles.input}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          <hr style={styles.divider} />

          <button style={styles.button} type="submit">
            Register
          </button>
        </form>

        {msg.text && (
          <div
            style={{
              ...styles.alert,
              background: msg.type === "success" ? "rgba(5, 150, 105, 0.08)" : "rgba(239, 68, 68, 0.08)",
              color: msg.type === "success" ? "#059669" : "#f87171",
              border: msg.type === "success" ? "1px solid rgba(5, 150, 105, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {msg.text}
          </div>
        )}

        <div style={styles.linkText}>
          <span>
            Already have an account?{" "}
          </span>
          <Link to="/" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}>Login</Link>
        </div>
      </div>
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
  },
  backButton: {
    position: "absolute",
    top: "32px",
    left: "32px",
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: "rgba(20, 10, 60, 0.45)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    display: "grid",
    placeItems: "center",
    color: "#FFFFFF",
    fontSize: "20px",
    fontWeight: "800",
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    zIndex: 10,
  },
  card: {
    width: 320,
    padding: 24,
    borderRadius: 16,
    background: "rgba(20, 10, 60, 0.45)",
    backdropFilter: "blur(10px)",
    color: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
  },
  brand: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-plum))",
    fontSize: 16,
    color: "#fff",
    boxShadow: "0 8px 24px rgba(0, 102, 80, 0.2)",
  },
  brandTitle: { fontWeight: 800, fontSize: 16, margin: 0, color: "#FFFFFF" },
  brandSub: { fontSize: 12, color: "var(--text-muted)", margin: 0 },
  formTitle: { fontSize: 20, fontWeight: 800, margin: "8px 0 2px 0", color: "#FFFFFF" },
  formNote: { fontSize: 13, color: "var(--text-muted)", opacity: 0.9, margin: "0 0 10px 0" },
  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(0, 0, 0, 0.2)",
    color: "#FFFFFF",
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
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-plum))",
    boxShadow: "0 4px 20px rgba(124, 58, 237, 0.25)",
  },
  alert: {
    padding: 10,
    borderRadius: 10,
    fontSize: 13,
    marginTop: 8,
  },
  linkText: {
    textAlign: "center",
    fontSize: 13,
    color: "var(--text-muted)",
    marginTop: 10,
  },
  divider: {
    border: "none",
    borderTop: "1.5px solid rgba(255, 255, 255, 0.08)",
    margin: "12px 0",
    width: "100%",
  },
};
