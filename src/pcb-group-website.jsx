import { useState, useEffect, useRef } from "react";

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
// LENDER DATA (preserved)
// ─────────────────────────────────────────────────────────────
const INITIAL_LENDERS = [
  { id: 1, category: "Permanent", location: "California", bankName: "Pacific Trust Bank", contactName: "Sarah Chen", email: "s.chen@pacifictrust.com", phone: "(415) 555-0192", assistantPhone: "(415) 555-0193", assistantName: "Mark Rivera", brokerType: "Direct Lender", notes: "Excellent rates for jumbo loans. Preferred partner.", rate: 6.75, minLoan: 500000, maxLoan: 5000000 },
  { id: 2, category: "Permanent", location: "Texas", bankName: "Lone Star Capital", contactName: "James Whitfield", email: "j.whitfield@lonestar.com", phone: "(713) 555-0247", assistantPhone: "", assistantName: "", brokerType: "Correspondent", notes: "Strong in commercial permanent financing.", rate: 7.10, minLoan: 250000, maxLoan: 10000000 },
  { id: 3, category: "Bridge to Perm", location: "New York", bankName: "Hudson Bridge Finance", contactName: "Alexandra Novak", email: "a.novak@hudsonbridge.com", phone: "(212) 555-0384", assistantPhone: "(212) 555-0385", assistantName: "Daniel Park", brokerType: "Portfolio Lender", notes: "Fast close, 30-day guarantee. Great for value-add.", rate: 8.50, minLoan: 1000000, maxLoan: 50000000 },
  { id: 4, category: "Bridge to Perm", location: "Florida", bankName: "Coastal Bridge Group", contactName: "Carlos Mendez", email: "c.mendez@coastalbridge.com", phone: "(305) 555-0561", assistantPhone: "", assistantName: "", brokerType: "Direct Lender", notes: "Specializes in multifamily bridge-to-perm.", rate: 8.25, minLoan: 500000, maxLoan: 25000000 },
  { id: 5, category: "Construction", location: "California", bankName: "BuildFirst National", contactName: "Priya Sharma", email: "p.sharma@buildfirst.com", phone: "(818) 555-0729", assistantPhone: "(818) 555-0730", assistantName: "Tom Nguyen", brokerType: "Construction Specialist", notes: "Interest reserve required. 18-month max term.", rate: 9.00, minLoan: 750000, maxLoan: 30000000 },
  { id: 6, category: "Owner Occupied", location: "New York", bankName: "Empire Owner Finance", contactName: "Robert Kim", email: "r.kim@empireowner.com", phone: "(646) 555-0843", assistantPhone: "", assistantName: "", brokerType: "Bank", notes: "SBA preferred lender. Owner-occ commercial only.", rate: 6.90, minLoan: 300000, maxLoan: 8000000 },
];

const INITIAL_CLIENTS = [
  { id: 1, fullName: "Michael Torres", phone: "(212) 555-0910", email: "m.torres@email.com", address: "45 Park Ave, New York, NY 10016", dealStage: "approved", paymentStatus: "paid", paymentAmount: 15000, notes: "Fast mover. Docs all verified. Preferred client.", idFileName: "torres_passport.pdf", contractFileName: "torres_contract.pdf", createdAt: "2025-01-15" },
  { id: 2, fullName: "Rachel Kim", phone: "(310) 555-0234", email: "r.kim@email.com", address: "820 Wilshire Blvd, Los Angeles, CA 90017", dealStage: "pending_docs", paymentStatus: "not_paid", paymentAmount: 8500, notes: "Waiting on ID scan.", idFileName: "", contractFileName: "", createdAt: "2025-02-03" },
  { id: 3, fullName: "David Schwartz", phone: "(305) 555-0567", email: "d.schwartz@email.com", address: "200 Biscayne Blvd, Miami, FL 33131", dealStage: "in_review", paymentStatus: "partial", paymentAmount: 22000, notes: "Complex deal. Multi-unit residential.", idFileName: "schwartz_id.jpg", contractFileName: "schwartz_agreement.pdf", createdAt: "2025-02-18" },
  { id: 4, fullName: "Linda Park", phone: "(713) 555-0811", email: "l.park@email.com", address: "900 Travis St, Houston, TX 77002", dealStage: "closed_deal", paymentStatus: "paid", paymentAmount: 31000, notes: "Deal closed. Excellent experience.", idFileName: "park_passport.pdf", contractFileName: "park_contract_final.pdf", createdAt: "2025-01-08" },
];

const CATEGORIES = ["Permanent", "Bridge to Perm", "Construction", "Owner Occupied"];
const LOCATIONS  = ["All Locations", "California", "Texas", "New York", "Florida"];
const BROKER_TYPES = ["Direct Lender", "Correspondent", "Portfolio Lender", "Construction Specialist", "Bank", "Credit Union", "Private"];

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES (injected once)
// ─────────────────────────────────────────────────────────────
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { margin: 0; font-family: 'Georgia', serif; background: ${C.bg}; }
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
    setTimeout(() => { setFadeOut(true); onEnter(); }, 2600);
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
function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true); setError("");
    setTimeout(() => {
      if (email.trim().toLowerCase() === "yfried@pcgroupny.com" && password === "pcb2027") {
        onLogin({ name: "Y. Fried", email: email.trim() });
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
        {/* Hamburger for mobile */}
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
// SIDEBAR  (overlay on mobile)
// ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { id: "dashboard",  label: "Dashboard",    icon: "◈", section: "main" },
  { id: "clients",    label: "Clients",      icon: "👤", section: "main" },
  { id: "categories", label: "Lenders",      icon: "⊞", section: "main" },
  { id: "search",     label: "Search",       icon: "⌕", section: "main" },
];

function Sidebar({ activeNav, onNavigate, isOpen, onClose }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 150, backdropFilter: "blur(2px)",
        }} className="anim-fade" />
      )}
      {/* Nav panel */}
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
        {NAV_LINKS.map(l => (
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
          v2.0 · PCB Portal
        </div>
      </nav>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// BOTTOM NAV (mobile only)
// ─────────────────────────────────────────────────────────────
function BottomNav({ activeNav, onNavigate }) {
  const items = [
    { id: "dashboard",  label: "Home",    icon: "◈" },
    { id: "clients",    label: "Clients", icon: "👤" },
    { id: "categories", label: "Lenders", icon: "⊞" },
    { id: "search",     label: "Search",  icon: "⌕" },
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
// FORM FIELD
// ─────────────────────────────────────────────────────────────
const fieldLabel = { color: "#888", fontSize: 10, letterSpacing: 2, marginBottom: 6 };
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
        style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg
' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
        {options.map(o => (
          <option key={typeof o === "string" ? o : o.id} value={typeof o === "string" ? o : o.id}>
            {typeof o === "string" ? o : o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// File upload field
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
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                padding: "0 6px",
              }}>
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
                <div style={{
                  width: 20, height: 2, marginBottom: 18,
                  background: isDone ? C.goldDark : "#E5E7EB",
                  transition: "background 0.3s",
                }} />
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
// CLIENT FORM (Add / Edit)
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
    <div style={{ padding: "20px 16px 40px" }}>
      {/* Handle bar */}
      <div style={{ width: 36, height: 4, background: C.ivoryDark, borderRadius: 2, margin: "0 auto 20px" }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontFamily: "Georgia, serif", fontWeight: "normal", color: C.charcoal }}>
          {initial ? "Edit Client" : "New Client"}
        </h2>
        <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa", lineHeight: 1 }}>×</button>
      </div>

      {/* Pipeline */}
      <div style={{ background: C.bg, borderRadius: 12, padding: "14px 12px", marginBottom: 20 }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#999", marginBottom: 10 }}>DEAL PROGRESS</div>
        <DealPipeline currentStage={form.dealStage} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Full Name" value={form.fullName} onChange={v => set("fullName", v)} required span2 />
        <FormField label="Phone" type="tel" value={form.phone} onChange={v => set("phone", v)} />
        <FormField label="Email" type="email" value={form.email} onChange={v => set("email", v)} />
        <FormField label="Address" value={form.address} onChange={v => set("address", v)} span2 />

        <SelectField label="Deal Stage" value={form.dealStage} onChange={v => set("dealStage", v)}
          options={DEAL_STAGES} />
        <SelectField label="Payment Status" value={form.paymentStatus} onChange={v => set("paymentStatus", v)}
          options={PAYMENT_STATUSES} />

        <FormField label="Payment Amount ($)" type="number" value={form.paymentAmount}
          onChange={v => set("paymentAmount", v)} />

        <FileField label="ID / Passport" fileName={form.idFileName}
          onChange={v => set("idFileName", v)} />
        <FileField label="Contract / Document" fileName={form.contractFileName}
          onChange={v => set("contractFileName", v)} />

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
  const [stagePickerOpen, setStagePickerOpen] = useState(false);
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
        {/* Card header */}
        <div onClick={() => setExpanded(v => !v)} style={{
          padding: "14px 16px", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", gap: 10,
        }}>
          {/* Avatar + info */}
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
          {/* Stage + chevron */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <StageBadge stageId={client.dealStage} small />
            <span style={{
              color: C.gold, fontSize: 14,
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}>▾</span>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="anim-fade-up" style={{ padding: "0 16px 18px", borderTop: `1px solid ${C.ivory}` }}>
            {/* Pipeline visual */}
            <div style={{ marginTop: 14, marginBottom: 14, overflowX: "auto" }}>
              <DealPipeline currentStage={client.dealStage} />
            </div>
            }
