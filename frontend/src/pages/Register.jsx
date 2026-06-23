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
              background: msg.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
              color: msg.type === "success" ? "#4ade80" : "#f87171",
            }}
          >
            {msg.text}
          </div>
        )}

        <div style={styles.linkText}>
          <span style={{ color: "rgba(255,255,255,0.75)" }}>
            Already have an account?{" "}
          </span>
          <Link to="/" style={{ color: "#3b82f6", fontWeight: 600 }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #0f172a, #111827)",
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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
    border: "1px solid rgba(255, 255, 255, 0.08)",
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
    background: "linear-gradient(135deg, #22c55e, #3b82f6)",
    fontSize: 16,
  },
  brandTitle: { fontWeight: 800, fontSize: 16, margin: 0 },
  brandSub: { fontSize: 12, opacity: 0.75, margin: 0 },
  formTitle: { fontSize: 20, fontWeight: 800, margin: "8px 0 2px 0" },
  formNote: { fontSize: 13, opacity: 0.7, margin: "0 0 10px 0" },
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
  alert: {
    padding: 10,
    borderRadius: 10,
    fontSize: 13,
    marginTop: 8,
  },
  linkText: {
    textAlign: "center",
    fontSize: 13,
    opacity: 0.8,
    marginTop: 10,
  },
  divider: {
    border: "none",
    borderTop: "1.5px solid rgba(255, 255, 255, 0.3)",
    margin: "12px 0",
    width: "100%",
  },
};

