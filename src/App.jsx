import { useState, useEffect } from "react";

// ── Brand Colors ──────────────────────────────────────────────
const C = {
  gold: "#C7B89A",
  ivory: "#E7E1D4",
  charcoal: "#1A1A1A",
  goldDark: "#A89878",
  goldLight: "#DDD0B8",
  ivoryDark: "#CFC8B8",
  bg: "#F4F0E8",
  danger: "#c0392b",
  dangerLight: "#fdf0ef",
};

// ── Mock Data ──────────────────────────────────────────────────
const INITIAL_LENDERS = [
  {
    id: 1, category: "Permanent", location: "California",
    bankName: "Pacific Trust Bank", contactName: "Sarah Chen",
    email: "s.chen@pacifictrust.com", phone: "(415) 555-0192",
    assistantPhone: "(415) 555-0193", assistantName: "Mark Rivera",
    brokerType: "Direct Lender", notes: "Excellent rates for jumbo loans. Preferred partner.",
    rate: 6.75, minLoan: 500000, maxLoan: 5000000,
  },
  {
    id: 2, category: "Permanent", location: "Texas",
    bankName: "Lone Star Capital", contactName: "James Whitfield",
    email: "j.whitfield@lonestar.com", phone: "(713) 555-0247",
    assistantPhone: "", assistantName: "",
    brokerType: "Correspondent", notes: "Strong in commercial permanent financing.",
    rate: 7.10, minLoan: 250000, maxLoan: 10000000,
  },
  {
    id: 3, category: "Bridge to Perm", location: "New York",
    bankName: "Hudson Bridge Finance", contactName: "Alexandra Novak",
    email: "a.novak@hudsonbridge.com", phone: "(212) 555-0384",
    assistantPhone: "(212) 555-0385", assistantName: "Daniel Park",
    brokerType: "Portfolio Lender", notes: "Fast close, 30-day guarantee. Great for value-add.",
    rate: 8.50, minLoan: 1000000, maxLoan: 50000000,
  },
  {
    id: 4, category: "Bridge to Perm", location: "Florida",
    bankName: "Coastal Bridge Group", contactName: "Carlos Mendez",
    email: "c.mendez@coastalbridge.com", phone: "(305) 555-0561",
    assistantPhone: "", assistantName: "",
    brokerType: "Direct Lender", notes: "Specializes in multifamily bridge-to-perm.",
    rate: 8.25, minLoan: 500000, maxLoan: 25000000,
  },
  {
    id: 5, category: "Construction", location: "California",
    bankName: "BuildFirst National", contactName: "Priya Sharma",
    email: "p.sharma@buildfirst.com", phone: "(818) 555-0729",
    assistantPhone: "(818) 555-0730", assistantName: "Tom Nguyen",
    brokerType: "Construction Specialist", notes: "Interest reserve required. 18-month max term.",
    rate: 9.00, minLoan: 750000, maxLoan: 30000000,
  },
  {
    id: 6, category: "Owner Occupied", location: "New York",
    bankName: "Empire Owner Finance", contactName: "Robert Kim",
    email: "r.kim@empireowner.com", phone: "(646) 555-0843",
    assistantPhone: "", assistantName: "",
    brokerType: "Bank", notes: "SBA preferred lender. Owner-occ commercial only.",
    rate: 6.90, minLoan: 300000, maxLoan: 8000000,
  },
];

const CATEGORIES = ["Permanent", "Bridge to Perm", "Construction", "Owner Occupied"];
const LOCATIONS = ["All Locations", "California", "Texas", "New York", "Florida"];
const BROKER_TYPES = ["Direct Lender", "Correspondent", "Portfolio Lender", "Construction Specialist", "Bank", "Credit Union", "Private"];

// ── REAL PCB Logo ─────────────────────────────────────────────
// Reads from public/pcb-logo.png — copy your logo file there.
// darkBg=true applies a CSS filter to make the logo visible on dark backgrounds.
function PCBLogo({ size = 120, darkBg = false }) {
  return (
    <img
      src="/pcb-logo.png"
      alt="PCB Group – Pyramid Capital Brokerage"
      style={{
        width: size,
        height: "auto",
        display: "block",
        objectFit: "contain",
        // On dark backgrounds, render logo in gold tones
        filter: darkBg
          ? "brightness(0) invert(1) sepia(1) saturate(1.2) hue-rotate(5deg) opacity(0.88)"
          : "none",
      }}
    />
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────
function DeleteModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.55)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "white", borderRadius: 2, padding: "36px 32px",
        maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        border: `1px solid ${C.ivoryDark}`,
      }}>
        <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center" }}>🗑️</div>
        <h3 style={{
          margin: "0 0 12px", fontFamily: "Georgia, serif",
          color: C.charcoal, textAlign: "center", fontWeight: "normal", fontSize: 20,
        }}>Confirm Delete</h3>
        <p style={{ color: "#666", fontSize: 14, lineHeight: 1.6, textAlign: "center", margin: "0 0 28px" }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px", background: C.ivory,
            border: `1px solid ${C.ivoryDark}`, borderRadius: 2,
            cursor: "pointer", fontSize: 12, letterSpacing: 2,
            fontFamily: "Georgia, serif", color: C.charcoal,
          }}>CANCEL</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "12px", background: C.danger,
            border: "none", borderRadius: 2, cursor: "pointer",
            fontSize: 12, letterSpacing: 2, fontFamily: "Georgia, serif",
            color: "white", fontWeight: "bold",
          }}>DELETE</button>
        </div>
      </div>
    </div>
  );
}

// ── Floating Global Delete FAB ─────────────────────────────────
function GlobalDeleteButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Delete all items in current view"
      style={{
        position: "fixed", bottom: 32, right: 32, zIndex: 500,
        width: 56, height: 56, borderRadius: "50%",
        background: hover ? C.danger : "#e74c3c",
        border: "2px solid rgba(255,255,255,0.15)",
        cursor: "pointer",
        boxShadow: hover
          ? "0 8px 32px rgba(192,57,43,0.55)"
          : "0 4px 16px rgba(192,57,43,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, transition: "all 0.2s",
        transform: hover ? "scale(1.12)" : "scale(1)",
      }}
    >
      🗑️
    </button>
  );
}

// ── Splash Screen ─────────────────────────────────────────────
function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setTimeout(() => { setFadeOut(true); setTimeout(onEnter, 700); }, 2800);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: C.charcoal,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 1000, opacity: fadeOut ? 0 : 1, transition: "opacity 0.7s ease",
    }}>
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 1s ease",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
      }}>
        <PCBLogo size={260} darkBg={true} />
        <div style={{ width: 60, height: 1, background: C.gold, opacity: 0.5, marginTop: 4 }} />
        <div style={{ color: C.ivoryDark, letterSpacing: "3px", fontSize: 11, opacity: 0.7 }}>
          PRIVATE LENDING PORTAL
        </div>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("YFried@pcgroupny.com");
  const [password, setPassword] = useState("pcb2027");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email || !password) { setError("Please enter credentials."); return; }
    setLoading(true);
    setTimeout(() => {
      if (email.toLowerCase() === "yfried@pcgroupny.com" && password === "pcb2027") {
        onLogin({ name: "Y. Fried", email });
      } else {
        setError("Invalid credentials.");
        setLoading(false);
      }
    }, 900);
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.charcoal,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "Georgia, serif",
    }}>
      <div style={{
        background: "#222", borderRadius: 2, padding: "48px 40px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 0 60px rgba(0,0,0,0.6)",
        border: `1px solid ${C.goldDark}33`,
      }}>
        <div style={{ textAlign: "center", marginBottom: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <PCBLogo size={200} darkBg={true} />
          <div style={{ color: C.gold, letterSpacing: "5px", fontSize: 11 }}>PRIVATE PORTAL ACCESS</div>
        </div>

        <input
          type="email" placeholder="Email Address"
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={inputStyle}
        />
        <input
          type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ ...inputStyle, marginTop: 12 }}
        />
        {error && <div style={{ color: "#e07070", fontSize: 12, marginTop: 8 }}>{error}</div>}
        <button onClick={handleSubmit} disabled={loading} style={btnPrimary}>
          {loading ? "AUTHENTICATING..." : "SIGN IN"}
        </button>
        <div style={{ textAlign: "center", marginTop: 20, color: C.gold, opacity: 0.4, fontSize: 10, letterSpacing: 2 }}>
          SECURED · ENCRYPTED · PRIVATE
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "13px 16px", background: "#2a2a2a",
  border: `1px solid ${C.goldDark}44`, borderRadius: 2, color: C.ivory,
  fontSize: 14, fontFamily: "Georgia, serif", letterSpacing: 0.5,
  outline: "none", boxSizing: "border-box", display: "block",
};
const btnPrimary = {
  width: "100%", marginTop: 20, padding: "14px", background: C.goldDark,
  color: C.charcoal, border: "none", borderRadius: 2, fontSize: 13,
  fontFamily: "Georgia, serif", letterSpacing: "3px", cursor: "pointer", fontWeight: "bold",
};
const btnSmall = {
  padding: "7px 16px", background: C.ivory, border: `1px solid ${C.ivoryDark}`,
  borderRadius: 2, cursor: "pointer", fontSize: 11, letterSpacing: 2,
  color: C.charcoal, fontFamily: "Georgia, serif",
};
const btnDanger = {
  padding: "7px 14px", background: C.dangerLight, border: `1px solid #f5c6c2`,
  borderRadius: 2, cursor: "pointer", fontSize: 12, color: C.danger,
};

// ── Header ────────────────────────────────────────────────────
function Header({ user, onLogout, onHome }) {
  return (
    <header style={{
      background: C.charcoal, borderBottom: `1px solid ${C.goldDark}33`,
      padding: "0 24px", display: "flex", alignItems: "center",
      justifyContent: "space-between", height: 64,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ cursor: "pointer" }} onClick={onHome}>
        <PCBLogo size={110} darkBg={true} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ color: C.gold, fontSize: 12, letterSpacing: 2, opacity: 0.8 }}>
          {user.name.toUpperCase()}
        </span>
        <button onClick={onLogout} style={{
          background: "transparent", border: `1px solid ${C.goldDark}66`,
          color: C.gold, padding: "6px 16px", borderRadius: 2, cursor: "pointer",
          fontSize: 11, letterSpacing: 2, fontFamily: "Georgia, serif",
        }}>LOGOUT</button>
      </div>
    </header>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard({ lenders, onCategorySelect }) {
  const stats = CATEGORIES.map(cat => ({
    cat,
    count: lenders.filter(l => l.category === cat).length,
    avgRate: lenders.filter(l => l.category === cat).reduce((a, l) => a + l.rate, 0) /
      (lenders.filter(l => l.category === cat).length || 1),
  }));
  const recentLenders = [...lenders].slice(-3).reverse();

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: C.goldDark, fontSize: 11, letterSpacing: 4, marginBottom: 6 }}>OVERVIEW</div>
        <h1 style={{ color: C.charcoal, margin: 0, fontSize: 28, fontFamily: "Georgia, serif", fontWeight: "normal" }}>
          Lender Dashboard
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.cat} onClick={() => onCategorySelect(s.cat)} style={{
            background: "white", border: `1px solid ${C.ivoryDark}`,
            borderLeft: `4px solid ${C.gold}`,
            borderRadius: 2, padding: "24px 20px", cursor: "pointer",
          }}>
            <div style={{ color: C.goldDark, fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>{s.cat.toUpperCase()}</div>
            <div style={{ fontSize: 32, fontWeight: "bold", color: C.charcoal, fontFamily: "Georgia, serif" }}>{s.count}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>Avg Rate: {s.avgRate.toFixed(2)}%</div>
            <div style={{ color: C.gold, fontSize: 11, marginTop: 12, letterSpacing: 1 }}>View Lenders →</div>
          </div>
        ))}
        <div style={{ background: C.charcoal, borderRadius: 2, padding: "24px 20px", borderLeft: `4px solid ${C.goldDark}` }}>
          <div style={{ color: C.gold, fontSize: 10, letterSpacing: 3, marginBottom: 8 }}>TOTAL LENDERS</div>
          <div style={{ fontSize: 32, fontWeight: "bold", color: C.ivory, fontFamily: "Georgia, serif" }}>{lenders.length}</div>
          <div style={{ fontSize: 12, color: C.gold, opacity: 0.6, marginTop: 4 }}>
            Avg Rate: {(lenders.reduce((a, l) => a + l.rate, 0) / (lenders.length || 1)).toFixed(2)}%
          </div>
        </div>
      </div>

      <div>
        <div style={{ color: C.goldDark, fontSize: 11, letterSpacing: 4, marginBottom: 16 }}>RECENT LENDERS</div>
        {recentLenders.map(l => (
          <div key={l.id} style={{
            background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 2,
            padding: "16px 20px", marginBottom: 8, display: "flex",
            alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
          }}>
            <div>
              <div style={{ fontWeight: "bold", color: C.charcoal, fontSize: 15 }}>{l.bankName}</div>
              <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{l.category} · {l.location}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: C.goldDark, fontWeight: "bold", fontSize: 18 }}>{l.rate}%</div>
              <div style={{ color: "#aaa", fontSize: 11 }}>{l.brokerType}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Category Select ───────────────────────────────────────────
function CategorySelect({ onSelect }) {
  const icons = ["🏢", "🔄", "🏗️", "🏠"];
  const descs = ["Long-term financing", "Short-term bridge to permanent", "Ground-up construction", "Owner-occupied commercial"];
  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: C.goldDark, fontSize: 11, letterSpacing: 4, marginBottom: 6 }}>SELECT CATEGORY</div>
        <h2 style={{ color: C.charcoal, margin: 0, fontSize: 26, fontFamily: "Georgia, serif", fontWeight: "normal" }}>Mortgage Categories</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
        {CATEGORIES.map((cat, i) => (
          <div key={cat} onClick={() => onSelect(cat)} style={{
            background: "white", border: `1px solid ${C.ivoryDark}`,
            borderRadius: 2, padding: "32px 24px", cursor: "pointer", textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{icons[i]}</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: "bold", color: C.charcoal }}>{cat}</div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 8, lineHeight: 1.5 }}>{descs[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Location Select ───────────────────────────────────────────
function LocationSelect({ category, lenders, onSelect, onDeleteLocation }) {
  const [confirmLoc, setConfirmLoc] = useState(null);
  const locs = ["All Locations", ...new Set(lenders.filter(l => l.category === category).map(l => l.location))];
  const counts = loc => loc === "All Locations"
    ? lenders.filter(l => l.category === category).length
    : lenders.filter(l => l.category === category && l.location === loc).length;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>
      <Breadcrumb items={[category]} />
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: C.goldDark, fontSize: 11, letterSpacing: 4, marginBottom: 6 }}>SELECT LOCATION</div>
        <h2 style={{ color: C.charcoal, margin: 0, fontSize: 26, fontFamily: "Georgia, serif", fontWeight: "normal" }}>{category}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {locs.map(loc => (
          <div key={loc} style={{
            background: "white", border: `1px solid ${C.ivoryDark}`,
            borderLeft: `4px solid ${C.gold}`, borderRadius: 2, padding: "20px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ cursor: "pointer", flex: 1 }} onClick={() => onSelect(loc)}>
              <div style={{ fontSize: 13, fontWeight: "bold", color: C.charcoal }}>{loc}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
                {counts(loc)} lender{counts(loc) !== 1 ? "s" : ""}
              </div>
            </div>
            {loc !== "All Locations" && (
              <button onClick={() => setConfirmLoc(loc)} style={btnDanger} title={`Delete all ${loc} lenders`}>
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Floating FAB — deletes entire category */}
      <GlobalDeleteButton onClick={() => setConfirmLoc("__ALL__")} />

      {confirmLoc && (
        <DeleteModal
          message={
            confirmLoc === "__ALL__"
              ? `Delete ALL lenders in "${category}"? This cannot be undone.`
              : `Delete all lenders in "${confirmLoc}" under "${category}"? This cannot be undone.`
          }
          onConfirm={() => {
            onDeleteLocation(category, confirmLoc === "__ALL__" ? null : confirmLoc);
            setConfirmLoc(null);
          }}
          onCancel={() => setConfirmLoc(null)}
        />
      )}
    </div>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────
function Breadcrumb({ items, onNavigate }) {
  return (
    <div style={{ color: "#aaa", fontSize: 11, letterSpacing: 1, marginBottom: 24 }}>
      <span style={{ cursor: "pointer", color: C.goldDark }} onClick={() => onNavigate && onNavigate()}>Dashboard</span>
      {items.map((item, i) => (
        <span key={i}> › <span style={{ color: i === items.length - 1 ? C.charcoal : C.goldDark }}>{item}</span></span>
      ))}
    </div>
  );
}

// ── Lender Card ───────────────────────────────────────────────
function LenderCard({ lender, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div style={{
        background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 2,
        marginBottom: 12, overflow: "hidden",
        boxShadow: expanded ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
      }}>
        <div style={{
          padding: "18px 20px", display: "flex", alignItems: "center",
          justifyContent: "space-between", cursor: "pointer", flexWrap: "wrap", gap: 8,
        }} onClick={() => setExpanded(!expanded)}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", color: C.charcoal, fontSize: 16, fontFamily: "Georgia, serif" }}>{lender.bankName}</div>
            <div style={{ color: "#888", fontSize: 12, marginTop: 3 }}>
              {lender.contactName} · {lender.brokerType} · {lender.location}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Quick delete on card header */}
            <button
              onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
              title="Delete lender"
              style={btnDanger}
            >🗑️</button>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: C.goldDark, fontWeight: "bold", fontSize: 20, fontFamily: "Georgia, serif" }}>{lender.rate}%</div>
              <div style={{ color: "#bbb", fontSize: 10, letterSpacing: 1 }}>RATE</div>
            </div>
            <span style={{
              color: C.gold, fontSize: 18, display: "inline-block",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s",
            }}>▾</span>
          </div>
        </div>

        {expanded && (
          <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.ivory}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 16 }}>
              <Field label="Email" value={lender.email} link={`mailto:${lender.email}`} />
              <Field label="Phone" value={lender.phone} link={`tel:${lender.phone}`} />
              {lender.assistantPhone && (
                <Field label={`Assistant (${lender.assistantName || "Asst."})`} value={lender.assistantPhone} link={`tel:${lender.assistantPhone}`} />
              )}
              <Field label="Broker Type" value={lender.brokerType} />
              <Field label="Min Loan" value={`$${(lender.minLoan / 1000000).toFixed(1)}M`} />
              <Field label="Max Loan" value={`$${(lender.maxLoan / 1000000).toFixed(1)}M`} />
            </div>
            {lender.notes && (
              <div style={{ marginTop: 16, background: C.bg, borderRadius: 2, padding: "12px 14px" }}>
                <div style={{ color: C.goldDark, fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>NOTES</div>
                <div style={{ color: C.charcoal, fontSize: 13, lineHeight: 1.6 }}>{lender.notes}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={e => { e.stopPropagation(); onEdit(lender); }} style={btnSmall}>EDIT</button>
              <button onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                style={{ ...btnSmall, background: C.dangerLight, color: C.danger, borderColor: "#f5c6c2" }}>
                DELETE
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <DeleteModal
          message={`Delete "${lender.bankName}"? This action cannot be undone.`}
          onConfirm={() => { onDelete(lender.id); setConfirmDelete(false); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

function Field({ label, value, link }) {
  return (
    <div>
      <div style={{ color: "#aaa", fontSize: 10, letterSpacing: 2, marginBottom: 3 }}>{label.toUpperCase()}</div>
      {link
        ? <a href={link} style={{ color: C.charcoal, fontSize: 13, textDecoration: "none", borderBottom: `1px solid ${C.gold}` }}>{value}</a>
        : <div style={{ color: C.charcoal, fontSize: 13 }}>{value}</div>}
    </div>
  );
}

// ── Lender List ───────────────────────────────────────────────
function LenderList({ lenders, category, location, onEdit, onDelete, onDeleteAll, onAdd, onBack }) {
  const [confirmAll, setConfirmAll] = useState(false);
  const filtered = lenders.filter(l =>
    l.category === category && (location === "All Locations" || l.location === location)
  );

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <Breadcrumb items={[category, location]} onNavigate={onBack} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ color: C.goldDark, fontSize: 11, letterSpacing: 4, marginBottom: 6 }}>{category.toUpperCase()}</div>
          <h2 style={{ color: C.charcoal, margin: 0, fontSize: 26, fontFamily: "Georgia, serif", fontWeight: "normal" }}>
            {location} <span style={{ color: "#aaa", fontSize: 16 }}>({filtered.length})</span>
          </h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {filtered.length > 0 && (
            <button onClick={() => setConfirmAll(true)} style={{
              padding: "10px 18px", background: C.dangerLight, border: `1px solid #f5c6c2`,
              borderRadius: 2, cursor: "pointer", fontSize: 11, letterSpacing: 2,
              color: C.danger, fontFamily: "Georgia, serif",
            }}>DELETE ALL</button>
          )}
          <button onClick={onAdd} style={btnPrimary}>+ ADD LENDER</button>
        </div>
      </div>

      {filtered.length === 0
        ? <div style={{ textAlign: "center", color: "#aaa", padding: "60px 0", fontSize: 14 }}>No lenders found. Add one!</div>
        : filtered.map(l => <LenderCard key={l.id} lender={l} onEdit={onEdit} onDelete={onDelete} />)
      }

      {/* Floating FAB — same as DELETE ALL */}
      <GlobalDeleteButton onClick={() => setConfirmAll(true)} />

      {confirmAll && (
        <DeleteModal
          message={`Delete all ${filtered.length} lender(s) in "${location}" under "${category}"? This cannot be undone.`}
          onConfirm={() => { onDeleteAll(filtered.map(l => l.id)); setConfirmAll(false); }}
          onCancel={() => setConfirmAll(false)}
        />
      )}
    </div>
  );
}

// ── Search ────────────────────────────────────────────────────
function SearchView({ lenders, onEdit, onDelete }) {
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [locFilter, setLocFilter] = useState("All Locations");

  const results = lenders.filter(l => {
    const qLow = q.toLowerCase();
    const match = !q || [l.bankName, l.contactName, l.email, l.phone,
      l.assistantPhone, l.assistantName, l.brokerType, l.notes, String(l.rate)]
      .some(f => (f || "").toLowerCase().includes(qLow));
    const catMatch = catFilter === "All" || l.category === catFilter;
    const locMatch = locFilter === "All Locations" || l.location === locFilter;
    return match && catMatch && locMatch;
  });

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ color: C.goldDark, fontSize: 11, letterSpacing: 4, marginBottom: 6 }}>LENDER SEARCH</div>
      <h2 style={{ color: C.charcoal, margin: "0 0 24px", fontSize: 26, fontFamily: "Georgia, serif", fontWeight: "normal" }}>
        Search All Lenders
      </h2>
      <div style={{ background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 2, padding: "20px", marginBottom: 24 }}>
        <input
          type="text" placeholder="Search by name, email, phone, broker type, notes, rate…"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ ...inputStyle, color: C.charcoal, background: C.bg, border: `1px solid ${C.ivoryDark}`, marginBottom: 12 }}
        />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={selectStyle}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={locFilter} onChange={e => setLocFilter(e.target.value)} style={selectStyle}>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div style={{ color: "#888", fontSize: 12, marginBottom: 16 }}>
        {results.length} result{results.length !== 1 ? "s" : ""}
      </div>
      {results.map(l => <LenderCard key={l.id} lender={l} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}
const selectStyle = {
  padding: "10px 14px", background: C.bg, border: `1px solid ${C.ivoryDark}`,
  borderRadius: 2, color: C.charcoal, fontSize: 13, fontFamily: "Georgia, serif", cursor: "pointer",
};

// ── Lender Form ───────────────────────────────────────────────
function LenderForm({ initial, defaultCategory, defaultLocation, onSave, onCancel }) {
  const [form, setForm] = useState(initial || {
    category: defaultCategory || "Permanent",
    location: defaultLocation === "All Locations" ? "" : (defaultLocation || ""),
    bankName: "", contactName: "", email: "", phone: "",
    assistantPhone: "", assistantName: "", brokerType: "Direct Lender",
    notes: "", rate: "", minLoan: "", maxLoan: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ padding: "32px 24px", maxWidth: 700, margin: "0 auto" }}>
      <h2 style={{ color: C.charcoal, margin: "0 0 28px", fontSize: 24, fontFamily: "Georgia, serif", fontWeight: "normal" }}>
        {initial ? "Edit Lender" : "Add New Lender"}
      </h2>
      <div style={{ background: "white", border: `1px solid ${C.ivoryDark}`, borderRadius: 2, padding: "28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <FormField label="Bank / Institution Name *" value={form.bankName} onChange={v => set("bankName", v)} span2 />
          <FormField label="Contact Name" value={form.contactName} onChange={v => set("contactName", v)} />
          <FormField label="Email" type="email" value={form.email} onChange={v => set("email", v)} />
          <FormField label="Phone" value={form.phone} onChange={v => set("phone", v)} />
          <FormField label="Assistant Name" value={form.assistantName} onChange={v => set("assistantName", v)} />
          <FormField label="Assistant Phone" value={form.assistantPhone} onChange={v => set("assistantPhone", v)} />
          <div>
            <div style={labelStyle}>Category *</div>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={labelStyle}>Broker Type</div>
            <select value={form.brokerType} onChange={e => set("brokerType", e.target.value)}
              style={{ ...selectStyle, width: "100%", boxSizing: "border-box" }}>
              {BROKER_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <FormField label="Location / State" value={form.location} onChange={v => set("location", v)} />
          <FormField label="Interest Rate (%)" type="number" step="0.01" value={form.rate} onChange={v => set("rate", v)} />
          <FormField label="Min Loan ($)" type="number" value={form.minLoan} onChange={v => set("minLoan", v)} />
          <FormField label="Max Loan ($)" type="number" value={form.maxLoan} onChange={v => set("maxLoan", v)} />
          <div style={{ gridColumn: "1/-1" }}>
            <div style={labelStyle}>Notes</div>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
              style={{ ...inputStyle, color: C.charcoal, background: C.bg, border: `1px solid ${C.ivoryDark}`, resize: "vertical", width: "100%", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={() => onSave(form)} style={btnPrimary}>{initial ? "SAVE CHANGES" : "ADD LENDER"}</button>
          <button onClick={onCancel} style={{ ...btnSmall, padding: "13px 20px" }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}
const labelStyle = { color: "#888", fontSize: 10, letterSpacing: 2, marginBottom: 6 };
function FormField({ label, value, onChange, type = "text", span2, step }) {
  return (
    <div style={span2 ? { gridColumn: "1/-1" } : {}}>
      <div style={labelStyle}>{label.toUpperCase()}</div>
      <input type={type} step={step} value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, color: C.charcoal, background: C.bg, border: `1px solid ${C.ivoryDark}`, width: "100%", boxSizing: "border-box" }} />
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ activeNav, onNavigate }) {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "categories", label: "Lenders", icon: "⊞" },
    { id: "search", label: "Search", icon: "⌕" },
  ];
  return (
    <nav style={{
      width: 200, background: "#111", borderRight: `1px solid ${C.goldDark}22`,
      minHeight: "calc(100vh - 64px)", padding: "24px 0",
      display: "flex", flexDirection: "column", gap: 4, flexShrink: 0,
    }}>
      {links.map(l => (
        <div key={l.id} onClick={() => onNavigate(l.id)} style={{
          padding: "12px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
          background: activeNav === l.id ? `${C.goldDark}22` : "transparent",
          borderLeft: activeNav === l.id ? `3px solid ${C.gold}` : "3px solid transparent",
          color: activeNav === l.id ? C.gold : "#888",
          transition: "all 0.15s", fontSize: 13, letterSpacing: 1,
        }}>
          <span style={{ fontSize: 16 }}>{l.icon}</span>
          <span>{l.label}</span>
        </div>
      ))}
    </nav>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [splash, setSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [lenders, setLenders] = useState(INITIAL_LENDERS);
  const [view, setView] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingLender, setEditingLender] = useState(null);
  const [formMode, setFormMode] = useState(null);

  const handleCategorySelect = (cat) => { setSelectedCategory(cat); setView("location"); };
  const handleLocationSelect = (loc) => { setSelectedLocation(loc); setView("lenders"); };
  const handleEdit = (lender) => { setEditingLender({ ...lender }); setFormMode("edit"); setView("form"); };
  const handleAdd = () => { setEditingLender(null); setFormMode("add"); setView("form"); };
  const handleDelete = (id) => setLenders(ls => ls.filter(l => l.id !== id));
  const handleDeleteAll = (ids) => setLenders(ls => ls.filter(l => !ids.includes(l.id)));
  const handleDeleteLocation = (category, location) => {
    setLenders(ls => ls.filter(l => {
      if (l.category !== category) return true;
      if (location === null) return false;
      return l.location !== location;
    }));
  };

  const handleSave = (form) => {
    if (!form.bankName) { alert("Bank name is required."); return; }
    const parsed = { ...form, rate: parseFloat(form.rate) || 0, minLoan: parseInt(form.minLoan) || 0, maxLoan: parseInt(form.maxLoan) || 0 };
    if (formMode === "edit") {
      setLenders(ls => ls.map(l => l.id === editingLender.id ? { ...parsed, id: editingLender.id } : l));
    } else {
      setLenders(ls => [...ls, { ...parsed, id: Date.now() }]);
      if (form.category !== selectedCategory) { setSelectedCategory(form.category); setSelectedLocation(form.location || "All Locations"); }
    }
    setView("lenders");
  };

  const activeNav = view === "dashboard" ? "dashboard" : view === "search" ? "search" : "categories";
  const navigate = (id) => {
    if (id === "dashboard") setView("dashboard");
    else if (id === "search") setView("search");
    else setView("categories");
  };

  if (splash) return <SplashScreen onEnter={() => setSplash(false)} />;
  if (!user) return <LoginScreen onLogin={setUser} />;

  const renderMain = () => {
    if (view === "form") return (
      <LenderForm initial={editingLender} defaultCategory={selectedCategory} defaultLocation={selectedLocation}
        onSave={handleSave} onCancel={() => setView("lenders")} />
    );
    if (view === "search") return <SearchView lenders={lenders} onEdit={handleEdit} onDelete={handleDelete} />;
    if (view === "lenders") return (
      <LenderList lenders={lenders} category={selectedCategory} location={selectedLocation}
        onEdit={handleEdit} onDelete={handleDelete} onDeleteAll={handleDeleteAll}
        onAdd={handleAdd} onBack={() => setView("location")} />
    );
    if (view === "location") return (
      <LocationSelect category={selectedCategory} lenders={lenders}
        onSelect={handleLocationSelect} onDeleteLocation={handleDeleteLocation} />
    );
    if (view === "categories") return <CategorySelect onSelect={handleCategorySelect} />;
    return <Dashboard lenders={lenders} onCategorySelect={handleCategorySelect} />;
  };

  return (
    <div style={{ fontFamily: "Georgia, serif", background: C.bg, minHeight: "100vh" }}>
      <Header user={user} onLogout={() => setUser(null)} onHome={() => setView("dashboard")} />
      <div style={{ display: "flex" }}>
        <Sidebar activeNav={activeNav} onNavigate={navigate} />
        <main style={{ flex: 1, overflowX: "auto" }}>{renderMain()}</main>
      </div>
    </div>
  );
      }
