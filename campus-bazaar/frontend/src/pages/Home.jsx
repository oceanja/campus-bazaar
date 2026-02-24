import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getListings } from "../lib/listings";


// ─── Inline styles & keyframes injected once ───────────────────────────────
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

    html { scroll-behavior: smooth; }

    body {
      background: var(--warm-white);
      color: var(--ink);
      font-family: 'DM Sans', sans-serif;
      overflow-x: hidden;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes floatA {
      0%,100% { transform: translateY(0px) rotate(-2deg); }
      50%      { transform: translateY(-14px) rotate(-2deg); }
    }
    @keyframes floatB {
      0%,100% { transform: translateY(0px) rotate(3deg); }
      50%      { transform: translateY(-10px) rotate(3deg); }
    }
    @keyframes floatC {
      0%,100% { transform: translateY(0px) rotate(-1deg); }
      50%      { transform: translateY(-18px) rotate(-1deg); }
    }
    @keyframes marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes pulseRing {
      0%   { transform: scale(1);   opacity: .6; }
      100% { transform: scale(1.7); opacity: 0;  }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes badgePop {
      0%   { transform: scale(0.8); opacity: 0; }
      60%  { transform: scale(1.08); }
      100% { transform: scale(1);   opacity: 1; }
    }

    .hero-title {
      font-family: 'Clash Display', sans-serif;
      font-size: clamp(3.2rem, 7vw, 6.5rem);
      font-weight: 700;
      line-height: 1.0;
      letter-spacing: -0.03em;
    }
    .serif-italic {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      color: var(--amber);
    }
    .section-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.72rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .card-hover {
      transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s ease;
    }
    .card-hover:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 48px rgba(26,22,18,0.13);
    }
    .btn-primary {
      background: var(--ink);
      color: var(--cream);
      border: none;
      padding: 14px 32px;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.25s, transform 0.2s;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary:hover { background: var(--rust); transform: scale(1.03); }
    .btn-outline {
      background: transparent;
      color: var(--ink);
      border: 1.5px solid var(--ink);
      padding: 13px 30px;
      border-radius: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.25s, color 0.25s, transform 0.2s;
    }
    .btn-outline:hover { background: var(--ink); color: var(--cream); transform: scale(1.03); }

    .marquee-track {
      display: flex;
      width: max-content;
      animation: marquee 28s linear infinite;
    }
    .marquee-track:hover { animation-play-state: paused; }

    .noise::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      border-radius: inherit;
    }

    .tag-chip {
      background: var(--cream);
      border: 1px solid var(--dust);
      border-radius: 100px;
      padding: 6px 14px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
      white-space: nowrap;
    }
    .tag-chip:hover, .tag-chip.active {
      background: var(--amber);
      border-color: var(--amber);
      transform: scale(1.05);
    }

    .product-img-wrap {
      overflow: hidden;
      border-radius: 16px 16px 0 0;
      position: relative;
    }
    .product-img-wrap img {
      width: 100%; height: 220px; object-fit: cover;
      transition: transform 0.5s cubic-bezier(.22,1,.36,1);
    }
    .product-img-wrap:hover img { transform: scale(1.07); }

    .rating-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--sage);
      display: inline-block;
    }

    input[type=text], input[type=search] {
      font-family: 'DM Sans', sans-serif;
      outline: none;
    }

    .ai-badge {
      background: linear-gradient(135deg, #C8861A, #E8A830);
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      padding: 3px 9px;
      border-radius: 100px;
      display: inline-flex; align-items: center; gap: 4px;
    }

    .scroll-reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.7s ease, transform 0.7s cubic-bezier(.22,1,.36,1);
    }
    .scroll-reveal.visible {
      opacity: 1;
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      /* Hide decorative floating cards — they overflow on small screens */
      .hero-float-card { display: none !important; }

      /* AI features: collapse 2-col to 1-col */
      .ai-grid { grid-template-columns: 1fr !important; gap: 36px !important; }

      /* Slightly smaller nav buttons */
      nav .btn-primary, nav .btn-outline {
        padding: 8px 14px !important;
        font-size: 0.8rem !important;
      }

      /* Hero text: reduce top padding so content isn't pushed too far down */
      .hero-inner { padding-top: 80px !important; }

      /* Tighten hero stats row */
      .hero-stats { gap: 20px !important; flex-wrap: wrap; }
    }
  `}</style>
);

// ─── Mock data ──────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Books", "Electronics", "Furniture", "Clothes", "Cycles", "Stationery", "Sports", "Others"];

const TESTIMONIALS = [
    { name: "Arjun Sharma", college: "IIT Delhi, 3rd Year", text: "Sold my old laptop in 2 days. The AI price suggestion was spot-on — no awkward negotiations!", avatar: "AS" },
    { name: "Meera Iyer", college: "DU South, 2nd Year", text: "Found affordable textbooks for all my subjects. Saved ₹3,000 this semester alone.", avatar: "MI" },
    { name: "Karan Singh", college: "NSUT, Final Year", text: "The real-time chat made it super easy to negotiate and pick up items from campus.", avatar: "KS" },
];

const STATS = [
    { value: "24K+", label: "Students" },
    { value: "8K+", label: "Listings" },
    { value: "₹2Cr+", label: "Saved" },
    { value: "50+", label: "Colleges" },
];

// ─── Floating card component ─────────────────────────────────────────────────
const FloatingCard = ({ style, anim, children }) => (
    <div className="hero-float-card" style={{
        position: "absolute",
        background: "white",
        borderRadius: 16,
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(26,22,18,0.12)",
        animation: anim,
        ...style,
    }}>{children}</div>
);

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ p, delay = 0 }) => {
    const [fav, setFav] = useState(false);
    const price = p.price || 0;
    const original = p.original_price || price;
    const disc = original > 0 ? Math.round((1 - price / original) * 100) : 0;
    const sellerInitials = p.profiles?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
    return (
        <div className="card-hover scroll-reveal" style={{
            background: "white",
            borderRadius: 20,
            overflow: "hidden",
            border: "1px solid #EDE8E0",
            animationDelay: `${delay}ms`,
        }}>
            <div className="product-img-wrap">
                <img src={p.image_url || "https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=500&q=80"} alt={p.title} loading="lazy" />
                {p.badge && (
                    <span style={{
                        position: "absolute", top: 12, left: 12,
                        background: p.badge.includes("Hot") ? "var(--rust)" : "var(--ink)",
                        color: "white", fontSize: "0.72rem", fontWeight: 600,
                        padding: "4px 10px", borderRadius: 100,
                        animation: "badgePop 0.4s ease forwards",
                    }}>{p.badge}</span>
                )}
                <button onClick={() => setFav(f => !f)} style={{
                    position: "absolute", top: 10, right: 12,
                    background: "white", border: "none", borderRadius: "50%",
                    width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: "1.1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s",
                    transform: fav ? "scale(1.2)" : "scale(1)",
                }}>{fav ? "❤️" : "🤍"}</button>
                {disc > 0 && (
                    <div style={{
                        position: "absolute", bottom: 12, left: 12,
                        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
                        borderRadius: 100, padding: "4px 10px", fontSize: "0.72rem", fontWeight: 600,
                        color: "var(--sage)",
                    }}>↓{disc}% OFF</div>
                )}
            </div>
            <div style={{ padding: "16px 18px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <p style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 500 }}>{p.category}</p>
                    <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>👁 {p.views || 0}</span>
                </div>
                <h3 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1rem", fontWeight: 600, lineHeight: 1.3, marginBottom: 8 }}>{p.title}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.25rem", fontWeight: 700 }}>₹{price.toLocaleString()}</span>
                    {original > price && (
                        <span style={{ fontSize: "0.8rem", color: "var(--muted)", textDecoration: "line-through" }}>₹{original.toLocaleString()}</span>
                    )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                    <span className="ai-badge">✦ AI Verified Price</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.6rem", fontWeight: 700, color: "white",
                        }}>{sellerInitials}</div>
                        <div>
                            <p style={{ fontSize: "0.72rem", fontWeight: 500, lineHeight: 1 }}>{p.profiles?.name || "Verified Seller"}</p>
                            <p style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{p.profiles?.college || "Campus Community"}</p>
                        </div>
                    </div>
                    <button
                        className="btn-primary"
                        style={{ padding: "8px 18px", fontSize: "0.78rem" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = "/login";
                        }}
                    >
                        Message
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const revealRefs = useRef([]);



    // Navbar scroll effect
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Load real listings
    useEffect(() => {
        setLoading(true);
        getListings()
            .then(data => {
                setListings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Home: Error loading listings:", err);
                setLoading(false);
            });
    }, []);

    // Intersection observer for scroll reveals
    useEffect(() => {
        const obs = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
            { threshold: 0.12 }
        );
        document.querySelectorAll(".scroll-reveal").forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [listings, loading, activeCategory, search]); // Re-observe when listings load or filter changes

    const filtered = listings.filter(p =>
        (activeCategory === "All" || p.category === activeCategory) &&
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <GlobalStyles />

            {/* ── NAVBAR ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "0 5%",
                background: scrolled ? "rgba(253,250,245,0.92)" : "transparent",
                backdropFilter: scrolled ? "blur(16px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(212,197,176,0.5)" : "none",
                transition: "all 0.4s ease",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                height: 68,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "var(--ink)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <span style={{ color: "var(--amber)", fontSize: "1.1rem" }}>⬡</span>
                    </div>
                    <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
                        Campus<span style={{ color: "var(--amber)" }}>Bazaar</span>
                    </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                        className="btn-outline"
                        style={{ padding: "9px 22px", fontSize: "0.85rem" }}
                        onClick={() => navigate("/login")}
                    >
                        Log In
                    </button>

                    <button className="btn-primary" style={{ padding: "9px 22px", fontSize: "0.85rem" }} onClick={() => navigate("/login")}>Sell Now</button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section style={{
                position: "relative",
                minHeight: "100vh",
                display: "flex", alignItems: "center",
                padding: "0 5%",
                overflow: "hidden",
                background: "var(--warm-white)",
            }}>
                {/* Decorative blobs */}
                <div style={{
                    position: "absolute", top: "10%", right: "8%",
                    width: 420, height: 420, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(232,168,48,0.18) 0%, transparent 70%)",
                    filter: "blur(40px)", pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: "15%", left: "3%",
                    width: 280, height: 280, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(196,85,42,0.12) 0%, transparent 70%)",
                    filter: "blur(30px)", pointerEvents: "none",
                }} />

                {/* Grid pattern */}
                <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    backgroundImage: `linear-gradient(rgba(26,22,18,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,22,18,0.04) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }} />

                <div className="hero-inner" style={{ maxWidth: 680, position: "relative", zIndex: 2, paddingTop: 100 }}>
                    <div style={{ animation: "fadeUp 0.7s ease forwards", display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                        <span className="section-label">Campus marketplace</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ position: "relative" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sage)" }} />
                                <div style={{
                                    position: "absolute", inset: -1, borderRadius: "50%",
                                    border: "1px solid var(--sage)",
                                    animation: "pulseRing 1.8s ease-out infinite",
                                }} />
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "var(--sage)", fontWeight: 500 }}>24K students online</span>
                        </div>
                    </div>

                    <h1 className="hero-title" style={{ animation: "fadeUp 0.8s 0.1s ease both", marginBottom: 24 }}>
                        Buy & Sell<br />
                        <span className="serif-italic">smarter</span> on<br />
                        campus.
                    </h1>

                    <p style={{
                        animation: "fadeUp 0.8s 0.22s ease both",
                        fontSize: "1.05rem", color: "var(--ink-light)", lineHeight: 1.7,
                        maxWidth: 480, marginBottom: 36,
                    }}>
                        The AI-powered marketplace built exclusively for college students. Get fair prices instantly — no haggling, no guesswork.
                    </p>

                    <div style={{ animation: "fadeUp 0.8s 0.34s ease both", display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
                        <button className="btn-primary" style={{ fontSize: "1rem", padding: "15px 36px" }} onClick={() => {
                            const grid = document.querySelector("#listings-grid");
                            if (grid) grid.scrollIntoView({ behavior: "smooth" });
                        }}>
                            Start Browsing <span style={{ fontSize: "1.1rem" }}>→</span>
                        </button>
                        <button className="btn-outline" style={{ fontSize: "1rem", padding: "15px 36px" }} onClick={() => navigate("/login")}>
                            List an Item
                        </button>
                    </div>

                    {/* Stats row */}
                    <div className="hero-stats" style={{
                        animation: "fadeUp 0.8s 0.46s ease both",
                        display: "flex", gap: 32, flexWrap: "wrap",
                    }}>
                        {[
                            { value: "24K+", label: "Students" },
                            { value: listings.length > 0 ? `${listings.length}+` : STATS[1].value, label: "Listings" },
                            { value: "₹2Cr+", label: "Saved" },
                            { value: "50+", label: "Colleges" },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)" }}>{s.value}</div>
                                <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 500 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Floating cards – decorative right side */}
                <div style={{ position: "absolute", right: "5%", top: "50%", transform: "translateY(-50%)", width: 320, display: "none" }} className="hero-cards">
                    {/* These show on wider screens via media query — styled inline for simplicity */}
                </div>

                {/* Floating UI snippets */}
                <FloatingCard
                    style={{ top: "22%", right: "12%", minWidth: 200 }}
                    anim="floatA 4s ease-in-out infinite"
                >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.3rem",
                        }}>💻</div>
                        <div>
                            <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "0.9rem", fontWeight: 600 }}>MacBook M1</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>₹54,000</div>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                            <span style={{ fontSize: "0.68rem", color: "var(--sage)", fontWeight: 600, background: "#EEF5EF", padding: "3px 8px", borderRadius: 100 }}>Like New</span>
                        </div>
                    </div>
                </FloatingCard>

                <FloatingCard
                    style={{ bottom: "28%", right: "22%", minWidth: 170 }}
                    anim="floatB 5s ease-in-out infinite"
                >
                    <div style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "1rem" }}>✦</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--amber-deep)" }}>AI Price Suggestion</span>
                    </div>
                    <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.4rem", fontWeight: 700 }}>₹55,000</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>Based on market data</div>
                </FloatingCard>

                <FloatingCard
                    style={{ top: "55%", right: "8%", minWidth: 155 }}
                    anim="floatC 3.5s ease-in-out infinite"
                >
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 6 }}>New message from</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: "var(--rust)", color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: 700,
                        }}>PK</div>
                        <div>
                            <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>Priya K.</div>
                            <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>"Is this still available?"</div>
                        </div>
                    </div>
                </FloatingCard>

                {/* Scroll cue */}
                <div style={{
                    position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    animation: "fadeIn 1s 1s ease both",
                }}>
                    <span style={{ fontSize: "0.68rem", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>scroll</span>
                    <div style={{
                        width: 1, height: 40,
                        background: "linear-gradient(to bottom, var(--muted), transparent)",
                    }} />
                </div>
            </section>

            {/* ── MARQUEE STRIP ── */}
            <div style={{
                background: "var(--ink)", padding: "14px 0",
                overflow: "hidden", userSelect: "none",
            }}>
                <div className="marquee-track">
                    {[...Array(2)].map((_, i) =>
                        ["📚 Textbooks", "💻 Electronics", "🚲 Cycles", "🪑 Furniture", "👕 Clothes", "🎮 Gaming", "🏋️ Sports", "✏️ Stationery"].map((item, j) => (
                            <span key={`${i}-${j}`} style={{
                                color: "var(--cream)", fontSize: "0.8rem", fontWeight: 500,
                                letterSpacing: "0.06em", padding: "0 32px",
                                display: "flex", alignItems: "center", gap: 8,
                            }}>
                                {item}
                                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--amber)", display: "inline-block" }} />
                            </span>
                        ))
                    )}
                </div>
            </div>

            {/* ── SEARCH + FILTER ── */}
            <section style={{ padding: "72px 5% 0", maxWidth: 1200, margin: "0 auto" }}>
                <div className="scroll-reveal" style={{ marginBottom: 32 }}>
                    <p className="section-label" style={{ marginBottom: 12 }}>Find what you need</p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <div style={{
                            flex: "1 1 320px", position: "relative",
                            background: "white", borderRadius: 100,
                            border: "1.5px solid var(--dust)",
                            display: "flex", alignItems: "center",
                            padding: "12px 20px", gap: 10,
                            boxShadow: "0 2px 16px rgba(26,22,18,0.05)",
                        }}>
                            <span style={{ fontSize: "1.1rem", opacity: 0.5 }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search textbooks, laptops, cycles…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    border: "none", background: "transparent",
                                    flex: 1, fontSize: "0.9rem", color: "var(--ink)",
                                }}
                            />
                        </div>
                        <button className="btn-primary" style={{ flex: "0 0 auto", borderRadius: 100, padding: "12px 28px" }}>
                            Search
                        </button>
                    </div>
                </div>

                {/* Category chips */}
                <div className="scroll-reveal" style={{
                    display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 48,
                    animationDelay: "0.1s",
                }}>
                    {CATEGORIES.map(c => (
                        <button
                            key={c}
                            className={`tag-chip ${activeCategory === c ? "active" : ""}`}
                            onClick={() => setActiveCategory(c)}
                        >{c}</button>
                    ))}
                </div>
            </section>

            {/* ── PRODUCT GRID ── */}
            <section id="listings-grid" style={{ padding: "0 5% 80px", maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                    <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.6rem", fontWeight: 700 }}>
                        {filtered.length} listings {activeCategory !== "All" ? `in ${activeCategory}` : ""}
                    </h2>
                    <select style={{
                        border: "1.5px solid var(--dust)", borderRadius: 100,
                        padding: "9px 18px", fontFamily: "'DM Sans',sans-serif",
                        fontSize: "0.85rem", background: "white", cursor: "pointer",
                        color: "var(--ink)", outline: "none",
                    }}>
                        <option>Newest first</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Most Viewed</option>
                    </select>
                </div>

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 24,
                }}>
                    {filtered.map((p, i) => <ProductCard key={p.id} p={p} delay={i * 80} />)}
                </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
                        <p style={{ fontSize: "1.1rem" }}>No listings found. Try a different search.</p>
                    </div>
                )}
            </section>

            {/* ── AI FEATURE HIGHLIGHT ── */}
            <section style={{
                background: "var(--ink)", color: "var(--cream)",
                padding: "96px 5%", position: "relative", overflow: "hidden",
            }}>
                {/* decorative ring */}
                <div style={{
                    position: "absolute", right: "-80px", top: "50%", transform: "translateY(-50%)",
                    width: 500, height: 500, borderRadius: "50%",
                    border: "1px solid rgba(232,168,48,0.15)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", right: "-40px", top: "50%", transform: "translateY(-50%)",
                    width: 380, height: 380, borderRadius: "50%",
                    border: "1px solid rgba(232,168,48,0.08)",
                    pointerEvents: "none",
                }} />

                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div className="ai-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
                        <div className="scroll-reveal">
                            <span className="section-label" style={{ color: "var(--amber)" }}>Powered by AI</span>
                            <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(2rem,4vw,3.2rem)", fontWeight: 700, lineHeight: 1.1, margin: "16px 0 20px" }}>
                                Fair prices.<br />
                                <span className="serif-italic">Instantly.</span>
                            </h2>
                            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#B8A898", maxWidth: 420, marginBottom: 36 }}>
                                Tell us your item's category, condition, and original price — our AI instantly suggests a fair resale price tailored to the Indian college student market.
                            </p>
                            <button className="btn-primary" style={{ background: "var(--amber)", color: "var(--ink)", fontWeight: 600 }} onClick={() => navigate("/login")}>
                                Try AI Pricing →
                            </button>
                        </div>

                        <div className="scroll-reveal" style={{ animationDelay: "0.15s" }}>
                            <div style={{
                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 24, padding: 32, backdropFilter: "blur(8px)",
                            }}>
                                {[
                                    { label: "💰 Price Suggestion", desc: "Instantly recommends a fair resale price based on your item details" },
                                    { label: "📊 Market-Aware", desc: "Calibrated for Indian college campuses and student buying patterns" },
                                    { label: "🔄 Condition-Adjusted", desc: "Price accounts for item condition and original purchase value" },
                                    { label: "💬 Clear Reasoning", desc: "Explains the suggested price so you can negotiate with confidence" },
                                ].map((f, i) => (
                                    <div key={i} style={{
                                        display: "flex", gap: 16, alignItems: "flex-start",
                                        padding: "16px 0",
                                        borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                            background: "rgba(232,168,48,0.12)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "1.1rem",
                                        }}>{f.label.split(" ")[0]}</div>
                                        <div>
                                            <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 4 }}>{f.label.slice(3)}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#8A7A6A" }}>{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section style={{ padding: "96px 5%", maxWidth: 1200, margin: "0 auto" }}>
                <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: 56 }}>
                    <p className="section-label" style={{ marginBottom: 12 }}>Simple process</p>
                    <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 700 }}>
                        Selling takes <span className="serif-italic">3 minutes</span>
                    </h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
                    {[
                        { step: "01", icon: "📸", title: "Snap & Upload", body: "Take photos of your item. Our AI will handle the rest — analysis, description, pricing." },
                        { step: "02", icon: "✦", title: "AI Prices It", body: "Get a fair, data-backed price suggestion in seconds based on real campus sales." },
                        { step: "03", icon: "💬", title: "Chat Directly", body: "Buyers message you in real-time. No middlemen, no fees, no hassle." },
                        { step: "04", icon: "🤝", title: "Meet & Swap", body: "Meetup on campus, hand over the item, get paid. Done." },
                    ].map((s, i) => (
                        <div key={i} className="scroll-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                            <div style={{
                                fontFamily: "'Clash Display',sans-serif", fontSize: "0.72rem",
                                fontWeight: 700, letterSpacing: "0.15em", color: "var(--amber)",
                                marginBottom: 16,
                            }}>{s.step}</div>
                            <div style={{
                                width: 56, height: 56, borderRadius: 16,
                                background: "var(--cream)", border: "1px solid var(--dust)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.6rem", marginBottom: 18,
                            }}>{s.icon}</div>
                            <h3 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.1rem", fontWeight: 600, marginBottom: 10 }}>{s.title}</h3>
                            <p style={{ fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.7 }}>{s.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section style={{ background: "var(--cream)", padding: "80px 5%" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div className="scroll-reveal" style={{ marginBottom: 48, textAlign: "center" }}>
                        <p className="section-label" style={{ marginBottom: 12 }}>Student stories</p>
                        <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 700 }}>
                            They <span className="serif-italic">love</span> it
                        </h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="card-hover scroll-reveal" style={{
                                background: "white", borderRadius: 20, padding: 28,
                                border: "1px solid #EDE8E0", animationDelay: `${i * 100}ms`,
                            }}>
                                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                                    {[...Array(5)].map((_, j) => <span key={j} style={{ color: "var(--amber)", fontSize: "0.9rem" }}>★</span>)}
                                </div>
                                <p style={{ fontSize: "0.92rem", lineHeight: 1.75, color: "var(--ink-light)", marginBottom: 20, fontStyle: "italic" }}>
                                    "{t.text}"
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: "50%",
                                        background: "var(--ink)", color: "var(--amber)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontFamily: "'Clash Display',sans-serif", fontSize: "0.8rem", fontWeight: 700,
                                    }}>{t.avatar}</div>
                                    <div>
                                        <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{t.name}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{t.college}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section style={{
                padding: "96px 5%", textAlign: "center",
                background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,168,48,0.12) 0%, transparent 70%)`,
                maxWidth: 1200, margin: "0 auto",
            }}>
                <div className="scroll-reveal">
                    <p className="section-label" style={{ marginBottom: 16 }}>Ready to start?</p>
                    <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "clamp(2.2rem,5vw,4rem)", fontWeight: 700, lineHeight: 1.05, marginBottom: 24 }}>
                        Your campus.<br />
                        Your <span className="serif-italic">marketplace.</span>
                    </h2>
                    <p style={{ fontSize: "1rem", color: "var(--muted)", marginBottom: 40, maxWidth: 400, margin: "0 auto 40px" }}>
                        Join 24,000+ students already buying and selling smarter.
                    </p>
                    <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                        <button className="btn-primary" style={{ padding: "16px 42px", fontSize: "1rem" }}>
                            Get Started — It's Free →
                        </button>
                        <button className="btn-outline" style={{ padding: "16px 42px", fontSize: "1rem" }}>
                            Browse Listings
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{
                background: "var(--ink)", color: "#8A7A6A",
                padding: "48px 5% 32px",
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 48 }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ color: "var(--ink)", fontSize: "1rem" }}>⬡</span>
                                </div>
                                <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "var(--cream)" }}>
                                    Campus<span style={{ color: "var(--amber)" }}>Bazaar</span>
                                </span>
                            </div>
                            <p style={{ fontSize: "0.82rem", maxWidth: 220, lineHeight: 1.7 }}>
                                The smarter way to buy & sell within your college community.
                            </p>
                        </div>
                        {[
                            { heading: "Marketplace", links: ["Browse All", "Electronics", "Books", "Furniture", "Cycles"] },
                            { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
                            { heading: "Support", links: ["Help Center", "Safety Tips", "Report Issue", "Contact"] },
                        ].map(col => (
                            <div key={col.heading}>
                                <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "var(--cream)", letterSpacing: "0.08em", marginBottom: 16 }}>{col.heading}</div>
                                {col.links.map(l => (
                                    <div key={l} style={{ fontSize: "0.82rem", marginBottom: 10, cursor: "pointer", transition: "color 0.2s" }}
                                        onMouseOver={e => e.target.style.color = "var(--amber)"}
                                        onMouseOut={e => e.target.style.color = "#8A7A6A"}
                                    >{l}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <p style={{ fontSize: "0.75rem" }}>© 2025 CampusBazaar. Made with ❤️ for students.</p>
                        <p style={{ fontSize: "0.75rem" }}>Privacy · Terms · Cookies</p>
                    </div>
                </div>
            </footer>
        </>
    );
}