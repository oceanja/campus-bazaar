import { Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/* ─── Error Boundary: catches any unhandled React error ─── */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || "Unknown error" };
  }
  componentDidCatch(err, info) {
    console.error("App crashed:", err, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: "fixed", inset: 0, background: "#FDFAF5",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 16, fontFamily: "system-ui, sans-serif",
          color: "#1A1612",
        }}>
          <div style={{ fontSize: "3rem" }}>⚠️</div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ fontSize: ".85rem", color: "#9A8E82", maxWidth: 320, textAlign: "center" }}>
            {this.state.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8, background: "#1A1612", color: "#F5F0E8",
              border: "none", borderRadius: 100, padding: "11px 28px",
              fontSize: ".88rem", fontWeight: 500, cursor: "pointer",
            }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// NOTE: StrictMode removed — it double-invokes effects in dev which caused
// onAuthStateChange to fire twice, leading to session flicker / blank screens.
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)

