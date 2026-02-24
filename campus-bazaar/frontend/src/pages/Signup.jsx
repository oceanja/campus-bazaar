import { useState } from "react";
import { signupWithEmail } from "../lib/auth";
import { loginWithGoogle } from "../lib/auth";

const G = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --cream: #F5F0E8; --warm-white: #FDFAF5; --ink: #1A1612;
      --ink-light: #3D3530; --amber: #E8A830; --amber-deep: #C8861A;
      --rust: #C4552A; --sage: #6B8F71; --dust: #D4C5B0; --muted: #9A8E82;
    }
    html, body { height: 100%; }
    body { background: var(--warm-white); color: var(--ink); font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

    @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes slideL  { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
    @keyframes slideR  { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
    @keyframes pop     { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
    @keyframes pulse   { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.7);opacity:0} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes floatA  { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(-2deg)} }
    @keyframes floatB  { 0%,100%{transform:translateY(0) rotate(2deg)} 50%{transform:translateY(-14px) rotate(2deg)} }

    .field {
      width:100%; border:1.5px solid var(--dust); border-radius:13px;
      padding:12px 16px 12px 44px; font-family:'DM Sans',sans-serif;
      font-size:.9rem; color:var(--ink); background:var(--warm-white);
      outline:none; transition:border-color .2s, box-shadow .2s, background .2s;
    }
    .field:focus { border-color:var(--amber); box-shadow:0 0 0 3px rgba(232,168,48,.12); background:white; }
    .field::placeholder { color:var(--muted); }
    .field.err { border-color:var(--rust); box-shadow:0 0 0 3px rgba(196,85,42,.1); }

    select.field { cursor:pointer; padding-left:44px; }

    .btn-ink {
      background:var(--ink); color:var(--cream); border:none;
      padding:14px 28px; border-radius:100px; font-family:'DM Sans',sans-serif;
      font-size:.93rem; font-weight:500; cursor:pointer; width:100%;
      display:flex; align-items:center; justify-content:center; gap:8px;
      transition:background .22s, transform .18s, box-shadow .22s;
    }
    .btn-ink:hover:not(:disabled) { background:var(--rust); transform:translateY(-1px); box-shadow:0 8px 22px rgba(196,85,42,.24); }
    .btn-ink:disabled { opacity:.55; cursor:not-allowed; }

    .btn-google {
      background:white; color:var(--ink); border:1.5px solid var(--dust);
      padding:12px 28px; border-radius:100px; font-family:'DM Sans',sans-serif;
      font-size:.88rem; font-weight:500; cursor:pointer; width:100%;
      display:flex; align-items:center; justify-content:center; gap:10px;
      transition:border-color .2s, box-shadow .2s, transform .18s;
    }
    .btn-google:hover { border-color:var(--muted); box-shadow:0 4px 14px rgba(26,22,18,.08); transform:translateY(-1px); }

    .divider { display:flex; align-items:center; gap:12px; color:var(--muted); font-size:.75rem; letter-spacing:.07em; }
    .divider::before,.divider::after { content:''; flex:1; height:1px; background:var(--dust); }

    .step-dot {
      width:28px; height:28px; border-radius:50%; border:2px solid;
      display:flex; align-items:center; justify-content:center;
      font-size:.72rem; font-weight:700; transition:all .3s; flex-shrink:0;
    }

    .floating-chip {
      position:absolute; background:white;
      border-radius:14px; padding:12px 15px;
      box-shadow:0 8px 28px rgba(26,22,18,.11);
    }

    .trust-pill {
      display:inline-flex; align-items:center; gap:6px;
      background:var(--cream); border:1px solid var(--dust);
      border-radius:100px; padding:5px 12px;
      font-size:.72rem; font-weight:500; color:var(--ink-light);
    }

    .error-box {
      background:rgba(196,85,42,.07); border:1px solid rgba(196,85,42,.18);
      border-radius:10px; padding:9px 13px; font-size:.8rem; color:var(--rust);
      display:flex; align-items:center; gap:7px; animation:fadeUp .25s ease;
    }

    .success-screen {
      position:fixed; inset:0; background:var(--warm-white); z-index:200;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      animation:fadeIn .3s ease;
    }

    @media (max-width:768px) {
      .right-panel { display:none !important; }
      .left-panel  { padding:36px 6% !important; }
    }
  `}</style>
);

const COLLEGES = ["IIT Delhi", "IIT Bombay", "IIT Madras", "IIT Kanpur", "DU North Campus", "DU South Campus", "NSUT", "Jamia Millia", "Miranda House", "Other"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "PG 1st Year", "PG 2nd Year"];

export default function Signup() {
    const [step, setStep] = useState(1); // 1 = account, 2 = college details
    const [form, setForm] = useState({ name: "", email: "", password: "", college: "", year: "", branch: "" });
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

    const nextStep = () => {
        if (!form.name.trim()) { setError("Please enter your full name."); return; }
        if (!form.email.includes("@")) { setError("Enter a valid email address."); return; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
        setError(""); setStep(2);
    };

    const submit = async () => {
        if (!form.college) { setError("Please select your college."); return; }
        if (!form.year) { setError("Please select your year."); return; }

        setError("");
        setLoading(true);

        try {
            await signupWithEmail({
                email: form.email,
                password: form.password,
                name: form.name,
                college: form.college || null,
                year: form.year || null,
                branch: form.branch || null,
            });

            setDone(true); // ✅ shows success screen
        } catch (err) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    const strength = (() => {
        const p = form.password;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 6) s++;
        if (p.length >= 10) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9!@#$]/.test(p)) s++;
        return s;
    })();

    const strengthColor = ["", "var(--rust)", "var(--amber)", "var(--amber-deep)", "var(--sage)"][strength];
    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];

    if (done) return (
        <>
            <G />
            <div className="success-screen">
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: 24, animation: "pop .5s cubic-bezier(.22,1,.36,1) both" }}>🎉</div>
                <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "2rem", fontWeight: 700, marginBottom: 10 }}>You're in!</h2>
                <p style={{ color: "var(--muted)", fontSize: ".95rem", marginBottom: 8 }}>Welcome to CampusBazaar, <strong>{form.name.split(" ")[0]}</strong>.</p>
                <p style={{ color: "var(--muted)", fontSize: ".82rem" }}>Check your inbox to verify your college email.</p>
                <a href="/dashboard" style={{
                    marginTop: 32, background: "var(--ink)", color: "var(--cream)",
                    padding: "13px 36px", borderRadius: 100, textDecoration: "none",
                    fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: ".93rem",
                    display: "inline-flex", alignItems: "center", gap: 8,
                }}>Go to Dashboard →</a>
            </div>
        </>
    );

    return (
        <>
            <G />

            {/* Navbar */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                height: 64, padding: "0 5%",
                background: "rgba(253,250,245,.92)", backdropFilter: "blur(16px)",
                borderBottom: "1px solid rgba(212,197,176,.4)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
                    <div style={{ width: 33, height: 33, borderRadius: 9, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ color: "var(--amber)", fontSize: ".95rem" }}>⬡</span>
                    </div>
                    <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.08rem", letterSpacing: "-.02em", color: "var(--ink)" }}>
                        Campus<span style={{ color: "var(--amber)" }}>Bazaar</span>
                    </span>
                </a>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem", color: "var(--muted)" }}>
                    <span>Already have an account?</span>
                    <a href="/login" style={{ fontWeight: 600, color: "var(--ink)", textDecoration: "none", borderBottom: "1.5px solid var(--amber)", paddingBottom: 1 }}>Log In →</a>
                </div>
            </nav>

            {/* Split layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh", paddingTop: 64 }}>

                {/* ── LEFT: FORM ── */}
                <div className="left-panel" style={{
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    padding: "56px 9% 56px 10%", background: "var(--warm-white)",
                    position: "relative", overflow: "hidden",
                    animation: "slideL .55s cubic-bezier(.22,1,.36,1) both",
                }}>
                    {/* blob */}
                    <div style={{ position: "absolute", bottom: "5%", right: 0, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,168,48,.1) 0%, transparent 70%)", filter: "blur(28px)", pointerEvents: "none" }} />

                    {/* Step indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, animation: "fadeUp .5s .05s ease both" }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div className="step-dot" style={{
                                    borderColor: s <= step ? "var(--amber)" : "var(--dust)",
                                    background: s < step ? "var(--amber)" : s === step ? "var(--ink)" : "white",
                                    color: s < step ? "var(--ink)" : s === step ? "white" : "var(--muted)",
                                }}>{s < step ? "✓" : s}</div>
                                <span style={{ fontSize: ".75rem", color: s === step ? "var(--ink)" : "var(--muted)", fontWeight: s === step ? 600 : 400 }}>
                                    {s === 1 ? "Account" : "Your College"}
                                </span>
                                {s < 2 && <div style={{ width: 28, height: 1.5, background: step > 1 ? "var(--amber)" : "var(--dust)", borderRadius: 100, transition: "background .3s" }} />}
                            </div>
                        ))}
                    </div>

                    {/* Heading */}
                    <div style={{ marginBottom: 28, animation: "fadeUp .5s .1s ease both" }}>
                        <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(1.9rem,3.2vw,2.6rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-.03em", marginBottom: 10 }}>
                            {step === 1 ? <>Create your<br /><span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", color: "var(--amber)" }}>free</span> account.</> : <>Tell us about<br /><span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", color: "var(--amber)" }}>your campus.</span></>}
                        </h1>
                        <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.7 }}>
                            {step === 1 ? "Join 24,000+ students buying & selling smarter." : "We'll connect you with students from your college."}
                        </p>
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div style={{ animation: "fadeUp .4s .15s ease both" }}>
                            {/* Google */}
                            <button
                                className="btn-google"
                                style={{ marginBottom: 18 }}
                                onClick={loginWithGoogle}
                            >
                                <svg width="17" height="17" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                </svg>
                                Sign up with Google
                            </button>

                            <div className="divider" style={{ marginBottom: 18 }}>or with email</div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {/* Name */}
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: ".95rem", opacity: .4, pointerEvents: "none" }}>👤</span>
                                    <input className={`field ${error && !form.name ? "err" : ""}`} type="text" placeholder="Full name" value={form.name} onChange={e => set("name", e.target.value)} />
                                </div>

                                {/* Email */}
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: ".95rem", opacity: .4, pointerEvents: "none" }}>✉</span>
                                    <input className={`field ${error && !form.email.includes("@") ? "err" : ""}`} type="email" placeholder="College email (preferred)" value={form.email} onChange={e => set("email", e.target.value)} />
                                    {form.email.includes("@") && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "var(--sage)", fontSize: ".82rem" }}>✓</span>}
                                </div>

                                {/* Password */}
                                <div>
                                    <div style={{ position: "relative" }}>
                                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: ".95rem", opacity: .4, pointerEvents: "none" }}>🔒</span>
                                        <input className={`field ${error && form.password.length < 6 && form.password ? "err" : ""}`}
                                            type={show ? "text" : "password"} placeholder="Create a password"
                                            value={form.password} onChange={e => set("password", e.target.value)} />
                                        <button type="button" onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: ".88rem", color: "var(--muted)", padding: 4 }}>
                                            {show ? "🙈" : "👁"}
                                        </button>
                                    </div>
                                    {/* Strength bar */}
                                    {form.password && (
                                        <div style={{ marginTop: 8, animation: "fadeIn .2s ease" }}>
                                            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 100, background: i <= strength ? strengthColor : "var(--dust)", transition: "background .25s" }} />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: ".68rem", color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && <div className="error-box" style={{ marginTop: 14 }}><span>⚠</span>{error}</div>}

                            <button className="btn-ink" style={{ marginTop: 20 }} onClick={nextStep}>
                                Continue →
                            </button>

                            <p style={{ fontSize: ".72rem", color: "var(--muted)", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
                                By signing up you agree to our{" "}
                                <a href="#" style={{ color: "var(--ink)", textDecoration: "underline" }}>Terms</a> &{" "}
                                <a href="#" style={{ color: "var(--ink)", textDecoration: "underline" }}>Privacy Policy</a>.
                            </p>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div style={{ animation: "fadeUp .4s .05s ease both" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {/* College */}
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: ".95rem", opacity: .4, pointerEvents: "none" }}>🎓</span>
                                    <select className={`field ${error && !form.college ? "err" : ""}`} value={form.college} onChange={e => set("college", e.target.value)}>
                                        <option value="">Select your college…</option>
                                        {COLLEGES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Year */}
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: ".95rem", opacity: .4, pointerEvents: "none" }}>📅</span>
                                    <select className={`field ${error && !form.year ? "err" : ""}`} value={form.year} onChange={e => set("year", e.target.value)}>
                                        <option value="">Year of study…</option>
                                        {YEARS.map(y => <option key={y}>{y}</option>)}
                                    </select>
                                </div>

                                {/* Branch */}
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: ".95rem", opacity: .4, pointerEvents: "none" }}>📖</span>
                                    <input className="field" type="text" placeholder="Branch / Stream (optional)" value={form.branch} onChange={e => set("branch", e.target.value)} />
                                </div>
                            </div>

                            {error && <div className="error-box" style={{ marginTop: 14 }}><span>⚠</span>{error}</div>}

                            <button className="btn-ink" style={{ marginTop: 20 }} onClick={submit} disabled={loading}>
                                {loading
                                    ? <><span style={{ animation: "spin .7s linear infinite", display: "inline-block" }}>⟳</span> Creating account…</>
                                    : "🎉 Create My Account"}
                            </button>

                            <button onClick={() => { setStep(1); setError(""); }} style={{ width: "100%", marginTop: 10, background: "none", border: "none", cursor: "pointer", fontSize: ".82rem", color: "var(--muted)", padding: "6px", transition: "color .2s" }}
                                onMouseOver={e => e.target.style.color = "var(--ink)"}
                                onMouseOut={e => e.target.style.color = "var(--muted)"}>
                                ← Back
                            </button>
                        </div>
                    )}

                    {/* Trust pills */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 28, animation: "fadeUp .5s .4s ease both" }}>
                        {["🔐 Encrypted", "🎓 Students only", "⚡ Free forever"].map(t => (
                            <div key={t} className="trust-pill">{t}</div>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT: DARK PANEL ── */}
                <div className="right-panel" style={{
                    background: "var(--ink)", position: "relative", overflow: "hidden",
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    padding: "56px 48px",
                    animation: "slideR .6s .05s cubic-bezier(.22,1,.36,1) both",
                }}>
                    {/* Grid */}
                    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

                    {/* Glows */}
                    <div style={{ position: "absolute", top: "15%", right: "-10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,168,48,.14) 0%, transparent 70%)", filter: "blur(35px)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "10%", left: "0%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,85,42,.1) 0%, transparent 70%)", filter: "blur(28px)", pointerEvents: "none" }} />

                    {/* Floating chips */}
                    <div className="floating-chip" style={{ top: 88, right: 28, minWidth: 188, animation: "floatA 4s ease-in-out infinite" }}>
                        <div style={{ fontSize: ".65rem", color: "var(--muted)", letterSpacing: ".1em", marginBottom: 8 }}>NEW MEMBER</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Clash Display',sans-serif", fontSize: ".75rem", fontWeight: 700 }}>RS</div>
                            <div>
                                <div style={{ fontSize: ".82rem", fontWeight: 600 }}>Riya Sharma</div>
                                <div style={{ fontSize: ".68rem", color: "var(--muted)" }}>IIT Delhi · Just joined</div>
                            </div>
                        </div>
                    </div>

                    <div className="floating-chip" style={{ bottom: 110, right: 20, minWidth: 172, animation: "floatB 5s ease-in-out infinite" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                            <span style={{ color: "var(--amber)", fontSize: ".85rem" }}>✦</span>
                            <span style={{ fontSize: ".7rem", fontWeight: 600, color: "var(--amber-deep)" }}>AI Priced in 2s</span>
                        </div>
                        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.35rem", fontWeight: 700 }}>₹3,400</div>
                        <div style={{ fontSize: ".68rem", color: "var(--muted)" }}>Suggested for your cycle</div>
                    </div>

                    {/* Main copy */}
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            background: "rgba(232,168,48,.12)", border: "1px solid rgba(232,168,48,.25)",
                            borderRadius: 100, padding: "6px 14px",
                            fontSize: ".7rem", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase",
                            color: "var(--amber)", marginBottom: 22,
                        }}>
                            <div style={{ position: "relative" }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--amber)" }} />
                                <div style={{ position: "absolute", inset: -1, borderRadius: "50%", border: "1px solid var(--amber)", animation: "pulse 2s ease-out infinite" }} />
                            </div>
                            24,000+ students
                        </div>

                        <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(1.7rem,2.6vw,2.4rem)", fontWeight: 700, lineHeight: 1.1, color: "white", letterSpacing: "-.025em", marginBottom: 14 }}>
                            Trade smarter<br />with your<br />
                            <span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", color: "var(--amber)" }}>campus community.</span>
                        </h2>
                        <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.4)", lineHeight: 1.8, maxWidth: 320, marginBottom: 32 }}>
                            Buy second-hand textbooks, electronics, cycles & more — all from verified students near you.
                        </p>

                        {/* Benefits list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {[
                                { icon: "✦", text: "AI suggests fair prices instantly" },
                                { icon: "💬", text: "Real-time chat with buyers & sellers" },
                                { icon: "🎓", text: "Only verified college students" },
                                { icon: "⚡", text: "Zero platform fees — always free" },
                            ].map((b, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", flexShrink: 0 }}>{b.icon}</div>
                                    <span style={{ fontSize: ".85rem", color: "rgba(255,255,255,.65)" }}>{b.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Avatars */}
                        <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ display: "flex" }}>
                                {["AS", "MK", "PR", "DV", "SR"].map((init, i) => (
                                    <div key={i} style={{
                                        width: 30, height: 30, borderRadius: "50%",
                                        background: ["var(--amber)", "var(--rust)", "var(--sage)", "#6B7FBF", "var(--amber-deep)"][i],
                                        border: "2px solid var(--ink)", marginLeft: i ? -9 : 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: ".58rem", fontWeight: 700, color: "white", position: "relative", zIndex: 5 - i,
                                    }}>{init}</div>
                                ))}
                            </div>
                            <div>
                                <div style={{ fontSize: ".82rem", fontWeight: 600, color: "white" }}>Join them today</div>
                                <div style={{ fontSize: ".7rem", color: "rgba(255,255,255,.35)" }}>Free · No credit card</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}