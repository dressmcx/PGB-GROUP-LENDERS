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
  { id: "intake",       label: "Initial Intake & Preparation", color: "#6B7280", bg: "#F3F4F6", icon: "📥" },
  { id: "quote",        label: "Lender Quote Requests",        color: "#B8762A", bg: "#FEF8EE", icon: "💬" },
  { id: "term_sheet",   label: "Term Sheet Review",            color: "#8B5CF6", bg: "#F5F3FF", icon: "📄" },
  { id: "underwriting", label: "Lender Underwriting",          color: "#2C5F8A", bg: "#EEF4FB", icon: "🔍" },
  { id: "reports",      label: "Order & Review Reports",       color: "#B45309", bg: "#FFFBEB", icon: "📊" },
  { id: "commitment",   label: "Loan Commitment Issued",       color: "#2D7A4F", bg: "#EDF7F2", icon: "✅" },
  { id: "pre_closing",  label: "Pre-Closing Checklist",        color: "#1D4ED8", bg: "#EFF6FF", icon: "☑️" },
  { id: "closed",       label: "Approval & Closing",           color: "#92400E", bg: "#FEF3C7", icon: "🏆" },
  { id: "completed",    label: "Completed",                    color: "#059669", bg: "#D1FAE5", icon: "✓" },
  { id: "cancelled",    label: "Cancelled",                    color: "#991B1B", bg: "#FEE2E2", icon: "✗" },
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
  { id: 1, fullName: "Michael Torres", phones:[{number:"(212) 555-0910",tag:"Work"}], emails:["m.torres@email.com"], address: "45 Park Ave, New York, NY 10016", notes: "Fast mover. Preferred contact.", createdAt: "2025-01-15" },
  { id: 2, fullName: "Rachel Kim",     phones:[{number:"(310) 555-0234",tag:"Mobile"}], emails:["r.kim@email.com"], address: "820 Wilshire Blvd, Los Angeles, CA 90017", notes: "", createdAt: "2025-02-03" },
  { id: 3, fullName: "David Schwartz", phones:[{number:"(305) 555-0567",tag:"Work"},{number:"(305) 555-0568",tag:"Home"}], emails:["d.schwartz@email.com","david@schwartzgroup.com"], address: "200 Biscayne Blvd, Miami, FL 33131", notes: "Multi-unit residential client.", createdAt: "2025-02-18" },
  { id: 4, fullName: "Linda Park",     phones:[{number:"(713) 555-0811",tag:"Work"}], emails:["l.park@email.com"], address: "900 Travis St, Houston, TX 77002", notes: "", createdAt: "2025-01-08" },
];

const INITIAL_ORGS = [
  { id: 1, name: "Skyline Capital Group", sponsor: "First National Trust", sponsor2: "", officeContact: "Michael Torres", mgmtContact: "Realty Mgmt LLC", assistance: "Lisa Brown", loanOfficer: "David Chen", address: "350 5th Ave, New York, NY 10118", entityType: "LLC", phones: [{ number: "(212) 555-0100", tag: "Work" }], emails: ["j.whitfield@skyline.com"] },
];

const INITIAL_DEALS = [
  { id: 1, contactId: 1, orgId: 1, address: "45 Park Ave, New York, NY 10016", value: 2500000, closingDate: "2025-06-30", createdBy: "Y. Fried", dealType: "Priority", dealStage: "commitment", paymentAmount: 15000, visibleTo: "all", notes: "Fast mover. Multi-unit deal.", createdAt: "2025-01-15" },
  { id: 2, contactId: 2, orgId: 1, address: "820 Wilshire Blvd, Los Angeles, CA 90017", value: 850000, closingDate: "2025-09-15", createdBy: "Y. Fried", dealType: "Regular", dealStage: "intake", paymentAmount: 8500, visibleTo: "all", notes: "Waiting on ID scan.", createdAt: "2025-02-03" },
];

const CATEGORIES   = ["Permanent", "Bridge to Perm", "Construction", "Owner Occupied", "Hard Money"];
const LOCATIONS    = ["All Locations", "California", "Texas", "New York", "Florida"];

// Category-conditional lender type mapping
const LENDER_TYPES_BY_CATEGORY = {
  "Permanent":      ["Banks", "Credit Union", "CMBS", "Life Co", "Agency (Fannie Mae and Freddie Mac)"],
  "Bridge to Perm": ["Traditional Lender", "Balance Sheet Lender"],
  "Construction":   ["Bank", "Hard Money", "Private Lender"],
  "Owner Occupied": ["SBA 504", "SBA 7A", "Conventional"],
  "Hard Money":     ["Private Lender", "Hard Money Lender", "Bridge Lender"],
};
const getLenderTypes = cat => LENDER_TYPES_BY_CATEGORY[cat] || ["Other"];
// Legacy flat list kept for search/display compatibility
const LENDER_TYPES = [...new Set(Object.values(LENDER_TYPES_BY_CATEGORY).flat())];

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
    { id: "dashboard",  label: "Dashboard", icon: "◈" },
    { id: "clients",    label: "Contacts",  icon: "👤" },
    { id: "orgs",       label: "Orgs",      icon: "🏢" },
    { id: "deals",      label: "Deals",     icon: "🤝" },
    { id: "categories", label: "Lenders",   icon: "⊞" },
    ...(userRole === "manager" ? [
      { id: "workers",  label: "Workers",   icon: "📊" },
      { id: "settings", label: "Settings",  icon: "⚙" },
    ] : []),
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
          v2.0 PCB Portal
        </div>
      </nav>
    </>
  );
}

// BottomNav removed — navigation is sidebar-only

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
  const [confirmDelete, setConfirmDelete] = useState(false);
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
          <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 16, padding: 4 }}>×</button>
        )}
        <input ref={ref} type="file" style={{ display: "none" }}
          onChange={e => { if (e.target.files?.[0]) onChange(e.target.files[0].name); }} />
      </div>
      {confirmDelete && (
        <ConfirmModal
          title="Delete File"
          message="Are you sure you want to delete this file? This action cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => { onChange(""); setConfirmDelete(false); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

// Enhanced Terms & Conditions upload with view/download support
function TermsFileField({ label = "Terms & Conditions (PDF / Image)", fileData, fileName, onChange, span2 }) {
  const ref = useRef();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isPdf = fileName && fileName.toLowerCase().endsWith(".pdf");

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange({ name: file.name, data: ev.target.result, type: file.type });
    reader.readAsDataURL(file);
  };

  const handleDownload = e => {
    e.stopPropagation();
    if (!fileData) return;
    const a = document.createElement("a");
    a.href = fileData;
    a.download = fileName || "document";
    a.click();
  };

  return (
    <div style={span2 ? { gridColumn: "1/-1" } : {}}>
      <div style={fieldLabel}>{label.toUpperCase()}</div>

      {/* Upload zone */}
      <div style={{
        border: `1.5px dashed ${fileName ? C.goldDark : C.ivoryDark}`, borderRadius: 10,
        padding: "12px 14px", background: fileName ? `${C.goldDark}08` : C.bg,
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
        transition: "all 0.2s",
      }} onClick={() => !fileName && ref.current?.click()}>
        <span style={{ fontSize: 18 }}>{fileName ? (isPdf ? "📄" : "🖼️") : "📎"}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: fileName ? C.goldDark : "#bbb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: fileName ? "bold" : "normal" }}>
            {fileName || "Tap to upload PDF or image"}
          </div>
          {!fileName && <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>Supported: PDF, PNG, JPG</div>}
        </div>
        {fileName && (
          <button onClick={e => { e.stopPropagation(); ref.current?.click(); }}
            style={{ background: "none", border: `1px solid ${C.ivoryDark}`, borderRadius: 6, cursor: "pointer", color: "#888", fontSize: 10, padding: "4px 8px", whiteSpace: "nowrap" }}>
            Replace
          </button>
        )}
        {fileName && (
          <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: C.danger, fontSize: 18, padding: "0 2px", lineHeight: 1 }}>×</button>
        )}
        <input ref={ref} type="file" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp" style={{ display: "none" }} onChange={handleFile} />
      </div>

      {/* View / Download actions — only shown when file is uploaded */}
      {fileName && fileData && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={() => setViewerOpen(true)} className="btn-transition" style={{
            flex: 1, padding: "9px 14px",
            background: C.charcoal, color: C.gold,
            border: "none", borderRadius: 8,
            cursor: "pointer", fontSize: 11, letterSpacing: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <span style={{ fontSize: 13 }}>{isPdf ? "📄" : "🖼️"}</span>
            View {isPdf ? "PDF" : "Document"}
          </button>
        </div>
      )}

      {/* Viewer Modal */}
      {viewerOpen && fileData && (
        <div className="anim-fade" style={{
          position: "fixed", inset: 0, zIndex: 3000,
          background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 16,
        }} onClick={e => e.target === e.currentTarget && setViewerOpen(false)}>
          <div className="anim-fade-up" style={{
            background: "#111", borderRadius: 14, overflow: "hidden",
            width: "100%", maxWidth: 820,
            maxHeight: "90vh", display: "flex", flexDirection: "column",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            border: `1px solid ${C.goldDark}33`,
          }}>
            {/* Viewer header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderBottom: `1px solid ${C.goldDark}22`,
              background: "#1a1a1a",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{isPdf ? "📄" : "🖼️"}</span>
                <span style={{ color: C.gold, fontSize: 13, fontFamily: "Georgia, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>{fileName}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={handleDownload} className="btn-transition" style={{
                  padding: "7px 14px", background: `${C.goldDark}22`, color: C.gold,
                  border: `1px solid ${C.goldDark}44`, borderRadius: 8,
                  cursor: "pointer", fontSize: 11, letterSpacing: 1,
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span>⬇</span> Download
                </button>
                <button onClick={() => setViewerOpen(false)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#888", fontSize: 22, lineHeight: 1, padding: "2px 6px",
                }}>×</button>
              </div>
            </div>
            {/* Viewer body */}
            <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, minHeight: 0 }}>
              {isPdf ? (
                <iframe
                  src={fileData}
                  title={fileName}
                  style={{ width: "100%", height: "72vh", border: "none", borderRadius: 8, background: "white" }}
                />
              ) : (
                <img src={fileData} alt={fileName} style={{ maxWidth: "100%", maxHeight: "72vh", borderRadius: 8, objectFit: "contain", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} />
              )}
            </div>
          </div>
        </div>
      )}
      {confirmDelete && (
        <ConfirmModal
          title="Delete File"
          message="Are you sure you want to delete this file? This action cannot be undone."
          confirmLabel="Delete"
          danger
          onConfirm={() => { onChange(null); setConfirmDelete(false); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
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
// FILE MANAGER — desktop-style, folders + files
// ─────────────────────────────────────────────────────────────
function ContactFileManager({ value, onChange }) {
  // value: { folders: [{id, name, files:[{id,name,type,size,data,uploadedAt}]}], rootFiles:[...] }
  const init = value || { folders: [], rootFiles: [] };
  const [fs, setFs]                       = useState(init);
  const [activeFolderId, setActiveFolderId] = useState(null); // null = root
  const [renamingId, setRenamingId]        = useState(null);
  const [renameVal, setRenameVal]          = useState("");
  const [newFolderMode, setNewFolderMode]  = useState(false);
  const [newFolderName, setNewFolderName]  = useState("");
  const [previewFile, setPreviewFile]      = useState(null);
  const [confirmDel, setConfirmDel]        = useState(null); // {type:'folder'|'file', id, folderId?}
  const [draggingOver, setDraggingOver]    = useState(false);
  const uploadRef                          = useRef();
  const renameRef                          = useRef();

  // Sync up to parent whenever fs changes
  useEffect(() => { onChange(fs); }, [fs]);

  // Auto-focus rename input
  useEffect(() => { if (renamingId && renameRef.current) renameRef.current.focus(); }, [renamingId]);

  const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2,7)}`;

  const activeFolder = activeFolderId ? fs.folders.find(f => f.id === activeFolderId) : null;
  const currentFiles = activeFolder ? activeFolder.files : fs.rootFiles;

  const updateFs = updater => setFs(prev => {
    const next = updater({ ...prev, folders: prev.folders.map(f => ({ ...f, files: [...f.files] })), rootFiles: [...prev.rootFiles] });
    return next;
  });

  // ── Folder ops ─────────────────────────────────────────────
  const createFolder = () => {
    const name = newFolderName.trim() || "New Folder";
    updateFs(prev => ({ ...prev, folders: [...prev.folders, { id: uid(), name, files: [] }] }));
    setNewFolderMode(false); setNewFolderName("");
  };

  const deleteFolder = id => {
    updateFs(prev => ({ ...prev, folders: prev.folders.filter(f => f.id !== id) }));
    if (activeFolderId === id) setActiveFolderId(null);
  };

  const renameFolder = (id, name) => {
    updateFs(prev => ({ ...prev, folders: prev.folders.map(f => f.id === id ? { ...f, name } : f) }));
    setRenamingId(null);
  };

  // ── File ops ───────────────────────────────────────────────
  const addFiles = files => {
    const readers = Array.from(files).map(file => new Promise(res => {
      const reader = new FileReader();
      reader.onload = ev => res({ id: uid(), name: file.name, type: file.type, size: file.size, data: ev.target.result, uploadedAt: new Date().toISOString() });
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(newFiles => {
      updateFs(prev => {
        if (activeFolderId) {
          return { ...prev, folders: prev.folders.map(f => f.id === activeFolderId ? { ...f, files: [...f.files, ...newFiles] } : f) };
        }
        return { ...prev, rootFiles: [...prev.rootFiles, ...newFiles] };
      });
    });
  };

  const deleteFile = (fileId, folderId) => {
    updateFs(prev => {
      if (folderId) {
        return { ...prev, folders: prev.folders.map(f => f.id === folderId ? { ...f, files: f.files.filter(fi => fi.id !== fileId) } : f) };
      }
      return { ...prev, rootFiles: prev.rootFiles.filter(fi => fi.id !== fileId) };
    });
  };

  const renameFile = (fileId, folderId, name) => {
    updateFs(prev => {
      if (folderId) {
        return { ...prev, folders: prev.folders.map(f => f.id === folderId ? { ...f, files: f.files.map(fi => fi.id === fileId ? { ...fi, name } : fi) } : f) };
      }
      return { ...prev, rootFiles: prev.rootFiles.map(fi => fi.id === fileId ? { ...fi, name } : fi) };
    });
    setRenamingId(null);
  };

  // ── Drag & drop ────────────────────────────────────────────
  const handleDrop = e => {
    e.preventDefault(); setDraggingOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  // ── Helpers ────────────────────────────────────────────────
  const fileIcon = file => {
    if (!file.type) return "📎";
    if (file.type.startsWith("image/")) return "🖼️";
    if (file.type === "application/pdf") return "📄";
    if (file.type.includes("word")) return "📝";
    if (file.type.includes("sheet") || file.type.includes("excel")) return "📊";
    if (file.type.startsWith("video/")) return "🎬";
    if (file.type.startsWith("audio/")) return "🎵";
    if (file.type.includes("zip") || file.type.includes("compress")) return "🗜️";
    return "📎";
  };

  const fmtSize = bytes => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1048576).toFixed(1)} MB`;
  };

  const isImage = f => f.type?.startsWith("image/");
  const isPdf   = f => f.type === "application/pdf";

  const totalCount = fs.folders.reduce((acc, f) => acc + f.files.length, 0) + fs.rootFiles.length;

  // ── Styles ─────────────────────────────────────────────────
  const S = {
    panel: {
      border: `1.5px solid ${C.ivoryDark}`,
      borderRadius: 12,
      overflow: "hidden",
      background: "#fafaf8",
      fontFamily: "Georgia, serif",
    },
    toolbar: {
      display: "flex", alignItems: "center", gap: 8,
      padding: "10px 14px",
      background: C.charcoal,
      borderBottom: `1px solid ${C.goldDark}33`,
      flexWrap: "wrap",
    },
    toolbarTitle: {
      color: C.gold, fontSize: 11, letterSpacing: 2, fontWeight: "bold", flex: 1,
    },
    toolBtn: {
      padding: "6px 12px", background: `${C.goldDark}22`, border: `1px solid ${C.goldDark}44`,
      color: C.gold, borderRadius: 7, cursor: "pointer", fontSize: 11, letterSpacing: 0.5,
      display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
    },
    breadcrumb: {
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 14px", background: "#f0ede5",
      borderBottom: `1px solid ${C.ivoryDark}`,
      fontSize: 11,
    },
    crumbBtn: {
      background: "none", border: "none", cursor: "pointer", color: C.goldDark,
      fontSize: 11, fontFamily: "Georgia, serif", padding: "2px 4px", borderRadius: 4,
    },
    body: {
      minHeight: 160, padding: "12px 14px",
    },
    dropZone: {
      border: `2px dashed ${draggingOver ? C.goldDark : C.ivoryDark}`,
      borderRadius: 10, padding: "24px 16px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      background: draggingOver ? `${C.goldDark}08` : "transparent",
      transition: "all 0.18s", cursor: "pointer", marginTop: 8,
    },
    folderRow: active => ({
      display: "flex", alignItems: "center", gap: 10,
      padding: "9px 12px", borderRadius: 9,
      background: active ? `${C.goldDark}18` : "white",
      border: `1px solid ${active ? C.goldDark : C.ivoryDark}`,
      marginBottom: 6, cursor: "pointer",
      transition: "all 0.15s",
    }),
    fileRow: {
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", borderRadius: 9,
      background: "white", border: `1px solid ${C.ivoryDark}`,
      marginBottom: 6, transition: "all 0.15s",
    },
    iconBtn: (color="#888") => ({
      background: "none", border: "none", cursor: "pointer",
      color, fontSize: 14, padding: "3px 5px", borderRadius: 5,
      lineHeight: 1, flexShrink: 0,
    }),
  };

  return (
    <div style={{ gridColumn: "1/-1" }}>
      <div style={{ ...fieldLabel, marginBottom: 8 }}>
        FILES & DOCUMENTS
        {totalCount > 0 && <span style={{ color: C.goldDark, marginLeft: 8 }}>({totalCount} item{totalCount !== 1 ? "s" : ""})</span>}
      </div>

      <div style={S.panel}>
        {/* Toolbar */}
        <div style={S.toolbar}>
          <span style={S.toolbarTitle}>📁 FILE MANAGER</span>
          <button className="btn-transition" style={S.toolBtn} onClick={() => { setNewFolderMode(true); setNewFolderName(""); }}>
            <span>➕</span> New Folder
          </button>
          <button className="btn-transition" style={S.toolBtn} onClick={() => uploadRef.current?.click()}>
            <span>⬆</span> Upload
          </button>
          <input ref={uploadRef} type="file" multiple accept="*/*" style={{ display: "none" }}
            onChange={e => { if (e.target.files?.length) { addFiles(e.target.files); e.target.value = ""; } }} />
        </div>

        {/* Breadcrumb */}
        <div style={S.breadcrumb}>
          <button style={S.crumbBtn} onClick={() => setActiveFolderId(null)}>🏠 Root</button>
          {activeFolder && (
            <>
              <span style={{ color: "#bbb" }}>›</span>
              <span style={{ color: C.charcoal, fontSize: 11 }}>📁 {activeFolder.name}</span>
            </>
          )}
          <span style={{ marginLeft: "auto", color: "#aaa", fontSize: 10 }}>
            {currentFiles.length} file{currentFiles.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Body */}
        <div style={S.body}>
          {/* New folder input */}
          {newFolderMode && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>📁</span>
              <input
                autoFocus
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setNewFolderMode(false); }}
                placeholder="Folder name…"
                style={{ ...inputStyle, flex: 1, padding: "8px 12px", fontSize: 13 }}
              />
              <button className="btn-transition" onClick={createFolder}
                style={{ padding: "8px 14px", background: C.goldDark, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
                Create
              </button>
              <button className="btn-transition" onClick={() => setNewFolderMode(false)}
                style={{ padding: "8px 12px", background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 8, cursor: "pointer", fontSize: 12, color: "#888" }}>
                ✕
              </button>
            </div>
          )}

          {/* Folders (only visible at root) */}
          {!activeFolderId && fs.folders.map(folder => (
            <div key={folder.id} style={S.folderRow(false)}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>📁</span>
              {renamingId === folder.id ? (
                <input
                  ref={renameRef}
                  value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") renameFolder(folder.id, renameVal.trim() || folder.name); if (e.key === "Escape") setRenamingId(null); }}
                  onBlur={() => renameFolder(folder.id, renameVal.trim() || folder.name)}
                  style={{ ...inputStyle, flex: 1, padding: "5px 10px", fontSize: 13 }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span onClick={() => setActiveFolderId(folder.id)}
                  style={{ flex: 1, fontSize: 13, color: C.charcoal, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {folder.name}
                </span>
              )}
              <span style={{ fontSize: 10, color: "#aaa", whiteSpace: "nowrap", marginRight: 4 }}>
                {folder.files.length} item{folder.files.length !== 1 ? "s" : ""}
              </span>
              {renamingId !== folder.id && (
                <>
                  <button title="Open" style={S.iconBtn(C.goldDark)} onClick={() => setActiveFolderId(folder.id)}>›</button>
                  <button title="Rename" style={S.iconBtn("#888")} onClick={e => { e.stopPropagation(); setRenamingId(folder.id); setRenameVal(folder.name); }}>✏️</button>
                  <button title="Delete folder" style={S.iconBtn(C.danger)} onClick={e => { e.stopPropagation(); setConfirmDel({ type: "folder", id: folder.id }); }}>🗑</button>
                </>
              )}
            </div>
          ))}

          {/* Files in current location */}
          {currentFiles.map(file => (
            <div key={file.id} style={S.fileRow}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{fileIcon(file)}</span>
              {renamingId === file.id ? (
                <input
                  ref={renameRef}
                  value={renameVal}
                  onChange={e => setRenameVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") renameFile(file.id, activeFolderId, renameVal.trim() || file.name);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  onBlur={() => renameFile(file.id, activeFolderId, renameVal.trim() || file.name)}
                  style={{ ...inputStyle, flex: 1, padding: "5px 10px", fontSize: 13 }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span style={{ flex: 1, fontSize: 13, color: C.charcoal, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  title={file.name}>
                  {file.name}
                </span>
              )}
              <span style={{ fontSize: 10, color: "#aaa", whiteSpace: "nowrap", marginRight: 4 }}>{fmtSize(file.size)}</span>
              {renamingId !== file.id && (
                <>
                  {(isImage(file) || isPdf(file)) && (
                    <button title="Preview" style={S.iconBtn(C.info)} onClick={() => setPreviewFile(file)}>👁</button>
                  )}
                  <button title="Download" style={S.iconBtn("#888")} onClick={() => { const a = document.createElement("a"); a.href = file.data; a.download = file.name; a.click(); }}>⬇</button>
                  <button title="Rename" style={S.iconBtn("#888")} onClick={() => { setRenamingId(file.id); setRenameVal(file.name); }}>✏️</button>
                  <button title="Delete" style={S.iconBtn(C.danger)} onClick={() => setConfirmDel({ type: "file", id: file.id, folderId: activeFolderId })}>🗑</button>
                </>
              )}
            </div>
          ))}

          {/* Empty state + drop zone */}
          {currentFiles.length === 0 && !activeFolderId && fs.folders.length === 0 && !newFolderMode && (
            <div
              style={S.dropZone}
              onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
              onDragLeave={() => setDraggingOver(false)}
              onDrop={handleDrop}
              onClick={() => uploadRef.current?.click()}
            >
              <span style={{ fontSize: 32 }}>📂</span>
              <span style={{ fontSize: 13, color: "#aaa" }}>Drop files here or click Upload</span>
              <span style={{ fontSize: 11, color: "#ccc" }}>Images, PDFs, documents & more</span>
            </div>
          )}

          {currentFiles.length === 0 && (activeFolderId || fs.folders.length > 0 || newFolderMode) && (
            <div
              style={{ ...S.dropZone, marginTop: 4 }}
              onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
              onDragLeave={() => setDraggingOver(false)}
              onDrop={handleDrop}
              onClick={() => uploadRef.current?.click()}
            >
              <span style={{ fontSize: 24 }}>⬆</span>
              <span style={{ fontSize: 12, color: "#aaa" }}>
                {activeFolderId ? `Drop files into "${activeFolder?.name}"` : "Drop files or click Upload"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDel && (
        <ConfirmModal
          title={confirmDel.type === "folder" ? "Delete Folder" : "Delete File"}
          message={confirmDel.type === "folder"
            ? "This will permanently delete the folder and all its files."
            : "This file will be permanently removed."}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            if (confirmDel.type === "folder") deleteFolder(confirmDel.id);
            else deleteFile(confirmDel.id, confirmDel.folderId);
            setConfirmDel(null);
          }}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* File preview modal */}
      {previewFile && (
        <div className="anim-fade" style={{
          position: "fixed", inset: 0, zIndex: 3100,
          background: "rgba(0,0,0,0.86)", backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 16,
        }} onClick={e => e.target === e.currentTarget && setPreviewFile(null)}>
          <div className="anim-fade-up" style={{
            background: "#111", borderRadius: 14, overflow: "hidden",
            width: "100%", maxWidth: 860, maxHeight: "90vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            border: `1px solid ${C.goldDark}33`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 18px", background: "#1a1a1a", borderBottom: `1px solid ${C.goldDark}22`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{fileIcon(previewFile)}</span>
                <span style={{ color: C.gold, fontSize: 13, fontFamily: "Georgia, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>{previewFile.name}</span>
                <span style={{ color: "#555", fontSize: 11 }}>{fmtSize(previewFile.size)}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { const a = document.createElement("a"); a.href = previewFile.data; a.download = previewFile.name; a.click(); }}
                  style={{ padding: "6px 13px", background: `${C.goldDark}22`, color: C.gold, border: `1px solid ${C.goldDark}44`, borderRadius: 7, cursor: "pointer", fontSize: 11 }}>
                  ⬇ Download
                </button>
                <button onClick={() => setPreviewFile(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: 22, lineHeight: 1 }}>×</button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, minHeight: 0 }}>
              {isPdf(previewFile) ? (
                <iframe src={previewFile.data} title={previewFile.name}
                  style={{ width: "100%", height: "72vh", border: "none", borderRadius: 8, background: "white" }} />
              ) : (
                <img src={previewFile.data} alt={previewFile.name}
                  style={{ maxWidth: "100%", maxHeight: "72vh", borderRadius: 8, objectFit: "contain", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACT FORM — multi-phone, multi-email
// ─────────────────────────────────────────────────────────────
function ClientForm({ initial, onSave, onCancel }) {
  const blank = {
    fullName: "", address: "", notes: "",
    phones: [{ number: "", tag: "Work" }],
    emails: [""],
    files: { folders: [], rootFiles: [] },
  };
  const normalize = c => ({
    ...c,
    phones: c.phones?.length ? c.phones : (c.phone ? [{ number: c.phone, tag: "Work" }] : [{ number: "", tag: "Work" }]),
    emails: c.emails?.length ? c.emails : (c.email ? [c.email] : [""]),
    files: c.files || { folders: [], rootFiles: [] },
  });
  const [form, setForm] = useState(initial ? normalize(initial) : blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ padding: "24px 20px 40px" }}>
      <div style={{ width: 36, height: 4, background: C.ivoryDark, borderRadius: 2, margin: "0 auto 20px" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: initial?._isNew ? 10 : 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontFamily: "Georgia, serif", fontWeight: "normal", color: C.charcoal }}>
          {initial?._isNew ? "Add New Contact" : initial ? "Edit Contact" : "New Contact"}
        </h2>
        <button onClick={onCancel} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#aaa" }}>×</button>
      </div>
      {initial?._isNew && (
        <div style={{ background:`${C.goldDark}18`, border:`1px solid ${C.goldDark}44`, borderRadius:10, padding:"10px 14px", marginBottom:18, fontSize:12, color:C.goldDark }}>
          ← Adding new contact from Deal or Org form. Save to return.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Full Name" value={form.fullName} onChange={v => set("fullName", v)} required span2 />
        <AddressField label="Address" value={form.address} onChange={v => set("address", v)} span2 />
        <MultiPhoneField phones={form.phones} onChange={v => set("phones", v)} />
        <MultiEmailField emails={form.emails} onChange={v => set("emails", v)} />
        <ContactFileManager value={form.files} onChange={v => set("files", v)} />
        <FormField label="Notes" value={form.notes} onChange={v => set("notes", v)} textarea span2 />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onCancel} className="btn-transition" style={{ flex:1, padding:"14px", background:"white", border:`1.5px solid ${C.ivoryDark}`, borderRadius:12, cursor:"pointer", fontSize:13, color:C.charcoal }}>Cancel</button>
        <button onClick={() => { if(!form.fullName.trim()){alert("Name required.");return;} onSave(form); }} className="btn-transition" style={{ flex:2, padding:"14px", background:C.goldDark, color:"white", border:"none", borderRadius:12, cursor:"pointer", fontSize:13, fontWeight:"bold", letterSpacing:1 }}>
          {initial && !initial._isNew ? "SAVE CHANGES" : "ADD CONTACT"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACT CARD (clean — no pipeline/files)
// ─────────────────────────────────────────────────────────────
function ClientCard({ client, onEdit, onDelete }) {
  const [expanded, setExpanded]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="card-hover" style={{
        background: "white", borderRadius: 14, marginBottom: 10, overflow: "hidden",
        border: `1px solid ${C.ivoryDark}`, borderLeft: `4px solid ${C.goldDark}`,
        boxShadow: expanded ? "0 4px 24px rgba(0,0,0,0.08)" : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s",
      }}>
        <div onClick={() => setExpanded(v => !v)} style={{
          padding: "14px 16px", display: "flex", alignItems: "center",
          justifyContent: "space-between", cursor: "pointer", gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: `${C.goldDark}22`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16, color: C.goldDark, fontWeight: "bold",
            }}>{client.fullName.charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: "bold", color: C.charcoal, fontSize: 14, fontFamily: "Georgia, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{client.fullName}</div>
              <div style={{ color: "#999", fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(client.emails||[])[0] || (client.phones||[])[0]?.number || client.email || client.phone || "No contact info"}</div>
            </div>
          </div>
          <span style={{ color: C.gold, fontSize: 14, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
        </div>

        {expanded && (
          <div className="anim-fade-up" style={{ padding: "4px 16px 18px", borderTop: `1px solid ${C.ivory}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14, marginBottom: 14 }}>
              {(client.phones||[]).filter(p=>p.number).length>0 && (
                <div>
                  <div style={{ ...fieldLabel, marginBottom: 3 }}>PHONE</div>
                  {(client.phones||[]).filter(p=>p.number).map((p,i)=>(
                    <div key={i} style={{ marginBottom:3 }}>
                      <a href={`tel:${p.number}`} style={{ color:C.charcoal, fontSize:13, textDecoration:"none", borderBottom:`1px solid ${C.gold}` }}>{p.number}</a>
                      <span style={{ fontSize:9, color:"#aaa", marginLeft:5 }}>({p.tag})</span>
                    </div>
                  ))}
                </div>
              )}
              {(client.emails||[]).filter(Boolean).length>0 && (
                <div>
                  <div style={{ ...fieldLabel, marginBottom: 3 }}>EMAIL</div>
                  {(client.emails||[]).filter(Boolean).map((e,i)=>(
                    <div key={i} style={{ marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      <a href={`mailto:${e}`} style={{ color:C.charcoal, fontSize:13, textDecoration:"none", borderBottom:`1px solid ${C.gold}` }}>{e}</a>
                    </div>
                  ))}
                </div>
              )}
              {client.address && <div style={{ gridColumn: "1/-1" }}><div style={{ ...fieldLabel, marginBottom: 3 }}>ADDRESS</div><a href={`https://maps.google.com/?q=${encodeURIComponent(client.address)}`} target="_blank" rel="noopener noreferrer" style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}` }}>📍 {client.address}</a></div>}
              {client.notes && <div style={{ gridColumn: "1/-1" }}><div style={{ ...fieldLabel, marginBottom: 3 }}>NOTES</div><div style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: C.charcoal, lineHeight: 1.6 }}>{client.notes}</div></div>}
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 12, borderTop: `1px solid ${C.ivory}` }}>
              <button onClick={e => { e.stopPropagation(); onEdit(client); }} className="btn-transition" style={{ flex:1, padding:"11px", background:C.charcoal, color:C.gold, border:"none", borderRadius:10, cursor:"pointer", fontSize:12, letterSpacing:1 }}>EDIT</button>
              <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }} className="btn-transition" style={{ padding:"11px 18px", background:C.dangerLight, color:C.danger, border:`1px solid ${C.danger}22`, borderRadius:10, cursor:"pointer", fontSize:12 }}>Delete</button>
            </div>
          </div>
        )}
      </div>
      {confirmDelete && <ConfirmModal title="Delete Contact" message={`Remove "${client.fullName}"? This cannot be undone.`} confirmLabel="Delete" danger onConfirm={() => { onDelete(client.id); setConfirmDelete(false); }} onCancel={() => setConfirmDelete(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTACTS VIEW (renamed from Clients; no pipeline here)
// ─────────────────────────────────────────────────────────────
function ClientsView({ clients, onAdd, onEdit, onDelete }) {
  const [q, setQ]       = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = clients
    .filter(c => !q || [c.fullName, c.email, c.phone, c.address, c.notes].some(f => (f||"").toLowerCase().includes(q.toLowerCase())))
    .sort((a,b) => sortBy==="name" ? a.fullName.localeCompare(b.fullName) : b.id-a.id);

  return (
    <div style={{ padding:"20px 16px 32px", maxWidth:800, margin:"0 auto", width:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ color:C.goldDark, fontSize:9, letterSpacing:4, marginBottom:4 }}>DIRECTORY</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"Georgia, serif", fontWeight:"normal", color:C.charcoal }}>
            Contacts <span style={{ color:"#bbb", fontSize:16 }}>({clients.length})</span>
          </h2>
        </div>
        <button onClick={onAdd} className="btn-transition" style={{
          padding:"12px 20px", background:C.charcoal, color:C.gold,
          border:"none", borderRadius:12, cursor:"pointer", fontSize:12, letterSpacing:2,
          display:"flex", alignItems:"center", gap:8,
        }}>
          <span style={{ fontSize:18 }}>+</span> NEW CONTACT
        </button>
      </div>

      <div style={{ background:"white", borderRadius:14, padding:"14px", marginBottom:16, border:`1px solid ${C.ivoryDark}` }}>
        <input type="text" placeholder="🔍  Search contacts by name, email, phone…" value={q} onChange={e=>setQ(e.target.value)}
          style={{...inputStyle, marginBottom:10, fontSize:13}} />
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
            style={{ flex:1, minWidth:120, padding:"9px 12px", background:C.bg, border:`1.5px solid ${C.ivoryDark}`, borderRadius:8, fontSize:12, cursor:"pointer" }}>
            <option value="newest">Newest First</option>
            <option value="name">Name A–Z</option>
          </select>
          <button onClick={()=>{
            const headers = ["Full Name","Phone","Email","Address","Notes","Created At"];
            const rows = filtered.map(c=>[
              c.fullName,
              (c.phones||[]).map(p=>p.number).filter(Boolean).join("; "),
              (c.emails||[]).filter(Boolean).join("; "),
              c.address||"",
              c.notes||"",
              c.createdAt||"",
            ]);
            const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob = new Blob([csv],{type:"text/csv"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href=url; a.download="contacts.csv"; a.click(); URL.revokeObjectURL(url);
          }} className="btn-transition" style={{
            padding:"9px 16px", background:C.success, color:"white", border:"none",
            borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:"bold", letterSpacing:0.5,
            whiteSpace:"nowrap", flexShrink:0,
          }}>
            Export to Excel
          </button>
        </div>
      </div>

      <div style={{ color:"#aaa", fontSize:11, marginBottom:12 }}>{filtered.length} contact{filtered.length!==1?"s":""}</div>

      {filtered.length===0
        ? <div style={{ textAlign:"center", padding:"50px 0", color:"#bbb", fontSize:14 }}>No contacts. <span style={{ color:C.goldDark, cursor:"pointer" }} onClick={onAdd}>Add one →</span></div>
        : filtered.map(c => <ClientCard key={c.id} client={c} onEdit={onEdit} onDelete={onDelete} />)
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
function Dashboard({ lenders, clients, deals, onCategorySelect, onNavigate, user }) {
  const totalDealValue = (deals||[]).reduce((s,d)=>s+(d.value||0),0);
  const priorityDeals  = (deals||[]).filter(d=>d.dealType==="Priority").length;
  const recentClients  = [...clients].sort((a,b)=>b.id-a.id).slice(0,5);

  // Pipeline columns — group clients by stage
  const pipelineStages = DEAL_STAGES.filter(s=>s.id!=="cancelled" && s.id!=="completed");
  const dealsByStage   = id => (deals||[]).filter(d=>d.dealStage===id);

  const kpis = [
    { label:"Total Contacts", value:clients.length,      color:C.goldDark, icon:"👤", sub:"in directory" },
    { label:"Total Deals",    value:(deals||[]).length,  color:C.info,     icon:"🤝", sub:`${fmt$(totalDealValue)} value` },
    { label:"Priority Deals", value:priorityDeals,       color:C.danger,   icon:"🔴", sub:"require attention" },
  ];

  return (
    <div style={{ padding:"20px 16px 90px", maxWidth:1200, margin:"0 auto", width:"100%" }}>

      {/* ── Greeting ── */}
      <div style={{ marginBottom:20 }}>
        <div style={{ color:C.goldDark, fontSize:9, letterSpacing:4, marginBottom:4 }}>OVERVIEW</div>
        <h1 style={{ color:C.charcoal, margin:0, fontSize:24, fontFamily:"Georgia, serif", fontWeight:"normal" }}>
          Good day, {user.name}
        </h1>
        <div style={{ color:"#aaa", fontSize:12, marginTop:4 }}>{(deals||[]).filter(d=>d.dealStage!=="cancelled").length} active deal{(deals||[]).filter(d=>d.dealStage!=="cancelled").length!==1?"s":""} in pipeline</div>
      </div>

      {/* ── KPI Banner — 3 cols ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, marginBottom:20 }}>
        {kpis.map((k,i) => (
          <div key={i} style={{
            background:"white", borderRadius:14, padding:"16px 14px",
            border:`1px solid ${C.ivoryDark}`, borderTop:`4px solid ${k.color}`,
            boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:9, color:"#aaa", letterSpacing:2, marginBottom:6 }}>{k.label.toUpperCase()}</div>
                <div style={{ fontSize:20, fontWeight:"bold", fontFamily:"Georgia, serif", color:C.charcoal }}>{k.value}</div>
                <div style={{ fontSize:10, color:"#bbb", marginTop:4 }}>{k.sub}</div>
              </div>
              <span style={{ fontSize:18, opacity:0.7 }}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Workspace: single col on mobile, 2-col on wider screens ── */}
      <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr)", gap:16, alignItems:"start" }}>

        {/* PIPELINE — Deals by stage */}
        <div>
          <div style={{ fontSize:9, color:"#aaa", letterSpacing:3, marginBottom:12 }}>ACTIVE PIPELINE · DEAL STAGES</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {pipelineStages.filter(s=>dealsByStage(s.id).length>0).map(s => {
              const stagDeals = dealsByStage(s.id);
              return (
                <div key={s.id} style={{ background:"white", borderRadius:12, border:`1px solid ${C.ivoryDark}`, borderLeft:`4px solid ${s.color}`, overflow:"hidden" }}>
                  <div style={{ padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", background:s.bg, borderBottom:`1px solid ${s.color}22` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:14 }}>{s.icon}</span>
                      <span style={{ fontSize:11, fontWeight:"bold", color:s.color }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize:10, fontWeight:"bold", color:s.color, background:"white", padding:"2px 8px", borderRadius:10, border:`1px solid ${s.color}33` }}>{stagDeals.length}</span>
                  </div>
                  {stagDeals.map(d => {
                    const cl  = clients.find(c=>c.id===Number(d.contactId));
                    const isPri = d.dealType==="Priority";
                    return (
                      <div key={d.id} style={{ padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, borderBottom:`1px solid ${C.ivory}`, background: isPri ? "#FFF5F5" : "white" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
                          <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, background: isPri ? `${C.danger}22` : `${s.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color: isPri ? C.danger : s.color, fontWeight:"bold" }}>
                            {isPri ? "!" : (cl?.fullName||"?").charAt(0)}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:12, fontWeight:"bold", color: isPri ? C.danger : C.charcoal, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {d.address||"No address"}
                              {isPri && <span style={{ marginLeft:6, fontSize:9, color:C.danger }}>● PRIORITY</span>}
                            </div>
                            <div style={{ fontSize:10, color:"#999" }}>{cl?.fullName||"—"}</div>
                          </div>
                        </div>
                        <div style={{ textAlign:"right", flexShrink:0 }}>
                          <div style={{ fontSize:12, fontWeight:"bold", fontFamily:"Georgia, serif", color: isPri ? C.danger : C.goldDark }}>{fmt$(d.value)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {(deals||[]).filter(d=>d.dealStage!=="cancelled").length===0 && (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#bbb", fontSize:13 }}>
                No active deals in pipeline.
                <span style={{ color:C.goldDark, cursor:"pointer", marginLeft:6 }} onClick={()=>onNavigate("deals")}>Add one →</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Recent activity + quick stats */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Recent Clients */}
          <div style={{ background:"white", borderRadius:14, padding:"16px", border:`1px solid ${C.ivoryDark}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:9, color:"#aaa", letterSpacing:3 }}>RECENT CLIENTS</div>
              <button onClick={()=>onNavigate("clients")} style={{ background:"none", border:"none", cursor:"pointer", color:C.goldDark, fontSize:11 }}>All →</button>
            </div>
            {recentClients.map(c => (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.ivory}` }}>
                <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, background:`${C.goldDark}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:C.goldDark, fontWeight:"bold" }}>
                  {c.fullName.charAt(0)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:"bold", color:C.charcoal, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.fullName}</div>
                  <div style={{ fontSize:10, color:"#aaa", marginTop:1 }}>{(c.emails||[])[0] || (c.phones||[])[0]?.number || "—"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Deals */}
          {(deals||[]).length > 0 && (
            <div style={{ background:"white", borderRadius:14, padding:"16px", border:`1px solid ${C.ivoryDark}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:9, color:"#aaa", letterSpacing:3 }}>RECENT DEALS</div>
                <button onClick={()=>onNavigate("deals")} style={{ background:"none", border:"none", cursor:"pointer", color:C.goldDark, fontSize:11 }}>All →</button>
              </div>
              {[...(deals||[])].sort((a,b)=>b.id-a.id).slice(0,4).map(d => (
                <div key={d.id} style={{ padding:"8px 0", borderBottom:`1px solid ${C.ivory}` }}>
                  <div style={{ fontSize:12, fontWeight:"bold", color:C.charcoal, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.address||"—"}</div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:3 }}>
                    <span style={{ fontSize:10, color:"#999" }}>{d.closingDate ? `Close: ${d.closingDate}` : "No date set"}</span>
                    <span style={{ fontSize:11, fontWeight:"bold", color:C.goldDark, fontFamily:"Georgia, serif" }}>{fmt$(d.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stage summary mini-chart */}
          <div style={{ background:"white", borderRadius:14, padding:"16px", border:`1px solid ${C.ivoryDark}` }}>
            <div style={{ fontSize:9, color:"#aaa", letterSpacing:3, marginBottom:10 }}>STAGE BREAKDOWN</div>
            {DEAL_STAGES.filter(s=>s.id!=="cancelled" && s.id!=="completed").map(s => {
              const cnt = dealsByStage(s.id).length;
              if (cnt===0) return null;
              const pct = Math.round((cnt/((deals||[]).length||1))*100)||0;
              return (
                <div key={s.id} style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                    <span style={{ fontSize:10, color:s.color, fontWeight:"bold" }}>{s.icon} {s.label}</span>
                    <span style={{ fontSize:10, color:"#aaa" }}>{cnt}</span>
                  </div>
                  <div style={{ height:5, background:"#F3F4F6", borderRadius:3 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:s.color, borderRadius:3, transition:"width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LENDER CARD
// ─────────────────────────────────────────────────────────────
// Inline Terms & Conditions viewer for LenderCard
function LenderTermsViewer({ fileName, fileData }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const isPdf = fileName && fileName.toLowerCase().endsWith(".pdf");

  const handleDownload = () => {
    if (!fileData) return;
    const a = document.createElement("a");
    a.href = fileData;
    a.download = fileName || "document";
    a.click();
  };

  return (
    <div>
      <div style={fieldLabel}>TERMS &amp; CONDITIONS</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.goldDark }}>{isPdf ? "📄" : "🖼️"} {fileName}</span>
        {fileData && (
          <>
            <button onClick={() => setViewerOpen(true)} className="btn-transition" style={{
              padding: "5px 12px", background: C.charcoal, color: C.gold,
              border: "none", borderRadius: 7, cursor: "pointer", fontSize: 10, letterSpacing: 1,
            }}>
              View {isPdf ? "PDF" : "Doc"}
            </button>
            <button onClick={handleDownload} className="btn-transition" style={{
              padding: "5px 12px", background: `${C.goldDark}18`, color: C.goldDark,
              border: `1px solid ${C.goldDark}44`, borderRadius: 7, cursor: "pointer", fontSize: 10, letterSpacing: 1,
            }}>
              ⬇ Download
            </button>
          </>
        )}
      </div>
      {viewerOpen && fileData && (
        <div className="anim-fade" style={{
          position: "fixed", inset: 0, zIndex: 3000,
          background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 16,
        }} onClick={e => e.target === e.currentTarget && setViewerOpen(false)}>
          <div className="anim-fade-up" style={{
            background: "#111", borderRadius: 14, overflow: "hidden",
            width: "100%", maxWidth: 820,
            maxHeight: "90vh", display: "flex", flexDirection: "column",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            border: `1px solid ${C.goldDark}33`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", borderBottom: `1px solid ${C.goldDark}22`, background: "#1a1a1a",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{isPdf ? "📄" : "🖼️"}</span>
                <span style={{ color: C.gold, fontSize: 13, fontFamily: "Georgia, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>{fileName}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={handleDownload} className="btn-transition" style={{
                  padding: "7px 14px", background: `${C.goldDark}22`, color: C.gold,
                  border: `1px solid ${C.goldDark}44`, borderRadius: 8,
                  cursor: "pointer", fontSize: 11, letterSpacing: 1, display: "flex", alignItems: "center", gap: 5,
                }}>⬇ Download</button>
                <button onClick={() => setViewerOpen(false)} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#888", fontSize: 22, lineHeight: 1, padding: "2px 6px",
                }}>×</button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16, minHeight: 0 }}>
              {isPdf ? (
                <iframe src={fileData} title={fileName} style={{ width: "100%", height: "72vh", border: "none", borderRadius: 8, background: "white" }} />
              ) : (
                <img src={fileData} alt={fileName} style={{ maxWidth: "100%", maxHeight: "72vh", borderRadius: 8, objectFit: "contain", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
              {lender.assistanceEmail && <div><div style={fieldLabel}>ASSISTANCE EMAIL</div><a href={`mailto:${lender.assistanceEmail}`} style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}` }}>{lender.assistanceEmail}</a></div>}
              {lender.termsFileName && <div style={{ gridColumn: "1/-1" }}><LenderTermsViewer fileName={lender.termsFileName} fileData={lender.termsFileData} /></div>}
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
  const icons = ["🏢","🔄","🏗️","🏠","💸"];
  const descs = ["Long-term financing","Bridge to permanent","Ground-up construction","Owner-occupied commercial","Short-term hard money loans"];
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

function LocationSelect({ category, lenders, onSelect, onAdd }) {
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
      {/* Header row with title + Add Lender button */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: C.goldDark, fontSize: 9, letterSpacing: 4, marginBottom: 4 }}>{category.toUpperCase()}</div>
          <h2 style={{ color: C.charcoal, margin: 0, fontSize: 22, fontFamily: "Georgia, serif", fontWeight: "normal" }}>Select Location</h2>
        </div>
        <button onClick={onAdd} className="btn-transition" style={{
          padding: "12px 20px", background: C.charcoal, color: C.gold,
          border: "none", borderRadius: 12, cursor: "pointer",
          fontSize: 12, letterSpacing: 2,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>+</span> ADD LENDER
        </button>
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
  const initCategory = initial?.category || defaultCategory || "Permanent";
  const [form, setForm] = useState(initial ? {
    ...initial,
    termsFileData: initial.termsFileData || null,
    termsFileName: initial.termsFileName || "",
  } : {
    category: initCategory,
    location: defaultLocation === "All Locations" ? "" : (defaultLocation || ""),
    address: "",
    bankName: "", contactName: "", email: "", phone: "",
    assistantPhone: "", assistantName: "", assistanceEmail: "",
    lenderType: getLenderTypes(initCategory)[0],
    termsFileName: "",
    termsFileData: null,
    notes: "", rate: "", minLoan: "", maxLoan: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // When category changes, reset lenderType to first valid option for new category
  const handleCategoryChange = newCat => {
    const types = getLenderTypes(newCat);
    setForm(f => ({ ...f, category: newCat, lenderType: types[0] }));
  };

  const availableTypes = getLenderTypes(form.category);

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
          <FormField label="Assistance Email" type="email" value={form.assistanceEmail} onChange={v => set("assistanceEmail", v)} span2 />

          {/* Category first — drives lender type dropdown */}
          <div>
            <div style={fieldLabel}>CATEGORY <span style={{ color: C.danger }}>*</span></div>
            <select value={form.category} onChange={e => handleCategoryChange(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg
' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Conditional Lender Type — filtered by selected category */}
          <div>
            <div style={fieldLabel}>
              LENDER TYPE
              <span style={{ marginLeft: 6, fontSize: 9, color: C.goldDark, letterSpacing: 1 }}>
                ↳ {form.category}
              </span>
            </div>
            <select value={form.lenderType} onChange={e => set("lenderType", e.target.value)}
              style={{ ...inputStyle, cursor: "pointer", appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg
' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
                border: `1.5px solid ${C.goldDark}66`,
                background: `${C.goldDark}08`,
              }}>
              {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <FormField label="Location / State" value={form.location} onChange={v => set("location", v)} />
          <AddressField label="Address" value={form.address || ""} onChange={v => set("address", v)} span2 />
          <FormField label="Interest Rate (%)" type="number" step="0.01" value={form.rate} onChange={v => set("rate", v)} />
          <FormField label="Min Loan ($)" type="number" value={form.minLoan} onChange={v => set("minLoan", v)} />
          <FormField label="Max Loan ($)" type="number" value={form.maxLoan} onChange={v => set("maxLoan", v)} />

          {/* Enhanced Terms & Conditions with view/download */}
          <TermsFileField
            label="Terms & Conditions (PDF / Image)"
            fileName={form.termsFileName}
            fileData={form.termsFileData}
            onChange={f => setForm(prev => ({ ...prev, termsFileName: f ? f.name : "", termsFileData: f ? f.data : null }))}
            span2
          />
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
// WORKERS VIEW — Deal performance by "Created By" field
// ─────────────────────────────────────────────────────────────
function WorkersView({ deals, workers, onPayDeal, onPayAllDeals }) {
  const [dateFilter, setDateFilter] = useState("all");
  const [customFrom,  setCustomFrom]  = useState("");
  const [customTo,    setCustomTo]    = useState("");
  const [expandedWorker, setExpandedWorker] = useState(null);
  const [confirmPayAll, setConfirmPayAll] = useState(null); // { workerName, amount, dealIds }
  const [confirmPayJob, setConfirmPayJob] = useState(null); // { dealId, amount, workerName }

  const today = new Date();
  const toDateStr = d => d.toISOString().slice(0, 10);

  const filterDeal = d => {
    const created = d.createdAt || "";
    if (!created) return true;
    if (dateFilter === "today") return created === toDateStr(today);
    if (dateFilter === "7days") {
      const from = new Date(today); from.setDate(from.getDate()-6);
      return created >= toDateStr(from);
    }
    if (dateFilter === "30days") {
      const from = new Date(today); from.setDate(from.getDate()-29);
      return created >= toDateStr(from);
    }
    if (dateFilter === "custom") {
      if (customFrom && created < customFrom) return false;
      if (customTo && created > customTo) return false;
      return true;
    }
    return true;
  };

  const filteredDeals = deals.filter(filterDeal);
  const totalFiltered = filteredDeals.length;

  // Group by createdBy
  const workerNames = [...new Set([
    ...workers.map(w=>w.name),
    ...deals.map(d=>d.createdBy).filter(Boolean),
  ])].filter(Boolean);

  const stats = workerNames.map(name => {
    const worker = workers.find(wk=>wk.name===name);
    const commPct = parseFloat(worker?.commission) || 0;
    const workerDeals = filteredDeals.filter(d=>(d.createdBy||"")===name);
    const totalValue  = workerDeals.reduce((s,d)=>s+(d.value||0),0);
    const pct = totalFiltered>0 ? Math.round((workerDeals.length/totalFiltered)*100) : 0;
    const stageBreakdown = DEAL_STAGES.map(s=>({
      ...s, count: workerDeals.filter(d=>d.dealStage===s.id).length,
    })).filter(s=>s.count>0);

    // Commission per deal = paymentAmount * commPct / 100
    const dealsWithComm = workerDeals.map(d => {
      const commEarned = commPct ? Math.round((d.paymentAmount||0) * commPct / 100) : 0;
      const isPaid = !!(d.paidWorkers && d.paidWorkers[name]);
      return { ...d, commEarned, isPaid };
    });
    const totalCommEarned = dealsWithComm.reduce((s,d)=>s+d.commEarned,0);
    const totalCommPaid   = dealsWithComm.filter(d=>d.isPaid).reduce((s,d)=>s+d.commEarned,0);
    const totalCommOwed   = totalCommEarned - totalCommPaid;
    const unpaidDeals     = dealsWithComm.filter(d=>!d.isPaid && d.commEarned>0);

    return { name, count:workerDeals.length, totalValue, pct, stageBreakdown, commPct, totalCommEarned, totalCommPaid, totalCommOwed, unpaidDeals, dealsWithComm };
  }).sort((a,b)=>b.count-a.count);

  const dateFilterOptions = [
    { value:"all",    label:"All Time"     },
    { value:"today",  label:"Today"        },
    { value:"7days",  label:"Last 7 Days"  },
    { value:"30days", label:"Last 30 Days" },
    { value:"custom", label:"Custom Range" },
  ];

  return (
    <div style={{ padding:"20px 16px 40px", maxWidth:860, margin:"0 auto", width:"100%" }}>
      <div style={{ color:C.goldDark, fontSize:9, letterSpacing:4, marginBottom:4 }}>PERFORMANCE</div>
      <h2 style={{ margin:"0 0 20px", fontSize:22, fontFamily:"Georgia, serif", fontWeight:"normal", color:C.charcoal }}>
        Workers <span style={{ color:"#bbb", fontSize:16 }}>({workers.length})</span>
      </h2>

      {/* Date filter */}
      <div style={{ background:"white", borderRadius:14, padding:"14px", marginBottom:20, border:`1px solid ${C.ivoryDark}` }}>
        <div style={{ fontSize:9, color:"#aaa", letterSpacing:2, marginBottom:10 }}>DATE FILTER</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {dateFilterOptions.map(opt=>(
            <button key={opt.value} onClick={()=>setDateFilter(opt.value)} className="btn-transition"
              style={{ padding:"7px 14px", borderRadius:20, cursor:"pointer", fontSize:11, border:`1px solid ${C.ivoryDark}`,
                background:dateFilter===opt.value?C.goldDark:C.bg, color:dateFilter===opt.value?"white":C.charcoal, fontWeight:dateFilter===opt.value?"bold":"normal" }}>
              {opt.label}
            </button>
          ))}
        </div>
        {dateFilter==="custom" && (
          <div style={{ display:"flex", gap:10, marginTop:12, alignItems:"center", flexWrap:"wrap" }}>
            <div>
              <div style={fieldLabel}>FROM</div>
              <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)} style={{...inputStyle, width:"auto"}} />
            </div>
            <div>
              <div style={fieldLabel}>TO</div>
              <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)} style={{...inputStyle, width:"auto"}} />
            </div>
          </div>
        )}
        <div style={{ marginTop:10, fontSize:11, color:"#aaa" }}>{totalFiltered} deal{totalFiltered!==1?"s":""} in selected period</div>
      </div>

      {/* Worker cards */}
      {stats.length===0 ? (
        <div style={{ textAlign:"center", padding:"50px 0", color:"#bbb", fontSize:13 }}>No worker data found.</div>
      ) : stats.map((w,i) => (
        <div key={w.name} className="card-hover" style={{
          background:"white", border:`1px solid ${C.ivoryDark}`,
          borderLeft:`4px solid ${C.goldDark}`, borderRadius:14,
          padding:"18px", marginBottom:12,
          boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:14, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{
                width:44, height:44, borderRadius:"50%", flexShrink:0,
                background:`${C.goldDark}22`, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:17, color:C.goldDark, fontWeight:"bold",
              }}>
                {w.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:"bold", fontSize:15, fontFamily:"Georgia, serif", color:C.charcoal }}>{w.name}</div>
                <div style={{ fontSize:10, color:"#aaa", marginTop:2, display:"flex", alignItems:"center", gap:8 }}>
                  <span>{w.count} deal{w.count!==1?"s":""} · {w.pct}% of pipeline</span>
                  {w.commPct ? <span style={{ padding:"2px 8px", borderRadius:8, background:`${C.warning}18`, color:C.warning, fontSize:9, fontWeight:"bold", border:`1px solid ${C.warning}33` }}>{w.commPct}% Commission</span> : null}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:8, color:"#aaa", letterSpacing:1.5 }}>TOTAL VALUE</div>
                <div style={{ fontSize:15, fontWeight:"bold", fontFamily:"Georgia, serif", color:C.goldDark }}>{fmt$(w.totalValue)}</div>
              </div>
              {w.commPct ? (
                <>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:8, color:"#aaa", letterSpacing:1.5 }}>COMM. EARNED</div>
                    <div style={{ fontSize:15, fontWeight:"bold", fontFamily:"Georgia, serif", color:C.success }}>{fmt$(w.totalCommEarned)}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:8, color:"#aaa", letterSpacing:1.5 }}>COMM. PAID</div>
                    <div style={{ fontSize:15, fontWeight:"bold", fontFamily:"Georgia, serif", color:"#6B7280" }}>{fmt$(w.totalCommPaid)}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:8, color:"#aaa", letterSpacing:1.5 }}>COMM. OWED</div>
                    <div style={{ fontSize:15, fontWeight:"bold", fontFamily:"Georgia, serif", color:w.totalCommOwed>0?C.danger:"#6B7280" }}>{fmt$(w.totalCommOwed)}</div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* % bar */}
          <div style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:9, color:"#aaa", letterSpacing:1 }}>SHARE OF DEALS</span>
              <span style={{ fontSize:9, color:C.goldDark, fontWeight:"bold" }}>{w.pct}%</span>
            </div>
            <div style={{ height:6, background:"#F3F4F6", borderRadius:3 }}>
              <div style={{ height:"100%", width:`${w.pct}%`, background:C.goldDark, borderRadius:3, transition:"width 0.5s" }} />
            </div>
          </div>

          {/* Stage breakdown */}
          {w.stageBreakdown.length>0 && (
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
              {w.stageBreakdown.map(s=>(
                <span key={s.id} style={{ fontSize:9, padding:"3px 9px", borderRadius:12, border:`1px solid ${s.color}33`, background:s.bg, color:s.color, fontWeight:"bold" }}>
                  {s.icon} {s.label} ({s.count})
                </span>
              ))}
            </div>
          )}

          {/* Commission payment section */}
          {w.commPct > 0 && (
            <div style={{ borderTop:`1px solid ${C.ivory}`, paddingTop:12, marginTop:4 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontSize:9, color:"#aaa", letterSpacing:2 }}>COMMISSION PAYMENTS</div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  {w.unpaidDeals.length>0 && (
                    <button onClick={()=>setConfirmPayAll({ workerName:w.name, amount:w.totalCommOwed, dealIds:w.unpaidDeals.map(d=>d.id) })}
                      className="btn-transition" style={{
                        padding:"7px 14px", background:C.success, color:"white", border:"none",
                        borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:"bold", letterSpacing:0.5,
                        display:"flex", alignItems:"center", gap:5,
                      }}>
                      💳 Pay All ({fmt$(w.totalCommOwed)})
                    </button>
                  )}
                  <button onClick={()=>setExpandedWorker(expandedWorker===w.name?null:w.name)}
                    className="btn-transition" style={{
                      padding:"7px 12px", background:C.bg, color:C.charcoal, border:`1px solid ${C.ivoryDark}`,
                      borderRadius:8, cursor:"pointer", fontSize:11,
                    }}>
                    {expandedWorker===w.name?"Hide Jobs ▲":"View Jobs ▼"}
                  </button>
                </div>
              </div>

              {expandedWorker===w.name && (
                <div className="anim-fade-up">
                  {w.dealsWithComm.length===0 ? (
                    <div style={{ fontSize:12, color:"#bbb", textAlign:"center", padding:"16px 0" }}>No deals in this period.</div>
                  ) : w.dealsWithComm.map(d=>(
                    <div key={d.id} style={{
                      display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                      background:d.isPaid?`${C.success}08`:`${C.danger}04`,
                      border:`1px solid ${d.isPaid?C.success+"33":C.ivoryDark}`,
                      borderRadius:9, marginBottom:6,
                    }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:"bold", color:C.charcoal, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.address||"No address"}</div>
                        <div style={{ fontSize:10, color:"#aaa", marginTop:2 }}>
                          Fee: {fmt$(d.paymentAmount||0)} · {w.commPct}% = <span style={{ color:C.success, fontWeight:"bold" }}>{fmt$(d.commEarned)}</span>
                          {d.closingDate && <span style={{ marginLeft:8 }}>📅 {d.closingDate}</span>}
                        </div>
                      </div>
                      {d.isPaid ? (
                        <span style={{ fontSize:11, color:C.success, fontWeight:"bold", padding:"5px 10px", background:`${C.success}15`, borderRadius:7, border:`1px solid ${C.success}44`, whiteSpace:"nowrap" }}>
                          ✓ Paid
                        </span>
                      ) : d.commEarned > 0 ? (
                        <button onClick={()=>setConfirmPayJob({ dealId:d.id, amount:d.commEarned, workerName:w.name })}
                          className="btn-transition" style={{
                            padding:"6px 12px", background:C.goldDark, color:"white", border:"none",
                            borderRadius:7, cursor:"pointer", fontSize:11, fontWeight:"bold", whiteSpace:"nowrap",
                          }}>
                          Pay {fmt$(d.commEarned)}
                        </button>
                      ) : (
                        <span style={{ fontSize:10, color:"#bbb", whiteSpace:"nowrap" }}>No comm.</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Pay single job confirmation */}
      {confirmPayJob && (
        <ConfirmModal
          title="Mark Job as Paid"
          message={`Mark commission of ${fmt$(confirmPayJob.amount)} for this deal as paid to ${confirmPayJob.workerName}?`}
          confirmLabel="Confirm Payment"
          onConfirm={()=>{ onPayDeal(confirmPayJob.dealId, confirmPayJob.workerName); setConfirmPayJob(null); }}
          onCancel={()=>setConfirmPayJob(null)}
        />
      )}

      {/* Pay all confirmation */}
      {confirmPayAll && (
        <ConfirmModal
          title="Pay All Outstanding Commission"
          message={`Mark all outstanding commission (${fmt$(confirmPayAll.amount)}) as paid to ${confirmPayAll.workerName}? This covers ${confirmPayAll.dealIds.length} unpaid deal${confirmPayAll.dealIds.length!==1?"s":""}.`}
          confirmLabel="Confirm Payment"
          onConfirm={()=>{ onPayAllDeals(confirmPayAll.dealIds, confirmPayAll.workerName); setConfirmPayAll(null); }}
          onCancel={()=>setConfirmPayAll(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SETTINGS VIEW — Worker Management (Manager only)
// ─────────────────────────────────────────────────────────────
function SettingsView({ workers, onAddWorker, onDeleteWorker }) {
  const blankWorker = { name: "", email: "", password: "", role: "worker", commission: "" };
  const [form, setForm]         = useState(blankWorker);
  const [showPass, setShowPass] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef();
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {/* Role + Commission side by side */}
          <div style={{ gridColumn:"1/-1", display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <div style={fieldLabel}>ROLE</div>
              <select value={form.role} onChange={e => setF("role", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg
' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
                <option value="worker">Regular Worker</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div>
              <div style={fieldLabel}>COMMISSION PERCENTAGE</div>
              <div style={{ position:"relative" }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.commission}
                  onChange={e => setF("commission", e.target.value)}
                  placeholder="e.g. 1, 2, 2.5"
                  style={{ ...inputStyle, paddingRight: 36 }}
                />
                <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", color:"#aaa", fontSize:14, pointerEvents:"none" }}>%</span>
              </div>
            </div>
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
                {w.commission && (
                  <span style={{
                    fontSize: 9, letterSpacing: 1, padding: "4px 10px", borderRadius: 10,
                    background: `${C.warning}18`, color: C.warning,
                    border: `1px solid ${C.warning}44`,
                  }}>
                    {w.commission}% COMM.
                  </span>
                )}
                <div style={{ position: "relative" }} ref={openMenuId === w.id ? menuRef : null}>
                  <button onClick={() => setOpenMenuId(openMenuId === w.id ? null : w.id)} className="btn-transition"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 18, lineHeight: 1, padding: "2px 6px", fontWeight: "bold" }}>
                    ···
                  </button>
                  {openMenuId === w.id && (
                    <div className="anim-fade" style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      background: "white",
                      border: `1px solid ${C.ivoryDark}`,
                      borderRadius: 8,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      zIndex: 10000,
                      minWidth: 140,
                      overflow: "hidden",
                      marginTop: 6,
                    }}>
                      <button onClick={() => { /* Edit handler */ setOpenMenuId(null); }}
                        style={{
                          width: "100%", padding: "10px 16px", background: "none", border: "none",
                          cursor: "pointer", fontSize: 13, color: C.charcoal,
                          textAlign: "left", transition: "all 0.15s",
                          borderBottom: `1px solid ${C.ivory}`,
                        }}
                        onMouseEnter={e => e.target.style.background = C.bg}
                        onMouseLeave={e => e.target.style.background = "none"}
                      >
                        ✏️ Edit
                      </button>
                      <button onClick={() => { setConfirmDel(w); setOpenMenuId(null); }}
                        style={{
                          width: "100%", padding: "10px 16px", background: "none", border: "none",
                          cursor: "pointer", fontSize: 13, color: C.danger,
                          textAlign: "left", transition: "all 0.15s",
                        }}
                        onMouseEnter={e => e.target.style.background = "#FEF0EF"}
                        onMouseLeave={e => e.target.style.background = "none"}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  )}
                </div>
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
// MULTI-ENTRY PHONE FIELD
// ─────────────────────────────────────────────────────────────
const PHONE_TAGS = ["Work", "Home", "Mobile", "Fax", "Custom"];
function MultiPhoneField({ phones, onChange }) {
  const add = () => onChange([...phones, { number: "", tag: "Work" }]);
  const upd = (i, k, v) => { const a = phones.map((p,j) => j===i ? {...p,[k]:v} : p); onChange(a); };
  const del = i => onChange(phones.filter((_,j) => j!==i));
  return (
    <div style={{ gridColumn: "1/-1" }}>
      <div style={fieldLabel}>PHONE NUMBERS</div>
      {phones.map((p,i) => (
        <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
          <input value={p.number} onChange={e=>upd(i,"number",e.target.value)} placeholder="Phone number"
            style={{...inputStyle, flex:2}} />
          <select value={p.tag} onChange={e=>upd(i,"tag",e.target.value)}
            style={{...inputStyle, flex:1, cursor:"pointer"}}>
            {PHONE_TAGS.map(t=><option key={t}>{t}</option>)}
          </select>
          <button onClick={()=>del(i)} style={{background:"none",border:"none",cursor:"pointer",color:C.danger,fontSize:18,flexShrink:0}}>×</button>
        </div>
      ))}
      <button onClick={add} className="btn-transition" style={{
        padding:"8px 14px", background:C.bg, border:`1.5px dashed ${C.ivoryDark}`,
        borderRadius:8, cursor:"pointer", fontSize:11, color:C.goldDark, letterSpacing:1,
      }}>+ Add Phone</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MULTI-ENTRY EMAIL FIELD
// ─────────────────────────────────────────────────────────────
function MultiEmailField({ emails, onChange }) {
  const add = () => onChange([...emails, ""]);
  const upd = (i,v) => onChange(emails.map((e,j)=>j===i?v:e));
  const del = i => onChange(emails.filter((_,j)=>j!==i));
  return (
    <div style={{ gridColumn: "1/-1" }}>
      <div style={fieldLabel}>EMAIL ADDRESSES</div>
      {emails.map((e,i) => (
        <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
          <input type="email" value={e} onChange={ev=>upd(i,ev.target.value)} placeholder="Email address"
            style={{...inputStyle, flex:1}} />
          <button onClick={()=>del(i)} style={{background:"none",border:"none",cursor:"pointer",color:C.danger,fontSize:18,flexShrink:0}}>×</button>
        </div>
      ))}
      <button onClick={add} className="btn-transition" style={{
        padding:"8px 14px", background:C.bg, border:`1.5px dashed ${C.ivoryDark}`,
        borderRadius:8, cursor:"pointer", fontSize:11, color:C.goldDark, letterSpacing:1,
      }}>+ Add Email</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ORGANIZATION FORM
// ─────────────────────────────────────────────────────────────
const ENTITY_TYPES = ["LLC","Corporation","Partnership","Non-Profit","Other"];
const VISIBLE_TO   = ["All","Manager Only","Assigned Team"];

// Contact autocomplete field — searches clients list, shows "Add New Contact" if not found
function ContactAutocomplete({ label, value, onChange, clients, onAddNew, span2 }) {
  const [query, setQuery]   = useState(value || "");
  const [open, setOpen]     = useState(false);
  const ref                 = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  // Click-outside closes dropdown
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const matches = query.length > 0
    ? clients.filter(c => c.fullName.toLowerCase().includes(query.toLowerCase()))
    : clients.slice(0, 6);

  const exactMatch = clients.some(c => c.fullName.toLowerCase() === query.toLowerCase());

  const pick = name => { onChange(name); setQuery(name); setOpen(false); };

  return (
    <div ref={ref} style={span2 ? { gridColumn:"1/-1", position:"relative" } : { position:"relative" }}>
      <div style={fieldLabel}>{label.toUpperCase()}</div>
      <div style={{ position:"relative" }}>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={`Search contacts…`}
          style={{ ...inputStyle, paddingRight: 36 }}
        />
        <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#bbb", pointerEvents:"none" }}>▾</span>
      </div>
      {open && (
        <div style={{
          
          position:"absolute", top:"100%", left:0, right:0, zIndex:500,
          background:"white", border:`1.5px solid ${C.ivoryDark}`, borderRadius:10,
          boxShadow:"0 8px 32px rgba(0,0,0,0.12)", maxHeight:220, overflowY:"auto",
          marginTop:4,
        }}>
          {matches.length > 0 ? matches.map(c => (
            <div key={c.id} onMouseDown={() => pick(c.fullName)} style={{
              padding:"11px 14px", cursor:"pointer", fontSize:13, color:C.charcoal,
              borderBottom:`1px solid ${C.ivory}`,
              display:"flex", alignItems:"center", gap:10,
            }}
            onMouseEnter={e=>e.currentTarget.style.background=C.bg}
            onMouseLeave={e=>e.currentTarget.style.background="white"}>
              <div style={{
                width:28, height:28, borderRadius:"50%", background:`${C.goldDark}22`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, color:C.goldDark, fontWeight:"bold", flexShrink:0,
              }}>{c.fullName.charAt(0)}</div>
              <div>
                <div style={{ fontWeight:"bold" }}>{c.fullName}</div>
                {c.email && <div style={{ fontSize:10, color:"#999" }}>{c.email}</div>}
              </div>
            </div>
          )) : (
            <div style={{ padding:"10px 14px", fontSize:12, color:"#aaa" }}>No contacts found</div>
          )}
          {!exactMatch && query.trim().length > 0 && (
            <div onMouseDown={() => { setOpen(false); onAddNew(query.trim(), label); }}
              style={{
                padding:"12px 14px", cursor:"pointer", fontSize:12,
                color:C.goldDark, borderTop:`1px solid ${C.ivory}`,
                display:"flex", alignItems:"center", gap:8, fontWeight:"bold",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=`${C.goldDark}0D`}
              onMouseLeave={e=>e.currentTarget.style.background="white"}>
              <span style={{ fontSize:16 }}>＋</span>
              Add "{query.trim()}" as new contact
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrgForm({ initial, clients, onSave, onCancel, onAddNewContact }) {
  const blank = {
    name:"", sponsor:"", sponsor2:"", officeContact:"",
    mgmtContact:"", assistance:"", loanOfficer:"", address:"",
    entityType:"LLC",
    phones:[{ number:"", tag:"Work" }], emails:[""],
  };
  const [form, setForm] = useState(initial ? {...initial} : blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // "Add New Contact" inline: saves field key + prefill name, then hands off
  const handleAddNew = (prefillName, fieldLabel) => {
    // Store current form progress before opening new contact form
    onAddNewContact(prefillName, (newClient) => {
      // Callback fires when new client is saved — auto-fill the right field
      const fieldMap = {
        "Sponsor Information":          "sponsor",
        "Sponsor 2 Information":        "sponsor2",
        "Office Contact":               "officeContact",
        "Management Company Contact":   "mgmtContact",
        "Assistance":                   "assistance",
        "Loan Officer":                 "loanOfficer",
      };
      const key = fieldMap[fieldLabel];
      if (key) set(key, newClient.fullName);
    });
  };

  return (
    <div style={{ padding:"24px 20px 40px" }}>
      <div style={{ width:36, height:4, background:C.ivoryDark, borderRadius:2, margin:"0 auto 20px" }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <h2 style={{ margin:0, fontSize:20, fontFamily:"Georgia, serif", fontWeight:"normal", color:C.charcoal }}>
          {initial ? "Edit Organization" : "Add Organization"}
        </h2>
        <button onClick={onCancel} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#aaa" }}>×</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <FormField label="Organization Name" value={form.name} onChange={v=>set("name",v)} required span2 />
        <SelectField label="Entity Type" value={form.entityType} onChange={v=>set("entityType",v)} options={ENTITY_TYPES} />
        <div /> {/* grid spacer */}
        <ContactAutocomplete label="Sponsor Information" value={form.sponsor} onChange={v=>set("sponsor",v)} clients={clients} onAddNew={handleAddNew} />
        <ContactAutocomplete label="Sponsor 2 Information" value={form.sponsor2} onChange={v=>set("sponsor2",v)} clients={clients} onAddNew={handleAddNew} />
        <ContactAutocomplete label="Office Contact" value={form.officeContact} onChange={v=>set("officeContact",v)} clients={clients} onAddNew={handleAddNew} />
        <ContactAutocomplete label="Management Company Contact" value={form.mgmtContact} onChange={v=>set("mgmtContact",v)} clients={clients} onAddNew={handleAddNew} />
        <ContactAutocomplete label="Assistance" value={form.assistance} onChange={v=>set("assistance",v)} clients={clients} onAddNew={handleAddNew} />
        <AddressField label="Address" value={form.address} onChange={v=>set("address",v)} span2 />
        <MultiPhoneField phones={form.phones} onChange={v=>set("phones",v)} />
        <MultiEmailField emails={form.emails} onChange={v=>set("emails",v)} />
      </div>
      <div style={{ display:"flex", gap:10, marginTop:24 }}>
        <button onClick={onCancel} className="btn-transition" style={{
          flex:1, padding:"14px", background:"white", border:`1.5px solid ${C.ivoryDark}`,
          borderRadius:12, cursor:"pointer", fontSize:13, color:C.charcoal,
        }}>Cancel</button>
        <button onClick={()=>{ if(!form.name.trim()){alert("Organization name is required.");return;} onSave(form); }}
          className="btn-transition" style={{
            flex:2, padding:"14px", background:C.goldDark, color:"white",
            border:"none", borderRadius:12, cursor:"pointer", fontSize:13, fontWeight:"bold", letterSpacing:1,
          }}>{initial ? "SAVE CHANGES" : "ADD ORGANIZATION"}</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ORGS VIEW
// ─────────────────────────────────────────────────────────────
function OrgsView({ orgs, onAdd, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const [confirmDel, setConfirmDel] = useState(null);
  const filtered = orgs.filter(o => !q || [o.name,o.owner,o.loanOfficer,o.entityType,o.address].some(f=>(f||"").toLowerCase().includes(q.toLowerCase())));
  return (
    <div style={{ padding:"20px 16px 32px", maxWidth:860, margin:"0 auto", width:"100%" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ color:C.goldDark, fontSize:9, letterSpacing:4, marginBottom:4 }}>DIRECTORY</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"Georgia, serif", fontWeight:"normal", color:C.charcoal }}>
            Organizations <span style={{ color:"#bbb", fontSize:16 }}>({orgs.length})</span>
          </h2>
        </div>
        <button onClick={onAdd} className="btn-transition" style={{
          padding:"12px 20px", background:C.charcoal, color:C.gold,
          border:"none", borderRadius:12, cursor:"pointer", fontSize:12, letterSpacing:2,
        }}>+ ADD ORG</button>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
        <input type="text" placeholder="🔍  Search organizations…" value={q} onChange={e=>setQ(e.target.value)}
          style={{...inputStyle, flex:1, marginBottom:0}} />
        <button onClick={()=>{
          const headers = ["Name","Entity Type","Owner","Loan Officer","Address","Phone","Email"];
          const rows = filtered.map(o=>[
            o.name,
            o.entityType||"",
            o.owner||"",
            o.loanOfficer||"",
            o.address||"",
            (o.phones||[]).map(p=>p.number).filter(Boolean).join("; "),
            (o.emails||[]).filter(Boolean).join("; "),
          ]);
          const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
          const blob = new Blob([csv],{type:"text/csv"});
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href=url; a.download="organizations.csv"; a.click(); URL.revokeObjectURL(url);
        }} className="btn-transition" style={{
          padding:"9px 16px", background:C.success, color:"white", border:"none",
          borderRadius:8, cursor:"pointer", fontSize:11, fontWeight:"bold", letterSpacing:0.5,
          whiteSpace:"nowrap", flexShrink:0,
        }}>
          Export to Excel
        </button>
      </div>
      {filtered.length === 0
        ? <div style={{ textAlign:"center", padding:"50px 0", color:"#bbb" }}>No organizations found.</div>
        : filtered.map(o => (
          <div key={o.id} className="card-hover" style={{
            background:"white", border:`1px solid ${C.ivoryDark}`, borderLeft:`4px solid ${C.goldDark}`,
            borderRadius:14, padding:"18px 18px 14px", marginBottom:12,
            boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
          }}>
            {/* TOP ROW: Name + Entity Badge + Actions */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontWeight:"bold", fontSize:15, fontFamily:"Georgia, serif", color:C.charcoal, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.name}</span>
                  <span style={{ fontSize:9, padding:"3px 9px", borderRadius:10, letterSpacing:1, background:`${C.goldDark}18`, color:C.goldDark, border:`1px solid ${C.goldDark}33`, fontWeight:"bold", whiteSpace:"nowrap" }}>
                    {o.entityType}
                  </span>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={()=>onEdit(o)} className="btn-transition" style={{ padding:"7px 12px", background:C.charcoal, color:C.gold, border:"none", borderRadius:8, cursor:"pointer", fontSize:11 }}>EDIT</button>
                <button onClick={()=>setConfirmDel(o)} style={{ background:"none", border:"none", color:C.danger, cursor:"pointer", fontSize:11, textDecoration:"underline", padding:"7px 4px" }}>Delete</button>
              </div>
            </div>

            {/* MIDDLE ROW: Owner + Loan Officer side by side */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div>
                <div style={{ fontSize:9, color:"#bbb", letterSpacing:1.5, marginBottom:2 }}>OWNER</div>
                <div style={{ fontSize:13, color:C.charcoal, fontWeight:"bold" }}>{o.owner||"—"}</div>
              </div>
              <div>
                <div style={{ fontSize:9, color:"#bbb", letterSpacing:1.5, marginBottom:2 }}>LOAN OFFICER</div>
                <div style={{ fontSize:13, color:C.charcoal }}>{o.loanOfficer||"—"}</div>
              </div>
            </div>

            {/* FOOTER: Address · Phone · Email */}
            <div style={{ borderTop:`1px solid ${C.ivory}`, paddingTop:10, display:"flex", flexDirection:"column", gap:6 }}>
              {o.address && (
                <a href={`https://maps.google.com/?q
=${encodeURIComponent(o.address)}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize:12, color:C.charcoal, textDecoration:"none", display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ color:C.goldDark }}>📍</span>
                  <span style={{ borderBottom:`1px solid ${C.gold}`, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.address}</span>
                </a>
              )}
              <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                {o.phones?.find(p=>p.number) && (
                  <a href={`tel:${o.phones.find(p=>p.number).number}`}
                    style={{ fontSize:12, color:C.charcoal, textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ color:C.goldDark }}>📞</span>
                    <span style={{ borderBottom:`1px solid ${C.gold}` }}>{o.phones.find(p=>p.number).number}</span>
                    <span style={{ fontSize:9, color:"#aaa" }}>({o.phones.find(p=>p.number).tag})</span>
                  </a>
                )}
                {o.emails?.find(Boolean) && (
                  <a href={`mailto:${o.emails.find(Boolean)}`}
                    style={{ fontSize:12, color:C.charcoal, textDecoration:"none", display:"flex", alignItems:"center", gap:4, minWidth:0 }}>
                    <span style={{ color:C.goldDark }}>✉</span>
                    <span style={{ borderBottom:`1px solid ${C.gold}`, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{o.emails.find(Boolean)}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))
      }
      {confirmDel && (
        <ConfirmModal title="Delete Organization" message={`Remove "${confirmDel.name}"? This cannot be undone.`}
          confirmLabel="Delete" danger
          onConfirm={()=>{ onDelete(confirmDel.id); setConfirmDel(null); }}
          onCancel={()=>setConfirmDel(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DEAL FORM — inline quick-add for contact/org, auto createdBy, visibleTo
// ─────────────────────────────────────────────────────────────
const SEL_STYLE = {
  cursor:"pointer", appearance:"none",
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg
' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
  backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center",
};

// Inline search+create for Contact/Org in DealForm
function DealLinkField({ label, items, value, onChange, onAddNew, idField, nameField }) {
  const [q, setQ]       = useState(() => { const found = items.find(i=>i[idField]===Number(value)||i[idField]===value); return found ? found[nameField] : ""; });
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);

  useEffect(() => {
    const found = items.find(i=>i[idField]===Number(value)||i[idField]===value);
    setQ(found ? found[nameField] : "");
  }, [value, items]);

  useEffect(() => {
    const h = e => { if(ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const matches = q.trim()
    ? items.filter(i=>(i[nameField]||"").toLowerCase().includes(q.toLowerCase()))
    : items.slice(0,8);
  const exactMatch = items.some(i=>(i[nameField]||"").toLowerCase()===q.toLowerCase());

  const pick = item => { onChange(item[idField]); setQ(item[nameField]); setOpen(false); };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div style={fieldLabel}>{label.toUpperCase()}</div>
      <div style={{ position:"relative" }}>
        <input value={q} onChange={e=>{ setQ(e.target.value); setOpen(true); if(!e.target.value) onChange(""); }}
          onFocus={()=>setOpen(true)} placeholder={`Search or create ${label.toLowerCase()}…`}
          style={{...inputStyle, paddingRight:36}} />
        <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"#bbb", pointerEvents:"none" }}>▾</span>
      </div>
      {open && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:600, background:"white", border:`1.5px solid ${C.ivoryDark}`, borderRadius:10, boxShadow:"0 8px 32px rgba(0,0,0,0.12)", maxHeight:200, overflowY:"auto", marginTop:4 }}>
          {matches.length>0 ? matches.map(item=>(
            <div key={item[idField]} onMouseDown={()=>pick(item)}
              style={{ padding:"10px 14px", cursor:"pointer", fontSize:13, color:C.charcoal, borderBottom:`1px solid ${C.ivory}`, display:"flex", alignItems:"center", gap:10 }}
              onMouseEnter={e=>e.currentTarget.style.background=C.bg}
              onMouseLeave={e=>e.currentTarget.style.background="white"}>
              <div style={{ width:26, height:26, borderRadius:"50%", background:`${C.goldDark}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:C.goldDark, fontWeight:"bold", flexShrink:0 }}>{(item[nameField]||"?").charAt(0)}</div>
              <span style={{ fontWeight:"bold" }}>{item[nameField]}</span>
            </div>
          )) : <div style={{ padding:"10px 14px", fontSize:12, color:"#aaa" }}>No {label.toLowerCase()} found</div>}
          {!exactMatch && q.trim().length>0 && (
            <div onMouseDown={()=>{ setOpen(false); onAddNew(q.trim()); }}
              style={{ padding:"11px 14px", cursor:"pointer", fontSize:12, color:C.goldDark, borderTop:`1px solid ${C.ivory}`, display:"flex", alignItems:"center", gap:8, fontWeight:"bold" }}
              onMouseEnter={e=>e.currentTarget.style.background=`${C.goldDark}0D`}
              onMouseLeave={e=>e.currentTarget.style.background="white"}>
              <span style={{ fontSize:16 }}>＋</span> Add "{q.trim()}" as new {label.toLowerCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DealForm({ initial, clients, orgs, onSave, onCancel, currentUser, onAddNewContact, onAddNewOrg }) {
  const blank = {
    contactId:"", orgId:"",
    address:"", value:"", closingDate:"",
    createdBy: currentUser?.name || "",
    dealType:"Regular", dealStage:"intake",
    paymentAmount:"",
    visibleTo:"all",
    notes:"",
    dealNotes: [],
    dealFiles: { folders: [], rootFiles: [] },
    _pendingCompleteNote: null,
  };
  const [form, setForm] = useState(initial
    ? {...initial, paymentAmount:initial.paymentAmount||"", value:initial.value||"", createdBy:initial.createdBy||currentUser?.name||"", dealNotes:initial.dealNotes||[], dealFiles:initial.dealFiles||{ folders: [], rootFiles: [] }}
    : blank);
  const [pendingStage, setPendingStage] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [pendingDeleteNote, setPendingDeleteNote] = useState(null);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const isPriority = form.dealType === "Priority";

  return (
    <div style={{ padding:"24px 20px 48px" }}>
      <div style={{ width:36, height:4, background:C.ivoryDark, borderRadius:2, margin:"0 auto 20px" }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <h2 style={{ margin:0, fontSize:20, fontFamily:"Georgia, serif", fontWeight:"normal", color: isPriority ? C.danger : C.charcoal }}>
            {initial ? "Edit Deal" : "Add Deal"}
          </h2>
          {isPriority && (
            <span style={{ fontSize:10, letterSpacing:1, padding:"4px 10px", borderRadius:10, background:"#FEE2E2", color:C.danger, border:`1px solid ${C.danger}44`, fontWeight:"bold", animation:"pulse 2s infinite" }}>
              ● PRIORITY
            </span>
          )}
        </div>
        <button onClick={onCancel} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#aaa" }}>×</button>
      </div>

      {/* Pipeline progress bar */}
      <div style={{ background: isPriority ? "#FEE2E2" : C.bg, borderRadius:12, padding:"14px 12px", marginBottom:20, border: isPriority ? `1px solid ${C.danger}33` : "none" }}>
        <div style={{ fontSize:9, letterSpacing:2, color: isPriority ? C.danger : "#999", marginBottom:10 }}>DEAL PROGRESS</div>
        <DealPipeline currentStage={form.dealStage} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

        {/* Organization — inline quick-add */}
        <DealLinkField label="Organization" items={orgs} value={form.orgId}
          onChange={v=>set("orgId",v)} idField="id" nameField="name"
          onAddNew={name=>onAddNewOrg(name, newO=>set("orgId", newO.id))} />

        <AddressField label="Address" value={form.address} onChange={v=>set("address",v)} span2 />

        {/* Value */}
        <div>
          <div style={fieldLabel}>VALUE</div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#888", fontSize:14 }}>$</span>
            <input type="number" value={form.value} onChange={e=>set("value",e.target.value)} placeholder="0" style={{...inputStyle, paddingLeft:28}} />
          </div>
        </div>

        <FormField label="Expected Closing Date" type="date" value={form.closingDate} onChange={v=>set("closingDate",v)} />

        {/* Created By — auto-populated, read-only display */}
        <div>
          <div style={fieldLabel}>CREATED BY</div>
          <div style={{ ...inputStyle, background:"#f8f8f8", color:"#888", display:"flex", alignItems:"center", gap:8, cursor:"default" }}>
            <span style={{ fontSize:14 }}>👤</span>
            <span>{form.createdBy || "—"}</span>
          </div>
        </div>

        {/* Deal Type — Priority bold red styling */}
        <div>
          <div style={fieldLabel}>DEAL TYPE</div>
          <select value={form.dealType} onChange={e=>set("dealType",e.target.value)}
            style={{...inputStyle,...SEL_STYLE,
              color: form.dealType==="Priority" ? C.danger : C.charcoal,
              fontWeight: form.dealType==="Priority" ? "bold" : "normal",
              border: form.dealType==="Priority" ? `2px solid ${C.danger}` : `1.5px solid ${C.ivoryDark}`,
              background: form.dealType==="Priority" ? "#FEF2F2" : C.bg,
            }}>
            <option value="Regular">Regular</option>
            <option value="Priority">Priority</option>
          </select>
        </div>

        {/* Deal Stage */}
        <div>
          <div style={fieldLabel}>DEAL STAGE</div>
          <select value={form.dealStage} onChange={e=>setPendingStage(e.target.value)} style={{...inputStyle,...SEL_STYLE}}>
            {DEAL_STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </div>

        {/* Payment Amount only (no status) */}
        <div>
          <div style={fieldLabel}>PAYMENT AMOUNT ($)</div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#888", fontSize:14 }}>$</span>
            <input type="number" value={form.paymentAmount} onChange={e=>set("paymentAmount",e.target.value)} placeholder="0" style={{...inputStyle, paddingLeft:28}} />
          </div>
        </div>

        {/* Visible To */}
        <div>
          <div style={fieldLabel}>VISIBLE TO</div>
          <select value={form.visibleTo} onChange={e=>set("visibleTo",e.target.value)} style={{...inputStyle,...SEL_STYLE}}>
            <option value="all">Visible to All</option>
            <option value="managers">Managers Only</option>
            <option value="workers">Regular Workers</option>
          </select>
        </div>

        <FormField label="Notes / Comments" value={form.notes} onChange={v=>set("notes",v)} textarea span2 />

        {/* Deal Notes - Free text notes with Complete button and history */}
        <div style={{ gridColumn: "1/-1" }}>
          <div style={fieldLabel}>DEAL NOTES (FREE TEXT)</div>
          <div style={{ display:"flex", gap:8, marginBottom:12, alignItems:"flex-start" }}>
            <textarea value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Add a note about this deal..."
              style={{...inputStyle, flex:1, resize:"vertical"}} rows={2} />
            <button onClick={()=>{
              if(newNote.trim()) {
                const noteId = Date.now();
                set("dealNotes", [...(form.dealNotes||[]), {id:noteId, text:newNote.trim(), done:false, createdAt:new Date().toISOString().slice(0,10)}]);
                setNewNote("");
              }
            }} style={{
              padding:"11px 16px", background:C.charcoal, color:C.gold, border:"none", borderRadius:8,
              cursor:"pointer", fontSize:11, fontWeight:"bold", letterSpacing:1, whiteSpace:"nowrap", marginTop:2
            }}>+ ADD NOTE</button>
          </div>
          {/* Active notes (not done) */}
          {(form.dealNotes||[]).filter(n=>!n.done).length>0 && (
            <div style={{ background:C.bg, borderRadius:10, padding:"12px 14px", marginBottom:12 }}>
              {(form.dealNotes||[]).filter(n=>!n.done).map(note=>(
                <div key={note.id} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${C.ivory}` }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color:C.charcoal, lineHeight:1.5 }}>{note.text}</div>
                    <div style={{ fontSize:9, color:"#aaa", marginTop:4 }}>{note.createdAt}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0, marginTop:2 }}>
                    <button onClick={()=>set("_pendingCompleteNote", note.id)}
                      style={{ padding:"5px 12px", background:C.success, color:"white", border:"none", borderRadius:6, cursor:"pointer", fontSize:10, fontWeight:"bold", letterSpacing:0.5, whiteSpace:"nowrap" }}>
                      Complete
                    </button>
                    <button onClick={()=>setPendingDeleteNote(note.id)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:C.danger, fontSize:11, fontWeight:"bold", textDecoration:"underline", padding:"2px 0", whiteSpace:"nowrap", letterSpacing:0.3 }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Completed notes history */}
          {(form.dealNotes||[]).filter(n=>n.done).length>0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ fontSize:9, color:"#aaa", letterSpacing:2, marginBottom:6 }}>COMPLETED NOTES HISTORY</div>
              <div style={{ background:"#F0FFF4", borderRadius:10, padding:"10px 14px", border:`1px solid ${C.success}33` }}>
                {(form.dealNotes||[]).filter(n=>n.done).map(note=>(
                  <div key={note.id} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${C.success}22` }}>
                    <span style={{ color:C.success, fontSize:16, flexShrink:0, marginTop:1 }}>✔</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, color:"#555", lineHeight:1.5, textDecoration:"line-through" }}>{note.text}</div>
                      <div style={{ fontSize:9, color:"#aaa", marginTop:3 }}>Completed · {note.createdAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deal File Manager — same as Contact File Manager */}
        <ContactFileManager value={form.dealFiles || { folders: [], rootFiles: [] }} onChange={v=>set("dealFiles",v)} />
      </div>

      {/* Stage change confirmation */}
      {pendingStage && pendingStage !== form.dealStage && (
        <ConfirmModal title="Update Deal Stage" message={`Move this deal to "${stageInfo(pendingStage).label}"?`}
          confirmLabel="Update Stage"
          onConfirm={()=>{ set("dealStage",pendingStage); setPendingStage(null); }}
          onCancel={()=>setPendingStage(null)} />
      )}

      {/* Complete note confirmation */}
      {form._pendingCompleteNote && (
        <ConfirmModal title="Complete Note"
          message="This note will be archived from the active deal view. It will remain fully accessible in the completed notes history for reference."
          confirmLabel="Mark Complete"
          onConfirm={()=>{
            set("dealNotes", (form.dealNotes||[]).map(n=>n.id===form._pendingCompleteNote?{...n,done:true}:n));
            set("_pendingCompleteNote", null);
          }}
          onCancel={()=>set("_pendingCompleteNote", null)} />
      )}

      {/* Delete note confirmation */}
      {pendingDeleteNote && (
        <ConfirmModal title="Delete Note"
          message="Are you sure you want to permanently delete this note? This action cannot be undone."
          confirmLabel="Delete Note"
          danger
          onConfirm={()=>{
            set("dealNotes", (form.dealNotes||[]).filter(n=>n.id!==pendingDeleteNote));
            setPendingDeleteNote(null);
          }}
          onCancel={()=>setPendingDeleteNote(null)} />
      )}

      <div style={{ display:"flex", gap:10, marginTop:24 }}>
        <button onClick={onCancel} className="btn-transition" style={{ flex:1, padding:"14px", background:"white", border:`1.5px solid ${C.ivoryDark}`, borderRadius:12, cursor:"pointer", fontSize:13, color:C.charcoal }}>Cancel</button>
        <button onClick={()=>{ if(!form.address.trim()){alert("Address is required.");return;} onSave({...form, value:parseFloat(form.value)||0, paymentAmount:parseFloat(form.paymentAmount)||0}); }}
          className="btn-transition" style={{
            flex:2, padding:"14px",
            background: isPriority ? C.danger : C.goldDark,
            color:"white", border:"none", borderRadius:12,
            cursor:"pointer", fontSize:13, fontWeight:"bold", letterSpacing:1,
            boxShadow: isPriority ? `0 4px 16px ${C.danger}44` : "none",
          }}>
          {initial ? "SAVE CHANGES" : "ADD DEAL"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DEALS VIEW — pipeline hub with stage workflow + Priority/Regular styling
// ─────────────────────────────────────────────────────────────
function DealsView({ deals, clients, orgs, onAdd, onEdit, onDelete, onStageChange }) {
  const [q, setQ]               = useState("");
  const [typeFilter, setType]   = useState("all");
  const [stageFilter, setStage] = useState("all");
  const [confirmDel, setConfirmDel] = useState(null);

  const getClient = id => clients.find(c=>c.id===Number(id));
  const getOrg    = id => orgs.find(o=>o.id===Number(id));

  const isInactiveStage = d => d.dealStage === "cancelled" || d.dealStage === "completed";

  const filtered = deals.filter(d=>{
    const cl = getClient(d.contactId), org = getOrg(d.orgId);
    const matchQ = !q || [d.address,cl?.fullName,org?.name,d.createdBy].some(f=>(f||"").toLowerCase().includes(q.toLowerCase()));
    const matchT = typeFilter==="all" || d.dealType===typeFilter;
    const matchS = stageFilter==="all" || d.dealStage===stageFilter;

    // If explicitly filtering for completed/cancelled: show them
    const explicitInactiveFilter = stageFilter==="completed" || stageFilter==="cancelled";
    // If searching: show all matching deals (including completed/cancelled)
    const isSearching = q.trim().length > 0;
    // Default "all stages" view: hide completed and cancelled
    const passesActiveRule = explicitInactiveFilter || isSearching || !isInactiveStage(d);

    return matchQ && matchT && matchS && passesActiveRule;
  });

  const totalValue    = deals.reduce((s,d)=>s+(d.value||0),0);
  const priorityCount = deals.filter(d=>d.dealType==="Priority").length;

  return (
    <div style={{ padding:"20px 16px 32px", maxWidth:900, margin:"0 auto", width:"100%" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ color:C.goldDark, fontSize:9, letterSpacing:4, marginBottom:4 }}>PIPELINE HUB</div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"Georgia, serif", fontWeight:"normal", color:C.charcoal }}>
            Deals <span style={{ color:"#bbb", fontSize:16 }}>({deals.length})</span>
            {priorityCount>0 && <span style={{ fontSize:11, marginLeft:10, color:C.danger, fontWeight:"bold" }}>● {priorityCount} Priority</span>}
          </h2>
        </div>
        <button onClick={onAdd} className="btn-transition" style={{ padding:"12px 20px", background:C.charcoal, color:C.gold, border:"none", borderRadius:12, cursor:"pointer", fontSize:12, letterSpacing:2 }}>+ ADD DEAL</button>
      </div>

      {/* KPI strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8, marginBottom:20 }}>
        {[
          { label:"TOTAL VALUE",   val:fmt$(totalValue),  color:C.goldDark },
          { label:"TOTAL DEALS",   val:deals.length,      color:C.info },
          { label:"PRIORITY",      val:priorityCount,     color:C.danger },
        ].map((k,i)=>(
          <div key={i} style={{ background:"white", borderRadius:12, padding:"12px 10px", border:`1px solid ${C.ivoryDark}`, borderTop:`3px solid ${k.color}`, textAlign:"center" }}>
            <div style={{ fontSize:8, color:"#aaa", letterSpacing:1.5 }}>{k.label}</div>
            <div style={{ fontSize:16, fontWeight:"bold", fontFamily:"Georgia, serif", color:k.color, marginTop:4 }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:"white", borderRadius:14, padding:"14px", marginBottom:16, border:`1px solid ${C.ivoryDark}` }}>
        <input type="text" placeholder="🔍  Search deals by address, contact, org…" value={q} onChange={e=>setQ(e.target.value)}
          style={{...inputStyle, marginBottom:10, fontSize:13}} />
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <select value={typeFilter} onChange={e=>setType(e.target.value)} style={{ flex:1, minWidth:110, padding:"9px 12px", background:C.bg, border:`1.5px solid ${C.ivoryDark}`, borderRadius:8, fontSize:12, cursor:"pointer" }}>
            <option value="all">All Types</option>
            <option value="Regular">Regular</option>
            <option value="Priority">Priority</option>
          </select>
          <select value={stageFilter} onChange={e=>setStage(e.target.value)} style={{ flex:2, minWidth:160, padding:"9px 12px", background:C.bg, border:`1.5px solid ${C.ivoryDark}`, borderRadius:8, fontSize:12, cursor:"pointer" }}>
            <option value="all">All Stages</option>
            {DEAL_STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Stage quick-filter pills */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
        {DEAL_STAGES.map(s=>{
          const cnt = deals.filter(d=>d.dealStage===s.id).length;
          if(!cnt) return null;
          return (
            <button key={s.id} onClick={()=>setStage(stageFilter===s.id?"all":s.id)} className="btn-transition"
              style={{ padding:"4px 10px", borderRadius:20, cursor:"pointer", fontSize:10, border:`1px solid ${s.color}33`,
                background:stageFilter===s.id?s.color:s.bg, color:stageFilter===s.id?"white":s.color }}>
              {s.icon} {s.label} ({cnt})
            </button>
          );
        })}
      </div>

      <div style={{ color:"#aaa", fontSize:11, marginBottom:12 }}>{filtered.length} deal{filtered.length!==1?"s":""} shown</div>

      {/* Deal cards */}
      {filtered.length===0
        ? <div style={{ textAlign:"center", padding:"50px 0", color:"#bbb" }}>No deals found. <span style={{ color:C.goldDark, cursor:"pointer" }} onClick={onAdd}>Add one →</span></div>
        : filtered.map(d=>{
          const cl   = getClient(d.contactId);
          const org  = getOrg(d.orgId);
          const s    = stageInfo(d.dealStage);
          const isPri = d.dealType==="Priority";
          const isInactive = isInactiveStage(d);

          return (
            <div key={d.id} className="card-hover" style={{
              background: isInactive ? "#FFF5F5" : "white", borderRadius:14, marginBottom:12, overflow:"hidden",
              border:`1px solid ${isInactive ? C.danger+"44" : isPri ? C.danger+"55" : C.ivoryDark}`,
              borderLeft:`4px solid ${isInactive ? C.danger : isPri ? C.danger : s.color}`,
              boxShadow: isPri || isInactive ? `0 2px 12px ${C.danger}18` : "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              {/* Card header */}
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    {/* Title row */}
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:4 }}>
                      <span style={{ fontWeight:"bold", fontSize:14, fontFamily:"Georgia, serif", color: isPri ? C.danger : C.charcoal, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {d.address||"No address"}
                      </span>
                      {isPri && (
                        <span style={{ fontSize:9, letterSpacing:1, padding:"3px 8px", borderRadius:10, background:"#FEE2E2", color:C.danger, border:`1px solid ${C.danger}33`, fontWeight:"bold", whiteSpace:"nowrap" }}>
                          ● PRIORITY
                        </span>
                      )}
                      {isInactive && (
                        <span style={{ fontSize:9, letterSpacing:1, padding:"3px 8px", borderRadius:10, background:"#FEE2E2", color:C.danger, border:`1px solid ${C.danger}33`, fontWeight:"bold", whiteSpace:"nowrap" }}>
                          ● {d.dealStage === "completed" ? "COMPLETED" : "CANCELLED"}
                        </span>
                      )}
                    </div>
                    {/* Meta */}
                    <div style={{ fontSize:11, color:"#999" }}>
                      👤 {cl?.fullName||"—"} &nbsp;·&nbsp; 🏢 {org?.name||"—"}
                    </div>
                    <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap", alignItems:"center" }}>
<StageBadge stageId={d.dealStage} small />
{d.closingDate && <span style={{ fontSize:10, color:"#aaa" }}>📅 {d.closingDate}</span>}
{d.visibleTo && d.visibleTo!=="all" && <span style={{ fontSize:9, padding:"3px 8px", borderRadius:10, background:${C.info}18, color:C.info, border:1px solid ${C.info}33 }}>👁 {d.visibleTo==="managers"?"Managers Only":"Workers Only"}</span>}
</div>
</div>
<div style={{ textAlign:"right", flexShrink:0 }}>
<div style={{ fontSize:18, fontWeight:"bold", fontFamily:"Georgia, serif", color: isPri ? C.danger : C.goldDark }}>{fmt$`(d.value)}</div>
</div>
</div>

{/* Pipeline mini-strip */}
<div style={{ marginTop:12, overflowX:"auto" }}>
<DealPipeline currentStage={d.dealStage} />
</div>

{d.notes && <div style={{ marginTop:10, fontSize:12, color:"#888", lineHeight:1.5, background:C.bg, borderRadius:8, padding:"8px 10px" }}>{d.notes}</div>}

{/* Active reminder notes shown on card */}
{(d.dealNotes||[]).filter(n=>!n.done).length>0 && (
<div style={{ marginTop:10, background:"#FFFBEB", borderRadius:8, padding:"8px 10px", border:1px solid${C.warning}33}}&gt; &lt;div style={{ fontSize:9, color:C.warning, letterSpacing:1.5, marginBottom:6 }}&gt;📌 REMINDERS&lt;/div&gt; {(d.dealNotes||[]).filter(n=&gt;!n.done).map(note=&gt;( &lt;div key={note.id} style={{ fontSize:12, color:C.charcoal, lineHeight:1.5, marginBottom:4, paddingBottom:4, borderBottom:1px solid ${C.warning}22 }}>
· {note.text}
<span style={{ fontSize:9, color:"#aaa", marginLeft:8 }}>{note.createdAt}</span>
</div>
))}
</div>
)}

{/* Actions */}
<div style={{ display:"flex", gap:8, marginTop:12, paddingTop:12, borderTop:1px solid${C.ivory}}}&gt; &lt;button onClick={()=&gt;onEdit(d)} className="btn-transition" style={{ flex:1, padding:"10px", background:C.charcoal, color:C.gold, border:"none", borderRadius:10, cursor:"pointer", fontSize:11, letterSpacing:1 }}&gt;EDIT&lt;/button&gt; &lt;button onClick={()=&gt;setConfirmDel(d)} style={{ padding:"10px 16px", background:C.dangerLight, color:C.danger, border:1px solid ${C.danger}22, borderRadius:10, cursor:"pointer", fontSize:11 }}>Delete</button>
</div>
</div>
</div>
);
})
}

{confirmDel && (
<ConfirmModal title="Delete Deal" message={Remove deal at "${confirmDel.address}"? This cannot be undone.`}
confirmLabel="Delete" danger
onConfirm={()=>{onDelete(confirmDel.id);setConfirmDel(null);}}
onCancel={()=>setConfirmDel(null)} />
)}
</div>
);
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
const [splash, setSplash] = useState(true);
const [user, setUser] = useState(null);
const [workers, setWorkers] = useState(INITIAL_WORKERS);
const [lenders, setLenders] = useState(INITIAL_LENDERS);
const [clients, setClients] = useState(INITIAL_CLIENTS);
const [view, setView] = useState("dashboard");
const [sidebarOpen, setSidebarOpen] = useState(false);
const [selectedCategory, setSelectedCategory] = useState(null);
const [selectedLocation, setSelectedLocation] = useState(null);
const [editingLender, setEditingLender] = useState(null);
const [formMode, setFormMode] = useState(null);
const [clientFormOpen, setClientFormOpen] = useState(false);
const [editingClient, setEditingClient] = useState(null);
const [orgs, setOrgs] = useState(INITIAL_ORGS);
const [deals, setDeals] = useState(INITIAL_DEALS);
const [orgFormOpen, setOrgFormOpen] = useState(false);
const [editingOrg, setEditingOrg] = useState(null);
const [dealFormOpen, setDealFormOpen] = useState(false);
const [editingDeal, setEditingDeal] = useState(null);
// Inline "Add New Contact" — from OrgForm or DealForm
const [addContactInline, setAddContactInline] = useState(null);
// Inline "Add New Org" — from DealForm
const [addOrgInline, setAddOrgInline] = useState(null);

// Restrict workers to their allowed views
const defaultView = user?.role === "manager" ? "dashboard" : "clients";

const activeNav = ["dashboard","clients","orgs","deals","search","settings","workers","categories","location","lenders","form"].includes(view) ? (["categories","location","lenders","form"].includes(view) ? "categories" : view) : "categories";

const navigate = id => {
setSidebarOpen(false);
// Workers cannot access dashboard or settings
if (user?.role !== "manager" && (id === "dashboard" || id === "settings" || id === "workers")) return;
if (id === "dashboard") setView("dashboard");
else if (id === "clients") setView("clients");
else if (id === "orgs") setView("orgs");
else if (id === "deals") setView("deals");
else if (id === "search") setView("search");
else if (id === "workers") setView("workers");
else if (id === "settings") setView("settings");
else setView("categories");
};

// Lender handlers
const handleCategorySelect = cat => { setSelectedCategory(cat); setView("location"); };
const handleLocationSelect = loc => { setSelectedLocation(loc); setView("lenders"); };
const handleLenderEdit = l => { setEditingLender({ ...l }); setFormMode("edit"); setView("form"); };
const handleLenderAdd = () => { setEditingLender(null); setFormMode("add"); setView("form"); };
const handleLenderDelete = id => setLenders(ls => ls.filter(l => l.id !== id));
const handleLenderSave = form => {
if (!form.bankName) { alert("Bank name is required."); return; }
const cleanedForm = {
...form,
rate: parseFloat(form.rate) || 0,
minLoan: parseInt(form.minLoan) || 0,
maxLoan: parseInt(form.maxLoan) || 0,
};
if (formMode === "edit") {
setLenders(ls => ls.map(l => l.id === editingLender.id ? { ...cleanedForm, id: editingLender.id } : l));
} else {
const newLender = { ...cleanedForm, id: Date.now() };
setLenders(ls => [...ls, newLender]);
setSelectedCategory(cleanedForm.category || selectedCategory);
setSelectedLocation(cleanedForm.location || "All Locations");
}
setEditingLender(null);
setFormMode(null);
setView("lenders");
};

// Client handlers
const handleClientSave = form => {
let saved;
if (editingClient) {
saved = { ...form, id: editingClient.id, createdAt: editingClient.createdAt };
setClients(cs => cs.map(c => c.id === editingClient.id ? saved : c));
} else {
saved = { ...form, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) };
setClients(cs => [...cs, saved]);
}
setClientFormOpen(false);
setEditingClient(null);
// If opened from OrgForm or DealForm "Add New Contact", fire callback and re-open parent
if (addContactInline) {
addContactInline.callback(saved);
setAddContactInline(null);
// Re-open whichever parent triggered this
if (addOrgInline === null && !orgFormOpen) {
setDealFormOpen(true);
} else {
setOrgFormOpen(true);
}
}
};
const handleClientEdit = c => { setEditingClient(c); setClientFormOpen(true); };
const handleClientDelete = id => setClients(cs => cs.filter(c => c.id !== id));
const handleStageChange = (id, stage) => setClients(cs => cs.map(c => c.id === id ? { ...c, dealStage: stage } : c));

// Worker handlers
const handleAddWorker = w => setWorkers(ws => [...ws, w]);
const handleDeleteWorker = id => setWorkers(ws => ws.filter(w => w.id !== id));

// Org handlers
const handleOrgSave = form => {
let saved;
if (editingOrg) {
saved = { ...form, id: editingOrg.id };
setOrgs(os => os.map(o => o.id === editingOrg.id ? saved : o));
} else {
saved = { ...form, id: Date.now() };
setOrgs(os => [...os, saved]);
}
setOrgFormOpen(false); setEditingOrg(null);
// Fire callback if opened inline from DealForm
if (addOrgInline) {
addOrgInline.callback(saved);
setAddOrgInline(null);
setDealFormOpen(true);
}
};
const handleOrgEdit = o => { setEditingOrg(o); setOrgFormOpen(true); };
const handleOrgDelete = id => setOrgs(os => os.filter(o => o.id !== id));

// Deal handlers
const handleDealSave = form => {
if (editingDeal) {
setDeals(ds => ds.map(d => d.id === editingDeal.id ? { ...form, id: editingDeal.id, createdAt: editingDeal.createdAt } : d));
} else {
setDeals(ds => [...ds, { ...form, id: Date.now(), createdAt: new Date().toISOString().slice(0,10) }]);
}
setDealFormOpen(false); setEditingDeal(null);
};
const handleDealEdit = d => { setEditingDeal(d); setDealFormOpen(true); };
const handleDealDelete = id => setDeals(ds => ds.filter(d => d.id !== id));

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
return <LocationSelect category={selectedCategory} lenders={lenders} onSelect={handleLocationSelect} onAdd={handleLenderAdd} />;
case "categories":
return <CategorySelect onSelect={handleCategorySelect} />;
case "clients":
return <ClientsView clients={clients} onAdd={() => { setEditingClient(null); setClientFormOpen(true); }}
onEdit={handleClientEdit} onDelete={handleClientDelete} />;
case "orgs":
return <OrgsView orgs={orgs} onAdd={() => { setEditingOrg(null); setOrgFormOpen(true); }}
onEdit={handleOrgEdit} onDelete={handleOrgDelete} />;
case "deals":
return <DealsView deals={deals} clients={clients} orgs={orgs}
onAdd={() => { setEditingDeal(null); setDealFormOpen(true); }}
onEdit={handleDealEdit} onDelete={handleDealDelete} onStageChange={(id,stage)=>setDeals(ds=>ds.map(d=>d.id===id?{...d,dealStage:stage}:d))} />;
case "settings":
if (user.role !== "manager") { setView("clients"); return null; }
return <SettingsView workers={workers} onAddWorker={handleAddWorker} onDeleteWorker={handleDeleteWorker} />;
case "workers":
if (user.role !== "manager") { setView("clients"); return null; }
return <WorkersView deals={deals} workers={workers}
onPayDeal={(dealId, workerName) => setDeals(ds => ds.map(d => d.id===dealId ? { ...d, paidWorkers: { ...(d.paidWorkers||{}), [workerName]: true } } : d))}
onPayAllDeals={(dealIds, workerName) => setDeals(ds => ds.map(d => dealIds.includes(d.id) ? { ...d, paidWorkers: { ...(d.paidWorkers||{}), [workerName]: true } } : d))}
/>;
default:
if (user.role !== "manager") return <ClientsView clients={clients} onAdd={() => { setEditingClient(null); setClientFormOpen(true); }}
onEdit={handleClientEdit} onDelete={handleClientDelete} />;
return <Dashboard lenders={lenders} clients={clients} deals={deals} user={user} onCategorySelect={handleCategorySelect} onNavigate={navigate} />;
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

<main style={{ minHeight: "calc(100vh - 58px)", paddingBottom: 24, width: "100%", overflowX: "hidden" }}>
{renderMain()}
</main>



{clientFormOpen && (
<Modal onClose={() => { setClientFormOpen(false); setEditingClient(null); }} maxWidth={640}>
<ClientForm
initial={editingClient}
onSave={handleClientSave}
onCancel={() => { setClientFormOpen(false); setEditingClient(null); }}
/>
</Modal>
)}
{orgFormOpen && (
<Modal onClose={() => { setOrgFormOpen(false); setEditingOrg(null); }} maxWidth={700}>
<OrgForm
initial={editingOrg}
clients={clients}
onSave={handleOrgSave}
onCancel={() => { setOrgFormOpen(false); setEditingOrg(null); }}
onAddNewContact={(prefillName, cb) => {
// Pause OrgForm, open ClientForm pre-filled
setOrgFormOpen(false);
setAddContactInline({ prefillName, callback: cb });
setEditingClient({ fullName: prefillName, phone:"", email:"", address:"",
notes:"", _isNew:true });
setClientFormOpen(true);
}}
/>
</Modal>
)}
{dealFormOpen && (
<Modal onClose={() => { setDealFormOpen(false); setEditingDeal(null); }} maxWidth={640}>
<DealForm
initial={editingDeal}
clients={clients}
orgs={orgs}
currentUser={user}
onSave={handleDealSave}
onCancel={() => { setDealFormOpen(false); setEditingDeal(null); }}
onAddNewContact={(prefillName, cb) => {
setDealFormOpen(false);
setAddContactInline({ prefillName, callback: cb });
setEditingClient({ fullName: prefillName, phones:[{number:"",tag:"Work"}], emails:[""], address:"", notes:"", _isNew:true });
setClientFormOpen(true);
}}
onAddNewOrg={(prefillName, cb) => {
setDealFormOpen(false);
setAddOrgInline({ prefillName, callback: cb });
setEditingOrg({ name: prefillName, sponsor:"", sponsor2:"", officeContact:"", mgmtContact:"", assistance:"", loanOfficer:"", address:"", entityType:"LLC", phones:[{number:"",tag:"Work"}], emails:[""], _isNew:true });
setOrgFormOpen(true);
}}
/>
</Modal>
)}
</div>
</>
);
}

    
