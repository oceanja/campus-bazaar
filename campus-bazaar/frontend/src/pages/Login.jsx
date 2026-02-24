import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, loginWithGoogle } from "../lib/auth";

// ─── Global Styles (same design system as Home) ───────────────────────────────
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream: #F5F0E8;
      --warm-white: #FDFAF5;
      --ink: #1A1612;
      --ink-light: #3D3530;
      --amber: #E8A830;
      --amber-deep: #C8861A;
      --rust: #C4552A;
      --sage: #6B8F71;
      --dust: #D4C5B0;
      --muted: #9A8E82;
    }

    html, body { height: 100%; }

    body {
      background: var(--warm-white);
      color: var(--ink);
      font-family: 'DM Sans', sans-serif;
      overflow-x: hidden;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes floatA {
      0%,100% { transform: translateY(0px) rotate(-2deg); }
      50%      { transform: translateY(-12px) rotate(-2deg); }
    }
    @keyframes floatB {
      0%,100% { transform: translateY(0px) rotate(2deg); }
      50%      { transform: translateY(-16px) rotate(2deg); }
    }
    @keyframes floatC {
      0%,100% { transform: translateY(0px) rotate(-1deg); }
      50%      { transform: translateY(-10px) rotate(-1deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes pulseRing {
      0%   { transform: scale(1);   opacity: .5; }
      100% { transform: scale(1.8); opacity: 0; }
    }
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes checkPop {
      0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
      60%  { transform: scale(1.15) rotate(3deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }

    .login-input {
      width: 100%;
      background: var(--warm-white);
      border: 1.5px solid var(--dust);
      border-radius: 14px;
      padding: 14px 18px 14px 48px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      color: var(--ink);
      transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
      outline: none;
    }
    .login-input:focus {
      border-color: var(--amber);
      box-shadow: 0 0 0 4px rgba(232,168,48,0.12);
      background: white;
    }
    .login-input::placeholder { color: var(--muted); }

    .btn-primary {
      background: var(--ink);
      color: var(--cream);
      border: none;
      padding: 15px 32px;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--rust);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(196,85,42,0.28);
    }
    .btn-primary:disabled {
      opacity: 0.6; cursor: not-allowed;
    }

    .btn-google {
      background: white;
      color: var(--ink);
      border: 1.5px solid var(--dust);
      padding: 13px 32px;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
      display: inline-flex; align-items: center; justify-content: center; gap: 10px;
      width: 100%;
    }
    .btn-google:hover {
      border-color: var(--muted);
      box-shadow: 0 4px 16px rgba(26,22,18,0.08);
      transform: translateY(-1px);
    }

    .divider {
      display: flex; align-items: center; gap: 14px;
      color: var(--muted); font-size: 0.78rem; letter-spacing: 0.08em;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1; height: 1px; background: var(--dust);
    }

    .social-trust-badge {
      display: flex; align-items: center; gap: 8px;
      background: var(--cream);
      border: 1px solid var(--dust);
      border-radius: 100px;
      padding: 8px 16px;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ink-light);
    }

    .panel-right {
      background: var(--ink);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px 52px;
      animation: slideInRight 0.7s 0.1s cubic-bezier(.22,1,.36,1) both;
    }

    .floating-card {
      position: absolute;
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      padding: 16px 20px;
    }

    .step-item {
      display: flex; gap: 16px; align-items: flex-start;
      padding: 18px 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .step-item:last-child { border-bottom: none; }

    .step-number {
      width: 32px; height: 32px; border-radius: 50%;
      background: rgba(232,168,48,0.15);
      border: 1px solid rgba(232,168,48,0.3);
      color: var(--amber);
      font-family: 'Clash Display', sans-serif;
      font-size: 0.75rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }

    .error-msg {
      background: rgba(196,85,42,0.08);
      border: 1px solid rgba(196,85,42,0.2);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 0.82rem;
      color: var(--rust);
      display: flex; align-items: center; gap: 8px;
      animation: fadeUp 0.3s ease;
    }

    .success-overlay {
      position: fixed; inset: 0; z-index: 999;
      background: var(--warm-white);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      animation: fadeIn 0.3s ease;
    }

    .check-circle {
      width: 80px; height: 80px; border-radius: 50%;
      background: var(--ink);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem;
      margin-bottom: 24px;
      animation: checkPop 0.5s cubic-bezier(.22,1,.36,1) both;
    }
  `}</style>
);

// ─── Floating stat card for right panel ──────────────────────────────────────
const PanelCard = ({ style, anim, children }) => (
    <div className="floating-card" style={{ animation: anim, ...style }}>
        {children}
    </div>
);

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    // Fake submit handler — wire up to your API
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            setLoading(true);
            await loginWithEmail(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Success overlay
    if (success) return (
        <>
            <GlobalStyles />
            <div className="success-overlay">
                <div className="check-circle">✓</div>
                <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "2rem", fontWeight: 700, marginBottom: 10 }}>
                    Welcome back!
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>Redirecting you to the marketplace…</p>
            </div>
        </>
    );

    return (
        <>
            <GlobalStyles />

            {/* ── NAVBAR ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "0 5%", height: 64,
                background: "rgba(253,250,245,0.92)",
                backdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(212,197,176,0.4)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                {/* Logo */}
                <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: "var(--ink)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <span style={{ color: "var(--amber)", fontSize: "1rem" }}>⬡</span>
                    </div>
                    <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "var(--ink)" }}>
                        Campus<span style={{ color: "var(--amber)" }}>Bazaar</span>
                    </span>
                </a>

                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem", color: "var(--muted)" }}>
                    <span>No account?</span>
                    <a href="/signup" style={{
                        fontWeight: 600, color: "var(--ink)",
                        textDecoration: "none",
                        borderBottom: "1.5px solid var(--amber)",
                        paddingBottom: 1,
                        transition: "color 0.2s",
                    }}>Sign Up Free →</a>
                </div>
            </nav>

            {/* ── SPLIT LAYOUT ── */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                minHeight: "100vh",
                paddingTop: 64,
            }}>

                {/* ── LEFT PANEL – FORM ── */}
                <div style={{
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    padding: "60px 8% 60px 10%",
                    animation: "slideInLeft 0.6s cubic-bezier(.22,1,.36,1) both",
                    position: "relative",
                    background: "var(--warm-white)",
                }}>
                    {/* Decorative blob */}
                    <div style={{
                        position: "absolute", top: "10%", right: 0,
                        width: 260, height: 260, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(232,168,48,0.1) 0%, transparent 70%)",
                        filter: "blur(30px)", pointerEvents: "none",
                    }} />

                    {/* Page label */}
                    <div style={{ marginBottom: 36, animation: "fadeUp 0.6s 0.1s ease both" }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            background: "var(--cream)", border: "1px solid var(--dust)",
                            borderRadius: 100, padding: "6px 14px",
                            fontSize: "0.72rem", fontWeight: 500,
                            letterSpacing: "0.12em", textTransform: "uppercase",
                            color: "var(--muted)", marginBottom: 20,
                        }}>
                            <div style={{ position: "relative" }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--sage)" }} />
                                <div style={{
                                    position: "absolute", inset: -1, borderRadius: "50%",
                                    border: "1px solid var(--sage)",
                                    animation: "pulseRing 2s ease-out infinite",
                                }} />
                            </div>
                            Secure Login
                        </div>

                        <h1 style={{
                            fontFamily: "'Clash Display',sans-serif",
                            fontSize: "clamp(2rem,3.5vw,2.8rem)",
                            fontWeight: 700, lineHeight: 1.05,
                            letterSpacing: "-0.03em",
                            marginBottom: 12,
                        }}>
                            Welcome<br />
                            <span style={{
                                fontFamily: "'Instrument Serif',serif",
                                fontStyle: "italic",
                                color: "var(--amber)",
                            }}>back.</span>
                        </h1>
                        <p style={{ fontSize: "0.92rem", color: "var(--muted)", lineHeight: 1.7 }}>
                            Log in to browse deals, chat with sellers,<br />and manage your listings.
                        </p>
                    </div>

                    {/* Google button */}
                    <div style={{ marginBottom: 20, animation: "fadeUp 0.6s 0.2s ease both" }}>
                        <button
                            className="btn-google"
                            onClick={loginWithGoogle}
                            type="button"
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="divider" style={{ marginBottom: 20, animation: "fadeUp 0.6s 0.25s ease both" }}>
                        or log in with email
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ animation: "fadeUp 0.6s 0.3s ease both" }}>

                        {/* Email */}
                        <div style={{ position: "relative", marginBottom: 14 }}>
                            <span style={{
                                position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                                fontSize: "1rem", opacity: focusedField === "email" ? 1 : 0.45,
                                transition: "opacity 0.2s", pointerEvents: "none",
                            }}>✉</span>
                            <input
                                className="login-input"
                                type="email"
                                placeholder="your@college.edu"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => setFocusedField(null)}
                                autoComplete="email"
                            />
                            {email && email.includes("@") && (
                                <span style={{
                                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                                    color: "var(--sage)", fontSize: "0.85rem",
                                }}>✓</span>
                            )}
                        </div>

                        {/* Password */}
                        <div style={{ position: "relative", marginBottom: 8 }}>
                            <span style={{
                                position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                                fontSize: "1rem", opacity: focusedField === "password" ? 1 : 0.45,
                                transition: "opacity 0.2s", pointerEvents: "none",
                            }}>🔒</span>
                            <input
                                className="login-input"
                                type={showPass ? "text" : "password"}
                                placeholder="Your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setFocusedField("password")}
                                onBlur={() => setFocusedField(null)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(s => !s)}
                                style={{
                                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer",
                                    fontSize: "0.9rem", color: "var(--muted)",
                                    padding: 4, transition: "color 0.2s",
                                }}
                            >{showPass ? "🙈" : "👁"}</button>
                        </div>

                        {/* Forgot password */}
                        <div style={{ textAlign: "right", marginBottom: 20 }}>
                            <a href="/forgot-password" style={{
                                fontSize: "0.78rem", color: "var(--muted)",
                                textDecoration: "none", transition: "color 0.2s",
                            }}
                                onMouseOver={e => e.target.style.color = "var(--amber-deep)"}
                                onMouseOut={e => e.target.style.color = "var(--muted)"}
                            >Forgot password?</a>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="error-msg" style={{ marginBottom: 16 }}>
                                <span>⚠</span> {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button className="btn-primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        style={{ animation: "spin 0.8s linear infinite" }}>
                                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                    </svg>
                                    Signing you in…
                                </>
                            ) : (
                                <>Log In <span style={{ fontSize: "1.05rem" }}>→</span></>
                            )}
                        </button>

                        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                    </form>

                    {/* Trust badges */}
                    <div style={{
                        display: "flex", gap: 10, flexWrap: "wrap", marginTop: 32,
                        animation: "fadeUp 0.6s 0.45s ease both",
                    }}>
                        {[
                            { icon: "🔐", text: "256-bit encrypted" },
                            { icon: "🎓", text: "Students only" },
                            { icon: "⚡", text: "Instant access" },
                        ].map(b => (
                            <div key={b.text} className="social-trust-badge">
                                <span>{b.icon}</span> {b.text}
                            </div>
                        ))}
                    </div>

                    {/* Signup link */}
                    <p style={{
                        marginTop: 28, fontSize: "0.85rem", color: "var(--muted)",
                        animation: "fadeUp 0.6s 0.5s ease both",
                    }}>
                        New to CampusBazaar?{" "}
                        <a href="/signup" style={{
                            color: "var(--ink)", fontWeight: 600, textDecoration: "none",
                            borderBottom: "1.5px solid var(--amber)",
                        }}>Create a free account →</a>
                    </p>
                </div>

                {/* ── RIGHT PANEL – DARK BRANDING ── */}
                <div className="panel-right">
                    {/* Decorative grid */}
                    <div style={{
                        position: "absolute", inset: 0, pointerEvents: "none",
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }} />

                    {/* Glow blob */}
                    <div style={{
                        position: "absolute", top: "20%", right: "10%",
                        width: 300, height: 300, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(232,168,48,0.15) 0%, transparent 70%)",
                        filter: "blur(40px)", pointerEvents: "none",
                    }} />
                    <div style={{
                        position: "absolute", bottom: "15%", left: "5%",
                        width: 200, height: 200, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(196,85,42,0.1) 0%, transparent 70%)",
                        filter: "blur(30px)", pointerEvents: "none",
                    }} />

                    {/* Floating cards */}
                    <PanelCard
                        style={{ top: 80, right: 32, minWidth: 190 }}
                        anim="floatA 4s ease-in-out infinite"
                    >
                        <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: "0.1em" }}>
                            RECENT SALE
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10, fontSize: "1.2rem",
                                background: "rgba(255,255,255,0.06)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>📚</div>
                            <div>
                                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "white" }}>Engineering Maths</div>
                                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)" }}>Sold for ₹320</div>
                            </div>
                        </div>
                    </PanelCard>

                    <PanelCard
                        style={{ top: "38%", left: 24, minWidth: 175 }}
                        anim="floatB 5s ease-in-out infinite"
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: "0.85rem" }}>✦</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--amber)", fontWeight: 600 }}>AI Suggested</span>
                        </div>
                        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.4rem", fontWeight: 700, color: "white" }}>₹4,200</div>
                        <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)" }}>For your cycle listing</div>
                    </PanelCard>

                    <PanelCard
                        style={{ bottom: 100, right: 28, minWidth: 190 }}
                        anim="floatC 3.8s ease-in-out infinite"
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: "var(--sage)",
                                boxShadow: "0 0 6px var(--sage)",
                            }} />
                            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>LIVE ACTIVITY</span>
                        </div>
                        {["Riya listed a MacBook", "Anuj bought a chair", "Priya sent a message"].map((a, i) => (
                            <div key={i} style={{
                                fontSize: "0.75rem", color: i === 0 ? "white" : "rgba(255,255,255,0.4)",
                                padding: "4px 0",
                                borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                            }}>{a}</div>
                        ))}
                    </PanelCard>

                    {/* Main content */}
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <div style={{ marginBottom: 40 }}>
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                background: "rgba(232,168,48,0.12)",
                                border: "1px solid rgba(232,168,48,0.25)",
                                borderRadius: 100, padding: "7px 16px",
                                fontSize: "0.72rem", fontWeight: 600,
                                letterSpacing: "0.1em", textTransform: "uppercase",
                                color: "var(--amber)", marginBottom: 24,
                            }}>
                                ✦ Campus-only marketplace
                            </div>

                            <h2 style={{
                                fontFamily: "'Clash Display',sans-serif",
                                fontSize: "clamp(1.8rem,2.8vw,2.6rem)",
                                fontWeight: 700, lineHeight: 1.1,
                                color: "white", marginBottom: 16, letterSpacing: "-0.02em",
                            }}>
                                Your campus.<br />
                                <span style={{
                                    fontFamily: "'Instrument Serif',serif",
                                    fontStyle: "italic",
                                    color: "var(--amber)",
                                }}>Your marketplace.</span>
                            </h2>
                            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: 340 }}>
                                Trade with verified students from your college. No strangers, no scams — just fair deals within your community.
                            </p>
                        </div>

                        {/* Feature list */}
                        <div style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 20, padding: "8px 24px",
                        }}>
                            {[
                                { icon: "🤖", title: "AI Price Suggestions", desc: "Get fair prices instantly" },
                                { icon: "💬", title: "Real-time Chat", desc: "Message buyers directly" },
                                { icon: "🎓", title: "Verified Students", desc: "College email required" },
                            ].map((f, i) => (
                                <div key={i} className="step-item">
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                        background: "rgba(232,168,48,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "1.15rem",
                                    }}>{f.icon}</div>
                                    <div>
                                        <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "white", marginBottom: 3 }}>{f.title}</div>
                                        <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)" }}>{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom social proof */}
                        <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ display: "flex" }}>
                                {["AS", "MK", "PR", "DV", "SR"].map((initials, i) => (
                                    <div key={i} style={{
                                        width: 32, height: 32, borderRadius: "50%",
                                        background: ["var(--amber)", "var(--rust)", "var(--sage)", "#6B7FBF", "var(--amber-deep)"][i],
                                        border: "2px solid var(--ink)",
                                        marginLeft: i > 0 ? -10 : 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.6rem", fontWeight: 700, color: "white",
                                        zIndex: 5 - i,
                                        position: "relative",
                                    }}>{initials}</div>
                                ))}
                            </div>
                            <div>
                                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "white" }}>24,000+ students</div>
                                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.38)" }}>already buying & selling</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RESPONSIVE: collapse right panel on mobile ── */}
            <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          .panel-right {
            display: none !important;
          }
          div[style*="padding: 60px 8%"] {
            padding: 40px 6% !important;
          }
        }
      `}</style>
        </>
    );
}