import { useState, useEffect, useRef, useCallback } from "react";
import { logout } from "../lib/auth";
import { updateProfile, upsertProfile, getProfileCompleteness, getInitials } from "../lib/profile";
import { createListing, uploadListingImage, getListings, getMyListings, updateListingStatus, updateListing } from "../lib/listings";
import { suggestPrice } from "../lib/ai";
import { supabase } from "../lib/supabase";
import { getOrCreateConversation, getConversations, getMessages, sendMessage, subscribeToMessages } from "../lib/messages";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────────── */
const G = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

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
      --sidebar-w: 256px;
      --bg: #F2EDE4;
    }
    html, body { height: 100%; overflow: hidden; }
    body { background: var(--bg); color: var(--ink); font-family: 'DM Sans', sans-serif; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--dust); border-radius: 10px; }

    @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes slideIn  { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
    @keyframes pop      { 0%{transform:scale(.85);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
    @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes shimmer  {
      0%   { background-position: -600px 0; }
      100% { background-position:  600px 0; }
    }

    .sidebar-link {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 14px; border-radius: 12px;
      font-size: 0.875rem; font-weight: 500; cursor: pointer;
      transition: background 0.18s, color 0.18s, transform 0.15s;
      color: var(--muted); border: none; background: none; width: 100%;
      text-align: left; text-decoration: none;
    }
    .sidebar-link:hover { background: rgba(26,22,18,0.06); color: var(--ink); transform: translateX(2px); }
    .sidebar-link.active { background: var(--ink); color: var(--cream); }
    .sidebar-link.active .link-icon { filter: invert(1); }

    /* ✅ Dedicated logout button style — rust hover so it feels intentional */
    .sidebar-logout {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 14px; border-radius: 12px;
      font-size: 0.875rem; font-weight: 500; cursor: pointer;
      transition: background 0.18s, color 0.18s, transform 0.15s;
      color: rgba(255,255,255,0.35); border: none; background: none; width: 100%;
      text-align: left; margin-top: 12px;
    }
    .sidebar-logout:hover {
      background: rgba(196,85,42,0.18);
      color: var(--rust);
      transform: translateX(2px);
    }

    .card {
      background: white; border-radius: 20px;
      border: 1px solid rgba(212,197,176,0.5);
      padding: 24px;
    }
    .card-sm { border-radius: 16px; padding: 18px; }

    .btn { border: none; cursor: pointer; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.2s; display: inline-flex; align-items: center; gap: 7px; }
    .btn-ink  { background: var(--ink); color: var(--cream); padding: 10px 22px; font-size: .87rem; }
    .btn-ink:hover  { background: var(--rust); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(196,85,42,.25); }
    .btn-amber { background: var(--amber); color: var(--ink); padding: 10px 22px; font-size: .87rem; font-weight: 600; }
    .btn-amber:hover { background: var(--amber-deep); transform: translateY(-1px); }
    .btn-ghost { background: transparent; color: var(--ink); border: 1.5px solid var(--dust); padding: 9px 20px; font-size: .85rem; }
    .btn-ghost:hover { border-color: var(--ink); background: var(--cream); }

    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 100px; font-size: .7rem; font-weight: 600; }
    .badge-green  { background: #EEF5EF; color: var(--sage); }
    .badge-amber  { background: rgba(232,168,48,.15); color: var(--amber-deep); }
    .badge-rust   { background: rgba(196,85,42,.1);  color: var(--rust); }
    .badge-ink    { background: var(--ink); color: var(--cream); }

    .stat-card { background: white; border-radius: 18px; padding: 20px 22px; border: 1px solid rgba(212,197,176,.5); transition: transform .25s, box-shadow .25s; }
    .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(26,22,18,.09); }

    .product-card-dash { background: white; border-radius: 18px; border: 1px solid rgba(212,197,176,.5); overflow: hidden; transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s; }
    .product-card-dash:hover { transform: translateY(-5px); box-shadow: 0 18px 40px rgba(26,22,18,.1); }
    .product-card-dash img { width:100%; height:160px; object-fit:cover; transition: transform .5s; }
    .product-card-dash:hover img { transform: scale(1.06); }

    .input-field {
      width: 100%; border: 1.5px solid var(--dust);
      border-radius: 12px; padding: 11px 15px;
      font-family: 'DM Sans', sans-serif; font-size: .9rem;
      color: var(--ink); background: var(--warm-white);
      outline: none; transition: border-color .2s, box-shadow .2s;
    }
    .input-field:focus { border-color: var(--amber); box-shadow: 0 0 0 3px rgba(232,168,48,.12); background: white; }
    .input-field::placeholder { color: var(--muted); }

    select.input-field { cursor: pointer; }

    .progress-bar { height: 6px; border-radius: 100px; background: var(--cream); overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, var(--amber), var(--amber-deep)); transition: width .8s cubic-bezier(.22,1,.36,1); }

    .msg-bubble-me   { background: var(--ink); color: white; border-radius: 18px 18px 4px 18px; padding: 10px 15px; max-width: 72%; margin-left: auto; font-size: .875rem; }
    .msg-bubble-them { background: white; color: var(--ink); border-radius: 18px 18px 18px 4px; padding: 10px 15px; max-width: 72%; border: 1px solid var(--dust); font-size: .875rem; }

    .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--rust); border: 2px solid white; position: absolute; top: -1px; right: -1px; }

    .tab-pill { padding: 7px 18px; border-radius: 100px; font-size: .82rem; font-weight: 500; border: none; cursor: pointer; transition: all .2s; background: transparent; color: var(--muted); }
    .tab-pill.active { background: var(--ink); color: var(--cream); }
    .tab-pill:hover:not(.active) { background: var(--cream); color: var(--ink); }

    .shimmer-line {
      border-radius: 6px; background: linear-gradient(90deg, var(--cream) 25%, #EDE8E0 50%, var(--cream) 75%);
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite;
    }

    .cart-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid rgba(212,197,176,.4); }
    .cart-row:last-child { border-bottom: none; }

    .profile-completion-ring {
      width: 72px; height: 72px; border-radius: 50%;
      background: conic-gradient(var(--amber) 0% 68%, var(--cream) 68% 100%);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .profile-completion-ring-inner {
      width: 56px; height: 56px; border-radius: 50%;
      background: white;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Clash Display', sans-serif; font-size: .95rem; font-weight: 700;
    }

    .section-heading { font-family:'Clash Display',sans-serif; font-weight:700; font-size:1.15rem; letter-spacing:-.02em; }

    /* ── Mobile-only visibility helpers (hidden by default on desktop) ── */
    .mob-nav  { display: none; }
    .mob-back { display: none; }

    @media (max-width: 768px) {
      .dash-sidebar { display: none !important; }
      .dash-content { padding: 16px 14px 84px !important; }
      .dash-topbar  { padding: 14px 16px 0 !important; }
      .dash-topbar-search { display: none !important; }

      /* Messages: one-panel-at-a-time */
      .dash-messages-grid {
        grid-template-columns: 1fr !important;
        height: calc(100svh - 180px) !important;
      }
      .dash-msg-chat { display: none !important; }
      .dash-messages-grid[data-chat-open="true"] .dash-msg-list  { display: none !important; }
      .dash-messages-grid[data-chat-open="true"] .dash-msg-chat  { display: flex !important; flex-direction: column; }

      /* Mobile bottom nav & back-arrow */
      .mob-nav  { display: flex !important; position: fixed; bottom: 0; left: 0; right: 0;
                  background: var(--ink); border-top: 1px solid rgba(255,255,255,.08);
                  padding: 10px 0 max(10px, env(safe-area-inset-bottom)); z-index: 100;
                  align-items: center; justify-content: space-around; }
      .mob-back { display: inline-flex !important; align-items: center; margin-right: 4px; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA (listings, shop, chat - not profile)
───────────────────────────────────────────────────────────────── */

const LISTINGS = [
    { id: 1, title: "MacBook Air M1", price: 54000, status: "Active", views: 142, favorites: 23, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=75", category: "Electronics" },
    { id: 2, title: "Organic Chemistry – Morrison Boyd", price: 280, status: "Sold", views: 67, favorites: 8, img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=75", category: "Books" },
    { id: 3, title: "Godrej Study Chair", price: 2200, status: "Active", views: 34, favorites: 5, img: "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&q=75", category: "Furniture" },
];

const SHOP_ITEMS = [
    { id: 1, title: "Canon EOS 1500D", price: 22000, original: 38000, condition: "Like New", seller: "Dev P.", college: "NSUT", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=75", category: "Electronics", aiPrice: 23000 },
    { id: 2, title: "Hero Sprint 26T Cycle", price: 3500, original: 8000, condition: "Good", seller: "Sneha R.", college: "IIT Delhi", img: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&q=75", category: "Cycles", aiPrice: 3600 },
    { id: 3, title: "Data Structures – CLRS", price: 450, original: 1200, condition: "Good", seller: "Meera I.", college: "DU North", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=75", category: "Books", aiPrice: 480 },
    { id: 4, title: "Bosch 6kg Washing Machine", price: 8500, original: 18000, condition: "Good", seller: "Tara N.", college: "Miranda", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75", category: "Others", aiPrice: 8800 },
    { id: 5, title: "PS4 Controller", price: 1800, original: 4500, condition: "Like New", seller: "Rahul M.", college: "NSUT", img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&q=75", category: "Electronics", aiPrice: 1900 },
    { id: 6, title: "Wooden Study Table", price: 3200, original: 7000, condition: "Good", seller: "Anuj K.", college: "Jamia", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=75", category: "Furniture", aiPrice: 3000 },
];

const CONVERSATIONS = [
    { id: 1, name: "Meera Iyer", college: "DU North", last: "Is the cycle still available?", time: "2m", unread: 2, avatar: "MI", item: "Hero Sprint Cycle" },
    { id: 2, name: "Dev Prakash", college: "NSUT", last: "Can you do ₹50,000?", time: "14m", unread: 0, avatar: "DP", item: "MacBook Air M1" },
    { id: 3, name: "Tara Nair", college: "Miranda", last: "Sure, I can pick up tomorrow", time: "1h", unread: 1, avatar: "TN", item: "Study Chair" },
    { id: 4, name: "Karan Singh", college: "NSUT", last: "Thanks for the quick delivery!", time: "3h", unread: 0, avatar: "KS", item: "Morrison Boyd" },
];

const MESSAGES_SAMPLE = [
    { from: "them", text: "Hey! Is the MacBook still available?", time: "10:02 AM" },
    { from: "me", text: "Yes it is! It's in great condition, barely used it.", time: "10:05 AM" },
    { from: "them", text: "Can you share more photos? Particularly the keyboard and ports?", time: "10:06 AM" },
    { from: "me", text: "Sure, I'll send them right now. Also, I can let you inspect it in person on campus.", time: "10:09 AM" },
    { from: "them", text: "That would be great! Can you do ₹52,000?", time: "10:11 AM" },
    { from: "me", text: "I can do ₹53,000 — that's my final price. It comes with the original box and charger.", time: "10:14 AM" },
    { from: "them", text: "Deal! When can we meet?", time: "10:15 AM" },
];

const CART_ITEMS = [
    { id: 1, title: "Canon EOS 1500D", price: 22000, seller: "Dev P.", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&q=75" },
    { id: 2, title: "Data Structures – CLRS", price: 450, seller: "Meera I.", img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&q=75" },
];

const PROFILE_FIELDS = [
    { key: "name", label: "Full Name", type: "text", placeholder: "e.g. Rohan Sharma" },
    { key: "college", label: "College / University", type: "text", placeholder: "e.g. IIT Delhi" },
    { key: "year", label: "Year of Study", type: "select", options: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "PG 1st Year", "PG 2nd Year"] },
    { key: "branch", label: "Branch / Stream", type: "text", placeholder: "e.g. Computer Science" },
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "+91 XXXXX XXXXX" },
    { key: "bio", label: "Short Bio", type: "textarea", placeholder: "Tell others a little about yourself…" },
    { key: "upi_id", label: "UPI ID (for receiving payments)", type: "text", placeholder: "e.g. name@paytm or 9876543210@upi" },
];

const CATEGORIES_SHOP = ["All", "Electronics", "Books", "Furniture", "Cycles", "Clothes", "Sports", "Others"];

/* ─────────────────────────────────────────────────────────────────
   SMALL COMPONENTS
───────────────────────────────────────────────────────────────── */
function UpiButton({ upiId }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(upiId).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: "var(--cream)", border: "1px solid var(--dust)", borderRadius: 100, padding: "6px 6px 6px 14px" }}>
            <span style={{ fontSize: ".7rem", fontWeight: 600, color: "var(--amber-deep)" }}>Pay via UPI</span>
            <span style={{ fontSize: ".75rem", color: "var(--ink)", fontFamily: "monospace" }}>{upiId}</span>
            <button
                onClick={handleCopy}
                style={{ background: copied ? "var(--sage)" : "var(--ink)", color: "white", border: "none", borderRadius: 100, padding: "4px 12px", fontSize: ".7rem", fontWeight: 600, cursor: "pointer", transition: "background .2s", whiteSpace: "nowrap" }}
            >
                {copied ? "✓ Copied" : "Copy"}
            </button>
        </div>
    );
}

const Avatar = ({ initials, size = 40, bg = "var(--amber)", color = "var(--ink)", style = {} }) => (
    <div style={{
        width: size, height: size, borderRadius: "50%", background: bg, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Clash Display',sans-serif", fontSize: size * .3, fontWeight: 700,
        flexShrink: 0, ...style,
    }}>{initials}</div>
);

/* ─────────────────────────────────────────────────────────────────
   SIDEBAR
   ✅ FIX: Receives onLogout as a prop — no more undefined reference
───────────────────────────────────────────────────────────────── */
const NAV = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "shop", icon: "🛍", label: "Shop / Buy" },
    { id: "sell", icon: "＋", label: "Sell Item", needsProfile: true },
    { id: "messages", icon: "💬", label: "Messages", needsProfile: true },
    { id: "cart", icon: "🛒", label: "My Cart" }, // badge added dynamically
    { id: "listings", icon: "📋", label: "My Listings", needsProfile: true },
    { id: "profile", icon: "👤", label: "Complete Profile" },
];

function Sidebar({ active, setActive, onLogout, profile, isProfileComplete, cartCount, myUserId }) {
    const { pct } = getProfileCompleteness(profile);
    const initials = getInitials(profile?.name);
    const cartBadge = cartCount > 0 ? cartCount : null;
    const [msgBadge, setMsgBadge] = useState(null);

    useEffect(() => {
        if (!myUserId) return;
        getConversations(myUserId)
            .then(convos => {
                // Show badge count = number of conversations that have at least 1 message
                const withMsgs = convos.filter(c => c.lastMessage).length;
                setMsgBadge(withMsgs > 0 ? withMsgs : null);
            })
            .catch(() => { });
    }, [myUserId, active]); // re-check when switching tabs

    return (
        <aside className="dash-sidebar" style={{
            width: "var(--sidebar-w)", flexShrink: 0,
            background: "var(--ink)",
            display: "flex", flexDirection: "column",
            padding: "24px 14px",
            animation: "slideIn .45s cubic-bezier(.22,1,.36,1) both",
            position: "relative", overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
            }} />

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 28, paddingLeft: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "var(--ink)", fontSize: "1rem" }}>⬡</span>
                </div>
                <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1.05rem", color: "white", letterSpacing: "-0.02em" }}>
                    Campus<span style={{ color: "var(--amber)" }}>Bazaar</span>
                </span>
            </div>

            {/* Profile card */}
            <div style={{
                background: "rgba(255,255,255,0.06)", borderRadius: 16,
                padding: "14px 14px", marginBottom: 22, border: "1px solid rgba(255,255,255,0.08)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Avatar initials={initials} size={38} bg="var(--amber)" />
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: ".875rem", fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {profile?.name || "Your Name"}
                        </div>
                        <div style={{ fontSize: ".68rem", color: "rgba(255,255,255,0.4)" }}>
                            {profile?.college || "Add your college →"}
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: ".68rem", color: "rgba(255,255,255,0.45)" }}>Profile complete</span>
                        <span style={{ fontSize: ".68rem", color: "var(--amber)", fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                </div>
                {!isProfileComplete && (
                    <button className="btn btn-amber" style={{ width: "100%", marginTop: 10, padding: "7px 14px", fontSize: ".78rem", borderRadius: 10, justifyContent: "center" }}
                        onClick={() => setActive("profile")}>
                        ✦ Complete Profile
                    </button>
                )}
            </div>

            {/* Nav label */}
            <div style={{ fontSize: ".65rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 8, paddingLeft: 4 }}>Navigation</div>

            {/* Nav items */}
            <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
                {NAV.map(n => {
                    const locked = n.needsProfile && !isProfileComplete;
                    return (
                        <div key={n.id} title={locked ? "Complete your profile (college + year) to unlock this" : ""}>
                            <button
                                className={`sidebar-link ${active === n.id ? "active" : ""}`}
                                onClick={() => !locked && setActive(n.id)}
                                style={{
                                    color: active === n.id ? "var(--cream)" : locked ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.55)",
                                    cursor: locked ? "not-allowed" : "pointer",
                                }}>
                                <span className="link-icon" style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>
                                    {locked ? "🔒" : n.icon}
                                </span>
                                <span style={{ flex: 1 }}>{n.label}</span>
                                {/* Cart badge */}
                                {n.id === "cart" && cartBadge && !locked && (
                                    <span style={{ background: active === n.id ? "rgba(255,255,255,0.2)" : "var(--rust)", color: "white", borderRadius: 100, padding: "1px 7px", fontSize: ".65rem", fontWeight: 700 }}>{cartBadge}</span>
                                )}
                                {/* Messages badge */}
                                {n.id === "messages" && msgBadge && !locked && (
                                    <span style={{ background: active === n.id ? "rgba(255,255,255,0.2)" : "var(--rust)", color: "white", borderRadius: 100, padding: "1px 7px", fontSize: ".65rem", fontWeight: 700 }}>{msgBadge}</span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </nav>

            <button className="sidebar-logout" onClick={onLogout}>
                <span style={{ fontSize: "1rem", width: 20, textAlign: "center" }}>⏻</span>
                Log Out
            </button>
        </aside>
    );
}

/* ─────────────────────────────────────────────────────────────────
   TOPBAR
───────────────────────────────────────────────────────────────── */
function TopBar({ title, subtitle, active, setActive, profile }) {
    const [search, setSearch] = useState("");
    const initials = getInitials(profile?.name);
    return (
        <div className="dash-topbar" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 28px 0", gap: 16, flexShrink: 0,
        }}>
            <div style={{ animation: "fadeUp .4s ease both" }}>
                <h1 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.45rem", fontWeight: 700, letterSpacing: "-.03em" }}>{title}</h1>
                {subtitle && <p style={{ fontSize: ".82rem", color: "var(--muted)", marginTop: 2 }}>{subtitle}</p>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="dash-topbar-search" style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: .45 }}>🔍</span>
                    <input className="input-field" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36, width: 200, padding: "9px 14px 9px 34px", borderRadius: 100, fontSize: ".82rem" }} />
                </div>
                <button onClick={() => setActive("messages")} style={{ position: "relative", background: "white", border: "1.5px solid var(--dust)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .2s" }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = "var(--amber)" }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = "var(--dust)" }}>
                    <span style={{ fontSize: ".95rem" }}>🔔</span>
                    <div className="notif-dot" />
                </button>
                <button onClick={() => setActive("cart")} style={{ position: "relative", background: "white", border: "1.5px solid var(--dust)", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .2s" }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = "var(--amber)" }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = "var(--dust)" }}>
                    <span style={{ fontSize: ".95rem" }}>🛒</span>
                    <div className="notif-dot" style={{ background: "var(--amber)", border: "2px solid white" }} />
                </button>
                <Avatar initials={initials} size={38} style={{ cursor: "pointer", flexShrink: 0 }} />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   HELPER: MY LISTINGS PREVIEW (used inside DashboardHome)
───────────────────────────────────────────────────────────────── */
function MyListingsPreview({ setActive, userId, refreshKey }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        setLoading(true);
        getMyListings(userId)
            .then(d => setItems(d.filter(l => l.status === "active")))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId, refreshKey]);

    return (
        <div style={{ animation: "fadeUp .4s .35s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="section-heading">Your Active Listings</span>
                <button className="btn btn-ghost" onClick={() => setActive("listings")} style={{ padding: "6px 14px", fontSize: ".75rem", borderRadius: 100 }}>Manage All</button>
            </div>
            {loading ? (
                <div style={{ color: "var(--muted)", fontSize: ".82rem", padding: "20px 0" }}>Loading…</div>
            ) : items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", border: "2px dashed var(--dust)", borderRadius: 16 }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>📦</div>
                    <p style={{ fontSize: ".85rem", color: "var(--muted)" }}>No active listings yet</p>
                    <button className="btn btn-amber" onClick={() => setActive("sell")} style={{ marginTop: 10, borderRadius: 100, padding: "7px 18px", fontSize: ".8rem" }}>+ List an item</button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                    {items.slice(0, 3).map((l, i) => (
                        <div key={l.id} className="product-card-dash" style={{ animation: `fadeUp .4s ${.35 + i * .08}s ease both` }}>
                            <div style={{ overflow: "hidden", height: 130, background: "var(--cream)", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {l.image_url
                                    ? <img src={l.image_url} alt={l.title} style={{ width: "100%", height: 130, objectFit: "cover", transition: "transform .4s" }}
                                        onMouseOver={e => e.target.style.transform = "scale(1.06)"}
                                        onMouseOut={e => e.target.style.transform = "scale(1)"} />
                                    : <span style={{ fontSize: "2.5rem" }}>📦</span>
                                }
                            </div>
                            <div style={{ padding: "12px 14px" }}>
                                <div style={{ fontWeight: 600, fontSize: ".875rem", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1rem", fontWeight: 700 }}>₹{l.price.toLocaleString()}</span>
                                    <span className="badge badge-green">● Active</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   VIEW: DASHBOARD HOME
───────────────────────────────────────────────────────────────── */
function DashboardHome({ setActive, profile, isProfileComplete, myUserId, refreshKey }) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const firstName = profile?.name?.split(" ")[0] || "there";
    const { pct, missing } = getProfileCompleteness(profile);
    const [activeCount, setActiveCount] = useState(null);
    const [soldCount, setSoldCount] = useState(null);
    const [recentConvos, setRecentConvos] = useState([]);
    const [convosLoading, setConvosLoading] = useState(true);

    useEffect(() => {
        if (!myUserId) return;
        setActiveCount(null); setSoldCount(null);
        getMyListings(myUserId)
            .then(data => {
                setActiveCount(data.filter(l => l.status === "active").length);
                setSoldCount(data.filter(l => l.status === "sold").length);
            })
            .catch(() => { setActiveCount(0); setSoldCount(0); });
    }, [myUserId, refreshKey]);

    useEffect(() => {
        if (!myUserId) { setConvosLoading(false); return; }
        getConversations(myUserId)
            .then(data => setRecentConvos(data.slice(0, 3)))
            .catch(() => setRecentConvos([]))
            .finally(() => setConvosLoading(false));
    }, [myUserId]);

    // Format timestamp nicely: "2h ago", "Mon", "Jan 5", etc.
    const fmtTime = (iso) => {
        if (!iso) return "";
        const d = new Date(iso), now = new Date();
        const diffMs = now - d;
        if (diffMs < 60000) return "Just now";
        if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
        if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
        if (diffMs < 604800000) return d.toLocaleDateString("en-IN", { weekday: "short" });
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* ── Incomplete Profile Banner ── */}
            {!isProfileComplete && (
                <div style={{
                    background: "rgba(232,168,48,.1)", border: "1.5px solid rgba(232,168,48,.3)",
                    borderRadius: 16, padding: "14px 20px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    animation: "fadeUp .35s ease both",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: "1.4rem" }}>✦</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: ".9rem" }}>Your profile is {pct}% complete</div>
                            <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>
                                Add {missing.slice(0, 2).join(" & ")} to unlock all features
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-amber" onClick={() => setActive("profile")} style={{ borderRadius: 100, padding: "8px 18px", fontSize: ".82rem", flexShrink: 0 }}>
                        Complete now →
                    </button>
                </div>
            )}

            <div style={{
                background: "var(--ink)", borderRadius: 20, padding: "24px 28px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                position: "relative", overflow: "hidden",
                animation: "fadeUp .45s .05s ease both",
            }}>
                <div style={{ position: "absolute", right: -40, top: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(232,168,48,0.1)", filter: "blur(30px)" }} />
                <div style={{ position: "absolute", left: "35%", bottom: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(196,85,42,0.07)", filter: "blur(25px)" }} />
                <div style={{ position: "relative", zIndex: 2 }}>
                    <p style={{ fontSize: ".78rem", color: "rgba(255,255,255,0.45)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>{greeting} 👋</p>
                    <h2 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "white", letterSpacing: "-.03em", marginBottom: 8 }}>
                        Welcome back, <span style={{ color: "var(--amber)", fontFamily: "'Instrument Serif',serif", fontStyle: "italic" }}>{firstName}</span>
                    </h2>
                    <p style={{ fontSize: ".875rem", color: "rgba(255,255,255,0.45)", maxWidth: 380 }}>Buy and sell with your campus community.</p>
                    <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                        <button className="btn btn-amber" onClick={() => setActive("shop")} style={{ borderRadius: 100 }}>Browse Deals →</button>
                        <button className="btn btn-ghost" onClick={() => setActive("sell")} style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)", color: "white", borderRadius: 100 }}>+ Sell Item</button>
                    </div>
                </div>
                <div style={{ position: "relative", zIndex: 2, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                    <div className="profile-completion-ring" style={{ background: `conic-gradient(var(--amber) 0% ${pct}%, var(--cream) ${pct}% 100%)` }}>
                        <div className="profile-completion-ring-inner">{pct}%</div>
                    </div>
                    <p style={{ fontSize: ".72rem", color: "rgba(255,255,255,0.45)" }}>Profile complete</p>
                    {!isProfileComplete && <button className="btn" onClick={() => setActive("profile")} style={{ background: "rgba(232,168,48,0.15)", color: "var(--amber)", borderRadius: 100, padding: "6px 14px", fontSize: ".75rem" }}>Finish it →</button>}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                    { label: "Total Sales", value: soldCount ?? "—", icon: "📦", sub: soldCount == null ? "Loading…" : soldCount === 0 ? "Get selling!" : soldCount === 1 ? "1 item sold" : `${soldCount} items sold`, color: "var(--sage)" },
                    { label: "Purchases", value: 0, icon: "🛍", sub: "Browse the shop", color: "var(--amber-deep)" },
                    { label: "Active Listings", value: activeCount ?? "—", icon: "📋", sub: activeCount == null ? "Loading…" : activeCount === 1 ? "1 item live" : activeCount > 1 ? `${activeCount} items live` : "List your first item", color: "var(--rust)" },
                    { label: "Your Rating", value: "—", icon: "⭐", sub: "No reviews yet", color: "var(--amber)" },
                ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ animation: `fadeUp .4s ${.05 + i * .07}s ease both` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
                            <span className="badge" style={{ background: `${s.color}18`, color: s.color, fontSize: ".65rem" }}>↑</span>
                        </div>
                        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-.02em", marginBottom: 3 }}>{s.value}</div>
                        <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.label}</div>
                        <div style={{ fontSize: ".68rem", color: `${s.color}`, marginTop: 3 }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
                <div className="card" style={{ animation: "fadeUp .4s .25s ease both" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                        <span className="section-heading">Recent Messages</span>
                        <button className="btn btn-ghost" onClick={() => setActive("messages")} style={{ padding: "6px 14px", fontSize: ".75rem", borderRadius: 100 }}>View All</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {convosLoading ? (
                            <div style={{ color: "var(--muted)", fontSize: ".82rem", padding: "16px 0" }}>Loading…</div>
                        ) : recentConvos.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)", fontSize: ".82rem" }}>
                                <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>💬</div>
                                No conversations yet. Message a seller from the Shop!
                            </div>
                        ) : recentConvos.map((c, i) => {
                            const initials = c.otherName?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
                            const colors = ["var(--amber)", "var(--rust)", "var(--sage)", "var(--ink)"];
                            return (
                                <div key={c.id} onClick={() => setActive("messages")} style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: "10px 10px", borderRadius: 12,
                                    cursor: "pointer", transition: "background .15s",
                                }}
                                    onMouseOver={e => e.currentTarget.style.background = "var(--cream)"}
                                    onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                                    <Avatar initials={initials} size={36} bg={colors[i % colors.length]} color="white" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: ".85rem", fontWeight: 600, marginBottom: 1 }}>{c.otherName}</div>
                                        <div style={{ fontSize: ".75rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {c.lastMessage || <em>No messages yet</em>}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: ".7rem", color: "var(--muted)", flexShrink: 0 }}>{fmtTime(c.lastAt)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card" style={{ animation: "fadeUp .4s .3s ease both" }}>
                    <span className="section-heading" style={{ display: "block", marginBottom: 18 }}>Quick Actions</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            { icon: "📸", label: "List a New Item", sub: "Snap & sell in 3 min", color: "var(--amber)", view: "sell" },
                            { icon: "🛍", label: "Browse the Shop", sub: "Latest campus deals", color: "var(--sage)", view: "shop" },
                            { icon: "✦", label: "AI Price My Item", sub: "Get a fair price instantly", color: "var(--rust)", view: "sell" },
                            { icon: "💬", label: "Check Messages", sub: "Chat with buyers & sellers", color: "var(--ink)", view: "messages" },
                        ].map((a, i) => (
                            <button key={i} onClick={() => setActive(a.view)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
                                    borderRadius: 14, border: `1.5px solid rgba(212,197,176,.5)`,
                                    background: "var(--warm-white)", cursor: "pointer", transition: "all .2s", textAlign: "left",
                                }}
                                onMouseOver={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = "white"; }}
                                onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(212,197,176,.5)"; e.currentTarget.style.background = "var(--warm-white)"; }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{a.icon}</div>
                                <div>
                                    <div style={{ fontSize: ".85rem", fontWeight: 600 }}>{a.label}</div>
                                    <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>{a.sub}</div>
                                </div>
                                <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: ".9rem" }}>›</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <MyListingsPreview setActive={setActive} userId={myUserId} refreshKey={refreshKey} />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   VIEW: SHOP / BUY  (real data from Supabase)
───────────────────────────────────────────────────────────────── */
function ShopView({ cart, setCart, myUserId, onMessageSeller }) {
    const [cat, setCat] = useState("All");
    const [fav, setFav] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [msgLoading, setMsgLoading] = useState(null); // listing id being initiated

    useEffect(() => {
        setLoading(true); setError("");
        getListings(cat)
            .then(setItems)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [cat]);

    const addToCart = (item) => {
        if (!cart.find(c => c.id === item.id)) setCart(prev => [...prev, { ...item }]);
    };

    const handleMessageSeller = async (p) => {
        if (!myUserId) return;
        if (myUserId === p.seller_id) return; // can't message yourself
        setMsgLoading(p.id);
        try {
            const conv = await getOrCreateConversation(myUserId, p.seller_id, p.id);
            onMessageSeller(conv.id);
        } catch (err) {
            console.error("Failed to open conversation:", err);
        } finally {
            setMsgLoading(null);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", animation: "fadeUp .35s ease both" }}>
                {CATEGORIES_SHOP.map(c => (
                    <button key={c} className={`tab-pill ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
                ))}
            </div>

            {loading && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{ borderRadius: 18, background: "var(--cream)", height: 280, animation: "pulse 1.4s ease infinite alternate" }} />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div style={{ background: "rgba(196,85,42,.07)", border: "1px solid rgba(196,85,42,.18)", borderRadius: 14, padding: "20px", color: "var(--rust)", fontSize: ".85rem" }}>⚠ {error}</div>
            )}

            {!loading && !error && items.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🛍</div>
                    <p style={{ fontSize: "1rem", fontWeight: 600 }}>No listings yet{cat !== "All" ? ` in ${cat}` : ""}</p>
                    <p style={{ fontSize: ".82rem", marginTop: 4 }}>Be the first to sell something!</p>
                </div>
            )}

            {!loading && !error && items.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {items.map((p, i) => {
                        const inCart = cart.find(c => c.id === p.id);
                        const isFav = fav.includes(p.id);
                        const seller = p.profiles?.name || p.profiles?.email?.split("@")[0] || "Student";
                        const college = p.profiles?.college || "";
                        const isOwnListing = myUserId && myUserId === p.seller_id;
                        return (
                            <div key={p.id} className="product-card-dash" style={{ animation: `fadeUp .4s ${i * .06}s ease both` }}>
                                <div style={{ position: "relative", overflow: "hidden", height: 180, background: "var(--cream)", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {p.image_url
                                        ? <img src={p.image_url} alt={p.title} style={{ width: "100%", height: 180, objectFit: "cover", transition: "transform .5s" }}
                                            onMouseOver={e => e.target.style.transform = "scale(1.07)"}
                                            onMouseOut={e => e.target.style.transform = "scale(1)"} />
                                        : <span style={{ fontSize: "3rem" }}>📦</span>
                                    }
                                    <button onClick={() => setFav(f => isFav ? f.filter(x => x !== p.id) : [...f, p.id])}
                                        style={{ position: "absolute", top: 10, right: 10, background: "white", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: ".9rem", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
                                        {isFav ? "❤️" : "🤍"}
                                    </button>
                                </div>
                                <div style={{ padding: "14px 16px" }}>
                                    <div style={{ fontSize: ".7rem", color: "var(--muted)", marginBottom: 3 }}>{p.category}</div>
                                    <div style={{ fontWeight: 600, fontSize: ".88rem", marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 8 }}>
                                        <span style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.1rem", fontWeight: 700 }}>₹{p.price.toLocaleString()}</span>
                                        {p.original_price && <span style={{ fontSize: ".75rem", color: "var(--muted)", textDecoration: "line-through" }}>₹{p.original_price.toLocaleString()}</span>}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <Avatar initials={seller.slice(0, 2).toUpperCase()} size={22} bg="var(--ink)" color="var(--amber)" style={{ fontSize: ".55rem" }} />
                                            <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>{seller}{college ? ` · ${college}` : ""}</span>
                                        </div>
                                        {p.condition && <span className="badge badge-green" style={{ fontSize: ".62rem" }}>✓ {p.condition}</span>}
                                    </div>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button className={`btn ${inCart ? "btn-ghost" : "btn-ink"}`}
                                            style={{ flex: 1, justifyContent: "center", borderRadius: 12, padding: "9px 10px", fontSize: ".8rem" }}
                                            onClick={() => addToCart(p)}>
                                            {inCart ? "✓ In Cart" : "Add to Cart"}
                                        </button>
                                        {!isOwnListing && myUserId && (
                                            <button
                                                className="btn btn-ghost"
                                                style={{ borderRadius: 12, padding: "9px 10px", fontSize: ".8rem", flexShrink: 0 }}
                                                onClick={() => handleMessageSeller(p)}
                                                disabled={msgLoading === p.id}
                                                title="Message Seller">
                                                {msgLoading === p.id ? "…" : "💬"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}


/* ─────────────────────────────────────────────────────────────────
   VIEW: SELL ITEM
───────────────────────────────────────────────────────────────── */
function SellView({ profile, setActive, myUserId }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ title: "", category: "", condition: "", price: "", originalPrice: "", description: "", negotiable: false });
    const [photoFile, setPhotoFile] = useState(null);   // File object
    const [photoPreview, setPhotoPreview] = useState(null); // local blob URL
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPrice, setAiPrice] = useState(null);
    const [aiReason, setAiReason] = useState("");
    const [aiError, setAiError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState("");
    const [done, setDone] = useState(false);
    const fileInputRef = useRef(null);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handlePhoto = (file) => {
        if (!file) return;
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const runAI = async () => {
        setAiLoading(true); setAiPrice(null); setAiReason(""); setAiError("");
        try {
            const result = await suggestPrice({
                title: form.title,
                category: form.category,
                condition: form.condition,
                originalPrice: form.originalPrice,
                description: form.description,
            });
            setAiPrice(result.price);
            setAiReason(result.reason);
        } catch (err) {
            console.error("AI price suggestion failed:", err);
            setAiError(err.message || "AI suggestion failed. Check your API key.");
        } finally {
            setAiLoading(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return form.title.trim() && form.category && form.condition;
        if (step === 3) return form.price;
        return true;
    };

    const handlePublish = async () => {
        setSubmitting(true); setSubmitErr("");
        try {
            // Use myUserId prop directly — avoids getSession() Navigator Lock hang
            if (!myUserId) throw new Error("Not logged in. Please refresh and try again.");

            // Upload photo — non-blocking: if bucket missing, skip photo and warn
            let imageUrl = null;
            if (photoFile) {
                try {
                    imageUrl = await uploadListingImage(photoFile, myUserId);
                } catch (uploadErr) {
                    console.error("Photo upload failed:", uploadErr);
                    setSubmitErr("⚠ Photo upload failed (check storage bucket). Listing will be saved without image.");
                    await new Promise(r => setTimeout(r, 1500)); // let user read the warning
                    setSubmitErr("");
                }
            }

            await createListing({
                sellerId: myUserId,
                title: form.title,
                description: form.description,
                category: form.category,
                condition: form.condition,
                price: form.price,
                originalPrice: form.originalPrice || null,
                negotiable: form.negotiable,
                imageUrl,
            });

            setDone(true);
        } catch (err) {
            console.error("Publish error:", err);
            const msg = err?.message || JSON.stringify(err) || "Publish failed.";
            setSubmitErr(msg.includes("relation") || msg.includes("does not exist")
                ? "Database table not found. Have you run the SQL in Supabase?"
                : msg);
        } finally {
            setSubmitting(false);
        }
    };


    const STEPS = ["Item Details", "Photos", "Pricing", "Review"];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card" style={{ padding: "18px 24px", animation: "fadeUp .35s ease both" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    {STEPS.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "auto" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: "50%", border: "2px solid",
                                    borderColor: i + 1 <= step ? "var(--amber)" : "var(--dust)",
                                    background: i + 1 < step ? "var(--amber)" : i + 1 === step ? "var(--ink)" : "white",
                                    color: i + 1 < step ? "var(--ink)" : i + 1 === step ? "white" : "var(--muted)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: ".8rem", fontWeight: 700, transition: "all .3s", flexShrink: 0,
                                }}>{i + 1 < step ? "✓" : i + 1}</div>
                                <span style={{ fontSize: ".65rem", color: i + 1 === step ? "var(--ink)" : "var(--muted)", fontWeight: i + 1 === step ? 600 : 400, whiteSpace: "nowrap" }}>{s}</span>
                            </div>
                            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i + 1 < step ? "var(--amber)" : "var(--dust)", margin: "0 6px", marginBottom: 16, transition: "background .3s" }} />}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr .85fr", gap: 16 }}>
                <div className="card" style={{ animation: "fadeUp .4s .05s ease both" }}>
                    {step === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h3 className="section-heading">Item Details</h3>
                            <div>
                                <label style={{ fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Item Title *</label>
                                <input className="input-field" placeholder="e.g. MacBook Air M1 2021" value={form.title} onChange={e => set("title", e.target.value)} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Category *</label>
                                    <select className="input-field" value={form.category} onChange={e => set("category", e.target.value)}>
                                        <option value="">Select…</option>
                                        {["Electronics", "Books", "Furniture", "Cycles", "Clothes", "Sports", "Others"].map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Condition *</label>
                                    <select className="input-field" value={form.condition} onChange={e => set("condition", e.target.value)}>
                                        <option value="">Select…</option>
                                        {["Like New", "Good", "Fair", "For Parts"].map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Description</label>
                                <textarea className="input-field" rows={4} placeholder="Describe the item — age, usage, any defects…" value={form.description} onChange={e => set("description", e.target.value)} style={{ resize: "vertical" }} />
                            </div>
                            <div>
                                <label style={{ fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Your Asking Price (₹)</label>
                                <input className="input-field" type="number" placeholder="e.g. 15000" value={form.price} onChange={e => set("price", e.target.value)} />
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h3 className="section-heading">Upload Photo</h3>
                            <p style={{ fontSize: ".82rem", color: "var(--muted)" }}>Upload a clear cover photo. JPG or PNG, up to 10 MB.</p>
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); handlePhoto(e.dataTransfer.files[0]); }}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: `2.5px dashed ${dragOver ? "var(--amber)" : photoPreview ? "var(--sage)" : "var(--dust)"}`,
                                    borderRadius: 16, padding: photoPreview ? "8px" : "40px 24px", textAlign: "center",
                                    background: dragOver ? "rgba(232,168,48,.05)" : "var(--warm-white)",
                                    transition: "all .2s", cursor: "pointer", overflow: "hidden",
                                }}>
                                {photoPreview
                                    ? <img src={photoPreview} alt="preview" style={{ width: "100%", maxHeight: 220, objectFit: "contain", borderRadius: 10 }} />
                                    : <>
                                        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📸</div>
                                        <p style={{ fontSize: ".9rem", fontWeight: 600, marginBottom: 4 }}>Drag & drop or click to browse</p>
                                        <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>JPG, PNG up to 10 MB</p>
                                    </>
                                }
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                                onChange={e => handlePhoto(e.target.files[0])} />
                            {photoPreview && (
                                <button className="btn btn-ghost" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} style={{ alignSelf: "flex-start", borderRadius: 100, padding: "6px 14px", fontSize: ".78rem" }}>✕ Remove photo</button>
                            )}
                        </div>
                    )}
                    {step === 3 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h3 className="section-heading">Set Your Price</h3>
                            <div>
                                <label style={{ fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Original Price (₹)</label>
                                <input className="input-field" type="number" placeholder="What you originally paid" value={form.originalPrice} onChange={e => set("originalPrice", e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>Your Selling Price (₹) *</label>
                                <input className="input-field" type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="Your asking price" />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12, background: "var(--cream)", border: "1px solid var(--dust)" }}>
                                <input type="checkbox" id="neg" checked={form.negotiable} onChange={e => set("negotiable", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--amber)" }} />
                                <label htmlFor="neg" style={{ fontSize: ".85rem", cursor: "pointer" }}>Open to negotiation</label>
                            </div>
                            <button className="btn btn-amber" onClick={runAI} disabled={aiLoading} style={{ borderRadius: 12, padding: "11px 18px", justifyContent: "center" }}>
                                {aiLoading ? <><span style={{ animation: "spin .7s linear infinite", display: "inline-block" }}>⟳</span> Asking Gemini AI…</> : "✦ Get AI Price Suggestion"}
                            </button>
                            {aiError && (
                                <div style={{ background: "rgba(196,85,42,.07)", border: "1px solid rgba(196,85,42,.18)", borderRadius: 10, padding: "10px 14px", fontSize: ".8rem", color: "var(--rust)" }}>⚠ {aiError}</div>
                            )}
                            {aiPrice && (
                                <div style={{ background: "rgba(232,168,48,.1)", border: "1.5px solid rgba(232,168,48,.3)", borderRadius: 14, padding: "16px 18px", animation: "pop .4s ease" }}>
                                    <p style={{ fontSize: ".72rem", fontWeight: 600, color: "var(--amber-deep)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>✦ AI Suggested Price</p>
                                    <p style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "2rem", fontWeight: 700 }}>₹{aiPrice.toLocaleString()}</p>
                                    {aiReason && <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 6, lineHeight: 1.5 }}>{aiReason}</p>}
                                    <button className="btn btn-ink" onClick={() => set("price", aiPrice)} style={{ marginTop: 10, borderRadius: 100, padding: "7px 16px", fontSize: ".78rem" }}>Use this price</button>
                                </div>
                            )}
                        </div>
                    )}
                    {step === 4 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h3 className="section-heading">Review & Publish</h3>
                            {[
                                { label: "Title", val: form.title || "—" },
                                { label: "Category", val: form.category || "—" },
                                { label: "Condition", val: form.condition || "—" },
                                { label: "Price", val: form.price ? `₹${parseInt(form.price).toLocaleString()}` : "—" },
                            ].map(r => (
                                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--cream)" }}>
                                    <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>{r.label}</span>
                                    <span style={{ fontSize: ".85rem", fontWeight: 600 }}>{r.val}</span>
                                </div>
                            ))}
                            <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(107,143,113,.08)", border: "1px solid rgba(107,143,113,.2)", fontSize: ".82rem", color: "var(--sage)" }}>
                                ✓ Your listing will be visible to all verified students on CampusBazaar.
                            </div>
                        </div>
                    )}
                    {submitErr && (
                        <div style={{ background: "rgba(196,85,42,.07)", border: "1px solid rgba(196,85,42,.18)", borderRadius: 10, padding: "10px 14px", fontSize: ".8rem", color: "var(--rust)", display: "flex", gap: 7, marginTop: 12 }}>
                            <span>⚠</span>{submitErr}
                        </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--cream)" }}>
                        <button className="btn btn-ghost" onClick={() => setStep(s => Math.max(1, s - 1))} style={{ visibility: step === 1 ? "hidden" : "visible", borderRadius: 100 }}>← Back</button>
                        {step < 4
                            ? <button className="btn btn-ink" onClick={() => setStep(s => s + 1)} disabled={!canProceed()} style={{ borderRadius: 100 }}>Next →</button>
                            : <button className="btn btn-amber" onClick={handlePublish} disabled={submitting} style={{ borderRadius: 100, padding: "11px 24px" }}>
                                {submitting ? <><span style={{ animation: "spin .7s linear infinite", display: "inline-block" }}>⟳</span> Publishing…</> : "🚀 Publish Listing"}
                            </button>
                        }
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {done ? (
                        <div className="card" style={{ textAlign: "center", padding: "36px 24px", animation: "pop .4s ease" }}>
                            <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
                            <h3 style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>Listing published!</h3>
                            <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: 20 }}>Your item is now live and visible to all students.</p>
                            <button className="btn btn-amber" onClick={() => setActive("shop")} style={{ borderRadius: 100 }}>View in Shop →</button>
                            <button className="btn btn-ghost" onClick={() => { setDone(false); setStep(1); setForm({ title: "", category: "", condition: "", price: "", originalPrice: "", description: "", negotiable: false }); setPhotoFile(null); setPhotoPreview(null); }} style={{ borderRadius: 100, marginTop: 8, width: "100%" }}>+ List another item</button>
                        </div>
                    ) : (
                        <div className="card" style={{ animation: "fadeUp .4s .1s ease both" }}>
                            <p className="section-heading" style={{ marginBottom: 14, fontSize: "1rem" }}>Preview</p>
                            <div style={{ background: "var(--cream)", borderRadius: 14, height: 160, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, overflow: "hidden" }}>
                                {photoPreview
                                    ? <img src={photoPreview} alt="preview" style={{ width: "100%", height: 160, objectFit: "cover" }} />
                                    : <span style={{ fontSize: "2.5rem" }}>📦</span>
                                }
                            </div>
                            <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>{form.title || "Your item title"}</div>
                            <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>{form.price ? `₹${parseInt(form.price).toLocaleString()}` : "₹ —"}</div>
                            {form.condition && <span className="badge badge-green">{form.condition}</span>}
                            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
                                <Avatar initials={getInitials(profile?.name)} size={28} bg="var(--amber)" />
                                <div>
                                    <div style={{ fontSize: ".78rem", fontWeight: 600 }}>{profile?.name || "Your Name"}</div>
                                    <div style={{ fontSize: ".68rem", color: "var(--muted)" }}>{profile?.college || ""}</div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="card card-sm" style={{ animation: "fadeUp .4s .15s ease both" }}>
                        <p style={{ fontSize: ".72rem", fontWeight: 600, color: "var(--amber-deep)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>✦ Tips for a great listing</p>
                        {["Clear, bright photos sell 3x faster", "AI pricing gets 40% more inquiries", "Mention any accessories included"].map((t, i) => (
                            <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: i < 2 ? "1px solid var(--cream)" : "none", fontSize: ".78rem", color: "var(--ink-light)" }}>
                                <span style={{ color: "var(--sage)" }}>✓</span>{t}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   VIEW: MESSAGES  (real-time via Supabase Realtime)
───────────────────────────────────────────────────────────────── */
function MessagesView({ myUserId, openConvId, profile }) {
    const [convos, setConvos] = useState([]);
    const [selected, setSelected] = useState(null);
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const endRef = useRef(null);

    // Auto-scroll on new message
    useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

    // Load conversation list
    const loadConvos = useCallback(async () => {
        if (!myUserId) return;
        setLoadingConvos(true);
        try {
            const data = await getConversations(myUserId);
            setConvos(data);

            // If openConvId was passed (from "Message Seller"), select that conv
            if (openConvId) {
                const match = data.find(c => c.id === openConvId);
                if (match) setSelected(match);
                else if (data.length > 0) setSelected(data[0]);
            } else if (!selected && data.length > 0) {
                setSelected(data[0]);
            }
        } catch (err) {
            console.error("Failed to load conversations:", err);
        } finally {
            setLoadingConvos(false);
        }
    }, [myUserId, openConvId]);

    useEffect(() => { loadConvos(); }, [loadConvos]);

    // Load messages when a conversation is selected
    useEffect(() => {
        if (!selected) return;
        setLoadingMsgs(true);
        getMessages(selected.id)
            .then(setMsgs)
            .catch(console.error)
            .finally(() => setLoadingMsgs(false));
    }, [selected?.id]);

    // Realtime subscription — fires on any INSERT to messages in selected conv
    useEffect(() => {
        if (!selected) return;
        const unsub = subscribeToMessages(selected.id, (newMsg) => {
            setMsgs(prev => {
                // Already have this real message (duplicate real-time event) — skip
                if (prev.find(m => m.id === newMsg.id)) return prev;

                // If this is our own message arriving from Realtime, remove the
                // optimistic placeholder we added during send (id starts with "opt-")
                // and replace it with the real DB row.
                if (newMsg.sender_id === myUserId) {
                    const withoutOptimistic = prev.filter(m => !String(m.id).startsWith("opt-"));
                    return [...withoutOptimistic, newMsg];
                }

                return [...prev, newMsg];
            });
            // Refresh conversation list so last-message preview updates
            loadConvos();
        });
        return unsub;
    }, [selected?.id, loadConvos, myUserId]);

    const handleSend = async () => {
        if (!input.trim() || !selected || !myUserId) return;
        const text = input.trim();
        setInput("");
        setSending(true);

        // Optimistic UI
        const optimistic = {
            id: `opt-${Date.now()}`,
            sender_id: myUserId,
            text,
            created_at: new Date().toISOString(),
        };
        setMsgs(prev => [...prev, optimistic]);

        try {
            await sendMessage(selected.id, myUserId, text);
            // Realtime will fire and replace optimistic if needed; loadConvos updates sidebar
            loadConvos();
        } catch (err) {
            console.error("Send failed:", err);
            setMsgs(prev => prev.filter(m => m.id !== optimistic.id));
        } finally {
            setSending(false);
        }
    };

    const fmtTime = (iso) =>
        new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const fmtDate = (iso) => {
        const d = new Date(iso);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return fmtTime(iso);
        return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    const AVATAR_COLORS = ["var(--amber)", "var(--rust)", "var(--sage)", "var(--ink)"];

    return (
        <div className="dash-messages-grid" data-chat-open={mobileChatOpen} style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, height: "calc(100vh - 130px)", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(212,197,176,.5)", animation: "fadeUp .4s ease both" }}>

            {/* ── Left: Conversation List ── */}
            <div className="dash-msg-list" style={{ background: "white", borderRight: "1px solid rgba(212,197,176,.4)", display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px 16px 12px" }}>
                    <p style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 10 }}>Messages</p>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    {loadingConvos && (
                        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} style={{ height: 56, borderRadius: 12, background: "var(--cream)", animation: "pulse 1.4s ease infinite alternate" }} />
                            ))}
                        </div>
                    )}

                    {!loadingConvos && convos.length === 0 && (
                        <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--muted)" }}>
                            <div style={{ fontSize: "2rem", marginBottom: 8 }}>💬</div>
                            <p style={{ fontSize: ".82rem", fontWeight: 600, marginBottom: 4 }}>No conversations yet</p>
                            <p style={{ fontSize: ".75rem" }}>Browse the shop and tap 💬 on a listing to start chatting</p>
                        </div>
                    )}

                    {!loadingConvos && convos.map((c, i) => (
                        <div key={c.id} onClick={() => { setSelected(c); setMobileChatOpen(true); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer",
                                background: selected?.id === c.id ? "var(--cream)" : "transparent",
                                borderLeft: selected?.id === c.id ? "3px solid var(--amber)" : "3px solid transparent",
                                transition: "all .15s",
                            }}>
                            <Avatar
                                initials={(c.otherName || "?").slice(0, 2).toUpperCase()}
                                size={38}
                                bg={AVATAR_COLORS[i % 4]}
                                color="white"
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                    <span style={{ fontSize: ".85rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>{c.otherName}</span>
                                    <span style={{ fontSize: ".65rem", color: "var(--muted)", flexShrink: 0 }}>{fmtDate(c.lastAt)}</span>
                                </div>
                                <div style={{ fontSize: ".72rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {c.lastMessage || "No messages yet"}
                                </div>
                                {c.listingTitle && (
                                    <div style={{ fontSize: ".65rem", color: "var(--amber-deep)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        re: {c.listingTitle}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Right: Chat Pane ── */}
            <div className="dash-msg-chat" style={{ background: "var(--warm-white)", display: "flex", flexDirection: "column" }}>
                {!selected ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "var(--muted)" }}>
                        <div style={{ fontSize: "3rem" }}>💬</div>
                        <p style={{ fontSize: ".9rem", fontWeight: 600 }}>Select a conversation</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ padding: "14px 20px", background: "white", borderBottom: "1px solid rgba(212,197,176,.4)", display: "flex", alignItems: "center", gap: 12 }}>
                            <button className="mob-back" onClick={() => setMobileChatOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", fontSize: "1.2rem", lineHeight: 1, padding: "2px 6px", borderRadius: 8 }}>←</button>
                            <Avatar initials={(selected.otherName || "?").slice(0, 2).toUpperCase()} size={38} bg="var(--amber)" color="var(--ink)" />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: ".9rem" }}>{selected.otherName}</div>
                                <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>
                                    {selected.otherCollege || ""}
                                    {selected.listingTitle ? ` · re: ${selected.listingTitle}` : ""}
                                </div>
                            </div>
                            {/* Pay via UPI — seller's UPI shown to both sides of the conversation:
                                  if I'm the seller → show my own UPI from profile
                                  if I'm the buyer  → show the other person's UPI */}
                            {selected.listingSellerId && (
                                selected.listingSellerId === myUserId
                                    ? profile?.upi_id
                                    : selected.otherUpiId
                            ) && (
                                <UpiButton upiId={
                                    selected.listingSellerId === myUserId
                                        ? profile.upi_id
                                        : selected.otherUpiId
                                } />
                            )}
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 10px", display: "flex", flexDirection: "column", gap: 12 }}>
                            {loadingMsgs ? (
                                <div style={{ color: "var(--muted)", fontSize: ".82rem", textAlign: "center", paddingTop: 40 }}>Loading messages…</div>
                            ) : msgs.length === 0 ? (
                                <div style={{ textAlign: "center", color: "var(--muted)", fontSize: ".82rem", paddingTop: 40 }}>
                                    <p>No messages yet — say hello! 👋</p>
                                </div>
                            ) : (
                                msgs.map((m) => {
                                    const isMe = m.sender_id === myUserId;
                                    return (
                                        <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                                            <div className={isMe ? "msg-bubble-me" : "msg-bubble-them"}>{m.text}</div>
                                            <span style={{ fontSize: ".62rem", color: "var(--muted)", marginTop: 3, paddingInline: 4 }}>{fmtTime(m.created_at)}</span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Input */}
                        <div style={{ padding: "12px 16px", background: "white", borderTop: "1px solid rgba(212,197,176,.4)", display: "flex", gap: 10, alignItems: "center" }}>
                            <input
                                className="input-field"
                                placeholder="Type a message…"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                                style={{ flex: 1, borderRadius: 100 }}
                            />
                            <button
                                className="btn btn-ink"
                                onClick={handleSend}
                                disabled={sending || !input.trim()}
                                style={{ borderRadius: "50%", width: 38, height: 38, padding: 0, justifyContent: "center", flexShrink: 0 }}>
                                {sending ? "…" : "→"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}



/* ─────────────────────────────────────────────────────────────────
   VIEW: CART
───────────────────────────────────────────────────────────────── */
function CartView({ cart, setCart }) {
    const total = cart.reduce((s, i) => s + i.price, 0);
    const remove = (id) => setCart(c => c.filter(x => x.id !== id));

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr .5fr", gap: 16, animation: "fadeUp .4s ease both" }}>
            <div className="card">
                <h3 className="section-heading" style={{ marginBottom: 20 }}>My Cart ({cart.length} items)</h3>
                {cart.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🛒</div>
                        <p style={{ fontSize: "1rem" }}>Your cart is empty</p>
                        <p style={{ fontSize: ".82rem", marginTop: 4 }}>Browse the shop to add items</p>
                    </div>
                ) : (
                    <div>
                        {cart.map((item, i) => {
                            const sellerName = item.profiles?.name || "Student";
                            const sellerCollege = item.profiles?.college || "";
                            return (
                                <div key={item.id} className="cart-row" style={{ animation: `fadeUp .3s ${i * .07}s ease both` }}>
                                    {/* image — uses image_url from supabase */}
                                    <div style={{ width: 68, height: 68, borderRadius: 12, overflow: "hidden", background: "var(--cream)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {item.image_url
                                            ? <img src={item.image_url} alt={item.title} style={{ width: 68, height: 68, objectFit: "cover" }} />
                                            : <span style={{ fontSize: "1.6rem" }}>📦</span>
                                        }
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: 4 }}>{item.title}</div>
                                        <div style={{ fontSize: ".75rem", color: "var(--muted)", marginBottom: 2 }}>Seller: {sellerName}{sellerCollege ? ` · ${sellerCollege}` : ""}</div>
                                        {item.condition && <span className="badge badge-amber" style={{ marginTop: 4 }}>✓ {item.condition}</span>}
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.1rem", fontWeight: 700 }}>₹{item.price.toLocaleString()}</div>
                                        <button
                                            onClick={() => remove(item.id)}
                                            onMouseOver={e => e.target.style.color = "var(--rust)"}
                                            onMouseOut={e => e.target.style.color = "var(--muted)"}
                                            style={{ background: "none", border: "none", color: "var(--muted)", fontSize: ".75rem", cursor: "pointer", marginTop: 4, transition: "color .2s" }}>
                                            ✕ Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="card">
                    <h3 className="section-heading" style={{ marginBottom: 18 }}>Order Summary</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".875rem" }}>
                            <span style={{ color: "var(--muted)" }}>Subtotal ({cart.length} items)</span>
                            <span style={{ fontWeight: 600 }}>₹{total.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".875rem" }}>
                            <span style={{ color: "var(--muted)" }}>Platform Fee</span>
                            <span style={{ color: "var(--sage)", fontWeight: 600 }}>Free ✓</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".875rem" }}>
                            <span style={{ color: "var(--muted)" }}>Delivery</span>
                            <span style={{ fontWeight: 600 }}>Campus pickup</span>
                        </div>
                        <div style={{ height: 1, background: "var(--cream)", margin: "6px 0" }} />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700 }}>Total</span>
                            <span style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.3rem", fontWeight: 700 }}>₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                    <button className="btn btn-ink" style={{ width: "100%", justifyContent: "center", borderRadius: 14, padding: "13px", marginTop: 20, fontSize: ".9rem" }} disabled={cart.length === 0}>
                        Proceed to Chat with Sellers →
                    </button>
                    <p style={{ fontSize: ".72rem", color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
                        Payments happen directly between students. CampusBazaar is free.
                    </p>
                </div>
                <div className="card card-sm" style={{ background: "rgba(107,143,113,.07)", border: "1px solid rgba(107,143,113,.2)" }}>
                    <p style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--sage)", marginBottom: 8 }}>🔒 Safe Trading Tips</p>
                    {["Meet on campus in a public space", "Inspect before paying", "Don't pay online in advance"].map((t, i) => (
                        <div key={i} style={{ fontSize: ".75rem", color: "var(--ink-light)", padding: "4px 0" }}>• {t}</div>
                    ))}
                </div>
            </div>
        </div >
    );
}

/* ─────────────────────────────────────────────────────────────────
   VIEW: MY LISTINGS
───────────────────────────────────────────────────────────────── */
function ListingsView({ userId, setActive }) {
    const [tab, setTab] = useState("active");
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveErr, setSaveErr] = useState("");

    const CATS = ["Electronics", "Books", "Clothing", "Furniture", "Sports", "Stationery", "Transport", "Other"];
    const CONDS = ["Like New", "Good", "Fair", "Poor"];

    const load = () => {
        if (!userId) { setLoading(false); return; }
        setLoading(true); setError("");
        getMyListings(userId)
            .then(setListings)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [userId]);

    const handleStatus = async (id, status) => {
        try {
            await updateListingStatus(id, status);
            load();
        } catch (err) {
            console.error("Failed to update listing status:", err);
            setError("Failed to update listing status.");
        }
    };

    const startEdit = (l) => {
        setEditingId(l.id);
        setSaveErr("");
        setEditForm({
            title: l.title || "",
            category: l.category || "",
            condition: l.condition || "",
            price: l.price || "",
            originalPrice: l.original_price || "",
            description: l.description || "",
            negotiable: l.negotiable || false,
        });
    };

    const handleSave = async () => {
        setSaving(true); setSaveErr("");
        try {
            await updateListing(editingId, editForm);
            setEditingId(null);
            load();
        } catch (err) {
            console.error("Edit save error:", err);
            setSaveErr(err.message || "Save failed.");
        } finally {
            setSaving(false);
        }
    };

    const setF = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

    const filtered = listings.filter(l => tab === "all" ? true : l.status === tab);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 18, animation: "fadeUp .4s ease both" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 6, background: "white", border: "1.5px solid var(--dust)", borderRadius: 100, padding: 4 }}>
                    {["active", "sold", "all"].map(t => (
                        <button key={t} className={`tab-pill ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} style={{ padding: "6px 16px" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                    ))}
                </div>
                <button className="btn btn-amber" style={{ borderRadius: 100 }} onClick={() => setActive("sell")}>+ New Listing</button>
            </div>

            {loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card" style={{ height: 100, animation: "pulse 1.4s ease infinite alternate" }} />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div style={{ background: "rgba(196,85,42,.07)", border: "1px solid rgba(196,85,42,.18)", borderRadius: 14, padding: "20px", color: "var(--rust)", fontSize: ".85rem" }}>⚠ {error}</div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>📋</div>
                    <p style={{ fontSize: "1rem", fontWeight: 600 }}>No {tab === "all" ? "" : tab} listings yet</p>
                    <p style={{ fontSize: ".82rem", marginTop: 4 }}>Time to sell something!</p>
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {filtered.map((l, i) => (
                        <div key={l.id} style={{ animation: `fadeUp .35s ${i * .07}s ease both` }}>
                            {/* Listing row */}
                            <div className="card" style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 20px" }}>
                                <div style={{ width: 80, height: 80, borderRadius: 14, overflow: "hidden", background: "var(--cream)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    {l.image_url
                                        ? <img src={l.image_url} alt={l.title} style={{ width: 80, height: 80, objectFit: "cover" }} />
                                        : <span style={{ fontSize: "1.8rem" }}>📦</span>
                                    }
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: ".95rem", marginBottom: 4 }}>{l.title}</div>
                                    <div style={{ fontSize: ".75rem", color: "var(--muted)", marginBottom: 6 }}>{l.category}{l.condition ? ` · ${l.condition}` : ""}</div>
                                    <div style={{ display: "flex", gap: 14, fontSize: ".75rem", color: "var(--muted)" }}>
                                        <span>👁 {l.views || 0} views</span>
                                        <span>❤ {l.favorites || 0} saves</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>₹{l.price.toLocaleString()}</div>
                                    <span className={`badge ${l.status === "active" ? "badge-green" : "badge-ink"}`}>
                                        {l.status === "active" ? "● Active" : "✓ Sold"}
                                    </span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                                    <button
                                        className={`btn ${editingId === l.id ? "btn-amber" : "btn-ghost"}`}
                                        style={{ padding: "7px 14px", fontSize: ".78rem", borderRadius: 100 }}
                                        onClick={() => editingId === l.id ? setEditingId(null) : startEdit(l)}>
                                        {editingId === l.id ? "✕ Cancel" : "Edit"}
                                    </button>
                                    {l.status === "active"
                                        ? <button className="btn" onClick={() => handleStatus(l.id, "sold")} style={{ padding: "7px 14px", fontSize: ".78rem", borderRadius: 100, background: "rgba(107,143,113,.15)", color: "var(--sage)", border: "1px solid rgba(107,143,113,.2)" }}>Mark Sold</button>
                                        : <button className="btn" onClick={() => handleStatus(l.id, "active")} style={{ padding: "7px 14px", fontSize: ".78rem", borderRadius: 100, background: "rgba(232,168,48,.15)", color: "var(--amber)", border: "1px solid rgba(232,168,48,.2)" }}>Re-list</button>
                                    }
                                </div>
                            </div>

                            {/* Inline edit form */}
                            {editingId === l.id && (
                                <div className="card" style={{ marginTop: 6, border: "1.5px solid var(--amber)", borderRadius: 16, padding: "20px 24px", animation: "fadeUp .25s ease both" }}>
                                    <p style={{ fontWeight: 700, fontSize: ".9rem", marginBottom: 16, color: "var(--amber-deep)" }}>✦ Edit Listing</p>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label style={{ fontSize: ".78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>Title *</label>
                                            <input className="input-field" value={editForm.title} onChange={e => setF("title", e.target.value)} placeholder="Item title" />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: ".78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>Category</label>
                                            <select className="input-field" value={editForm.category} onChange={e => setF("category", e.target.value)} style={{ width: "100%", appearance: "none" }}>
                                                <option value="">Select…</option>
                                                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: ".78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>Condition</label>
                                            <select className="input-field" value={editForm.condition} onChange={e => setF("condition", e.target.value)} style={{ width: "100%", appearance: "none" }}>
                                                <option value="">Select…</option>
                                                {CONDS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: ".78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>Selling Price (₹) *</label>
                                            <input className="input-field" type="number" value={editForm.price} onChange={e => setF("price", e.target.value)} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: ".78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>Original Price (₹)</label>
                                            <input className="input-field" type="number" value={editForm.originalPrice} onChange={e => setF("originalPrice", e.target.value)} placeholder="Optional" />
                                        </div>
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label style={{ fontSize: ".78rem", fontWeight: 600, display: "block", marginBottom: 5 }}>Description</label>
                                            <textarea className="input-field" rows={3} value={editForm.description} onChange={e => setF("description", e.target.value)}
                                                placeholder="Describe the item…" style={{ resize: "vertical", fontFamily: "inherit" }} />
                                        </div>
                                        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}>
                                            <input type="checkbox" id={`neg-${l.id}`} checked={!!editForm.negotiable} onChange={e => setF("negotiable", e.target.checked)}
                                                style={{ width: 15, height: 15, accentColor: "var(--amber)" }} />
                                            <label htmlFor={`neg-${l.id}`} style={{ fontSize: ".85rem", cursor: "pointer" }}>Open to negotiation</label>
                                        </div>
                                    </div>
                                    {saveErr && (
                                        <div style={{ background: "rgba(196,85,42,.07)", border: "1px solid rgba(196,85,42,.18)", borderRadius: 10, padding: "10px 14px", fontSize: ".8rem", color: "var(--rust)", marginTop: 14 }}>⚠ {saveErr}</div>
                                    )}
                                    <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                                        <button className="btn btn-ghost" onClick={() => setEditingId(null)} style={{ borderRadius: 100 }}>Cancel</button>
                                        <button className="btn btn-ink" onClick={handleSave} disabled={saving || !editForm.title || !editForm.price}
                                            style={{ borderRadius: 100, padding: "9px 22px" }}>
                                            {saving ? "Saving…" : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   VIEW: COMPLETE PROFILE
───────────────────────────────────────────────────────────────── */
function ProfileView({ profile, refreshProfile }) {
    const [form, setForm] = useState({
        name: profile?.name || "",
        college: profile?.college || "",
        year: profile?.year || "",
        branch: profile?.branch || "",
        phone: profile?.phone || "",
        bio: profile?.bio || "",
        upi_id: profile?.upi_id || "",
    });
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveErr, setSaveErr] = useState("");
    const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaveErr(""); };

    const handleSave = async () => {
        setSaving(true); setSaveErr("");
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not logged in");
            // Use upsert so it works for both new accounts (INSERT) and existing ones (UPDATE)
            await upsertProfile({
                id: session.user.id,
                email: session.user.email,
                name: form.name || null,
                college: form.college || null,
                year: form.year || null,
                branch: form.branch || null,
                phone: form.phone || null,
                bio: form.bio || null,
                upi_id: form.upi_id || null,
            });
            await refreshProfile();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Profile save error:", err);
            setSaveErr(err.message || "Save failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const { pct } = getProfileCompleteness({ ...profile, ...form });

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr .6fr", gap: 16, animation: "fadeUp .4s ease both" }}>
            <div className="card">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                    <h3 className="section-heading">Complete Your Profile</h3>
                    {saved && <span className="badge badge-green" style={{ animation: "pop .3s ease" }}>✓ Saved!</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderRadius: 16, background: "var(--cream)", border: "1px solid var(--dust)", marginBottom: 24 }}>
                    <Avatar initials={getInitials(profile?.name)} size={60} bg="var(--ink)" color="var(--amber)" />
                    <div>
                        <div style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700, fontSize: "1rem" }}>{profile?.name || "—"}</div>
                        <div style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>{profile?.email || "—"}</div>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--amber)" }}>{pct}%</div>
                        <div style={{ fontSize: ".7rem", color: "var(--muted)" }}>Complete</div>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {PROFILE_FIELDS.map(f => (
                        <div key={f.key}>
                            <label style={{ fontSize: ".8rem", fontWeight: 600, display: "block", marginBottom: 6 }}>{f.label}</label>
                            {f.type === "select" ? (
                                <select className="input-field" value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
                                    <option value="">Select…</option>
                                    {f.options.map(o => <option key={o}>{o}</option>)}
                                </select>
                            ) : f.type === "textarea" ? (
                                <textarea className="input-field" rows={3} placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)} style={{ resize: "vertical" }} />
                            ) : (
                                <input className="input-field" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
                            )}
                        </div>
                    ))}
                </div>
                {saveErr && (
                    <div style={{ marginTop: 14, background: "rgba(196,85,42,.07)", border: "1px solid rgba(196,85,42,.18)", borderRadius: 10, padding: "9px 13px", fontSize: ".8rem", color: "var(--rust)", display: "flex", alignItems: "center", gap: 7 }}>
                        <span>⚠</span>{saveErr}
                    </div>
                )}
                <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }}>
                    <button className="btn btn-ink" onClick={handleSave} disabled={saving} style={{ borderRadius: 100, padding: "11px 28px" }}>
                        {saving ? <><span style={{ animation: "spin .7s linear infinite", display: "inline-block" }}>⟳</span> Saving…</> : "Save Profile ✓"}
                    </button>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="card">
                    <p className="section-heading" style={{ marginBottom: 16, fontSize: "1rem" }}>Profile Strength</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                            { label: "Basic Info", done: true },
                            { label: "College & Year", done: !!form.college && !!form.year },
                            { label: "Branch/Stream", done: !!form.branch },
                            { label: "Phone Number", done: !!form.phone },
                            { label: "Bio", done: !!form.bio },
                            { label: "Profile Photo", done: false },
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                                    background: item.done ? "var(--sage)" : "var(--cream)",
                                    border: `2px solid ${item.done ? "var(--sage)" : "var(--dust)"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: ".7rem", color: "white", transition: "all .3s",
                                }}>{item.done ? "✓" : ""}</div>
                                <span style={{ fontSize: ".82rem", color: item.done ? "var(--ink)" : "var(--muted)", fontWeight: item.done ? 500 : 400 }}>{item.label}</span>
                                {!item.done && <span style={{ marginLeft: "auto", fontSize: ".68rem", color: "var(--amber-deep)", fontWeight: 600 }}>+{i === 0 ? 0 : 10}%</span>}
                            </div>
                        ))}
                    </div>
                    <div className="progress-bar" style={{ marginTop: 18 }}>
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>Current</span>
                        <span style={{ fontSize: ".72rem", color: "var(--amber-deep)", fontWeight: 600 }}>{pct}% complete</span>
                    </div>
                </div>
                <div className="card">
                    <p className="section-heading" style={{ marginBottom: 14, fontSize: "1rem" }}>Your Stats</p>
                    {[
                        { label: "Items Sold", val: 0, icon: "📦" },
                        { label: "Items Bought", val: 0, icon: "🛍" },
                        { label: "Seller Rating", val: "—", icon: "⭐" },
                        { label: "Member Since", val: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—", icon: "🎓" },
                    ].map((s, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? "1px solid var(--cream)" : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span>{s.icon}</span>
                                <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>{s.label}</span>
                            </div>
                            <span style={{ fontFamily: "'Clash Display',sans-serif", fontWeight: 700 }}>{s.val}</span>
                        </div>
                    ))}
                </div>
                <div style={{ background: "var(--ink)", borderRadius: 18, padding: "18px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>✅</div>
                    <p style={{ color: "white", fontWeight: 600, fontSize: ".875rem", marginBottom: 4 }}>Student Verified</p>
                    <p style={{ color: "rgba(255,255,255,.45)", fontSize: ".75rem" }}>Your college email has been verified</p>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────
   ROOT DASHBOARD
───────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────
   MOBILE BOTTOM NAV  (hidden on desktop via CSS)
───────────────────────────────────────────────────────────────── */
const MOB_NAV = [
    { id: "dashboard", icon: "⊞", label: "Home" },
    { id: "shop",      icon: "🛍", label: "Shop" },
    { id: "sell",      icon: "＋", label: "Sell",     needsProfile: true },
    { id: "messages",  icon: "💬", label: "Messages", needsProfile: true },
    { id: "profile",   icon: "👤", label: "Profile" },
];

function MobileBottomNav({ active, setActive, isProfileComplete }) {
    return (
        <div className="mob-nav">
            {MOB_NAV.map(n => {
                const locked = n.needsProfile && !isProfileComplete;
                const isActive = active === n.id;
                return (
                    <button
                        key={n.id}
                        onClick={() => !locked && setActive(n.id)}
                        style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                            background: "none", border: "none",
                            cursor: locked ? "not-allowed" : "pointer",
                            color: isActive ? "var(--amber)" : locked ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.6)",
                            padding: "4px 10px", borderRadius: 12, transition: "color .2s", minWidth: 48,
                        }}>
                        <span style={{ fontSize: n.id === "sell" ? "1.3rem" : "1.1rem" }}>
                            {locked ? "🔒" : n.icon}
                        </span>
                        <span style={{ fontSize: ".58rem", fontWeight: isActive ? 700 : 500 }}>{n.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default function Dashboard({ profile, refreshProfile }) {
    const [active, setActive] = useState("dashboard");
    const [cart, setCart] = useState([]); // start empty — no hardcoded sample items
    const [myUserId, setMyUserId] = useState(null);
    const [openConvId, setOpenConvId] = useState(null); // set when "Message Seller" is clicked
    const [dashRefreshKey, setDashRefreshKey] = useState(0);
    const navigate = useNavigate();

    // Grab userId once from session
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data?.session?.user) setMyUserId(data.session.user.id);
        });
    }, []);

    // Profile is "complete" once college AND year are filled
    const isProfileComplete = !!(profile?.college && profile?.year);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            navigate("/");
        }
    };

    // Called by ShopView when user hits "Message Seller"
    const handleMessageSeller = (convId) => {
        setOpenConvId(convId);
        setActive("messages");
    };

    const VIEW_META = {
        dashboard: { title: `Dashboard`, subtitle: `${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}` },
        shop: { title: "Shop & Buy", subtitle: "Discover deals from students around your campus" },
        sell: { title: "Sell an Item", subtitle: "List your item in 3 minutes with AI pricing" },
        messages: { title: "Messages", subtitle: "Your conversations with buyers & sellers" },
        cart: { title: "My Cart", subtitle: `${cart.length} items ready to inquire about` },
        listings: { title: "My Listings", subtitle: "Manage your active and past listings" },
        profile: { title: "Complete Profile", subtitle: "A complete profile gets 3x more trust from buyers" },
    };

    const meta = VIEW_META[active] || VIEW_META.dashboard;

    return (
        <>
            <G />
            <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                <Sidebar
                    active={active}
                    setActive={(view) => {
                        // bump refresh key whenever user navigates to dashboard so listings reload
                        if (view === "dashboard") setDashRefreshKey(k => k + 1);
                        setActive(view);
                    }}
                    onLogout={handleLogout}
                    profile={profile}
                    isProfileComplete={isProfileComplete}
                    cartCount={cart.length}
                    myUserId={myUserId}
                />

                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <TopBar title={meta.title} subtitle={meta.subtitle} active={active} setActive={setActive} profile={profile} />
                    <div className="dash-content" style={{ flex: 1, overflowY: "auto", padding: "20px 28px 40px" }}>
                        {active === "dashboard" && <DashboardHome setActive={(view) => { if (view === "dashboard") setDashRefreshKey(k => k + 1); setActive(view); }} profile={profile} isProfileComplete={isProfileComplete} myUserId={myUserId} refreshKey={dashRefreshKey} />}
                        {active === "shop" && <ShopView cart={cart} setCart={setCart} myUserId={myUserId} onMessageSeller={handleMessageSeller} />}
                        {active === "sell" && <SellView profile={profile} setActive={setActive} myUserId={myUserId} />}
                        {active === "messages" && <MessagesView myUserId={myUserId} openConvId={openConvId} profile={profile} />}
                        {active === "cart" && <CartView cart={cart} setCart={setCart} />}
                        {active === "listings" && <ListingsView userId={myUserId} setActive={setActive} />}
                        {active === "profile" && <ProfileView profile={profile} refreshProfile={refreshProfile} />}
                    </div>
                </div>
            </div>
            <MobileBottomNav
                active={active}
                setActive={(view) => {
                    if (view === "dashboard") setDashRefreshKey(k => k + 1);
                    setActive(view);
                }}
                isProfileComplete={isProfileComplete}
            />
        </>
    );
}