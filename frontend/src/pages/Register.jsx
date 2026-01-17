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
        text: err.response?.data?.error || "Register failed",
        type: "danger",
      });
    }
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <div className="card">
        <div className="header">
          <div className="brand">
            <div className="logo" />
            <div>
              <h1 className="h-title">Chatbot Platform</h1>
              <p className="subtle">Create a new account</p>
            </div>
          </div>
        </div>

        <h2 className="form-title">Get started 🚀</h2>
        <p className="form-note">
          Create your account and build your own AI projects.
        </p>

        <form className="form" onSubmit={submit}>
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="input"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className="btn btn-primary" type="submit">
            Register
          </button>
        </form>

        {msg.text && (
          <div
            className={`alert ${
              msg.type === "success" ? "alert-success" : "alert-danger"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <span className="small" style={{ color: "rgba(234,240,255,0.75)" }}>
            Already have an account?{" "}
          </span>
          <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  );
}
