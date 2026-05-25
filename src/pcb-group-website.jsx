import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// GOOGLE MAPS CONFIG
// ─────────────────────────────────────────────────────────────
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

// Loads the Google Maps Places script once
function useGooglePlaces() {
  const [ready, setReady] = useState(!!window.google?.maps?.places);
  useEffect(() => {
    if (window.google?.maps?.places) { setReady(true); return; }
    if (document.getElementById("gmap-script")) return;
    const script = document.createElement("script");
    script.id  = "gmap-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);
  return ready;
}

// ─────────────────────────────────────────────────────────────
// BRAND TOKENS
// ─────────────────────────────────────────────────────────────
const C = {
  gold:        "#C7B89A",
  ivory:       "#E7E1D4",
  charcoal:    "#1A1A1A",
  goldDark:    "#A89878",
  goldLight:   "#DDD0B8",
  ivoryDark:   "#CFC8B8",
  bg:          "#F4F0E8",
  danger:      "#c0392b",
  dangerLight: "#fdf0ef",
  success:     "#2d7a4f",
  successLight:"#edf7f2",
  warning:     "#b8762a",
  warningLight:"#fef8ee",
  info:        "#2c5f8a",
  infoLight:   "#eef4fb",
};

// ─────────────────────────────────────────────────────────────
// DEAL STAGES
// ─────────────────────────────────────────────────────────────
const DEAL_STAGES = [
  { id: "new_lead",          label: "New Lead",            color: "#6B7280", bg: "#F3F4F6", icon: "✦" },
  { id: "pending_docs",      label: "Pending Documents",   color: "#B8762A", bg: "#FEF8EE", icon: "📋" },
  { id: "waiting_payment",   label: "Waiting for Payment", color: "#8B5CF6", bg: "#F5F3FF", icon: "⏳" },
  { id: "payment_received",  label: "Payment Received",    color: "#2D7A4F", bg: "#EDF7F2", icon: "✓" },
  { id: "in_review",         label: "In Review",           color: "#2C5F8A", bg: "#EEF4FB", icon: "🔍" },
  { id: "approved",          label: "Approved",            color: "#1A6B3C", bg: "#D1FAE5", icon: "✅" },
  { id: "closed_deal",       label: "Closed Deal",         color: "#92400E", bg: "#FEF3C7", icon: "🏆" },
  { id: "cancelled",         label: "Cancelled",           color: "#991B1B", bg: "#FEE2E2", icon: "✗" },
];

const PAYMENT_STATUSES = [
  { id: "not_paid",    label: "Not Paid",    color: C.danger },
  { id: "partial",     label: "Partial",     color: C.warning },
  { id: "paid",        label: "Paid",        color: C.success },
  { id: "refunded",    label: "Refunded",    color: "#6B7280" },
];

// ─────────────────────────────────────────────────────────────
// LENDER DATA
// ─────────────────────────────────────────────────────────────
const INITIAL_LENDERS = [
  { id: 1, category: "Permanent", location: "California", bankName: "Pacific Trust Bank", contactName: "Sarah Chen", email: "s.chen@pacifictrust.com", phone: "(415) 555-0192", assistantPhone: "(415) 555-0193", assistantName: "Mark Rivera", lenderType: "Direct Lender", notes: "Excellent rates for jumbo loans. Preferred partner.", rate: 6.75, minLoan: 500000, maxLoan: 5000000 },
  { id: 2, category: "Permanent", location: "Texas", bankName: "Lone Star Capital", contactName: "James Whitfield", email: "j.whitfield@lonestar.com", phone: "(713) 555-0247", assistantPhone: "", assistantName: "", lenderType: "Correspondent", notes: "Strong in commercial permanent financing.", rate: 7.10, minLoan: 250000, maxLoan: 10000000 },
  { id: 3, category: "Bridge to Perm", location: "New York", bankName: "Hudson Bridge Finance", contactName: "Alexandra Novak", email: "a.novak@hudsonbridge.com", phone: "(212) 555-0384", assistantPhone: "(212) 555-0385", assistantName: "Daniel Park", lenderType: "Portfolio Lender", notes: "Fast close, 30-day guarantee. Great for value-add.", rate: 8.50, minLoan: 1000000, maxLoan: 50000000 },
  { id: 4, category: "Bridge to Perm", location: "Florida", bankName: "Coastal Bridge Group", contactName: "Carlos Mendez", email: "c.mendez@coastalbridge.com", phone: "(305) 555-0561", assistantPhone: "", assistantName: "", lenderType: "Direct Lender", notes: "Specializes in multifamily bridge-to-perm.", rate: 8.25, minLoan: 500000, maxLoan: 25000000 },
  { id: 5, category: "Construction", location: "California", bankName: "BuildFirst National", contactName: "Priya Sharma", email: "p.sharma@buildfirst.com", phone: "(818) 555-0729", assistantPhone: "(818) 555-0730", assistantName: "Tom Nguyen", lenderType: "Construction Specialist", notes: "Interest reserve required. 18-month max term.", rate: 9.00, minLoan: 750000, maxLoan: 30000000 },
  { id: 6, category: "Owner Occupied", location: "New York", bankName: "Empire Owner Finance", contactName: "Robert Kim", email: "r.kim@empireowner.com", phone: "(646) 555-0843", assistantPhone: "", assistantName: "", lenderType: "Bank", notes: "SBA preferred lender. Owner-occ commercial only.", rate: 6.90, minLoan: 300000, maxLoan: 8000000 },
];

const INITIAL_CLIENTS = [
  { id: 1, fullName: "Michael Torres", phone: "(212) 555-0910", email: "m.torres@email.com", address: "45 Park Ave, New York, NY 10016", dealStage: "approved", paymentStatus: "paid", paymentAmount: 15000, notes: "Fast mover. Docs all verified. Preferred client.", idFileName: "torres_passport.pdf", contractFileName: "torres_contract.pdf", createdAt: "2025-01-15" },
  { id: 2, fullName: "Rachel Kim", phone: "(310) 555-0234", email: "r.kim@email.com", address: "820 Wilshire Blvd, Los Angeles, CA 90017", dealStage: "pending_docs", paymentStatus: "not_paid", paymentAmount: 8500, notes: "Waiting on ID scan.", idFileName: "", contractFileName: "", createdAt: "2025-02-03" },
  { id: 3, fullName: "David Schwartz", phone: "(305) 555-0567", email: "d.schwartz@email.com", address: "200 Biscayne Blvd, Miami, FL 33131", dealStage: "in_review", paymentStatus: "partial", paymentAmount: 22000, notes: "Complex deal. Multi-unit residential.", idFileName: "schwartz_id.jpg", contractFileName: "schwartz_agreement.pdf", createdAt: "2025-02-18" },
  { id: 4, fullName: "Linda Park", phone: "(713) 555-0811", email: "l.park@email.com", address: "900 Travis St, Houston, TX 77002", dealStage: "closed_deal", paymentStatus: "paid", paymentAmount: 31000, notes: "Deal closed. Excellent experience.", idFileName: "park_passport.pdf", contractFileName: "park_contract_final.pdf", createdAt: "2025-01-08" },
];

const CATEGORIES   = ["Permanent", "Bridge to Perm", "Construction", "Owner Occupied"];
const LOCATIONS    = ["All Locations", "California", "Texas", "New York", "Florida"];
const LENDER_TYPES = ["Direct Lender", "Correspondent", "Portfolio Lender", "Construction Specialist", "Bank", "Credit Union", "Private"];

// ─────────────────────────────────────────────────────────────
// INITIAL WORKERS (admin only)
// ─────────────────────────────────────────────────────────────
const INITIAL_WORKERS = [
  { id: 1, name: "Y. Fried", email: "yfried@pcgroupny.com", password: "pcb2027", role: "manager" },
];

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { margin: 0; font-family: 'Georgia', serif; background: ${C.bg}; overflow-x: hidden; }
      input, select, textarea, button { font-family: 'Georgia', serif; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: ${C.ivoryDark}; border-radius: 3px; }
      @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      .anim-fade-up { animation: fadeSlideUp 0.35s ease both; }
      .anim-fade { animation: fadeIn 0.25s ease both; }
      .card-hover { transition: box-shadow 0.2s, transform 0.2s; }
      .card-hover:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.10); transform: translateY(-1px); }
      .btn-transition { transition: background 0.18s, opacity 0.18s, transform 0.12s; }
      .btn-transition:active { transform: scale(0.97); }
      input::placeholder, textarea::placeholder { color: #bbb; }
      @media (max-width: 640px) {
        .hide-mobile { display: none !important; }
        .stack-mobile { flex-direction: column !important; }
        .full-mobile { width: 100% !important; }
        .pad-mobile { padding: 16px !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const fmt$ = v => v ? `$${Number(v).toLocaleString()}` : "—";
const stageInfo = id => DEAL_STAGES.find(s => s.id === id) || DEAL_STAGES[0];
const payInfo   = id => PAYMENT_STATUSES.find(s => s.id === id) || PAYMENT_STATUSES[0];

function StageBadge({ stageId, small }) {
  const s = stageInfo(stageId);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      padding: small ? "3px 8px" : "5px 11px",
      borderRadius: 20, fontSize: small ? 10 : 11,
      fontFamily: "Georgia, serif", letterSpacing: 0.5,
      fontWeight: "bold", whiteSpace: "nowrap",
      border: `1px solid ${s.color}33`,
    }}>
      <span style={{ fontSize: small ? 9 : 11 }}>{s.icon}</span>
      {s.label}
    </span>
  );
}

function PayBadge({ statusId, small }) {
  const p = payInfo(statusId);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: `${p.color}18`, color: p.color,
      padding: small ? "3px 8px" : "4px 10px",
      borderRadius: 20, fontSize: small ? 10 : 11,
      fontFamily: "Georgia, serif", letterSpacing: 0.5,
      border: `1px solid ${p.color}33`,
    }}>
      {p.label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// PCB LOGO
// ─────────────────────────────────────────────────────────────
function PCBLogo({ size = 120, darkBg = false }) {
  return (
    <img src="/pcb-logo.png" alt="PCB Group"
      style={{
        width: size, height: "auto", display: "block", objectFit: "contain",
        filter: darkBg ? "brightness(0) invert(1) sepia(1) saturate(1.1) hue-rotate(3deg) opacity(0.90)" : "none",
      }}
    />
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL BASE
// ─────────────────────────────────────────────────────────────
function Modal({ onClose, children, maxWidth = 520 }) {
  return (
    <div className="anim-fade" style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      padding: "0",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-fade-up" style={{
        background: "white", width: "100%", maxWidth,
        borderRadius: "16px 16px 0 0",
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 -8px 48px rgba(0,0,0,0.25)",
      }}>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel = "Confirm", danger, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} maxWidth={400}>
      <div style={{ padding: "28px 24px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>{danger ? "⚠️" : "?"}</div>
          <div style={{ fontSize: 17, fontFamily: "Georgia, serif", color: C.charcoal, marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 13, color: "#777", lineHeight: 1.6 }}>{message}</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onCancel} className="btn-transition" style={{ flex: 1, padding: "13px", background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 10, cursor: "pointer", fontSize: 13, color: C.charcoal }}>Cancel</button>
          <button onClick={onConfirm} className="btn-transition" style={{ flex: 1, padding: "13px", background: danger ? C.danger : C.goldDark, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "white", fontWeight: "bold" }}>{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// SPLASH SCREEN
// ─────────────────────────────────────────────────────────────
function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => { setFadeOut(true); setTimeout(onEnter, 700); }, 2600);
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, background: C.charcoal,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 9999, opacity: fadeOut ? 0 : 1, transition: "opacity 0.7s ease",
    }}>
      <div style={{
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: "all 1s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
      }}>
        <PCBLogo size={220} darkBg />
        <div style={{ width: 48, height: 1, background: C.gold, opacity: 0.4 }} />
        <div style={{ color: C.ivoryDark, letterSpacing: "5px", fontSize: 9, opacity: 0.55, textTransform: "uppercase" }}>
          Broker Management Portal
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, workers }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      const found = workers.find(
        w => w.email.trim().toLowerCase() === email.trim().toLowerCase() && w.password === password
      );
      if (found) {
        onLogin({ name: found.name, email: found.email, role: found.role });
      } else {
        setError("Invalid credentials. Please try again.");
        setLoading(false);
      }
    }, 900);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.charcoal,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", fontFamily: "Georgia, serif",
    }}>
      <div className="anim-fade-up" style={{
        background: "#222", borderRadius: 16, padding: "40px 32px",
        width: "100%", maxWidth: 400,
        boxShadow: "0 0 80px rgba(0,0,0,0.6)",
        border: `1px solid ${C.goldDark}33`,
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <PCBLogo size={180} darkBg />
          <div style={{ color: C.gold, letterSpacing: "5px", fontSize: 9, opacity: 0.7 }}>PRIVATE PORTAL ACCESS</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: `${C.gold}99`, fontSize: 10, letterSpacing: 2, marginBottom: 7 }}>EMAIL ADDRESS</div>
          <input type="email" placeholder="Enter your email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={{ width: "100%", padding: "14px 16px", background: "#2a2a2a", border: `1px solid ${C.goldDark}44`, borderRadius: 10, color: C.ivory, fontSize: 14, outline: "none" }}
          />
        </div>

        <div>
          <div style={{ color: `${C.gold}99`, fontSize: 10, letterSpacing: 2, marginBottom: 7 }}>PASSWORD</div>
          <div style={{ position: "relative" }}>
            <input type={showPass ? "text" : "password"} placeholder="Enter your password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "14px 48px 14px 16px", background: "#2a2a2a", border: `1px solid ${C.goldDark}44`, borderRadius: 10, color: C.ivory, fontSize: 14, outline: "none" }}
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: `${C.gold}88`, padding: 0, display: "flex", alignItems: "center" }}>
              <EyeIcon open={showPass} />
            </button>
          </div>
        </div>

        {error && <div style={{ color: "#e07070", fontSize: 12, marginTop: 10 }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading} className="btn-transition" style={{
          width: "100%", marginTop: 22, padding: "15px",
          background: C.goldDark, color: C.charcoal,
          border: "none", borderRadius: 10, fontSize: 13,
          letterSpacing: "3px", cursor: "pointer", fontWeight: "bold",
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "AUTHENTICATING…" : "SIGN IN"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20, color: C.gold, opacity: 0.25, fontSize: 9, letterSpacing: 2 }}>
          SECURED · ENCRYPTED · PRIVATE
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────
function Header({ user, onLogout, onHome, onMenuToggle, sidebarOpen }) {
  return (
    <header style={{
      background: C.charcoal, borderBottom: `1px solid ${C.goldDark}22`,
      padding: "0 16px 0 12px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      height: 58, position: "sticky", top: 0, zIndex: 200,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onMenuToggle} className="btn-transition" style={{
          background: "none", border: "none", cursor: "pointer",
          color: C.gold, padding: "8px 6px", borderRadius: 8,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <div style={{ width: 20, height: 2, background: sidebarOpen ? C.gold : `${C.gold}99`, transition: "all 0.2s", transform: sidebarOpen ? "rotate(45deg) translate(4px,4px)" : "none" }}/>
          <div style={{ width: 20, height: 2, background: C.gold, transition: "all 0.2s", opacity: sidebarOpen ? 0 : 1 }}/>
          <div style={{ width: 20, height: 2, background: sidebarOpen ? C.gold : `${C.gold}99`, transition: "all 0.2s", transform: sidebarOpen ? "rotate(-45deg) translate(4px,-4px)" : "none" }}/>
        </button>
        <div style={{ cursor: "pointer" }} onClick={onHome}>
          <PCBLogo size={96} darkBg />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: C.gold, fontSize: 10, letterSpacing: 2, opacity: 0.75 }} className="hide-mobile">
          {user.name.toUpperCase()}
        </span>
        {user.role === "manager" && (
          <span style={{ color: C.goldDark, fontSize: 9, letterSpacing: 1, background: `${C.goldDark}22`, padding: "3px 8px", borderRadius: 10 }} className="hide-mobile">
            MANAGER
          </span>
        )}
        <button onClick={onLogout} className="btn-transition" style={{
          background: "transparent", border: `1px solid ${C.goldDark}55`,
          color: C.gold, padding: "7px 14px", borderRadius: 8,
          cursor: "pointer", fontSize: 10, letterSpacing: 1.5,
        }}>LOGOUT</button>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────
function Sidebar({ activeNav, onNavigate, isOpen, onClose, userRole }) {
  const mainLinks = [
    ...(userRole === "manager" ? [{ id: "dashboard", label: "Dashboard", icon: "◈" }] : []),
    { id: "clients",    label: "Clients",  icon: "👤" },
    { id: "categories", label: "Lenders",  icon: "⊞" },
    { id: "search",     label: "Search",   icon: "⌕" },
    ...(userRole === "manager" ? [{ id: "settings", label: "Settings", icon: "⚙" }] : []),
  ];

  return (
    <>
      {isOpen && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 150, backdropFilter: "blur(2px)",
        }} className="anim-fade" />
      )}
      <nav style={{
        width: 220, background: "#111",
        borderRight: `1px solid ${C.goldDark}1A`,
        position: "fixed", top: 58, bottom: 0, left: 0,
        zIndex: 160,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
        overflowY: "auto",
        paddingTop: 16,
      }}>
        {mainLinks.map(l => (
          <div key={l.id} onClick={() => { onNavigate(l.id); onClose(); }} style={{
            padding: "13px 24px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 12,
            background: activeNav === l.id ? `${C.goldDark}1A` : "transparent",
            borderLeft: activeNav === l.id ? `3px solid ${C.gold}` : "3px solid transparent",
            color: activeNav === l.id ? C.gold : "#777",
            transition: "all 0.15s", fontSize: 13, letterSpacing: 0.5,
          }}>
            <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{l.icon}</span>
            <span>{l.label}</span>
          </div>
        ))}
        <div style={{ height: 1, background: `${C.goldDark}22`, margin: "12px 24px" }} />
        <div style={{ padding: "8px 24px", color: "#444", fontSize: 9, letterSpacing: 3 }}>SYSTEM</div>
        <div style={{ padding: "10px 24px", color: "#555", fontSize: 12, letterSpacing: 0.5 }}>
          v2.1 · PCB Portal
        </div>
      </nav>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────────────────────────
function BottomNav({ activeNav, onNavigate, userRole }) {
  const items = [
    ...(userRole === "manager" ? [{ id: "dashboard", label: "Home", icon: "◈" }] : []),
    { id: "clients",    label: "Clients", icon: "👤" },
    { id: "categories", label: "Lenders", icon: "⊞" },
    { id: "search",     label: "Search",  icon: "⌕" },
    ...(userRole === "manager" ? [{ id: "settings", label: "Settings", icon: "⚙" }] : []),
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: C.charcoal, borderTop: `1px solid ${C.goldDark}22`,
      display: "flex", zIndex: 190,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNavigate(item.id)} style={{
          flex: 1, padding: "10px 0 8px", background: "none", border: "none",
          cursor: "pointer", display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3,
          color: activeNav === item.id ? C.gold : "#555",
          transition: "color 0.15s",
        }}>
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          <span style={{ fontSize: 9, letterSpacing: 0.5 }}>{item.label}</span>
          {activeNav === item.id && (
            <div style={{ width: 16, height: 2, background: C.gold, borderRadius: 1 }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORM FIELDS
// ─────────────────────────────────────────────────────────────
const fieldLabel = { color: "#888", fontSize: 10, letterSpacing: 2, marginBottom: 6 };

// Google Places Address Autocomplete Field
function AddressField({ label = "Address", value, onChange, span2 }) {
  const placesReady = useGooglePlaces();
  const inputRef    = useRef(null);
  const acRef       = useRef(null);
  const [inputVal, setInputVal] = useState(value || "");

  // Keep local state in sync if parent resets form
  useEffect(() => { setInputVal(value || ""); }, [value]);

  useEffect(() => {
    if (!placesReady || !inputRef.current || acRef.current) return;
    try {
      acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        fields: ["formatted_address"],
      });
      acRef.current.addListener("place_changed", () => {
        const place = acRef.current.getPlace();
        const addr  = place?.formatted_address || inputRef.current.value;
        setInputVal(addr);
        onChange(addr);
      });
    } catch(e) {
      // Places API unavailable — fall back to manual input
    }
  }, [placesReady]);

  const handleChange = e => {
    setInputVal(e.target.value);
    onChange(e.target.value); // persist every keystroke so manual entry always saves
  };

  const handleBlur = () => {
    if (inputVal.trim()) onChange(inputVal.trim());
  };

  return (
    <div style={span2 ? { gridColumn: "1/-1" } : {}}>
      <div style={fieldLabel}>
        {label.toUpperCase()}
        {placesReady
          ? <span style={{ color: "#2d7a4f", marginLeft: 6, fontSize: 9 }}>📍 Google Maps</span>
          : <span style={{ color: "#bbb", marginLeft: 6, fontSize: 9 }}>📍 Address</span>}
      </div>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          placeholder="Start typing an address…"
          onChange={handleChange}
          onBlur={handleBlur}
          style={{ ...inputStyle, paddingLeft: 38 }}
        />
        <span style={{
          position: "absolute", left: 13, top: "50%",
          transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none",
        }}>📍</span>
      </div>
    </div>
  );
}
const inputStyle = {
  width: "100%", padding: "13px 14px",
  background: C.bg, border: `1.5px solid ${C.ivoryDark}`,
  borderRadius: 10, color: C.charcoal, fontSize: 14,
  outline: "none", transition: "border-color 0.15s",
};

function FormField({ label, value, onChange, type = "text", step, span2, textarea, required }) {
  return (
    <div style={span2 ? { gridColumn: "1/-1" } : {}}>
      <div style={fieldLabel}>{label.toUpperCase()}{required && <span style={{ color: C.danger }}> *</span>}</div>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          style={{ ...inputStyle, resize: "vertical" }} />
      ) : (
        <input type={type} step={step} value={value}
          onChange={e => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options, span2 }) {
  return (
    <div style={span2 ? { gridColumn: "1/-1" } : {}}>
      <div style={fieldLabel}>{label.toUpperCase()}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
        {options.map(o => (
          <option key={typeof o === "string" ? o : o.id} value={typeof o === "string" ? o : o.id}>
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FileField({ label, fileName, onChange, span2 }) {
  const ref = useRef();
  return (
    <div style={span2 ? { gridColumn: "1/-1" } : {}}>
      <div style={fieldLabel}>{label.toUpperCase()}</div>
      <div style={{
        border: `1.5px dashed ${C.ivoryDark}`, borderRadius: 10,
        padding: "12px 14px", background: C.bg,
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      }} onClick={() => ref.current?.click()}>
        <span style={{ fontSize: 18 }}>📎</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: fileName ? C.goldDark : "#bbb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fileName || "Tap to upload file"}
          </div>
          {fileName && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>Tap to replace</div>}
        </div>
        {fileName && (
          <button onClick={e => { e.stopPropagation(); onChange(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 16, padding: 4 }}>×</button>
        )}
        <input ref={ref} type="file" style={{ display: "none" }}
          onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0].name); }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DEAL PIPELINE VISUAL
// ─────────────────────────────────────────────────────────────
function DealPipeline({ currentStage }) {
  const stages = DEAL_STAGES.filter(s => s.id !== "cancelled");
  const currentIdx = stages.findIndex(s => s.id === currentStage);
  const isCancelled = currentStage === "cancelled";

  return (
    <div style={{ overflowX: "auto", paddingBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "max-content" }}>
        {stages.map((s, i) => {
          const isActive = s.id === currentStage;
          const isDone   = !isCancelled && i < currentIdx;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "0 6px" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: isActive ? s.color : isDone ? C.goldDark : "#E5E7EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, border: isActive ? `3px solid ${s.color}44` : "none",
                  transition: "all 0.3s",
                }}>
                  {isDone ? <span style={{ color: "white", fontSize: 11 }}>✓</span>
                    : <span style={{ color: isActive ? "white" : "#9CA3AF", fontSize: 11 }}>{i + 1}</span>}
                </div>
                <div style={{
                  fontSize: 8, letterSpacing: 0.5, textAlign: "center",
                  color: isActive ? s.color : isDone ? C.goldDark : "#9CA3AF",
                  maxWidth: 56, lineHeight: 1.3, fontWeight: isActive ? "bold" : "normal",
                }}>{s.label}</div>
              </div>
              {i < stages.length - 1 && (
                <div style={{ width: 20, height: 2, marginBottom: 18, background: isDone ? C.goldDark : "#E5E7EB", transition: "background 0.3s" }} />
              )}
            </div>
          );
        })}
      </div>
      {isCancelled && (
        <div style={{ textAlign: "center", marginTop: 6 }}>
          <StageBadge stageId="cancelled" />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CLIENT FORM
// ─────────────────────────────────────────────────────────────
function ClientForm({ initial, onSave, onCancel }) {
  const blank = {
    fullName: "", phone: "", email: "", address: "",
    idFileName: "", contractFileName: "",
    notes: "", paymentAmount: "", paymentStatus: "not_paid",
    dealStage: "new_lead",
  };
  const [form, setForm] = useState(initial ? { ...initial, paymentAmount: initial.paymentAmount || "" } : blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.fullName.trim()) { alert("Client name is required."); return; }
    onSave({ ...form, paymentAmount: parseFloat(form.paymentAmount) || 0 });
  };

  return (
    <div style={{ padding: "24px 20px 40px" }}>
      <div style={{ width: 36, height: 4, background: C.ivoryDark, borderRadius: 2, margin: "0 auto 20px" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontFamily: "Georgia, serif", fontWeight: "normal", color: C.charcoal }}>
          {initial ? "Edit Client" : "New Client"}
        </h2>
        <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>×</button>
      </div>

      <div style={{ background: C.bg, borderRadius: 12, padding: "14px 12px", marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#999", marginBottom: 10 }}>DEAL PROGRESS</div>
        <DealPipeline currentStage={form.dealStage} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Full Name" value={form.fullName} onChange={v => set("fullName", v)} required span2 />
        <FormField label="Phone" type="tel" value={form.phone} onChange={v => set("phone", v)} />
        <FormField label="Email" type="email" value={form.email} onChange={v => set("email", v)} />
        <AddressField label="Address" value={form.address} onChange={v => set("address", v)} span2 />

        <SelectField label="Deal Stage" value={form.dealStage} onChange={v => set("dealStage", v)} options={DEAL_STAGES} />
        <SelectField label="Payment Status" value={form.paymentStatus} onChange={v => set("paymentStatus", v)} options={PAYMENT_STATUSES} />

        <FormField label="Payment Amount ($)" type="number" value={form.paymentAmount} onChange={v => set("paymentAmount", v)} />
        <div /> {/* spacer to keep grid even */}

        <FileField label="ID / Passport" fileName={form.idFileName} onChange={v => set("idFileName", v)} />
        <FileField label="Contract / Document" fileName={form.contractFileName} onChange={v => set("contractFileName", v)} />

        <FormField label="Notes / Comments" value={form.notes} onChange={v => set("notes", v)} textarea span2 />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onCancel} className="btn-transition" style={{
          flex: 1, padding: "14px", background: "white",
          border: `1.5px solid ${C.ivoryDark}`, borderRadius: 12,
          cursor: "pointer", fontSize: 13, color: C.charcoal,
        }}>Cancel</button>
        <button onClick={handleSave} className="btn-transition" style={{
          flex: 2, padding: "14px",
          background: C.goldDark, color: "white",
          border: "none", borderRadius: 12,
          cursor: "pointer", fontSize: 13, fontWeight: "bold", letterSpacing: 1,
        }}>
          {initial ? "SAVE CHANGES" : "ADD CLIENT"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CLIENT CARD
// ─────────────────────────────────────────────────────────────
function ClientCard({ client, onEdit, onDelete, onStageChange }) {
  const [expanded, setExpanded]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const s = stageInfo(client.dealStage);

  return (
    <>
      <div className="card-hover" style={{
        background: "white", borderRadius: 14,
        marginBottom: 10, overflow: "hidden",
        border: `1px solid ${C.ivoryDark}`,
        boxShadow: expanded ? "0 4px 24px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s",
        borderLeft: `4px solid ${s.color}`,
      }}>
        <div onClick={() => setExpanded(v => !v)} style={{
          padding: "14px 16px", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${s.color}22, ${s.color}44)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: s.color, fontWeight: "bold",
            }}>
              {client.fullName.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: "bold", color: C.charcoal, fontSize: 14, fontFamily: "Georgia, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {client.fullName}
              </div>
              <div style={{ color: "#999", fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {client.email || client.phone || "No contact info"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <StageBadge stageId={client.dealStage} small />
            <span style={{ color: C.gold, fontSize: 14, transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
          </div>
        </div>

        {expanded && (
          <div className="anim-fade-up" style={{ padding: "0 16px 18px", borderTop: `1px solid ${C.ivory}` }}>
            <div style={{ marginTop: 14, marginBottom: 14, overflowX: "auto" }}>
              <DealPipeline currentStage={client.dealStage} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              {client.phone && (
                <div>
                  <div style={{ ...fieldLabel, marginBottom: 3 }}>PHONE</div>
                  <a href={`tel:${client.phone}`} style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}` }}>{client.phone}</a>
                </div>
              )}
              {client.email && (
                <div>
                  <div style={{ ...fieldLabel, marginBottom: 3 }}>EMAIL</div>
                  <a href={`mailto:${client.email}`} style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}`, overflow: "hidden", textOverflow: "ellipsis", display: "block", whiteSpace: "nowrap" }}>{client.email}</a>
                </div>
              )}
              {client.address && (
                <div style={{ gridColumn: "1/-1" }}>
                  <div style={{ ...fieldLabel, marginBottom: 3 }}>ADDRESS</div>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(client.address)}`} target="_blank" rel="noopener noreferrer" style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}` }}>
                    📍 {client.address}
                  </a>
                </div>
              )}
              <div>
                <div style={{ ...fieldLabel, marginBottom: 3 }}>PAYMENT</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ color: C.charcoal, fontWeight: "bold", fontSize: 15, fontFamily: "Georgia, serif" }}>{fmt$(client.paymentAmount)}</div>
                  <PayBadge statusId={client.paymentStatus} small />
                </div>
              </div>
              <div>
                <div style={{ ...fieldLabel, marginBottom: 3 }}>DOCUMENTS</div>
                <div style={{ fontSize: 12, color: "#888" }}>
                  {client.idFileName ? <div style={{ color: C.goldDark }}>📄 {client.idFileName}</div> : <div>No ID uploaded</div>}
                  {client.contractFileName ? <div style={{ color: C.goldDark, marginTop: 2 }}>📋 {client.contractFileName}</div> : <div style={{ marginTop: 2 }}>No contract</div>}
                </div>
              </div>
              {client.notes && (
                <div style={{ gridColumn: "1/-1" }}>
                  <div style={{ ...fieldLabel, marginBottom: 3 }}>NOTES</div>
                  <div style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: C.charcoal, lineHeight: 1.6 }}>{client.notes}</div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ ...fieldLabel, marginBottom: 6 }}>QUICK UPDATE STAGE</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DEAL_STAGES.map(ds => (
                  <button key={ds.id} onClick={() => { onStageChange(client.id, ds.id); }} className="btn-transition"
                    style={{
                      padding: "5px 10px", borderRadius: 20, border: `1px solid ${ds.color}44`,
                      background: client.dealStage === ds.id ? ds.color : ds.bg,
                      color: client.dealStage === ds.id ? "white" : ds.color,
                      cursor: "pointer", fontSize: 10, fontFamily: "Georgia, serif",
                    }}>
                    {ds.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: `1px solid ${C.ivory}` }}>
              <button onClick={e => { e.stopPropagation(); onEdit(client); }} className="btn-transition" style={{
                flex: 1, padding: "11px", background: C.charcoal,
                color: C.gold, border: "none", borderRadius: 10,
                cursor: "pointer", fontSize: 12, letterSpacing: 1,
              }}>EDIT</button>
              <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }} className="btn-transition" style={{
                padding: "11px 18px", background: C.dangerLight,
                color: C.danger, border: `1px solid ${C.danger}22`, borderRadius: 10,
                cursor: "pointer", fontSize: 12,
              }}>Delete</button>
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete Client"
          message={`Remove "${client.fullName}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { onDelete(client.id); setConfirmDelete(false); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// CLIENTS VIEW
// ─────────────────────────────────────────────────────────────
function ClientsView({ clients, onAdd, onEdit, onDelete, onStageChange }) {
  const [q, setQ]                     = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [payFilter, setPayFilter]     = useState("all");
  const [sortBy, setSortBy]           = useState("newest");

  const filtered = clients
    .filter(c => {
      const qLow = q.toLowerCase();
      const match = !q || [c.fullName, c.email, c.phone, c.address, c.notes].some(f => (f || "").toLowerCase().includes(qLow));
      const sMatch = stageFilter === "all" || c.dealStage === stageFilter;
      const pMatch = payFilter === "all" || c.paymentStatus === payFilter;
      return match && sMatch && pMatch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return (b.id - a.id);
      if (sortBy === "name")   return a.fullName.localeCompare(b.fullName);
      if (sortBy === "amount") return (b.paymentAmount || 0) - (a.paymentAmount || 0);
      return 0;
    });

  const totalPipeline = clients.reduce((sum, c) => sum + (c.paymentAmount || 0), 0);
  const paidTotal     = clients.filter(c => c.paymentStatus === "paid").reduce((sum, c) => sum + (c.paymentAmount || 0), 0);

  return (
    <div style={{ padding: "20px 16px 90px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: C.goldDark, fontSize: 9, letterSpacing: 4, marginBottom: 4 }}>PIPELINE</div>
          <h2 style={{ margin: 0, fontSize: 22, fontFamily: "Georgia, serif", fontWeight: "normal", color: C.charcoal }}>
            Clients <span style={{ color: "#bbb", fontSize: 16 }}>({clients.length})</span>
          </h2>
        </div>
        <button onClick={onAdd} className="btn-transition" style={{
          padding: "12px 20px", background: C.charcoal,
          color: C.gold, border: "none", borderRadius: 12,
          cursor: "pointer", fontSize: 12, letterSpacing: 2,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>+</span> NEW CLIENT
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.ivoryDark}`, borderLeft: `4px solid ${C.goldDark}` }}>
          <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 2, marginBottom: 4 }}>TOTAL PIPELINE</div>
          <div style={{ fontSize: 20, fontWeight: "bold", fontFamily: "Georgia, serif", color: C.charcoal }}>{fmt$(totalPipeline)}</div>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.ivoryDark}`, borderLeft: `4px solid ${C.success}` }}>
          <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 2, marginBottom: 4 }}>COLLECTED</div>
          <div style={{ fontSize: 20, fontWeight: "bold", fontFamily: "Georgia, serif", color: C.success }}>{fmt$(paidTotal)}</div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 14, padding: "16px", marginBottom: 16, border: `1px solid ${C.ivoryDark}` }}>
        <input type="text" placeholder="🔍  Search clients by name, email, phone…"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ ...inputStyle, marginBottom: 10, fontSize: 13 }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
            style={{ flex: 1, minWidth: 130, padding: "9px 12px", background: C.bg, border: `1.5px solid ${C.ivoryDark}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="all">All Stages</option>
            {DEAL_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={payFilter} onChange={e => setPayFilter(e.target.value)}
            style={{ flex: 1, minWidth: 120, padding: "9px 12px", background: C.bg, border: `1.5px solid ${C.ivoryDark}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="all">All Payments</option>
            {PAYMENT_STATUSES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ flex: 1, minWidth: 110, padding: "9px 12px", background: C.bg, border: `1.5px solid ${C.ivoryDark}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
            <option value="amount">Amount</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {DEAL_STAGES.map(s => {
          const count = clients.filter(c => c.dealStage === s.id).length;
          if (count === 0) return null;
          return (
            <button key={s.id} onClick={() => setStageFilter(stageFilter === s.id ? "all" : s.id)} className="btn-transition"
              style={{
                padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 10,
                background: stageFilter === s.id ? s.color : s.bg,
                color: stageFilter === s.id ? "white" : s.color,
                border: `1px solid ${s.color}33`,
              }}>
              {s.icon} {s.label} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ color: "#aaa", fontSize: 11, marginBottom: 12 }}>
        {filtered.length} client{filtered.length !== 1 ? "s" : ""} shown
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#bbb", fontSize: 14 }}>
          No clients found. <span style={{ color: C.goldDark, cursor: "pointer" }} onClick={onAdd}>Add one →</span>
        </div>
      ) : (
        filtered.map(c => (
          <ClientCard key={c.id} client={c} onEdit={onEdit} onDelete={onDelete} onStageChange={onStageChange} />
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
function Dashboard({ lenders, clients, onCategorySelect, onNavigate, user }) {
  const stats = CATEGORIES.map(cat => ({
    cat, count: lenders.filter(l => l.category === cat).length,
    avgRate: lenders.filter(l => l.category === cat).reduce((a, l) => a + l.rate, 0) /
      (lenders.filter(l => l.category === cat).length || 1),
  }));

  const stageStats = DEAL_STAGES.map(s => ({
    ...s, count: clients.filter(c => c.dealStage === s.id).length
  })).filter(s => s.count > 0);

  const totalPipeline = clients.reduce((sum, c) => sum + (c.paymentAmount || 0), 0);
  const paidTotal     = clients.filter(c => c.paymentStatus === "paid").reduce((sum, c) => sum + (c.paymentAmount || 0), 0);
  const recentClients = [...clients].sort((a,b) => b.id - a.id).slice(0, 4);
  const activeDeals   = clients.filter(c => !["closed_deal","cancelled"].includes(c.dealStage)).length;

  return (
    <div style={{ padding: "20px 16px 90px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: C.goldDark, fontSize: 9, letterSpacing: 4, marginBottom: 4 }}>OVERVIEW</div>
        <h1 style={{ color: C.charcoal, margin: 0, fontSize: 24, fontFamily: "Georgia, serif", fontWeight: "normal" }}>
          Good day, {user.name}
        </h1>
        <div style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
          {activeDeals} active deal{activeDeals !== 1 ? "s" : ""} in progress
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 24 }}>
        {[
          { label: "Total Clients", value: clients.length,       color: C.goldDark, icon: "👤" },
          { label: "Active Deals",  value: activeDeals,          color: C.info,     icon: "🔄" },
          { label: "Pipeline",      value: fmt$(totalPipeline),  color: C.goldDark, icon: "💰" },
          { label: "Collected",     value: fmt$(paidTotal),      color: C.success,  icon: "✓" },
        ].map((kpi, i) => (
          <div key={i} className="card-hover" style={{
            background: "white", borderRadius: 14, padding: "16px",
            border: `1px solid ${C.ivoryDark}`, borderTop: `4px solid ${kpi.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 2, marginBottom: 6 }}>{kpi.label.toUpperCase()}</div>
                <div style={{ fontSize: 22, fontWeight: "bold", fontFamily: "Georgia, serif", color: C.charcoal }}>{kpi.value}</div>
              </div>
              <span style={{ fontSize: 20 }}>{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {stageStats.length > 0 && (
        <div style={{ background: "white", borderRadius: 14, padding: "18px 16px", marginBottom: 20, border: `1px solid ${C.ivoryDark}` }}>
          <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 3, marginBottom: 14 }}>DEAL STAGES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stageStats.map(s => {
              const pct = Math.round((s.count / clients.length) * 100);
              return (
                <div key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: s.color, fontWeight: "bold" }}>{s.icon} {s.label}</span>
                    <span style={{ fontSize: 11, color: "#aaa" }}>{s.count} client{s.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: s.color, borderRadius: 3, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recentClients.length > 0 && (
        <div style={{ background: "white", borderRadius: 14, padding: "18px 16px", marginBottom: 20, border: `1px solid ${C.ivoryDark}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 3 }}>RECENT CLIENTS</div>
            <button onClick={() => onNavigate("clients")} style={{ background: "none", border: "none", cursor: "pointer", color: C.goldDark, fontSize: 11, letterSpacing: 1 }}>
              View All →
            </button>
          </div>
          {recentClients.map(c => {
            const s = stageInfo(c.dealStage);
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.ivory}` }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${s.color}22, ${s.color}44)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, color: s.color, fontWeight: "bold",
                }}>{c.fullName.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: C.charcoal, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.fullName}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                    <StageBadge stageId={c.dealStage} small />
                    <PayBadge statusId={c.paymentStatus} small />
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: "bold", color: C.charcoal, fontFamily: "Georgia, serif" }}>{fmt$(c.paymentAmount)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 3, marginBottom: 14 }}>LENDER CATEGORIES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {stats.map(s => (
            <div key={s.cat} onClick={() => onCategorySelect(s.cat)} className="card-hover"
              style={{ background: "white", border: `1px solid ${C.ivoryDark}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 14, padding: "16px 14px", cursor: "pointer" }}>
              <div style={{ color: "#aaa", fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>{s.cat.toUpperCase()}</div>
              <div style={{ fontSize: 26, fontWeight: "bold", color: C.charcoal, fontFamily: "Georgia, serif" }}>{s.count}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>Avg {s.avgRate.toFixed(2)}%</div>
              <div style={{ color: C.goldDark, fontSize: 11, marginTop: 10 }}>View →</div>
            </div>
          ))}
          <div style={{ background: C.charcoal, borderRadius: 14, padding: "16px 14px", borderLeft: `4px solid ${C.goldDark}` }}>
            <div style={{ color: C.gold, fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>TOTAL LENDERS</div>
            <div style={{ fontSize: 26, fontWeight: "bold", color: C.ivory, fontFamily: "Georgia, serif" }}>{lenders.length}</div>
            <div style={{ fontSize: 11, color: C.gold, opacity: 0.6, marginTop: 4 }}>
              Avg {(lenders.reduce((a, l) => a + l.rate, 0) / (lenders.length || 1)).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LENDER CARD
// ─────────────────────────────────────────────────────────────
function LenderCard({ lender, onEdit, onDelete }) {
  const [expanded, setExpanded]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <>
      <div className="card-hover" style={{
        background: "white", border: `1px solid ${C.ivoryDark}`,
        borderRadius: 14, marginBottom: 10, overflow: "hidden",
        boxShadow: expanded ? "0 4px 20px rgba(0,0,0,0.07)" : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
      }}>
        <div onClick={() => setExpanded(v => !v)} style={{
          padding: "14px 16px", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", flexWrap: "wrap", gap: 8,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", color: C.charcoal, fontSize: 14, fontFamily: "Georgia, serif" }}>{lender.bankName}</div>
            <div style={{ color: "#999", fontSize: 11, marginTop: 2 }}>{lender.contactName} · {lender.lenderType} · {lender.location}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: C.goldDark, fontWeight: "bold", fontSize: 17, fontFamily: "Georgia, serif" }}>{lender.rate}%</div>
              <div style={{ color: "#ccc", fontSize: 9, letterSpacing: 1 }}>RATE</div>
            </div>
            <span style={{ color: C.gold, fontSize: 16, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
          </div>
        </div>
        {expanded && (
          <div className="anim-fade-up" style={{ padding: "4px 16px 18px", borderTop: `1px solid ${C.ivory}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 14 }}>
              {lender.address  && <div style={{ gridColumn: "1/-1" }}><div style={fieldLabel}>ADDRESS</div><a href={`https://maps.google.com/?q=${encodeURIComponent(lender.address)}`} target="_blank" rel="noopener noreferrer" style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}` }}>📍 {lender.address}</a></div>}
              {lender.email    && <div><div style={fieldLabel}>EMAIL</div><a href={`mailto:${lender.email}`} style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}` }}>{lender.email}</a></div>}
              {lender.phone    && <div><div style={fieldLabel}>PHONE</div><a href={`tel:${lender.phone}`} style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}` }}>{lender.phone}</a></div>}
              {lender.assistantPhone && <div><div style={fieldLabel}>ASSISTANT ({lender.assistantName})</div><a href={`tel:${lender.assistantPhone}`} style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}` }}>{lender.assistantPhone}</a></div>}
              <div><div style={fieldLabel}>TYPE</div><div style={{ color: C.charcoal, fontSize: 13 }}>{lender.lenderType}</div></div>
              <div><div style={fieldLabel}>MIN LOAN</div><div style={{ color: C.charcoal, fontSize: 13 }}>${(lender.minLoan/1e6).toFixed(1)}M</div></div>
              <div><div style={fieldLabel}>MAX LOAN</div><div style={{ color: C.charcoal, fontSize: 13 }}>${(lender.maxLoan/1e6).toFixed(1)}M</div></div>
            </div>
            {lender.notes && (
              <div style={{ marginTop: 14, background: C.bg, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ color: C.goldDark, fontSize: 9, letterSpacing: 2, marginBottom: 4 }}>NOTES</div>
                <div style={{ color: C.charcoal, fontSize: 13, lineHeight: 1.65 }}>{lender.notes}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.ivory}` }}>
              <button onClick={e => { e.stopPropagation(); onEdit(lender); }} className="btn-transition"
                style={{ padding: "10px 20px", background: C.charcoal, color: C.gold, border: "none", borderRadius: 10, cursor: "pointer", fontSize: 11, letterSpacing: 1 }}>EDIT</button>
              <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }} className="btn-transition"
                style={{ background: "none", border: "none", padding: "10px 4px", color: C.danger, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Delete</button>
            </div>
          </div>
        )}
      </div>
      {confirmDelete && (
        <ConfirmModal
          title="Delete Lender"
          message={`Remove "${lender.bankName}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => { onDelete(lender.id); setConfirmDelete(false); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// LENDER LIST / LOCATION / CATEGORY
// ─────────────────────────────────────────────────────────────
function CategorySelect({ onSelect }) {
  const icons = ["🏢","🔄","🏗️","🏠"];
  const descs = ["Long-term financing","Bridge to permanent","Ground-up construction","Owner-occupied commercial"];
  return (
    <div style={{ padding: "20px 16px 90px", maxWidth: 900, margin: "0 auto", width: "100%" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: C.goldDark, fontSize: 9, letterSpacing: 4, marginBottom: 4 }}>SELECT CATEGORY</div>
        <h2 style={{ color: C.charcoal, margin: 0, fontSize: 22, fontFamily: "Georgia, serif", fontWeight: "normal" }}>Mortgage Categories</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {CATEGORIES.map((cat, i) => (
          <div key={cat} onClick={() => onSelect(cat)} className="card-hover"
            style={{ background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 14, padding: "24px 18px", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>{icons[i]}</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: "bold", color: C.charcoal }}>{cat}</div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 6, lineHeight: 1.55 }}>{descs[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationSelect({ category, lenders, onSelect }) {
  const locs = ["All Locations", ...new Set(lenders.filter(l => l.category === category).map(l => l.location))];
  const counts = loc => loc === "All Locations"
    ? lenders.filter(l => l.category === category).length
    : lenders.filter(l => l.category === category && l.location === loc).length;
  return (
    <div style={{ padding: "20px 16px 90px", maxWidth: 900, margin: "0 auto", width: "100%" }}>
      <div style={{ color: "#bbb", fontSize: 11, marginBottom: 20, display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ color: C.goldDark }}>{category}</span>
        <span>›</span>
        <span>Select Location</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {locs.map(loc => (
          <div key={loc} onClick={() => onSelect(loc)} className="card-hover"
            style={{ background: "white", border: `1px solid ${C.ivoryDark}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer" }}>
            <div style={{ fontSize: 13, fontWeight: "bold", color: C.charcoal }}>{loc}</div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 6 }}>{counts(loc)} lender{counts(loc) !== 1 ? "s" : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LenderList({ lenders, category, location, onEdit, onDelete, onAdd, onBack }) {
  const filtered = lenders.filter(l =>
    l.category === category && (location === "All Locations" || l.location === location)
  );
  return (
    <div style={{ padding: "20px 16px 90px", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
      <div style={{ color: "#bbb", fontSize: 11, marginBottom: 16, display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ color: C.goldDark, cursor: "pointer" }} onClick={onBack}>← {category}</span>
        <span>›</span>
        <span>{location}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: C.goldDark, fontSize: 9, letterSpacing: 4, marginBottom: 4 }}>{category.toUpperCase()}</div>
          <h2 style={{ color: C.charcoal, margin: 0, fontSize: 22, fontFamily: "Georgia, serif", fontWeight: "normal" }}>
            {location} <span style={{ color: "#bbb", fontSize: 15 }}>({filtered.length})</span>
          </h2>
        </div>
        <button onClick={onAdd} className="btn-transition" style={{
          padding: "12px 20px", background: C.charcoal, color: C.gold,
          border: "none", borderRadius: 12, cursor: "pointer",
          fontSize: 12, letterSpacing: 2,
        }}>+ ADD LENDER</button>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", color: "#aaa", padding: "60px 0", fontSize: 14 }}>No lenders found. Add one!</div>
      ) : filtered.map(l => <LenderCard key={l.id} lender={l} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SEARCH VIEW
// ─────────────────────────────────────────────────────────────
function SearchView({ lenders, onEdit, onDelete }) {
  const [q, setQ]           = useState("");
  const [catFilter, setCat] = useState("All");
  const [locFilter, setLoc] = useState("All Locations");

  const results = lenders.filter(l => {
    const qLow = q.toLowerCase();
    const match = !q || [l.bankName, l.contactName, l.email, l.phone, l.assistantPhone, l.assistantName, l.lenderType, l.notes, String(l.rate)]
      .some(f => (f || "").toLowerCase().includes(qLow));
    return match && (catFilter === "All" || l.category === catFilter) && (locFilter === "All Locations" || l.location === locFilter);
  });

  return (
    <div style={{ padding: "20px 16px 90px", maxWidth: 1000, margin: "0 auto", width: "100%" }}>
      <div style={{ color: C.goldDark, fontSize: 9, letterSpacing: 4, marginBottom: 4 }}>LENDER SEARCH</div>
      <h2 style={{ color: C.charcoal, margin: "0 0 20px", fontSize: 22, fontFamily: "Georgia, serif", fontWeight: "normal" }}>Search All Lenders</h2>
      <div style={{ background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 14, padding: "16px", marginBottom: 20 }}>
        <input type="text" placeholder="🔍  Search by name, email, rate, notes…"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ ...inputStyle, marginBottom: 10, fontSize: 13 }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={catFilter} onChange={e => setCat(e.target.value)}
            style={{ flex: 1, minWidth: 130, padding: "9px 12px", background: C.bg, border: `1.5px solid ${C.ivoryDark}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={locFilter} onChange={e => setLoc(e.target.value)}
            style={{ flex: 1, minWidth: 130, padding: "9px 12px", background: C.bg, border: `1.5px solid ${C.ivoryDark}`, borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div style={{ color: "#aaa", fontSize: 11, marginBottom: 12 }}>{results.length} result{results.length !== 1 ? "s" : ""}</div>
      {results.map(l => <LenderCard key={l.id} lender={l} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LENDER FORM
// ─────────────────────────────────────────────────────────────
function LenderForm({ initial, defaultCategory, defaultLocation, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    category: defaultCategory || "Permanent",
    location: defaultLocation === "All Locations" ? "" : (defaultLocation || ""),
    address: "",
    bankName: "", contactName: "", email: "", phone: "",
    assistantPhone: "", assistantName: "",
    lenderType: "Direct Lender",
    notes: "", rate: "", minLoan: "", maxLoan: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ padding: "20px 16px 90px", maxWidth: 700, margin: "0 auto", width: "100%" }}>
      <h2 style={{ color: C.charcoal, margin: "0 0 24px", fontSize: 22, fontFamily: "Georgia, serif", fontWeight: "normal" }}>
        {initial ? "Edit Lender" : "Add New Lender"}
      </h2>
      <div style={{ background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 14, padding: "24px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FormField label="Bank / Institution Name" value={form.bankName} onChange={v => set("bankName", v)} required span2 />
          <FormField label="Contact Name" value={form.contactName} onChange={v => set("contactName", v)} />
          <FormField label="Email" type="email" value={form.email} onChange={v => set("email", v)} />
          <FormField label="Phone" value={form.phone} onChange={v => set("phone", v)} />
          <FormField label="Assistant Name" value={form.assistantName} onChange={v => set("assistantName", v)} />
          <FormField label="Assistant Phone" value={form.assistantPhone} onChange={v => set("assistantPhone", v)} />
          <SelectField label="Category" value={form.category} onChange={v => set("category", v)} options={CATEGORIES} />
          <SelectField label="Lender Type" value={form.lenderType} onChange={v => set("lenderType", v)} options={LENDER_TYPES} />
          <AddressField label="Address / Location" value={form.address || ""} onChange={v => set("address", v)} span2 />
          <FormField label="Location / State" value={form.location} onChange={v => set("location", v)} />
          <FormField label="Interest Rate (%)" type="number" step="0.01" value={form.rate} onChange={v => set("rate", v)} />
          <FormField label="Min Loan ($)" type="number" value={form.minLoan} onChange={v => set("minLoan", v)} />
          <FormField label="Max Loan ($)" type="number" value={form.maxLoan} onChange={v => set("maxLoan", v)} />
          <FormField label="Notes" value={form.notes} onChange={v => set("notes", v)} textarea span2 />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onCancel} className="btn-transition" style={{ flex: 1, padding: "13px", background: "white", border: `1.5px solid ${C.ivoryDark}`, borderRadius: 12, cursor: "pointer", fontSize: 13, color: C.charcoal }}>Cancel</button>
          <button onClick={() => {
            if (!form.bankName) { alert("Bank name required."); return; }
            onSave({ ...form, rate: parseFloat(form.rate) || 0, minLoan: parseInt(form.minLoan) || 0, maxLoan: parseInt(form.maxLoan) || 0 });
          }} className="btn-transition" style={{ flex: 2, padding: "13px", background: C.goldDark, color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: "bold", letterSpacing: 1 }}>
            {initial ? "SAVE CHANGES" : "ADD LENDER"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS VIEW — Worker Management (Manager only)
// ─────────────────────────────────────────────────────────────
function SettingsView({ workers, onAddWorker, onDeleteWorker }) {
  const blankWorker = { name: "", email: "", password: "", role: "worker" };
  const [form, setForm]         = useState(blankWorker);
  const [showPass, setShowPass] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.name.trim())     { alert("Name is required."); return; }
    if (!form.email.trim())    { alert("Email is required."); return; }
    if (!form.password.trim()) { alert("Password is required."); return; }
    if (workers.find(w => w.email.toLowerCase() === form.email.toLowerCase())) {
      alert("A worker with this email already exists."); return;
    }
    onAddWorker({ ...form, id: Date.now() });
    setForm(blankWorker);
  };

  return (
    <div style={{ padding: "20px 16px 90px", maxWidth: 700, margin: "0 auto", width: "100%" }}>
      <div style={{ color: C.goldDark, fontSize: 9, letterSpacing: 4, marginBottom: 4 }}>ADMINISTRATION</div>
      <h2 style={{ color: C.charcoal, margin: "0 0 24px", fontSize: 22, fontFamily: "Georgia, serif", fontWeight: "normal" }}>
        Settings & Workers
      </h2>

      {/* Add Worker Card */}
      <div style={{ background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 14, padding: "24px 20px", marginBottom: 24 }}>
        <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 3, marginBottom: 16 }}>ADD TEAM MEMBER</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FormField label="Full Name" value={form.name} onChange={v => setF("name", v)} required span2 />
          <FormField label="Email Address" type="email" value={form.email} onChange={v => setF("email", v)} required />
          {/* Password field with toggle */}
          <div>
            <div style={fieldLabel}>PASSWORD <span style={{ color: C.danger }}>*</span></div>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={e => setF("password", e.target.value)}
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 0, display: "flex", alignItems: "center" }}>
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>
          {/* Role dropdown */}
          <div>
            <div style={fieldLabel}>ROLE</div>
            <select value={form.role} onChange={e => setF("role", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
              <option value="worker">Regular Worker</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </div>

        {/* Role description */}
        <div style={{ marginTop: 14, background: C.bg, borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#777", lineHeight: 1.7 }}>
          {form.role === "manager"
            ? "✦ Manager — Full access: Dashboard, financial data, lenders, clients, settings & worker management."
            : "✦ Regular Worker — Restricted access: Can view, add & manage Lenders and Clients only. No Dashboard or admin access."}
        </div>

        <button onClick={handleAdd} className="btn-transition" style={{
          marginTop: 18, width: "100%", padding: "13px",
          background: C.charcoal, color: C.gold,
          border: "none", borderRadius: 12,
          cursor: "pointer", fontSize: 12, letterSpacing: 2, fontWeight: "bold",
        }}>
          + ADD WORKER
        </button>
      </div>

      {/* Worker List */}
      <div style={{ background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 14, padding: "20px" }}>
        <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 3, marginBottom: 16 }}>
          TEAM MEMBERS ({workers.length})
        </div>
        {workers.length === 0 ? (
          <div style={{ textAlign: "center", color: "#bbb", padding: "30px 0", fontSize: 13 }}>No workers yet.</div>
        ) : (
          workers.map(w => (
            <div key={w.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              padding: "12px 0", borderBottom: `1px solid ${C.ivory}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                  background: w.role === "manager" ? `${C.goldDark}22` : "#F3F4F6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, color: w.role === "manager" ? C.goldDark : "#6B7280", fontWeight: "bold",
                }}>
                  {w.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: "bold", color: C.charcoal, fontSize: 13, fontFamily: "Georgia, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {w.name}
                  </div>
                  <div style={{ color: "#999", fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {w.email}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{
                  fontSize: 9, letterSpacing: 1, padding: "4px 10px", borderRadius: 10,
                  background: w.role === "manager" ? `${C.goldDark}18` : "#F3F4F6",
                  color: w.role === "manager" ? C.goldDark : "#6B7280",
                  border: `1px solid ${w.role === "manager" ? C.goldDark + "44" : "#E5E7EB"}`,
                }}>
                  {w.role === "manager" ? "MANAGER" : "WORKER"}
                </span>
                <button onClick={() => setConfirmDel(w)} className="btn-transition"
                  style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 18, lineHeight: 1, padding: "2px 6px" }}>×</button>
              </div>
            </div>
          ))
        )}
      </div>

      {confirmDel && (
        <ConfirmModal
          title="Remove Worker"
          message={`Remove "${confirmDel.name}" from the team? They will no longer be able to log in.`}
          confirmLabel="Remove"
          danger
          onConfirm={() => { onDeleteWorker(confirmDel.id); setConfirmDel(null); }}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [splash,           setSplash]           = useState(true);
  const [user,             setUser]             = useState(null);
  const [workers,          setWorkers]          = useState(INITIAL_WORKERS);
  const [lenders,          setLenders]          = useState(INITIAL_LENDERS);
  const [clients,          setClients]          = useState(INITIAL_CLIENTS);
  const [view,             setView]             = useState("dashboard");
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingLender,    setEditingLender]    = useState(null);
  const [formMode,         setFormMode]         = useState(null);
  const [clientFormOpen,   setClientFormOpen]   = useState(false);
  const [editingClient,    setEditingClient]    = useState(null);

  // Restrict workers to their allowed views
  const defaultView = user?.role === "manager" ? "dashboard" : "clients";

  const activeNav = ["dashboard","clients","search","settings"].includes(view) ? view : "categories";

  const navigate = id => {
    setSidebarOpen(false);
    // Workers cannot access dashboard or settings
    if (user?.role !== "manager" && (id === "dashboard" || id === "settings")) return;
    if (id === "dashboard") setView("dashboard");
    else if (id === "clients") setView("clients");
    else if (id === "search") setView("search");
    else if (id === "settings") setView("settings");
    else setView("categories");
  };

  // Lender handlers
  const handleCategorySelect = cat => { setSelectedCategory(cat); setView("location"); };
  const handleLocationSelect  = loc => { setSelectedLocation(loc); setView("lenders"); };
  const handleLenderEdit      = l   => { setEditingLender({ ...l }); setFormMode("edit"); setView("form"); };
  const handleLenderAdd       = ()  => { setEditingLender(null); setFormMode("add"); setView("form"); };
  const handleLenderDelete    = id  => setLenders(ls => ls.filter(l => l.id !== id));
  const handleLenderSave = form => {
    if (!form.bankName) { alert("Bank name is required."); return; }
    const cleanedForm = {
      ...form,
      rate:    parseFloat(form.rate)  || 0,
      minLoan: parseInt(form.minLoan) || 0,
      maxLoan: parseInt(form.maxLoan) || 0,
    };
    if (formMode === "edit") {
      setLenders(ls => ls.map(l => l.id === editingLender.id ? { ...cleanedForm, id: editingLender.id } : l));
    } else {
      const newLender = { ...cleanedForm, id: Date.now() };
      setLenders(ls => [...ls, newLender]);
      setSelectedCategory(cleanedForm.category || selectedCategory);
      setSelectedLocation(cleanedForm.location  || "All Locations");
    }
    setEditingLender(null);
    setFormMode(null);
    setView("lenders");
  };

  // Client handlers
  const handleClientSave = form => {
    if (editingClient) {
      setClients(cs => cs.map(c => c.id === editingClient.id ? { ...form, id: editingClient.id, createdAt: editingClient.createdAt } : c));
    } else {
      setClients(cs => [...cs, { ...form, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) }]);
    }
    setClientFormOpen(false);
    setEditingClient(null);
  };
  const handleClientEdit   = c  => { setEditingClient(c); setClientFormOpen(true); };
  const handleClientDelete = id => setClients(cs => cs.filter(c => c.id !== id));
  const handleStageChange  = (id, stage) => setClients(cs => cs.map(c => c.id === id ? { ...c, dealStage: stage } : c));

  // Worker handlers
  const handleAddWorker    = w  => setWorkers(ws => [...ws, w]);
  const handleDeleteWorker = id => setWorkers(ws => ws.filter(w => w.id !== id));

  const handleLogin = loggedInUser => {
    setUser(loggedInUser);
    setView(loggedInUser.role === "manager" ? "dashboard" : "clients");
  };

  if (splash) return (
    <>
      <GlobalStyles />
      <SplashScreen onEnter={() => setSplash(false)} />
    </>
  );
  if (!user) return (
    <>
      <GlobalStyles />
      <LoginScreen onLogin={handleLogin} workers={workers} />
    </>
  );

  const renderMain = () => {
    switch (view) {
      case "form":
        return <LenderForm initial={editingLender} defaultCategory={selectedCategory} defaultLocation={selectedLocation}
          onSave={handleLenderSave} onCancel={() => setView("lenders")} />;
      case "search":
        return <SearchView lenders={lenders} onEdit={handleLenderEdit} onDelete={handleLenderDelete} />;
      case "lenders":
        return <LenderList lenders={lenders} category={selectedCategory} location={selectedLocation}
          onEdit={handleLenderEdit} onDelete={handleLenderDelete} onAdd={handleLenderAdd} onBack={() => setView("location")} />;
      case "location":
        return <LocationSelect category={selectedCategory} lenders={lenders} onSelect={handleLocationSelect} />;
      case "categories":
        return <CategorySelect onSelect={handleCategorySelect} />;
      case "clients":
        return <ClientsView clients={clients} onAdd={() => { setEditingClient(null); setClientFormOpen(true); }}
          onEdit={handleClientEdit} onDelete={handleClientDelete} onStageChange={handleStageChange} />;
      case "settings":
        if (user.role !== "manager") { setView("clients"); return null; }
        return <SettingsView workers={workers} onAddWorker={handleAddWorker} onDeleteWorker={handleDeleteWorker} />;
      default:
        if (user.role !== "manager") return <ClientsView clients={clients} onAdd={() => { setEditingClient(null); setClientFormOpen(true); }}
          onEdit={handleClientEdit} onDelete={handleClientDelete} onStageChange={handleStageChange} />;
        return <Dashboard lenders={lenders} clients={clients} user={user} onCategorySelect={handleCategorySelect} onNavigate={navigate} />;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ fontFamily: "Georgia, serif", background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
        <Header user={user} onLogout={() => setUser(null)} onHome={() => setView(defaultView)}
          onMenuToggle={() => setSidebarOpen(v => !v)} sidebarOpen={sidebarOpen} />

        <Sidebar activeNav={activeNav} onNavigate={navigate}
          isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user.role} />

        <main style={{ minHeight: "calc(100vh - 58px)", paddingBottom: 70, width: "100%", overflowX: "hidden" }}>
          {renderMain()}
        </main>

        <BottomNav activeNav={activeNav} onNavigate={navigate} userRole={user.role} />

        {clientFormOpen && (
          <Modal onClose={() => { setClientFormOpen(false); setEditingClient(null); }} maxWidth={600}>
            <ClientForm
              initial={editingClient}
              onSave={handleClientSave}
              onCancel={() => { setClientFormOpen(false); setEditingClient(null); }}
            />
          </Modal>
        )}
      </div>
    </>
  );
            }
