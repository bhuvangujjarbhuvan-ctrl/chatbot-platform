import { Link } from "react-router-dom";

export default function Landing() {
  const features = [
    {
      icon: "📁",
      title: "Multi-Project Workspaces",
      desc: "Organize your AI agents, custom personas, and chat histories under separate project contexts.",
      color: "rgba(124, 58, 237, 0.15)",
      border: "rgba(124, 58, 237, 0.3)"
    },
    {
      icon: "⚙️",
      title: "Custom System Prompts",
      desc: "Inject system-level guidelines, tones, and boundaries per project to mold AI replies.",
      color: "rgba(6, 95, 70, 0.12)",
      border: "rgba(6, 95, 70, 0.25)"
    },
    {
      icon: "🤖",
      title: "Model Customization",
      desc: "Choose and swap preferred OpenRouter models (GPT-4o, Gemini 2.5, Claude, Llama) instantly.",
      color: "rgba(190, 24, 93, 0.15)",
      border: "rgba(190, 24, 93, 0.3)"
    },
    {
      icon: "⚡",
      title: "SSE Response Streaming",
      desc: "Experience high-fidelity, real-time responses streaming word-by-word into chat bubbles.",
      color: "rgba(245, 158, 11, 0.15)",
      border: "rgba(245, 158, 11, 0.3)"
    },
    {
      icon: "📋",
      title: "Markdown & Code Copying",
      desc: "Beautifully rendered math, tables, and monospace code blocks with one-click copying.",
      color: "rgba(239, 68, 68, 0.15)",
      border: "rgba(239, 68, 68, 0.3)"
    },
    {
      icon: "🎨",
      title: "Premium Glass UI",
      desc: "A futuristic user experience complete with dark mode, glowing meshes, and micro-interactions.",
      color: "rgba(6, 182, 212, 0.15)",
      border: "rgba(6, 182, 212, 0.3)"
    }
  ];

  return (
    <div style={styles.page}>
      {/* Background glowing meshes */}
      <div style={styles.glow1} />
      <div style={styles.glow2} />

      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logo}>🤖</div>
          <span style={styles.brandName}>Chatbot Platform</span>
        </div>
        <div style={styles.navActions}>
          <Link to="/login" style={styles.navLink}>Sign In</Link>
          <Link to="/register" className="action-btn-gradient btn-3d-interactive" style={styles.signUpBtn}>Sign Up</Link>
        </div>
      </header>

      <main style={styles.heroSection}>
        <div style={styles.badge}>🚀 Discover Next-Gen AI Customization</div>
        <h1 style={styles.heroTitle}>
          Build & Chat with <br />
          <span style={styles.gradientText}>Custom AI Assistants</span>
        </h1>
        <p style={styles.heroSub}>
          Organize projects, set precise system instructions, choose from top-tier OpenRouter models, and stream markdown replies within a responsive workspace.
        </p>

        <div style={styles.ctaGroup}>
          <Link to="/register" className="action-btn-gradient btn-3d-interactive" style={styles.primaryCta}>
            Get Started Free
          </Link>
          <Link to="/login" className="btn-3d-interactive" style={styles.secondaryCta}>
            Access Workspace
          </Link>
        </div>
      </main>

      <section style={styles.featureSection}>
        <h2 style={styles.sectionTitle}>Key Platform Features</h2>
        <p style={styles.sectionSub}>Everything you need to configure, run, and test customizable AI chat models.</p>

        <div className="landing-grid">
          {features.map((f, i) => (
            <div key={i} className="elevated-3d-card" style={{ ...styles.card, background: f.color, borderColor: f.border }}>
              <div style={styles.cardIcon}>{f.icon}</div>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Chatbot Platform. Powered by OpenRouter & Prisma.
      </footer>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    background: "radial-gradient(circle at top left, #2d1b69, #1a0f3e)",
    color: "#fff",
    fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  glow1: {
    position: "absolute",
    top: "-10%",
    left: "15%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(124, 58, 237, 0) 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  glow2: {
    position: "absolute",
    top: "40%",
    right: "10%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(6, 95, 70, 0.08) 0%, rgba(6, 95, 70, 0) 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    background: "rgba(13, 7, 37, 0.65)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(12px)",
    zIndex: 10,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #7c3aed, #be185d)",
    fontSize: 18,
    color: "#fff",
  },
  brandName: {
    fontWeight: 800,
    fontSize: 18,
    letterSpacing: "0.5px",
    color: "#fff",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },
  navLink: {
    color: "rgba(255, 255, 255, 0.85)",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 600,
    transition: "color 0.2s ease",
  },
  signUpBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
    color: "#fff",
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "80px 20px 60px 20px",
    maxWidth: 800,
    margin: "0 auto",
    zIndex: 5,
  },
  badge: {
    padding: "6px 14px",
    borderRadius: 20,
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: "52px",
    fontWeight: 900,
    lineHeight: 1.15,
    margin: 0,
    letterSpacing: "-1.5px",
  },
  gradientText: {
    background: "linear-gradient(135deg, #7c3aed, #059669)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: 17,
    lineHeight: 1.6,
    opacity: 0.75,
    marginTop: 20,
    marginBottom: 32,
    maxWidth: 620,
  },
  ctaGroup: {
    display: "flex",
    gap: 16,
  },
  primaryCta: {
    padding: "14px 28px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 800,
    textDecoration: "none",
    color: "#fff",
  },
  secondaryCta: {
    padding: "14px 28px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 800,
    textDecoration: "none",
    color: "#fff",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    transition: "all 0.2s ease",
  },
  featureSection: {
    padding: "60px 40px 80px 40px",
    maxWidth: 1200,
    margin: "0 auto",
    textAlign: "center",
    zIndex: 5,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 800,
    margin: 0,
  },
  sectionSub: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 48,
  },
  card: {
    padding: 32,
    borderRadius: 20,
    border: "1px solid",
    textAlign: "left",
    transition: "transform 0.25s ease",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxSizing: "border-box",
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 800,
    margin: "0 0 10px 0",
  },
  cardDesc: {
    fontSize: 14.5,
    opacity: 0.7,
    margin: 0,
    lineHeight: 1.5,
  },
  footer: {
    marginTop: "auto",
    padding: "30px 20px",
    textAlign: "center",
    fontSize: 13,
    opacity: 0.5,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  }
};
