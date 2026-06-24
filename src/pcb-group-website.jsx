import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ─────────────────────────────────────────────────────────────
// SUPABASE <-> APP FIELD MAPPING HELPERS
// DB columns are snake_case; the app's objects are camelCase.
// These convert both directions so the rest of the app code
// (forms, cards, etc.) never has to change.
// ─────────────────────────────────────────────────────────────
const toDbClient = c => ({
  id: c.id, full_name: c.fullName, phones: c.phones || [],
  emails: c.emails || [], address: c.address || "", notes: c.notes || "",
  created_at: c.createdAt || new Date().toISOString().slice(0, 10),
});
const fromDbClient = r => ({
  id: r.id, fullName: r.full_name, phones: r.phones || [],
  emails: r.emails || [], address: r.address || "", notes: r.notes || "",
  createdAt: r.created_at,
});

const toDbOrg = o => ({
  id: o.id, name: o.name, sponsor: o.sponsor || "", sponsor2: o.sponsor2 || "",
  office_contact: o.officeContact || "", mgmt_contact: o.mgmtContact || "",
  assistance: o.assistance || "", loan_officer: o.loanOfficer || "",
  address: o.address || "", entity_type: o.entityType || "LLC",
  phones: o.phones || [], emails: o.emails || [],
});
const fromDbOrg = r => ({
  id: r.id, name: r.name, sponsor: r.sponsor, sponsor2: r.sponsor2,
  officeContact: r.office_contact, mgmtContact: r.mgmt_contact,
  assistance: r.assistance, loanOfficer: r.loan_officer,
  address: r.address, entityType: r.entity_type,
  phones: r.phones || [], emails: r.emails || [],
});

const toDbDeal = d => ({
  id: d.id, contact_id: d.contactId || null, org_id: d.orgId || null,
  address: d.address || "", value: d.value || 0, closing_date: d.closingDate || "",
  created_by: d.createdBy || "", deal_type: d.dealType || "Regular",
  deal_stage: d.dealStage || "intake", payment_amount: d.paymentAmount || 0,
  visible_to: d.visibleTo || "all", notes: d.notes || "",
  created_at: d.createdAt || new Date().toISOString().slice(0, 10),
  deal_notes: d.dealNotes || [], deal_files: d.dealFiles || {},
  paid_workers: d.paidWorkers || {},
});
const fromDbDeal = r => ({
  id: r.id, contactId: r.contact_id, orgId: r.org_id,
  address: r.address, value: r.value, closingDate: r.closing_date,
  createdBy: r.created_by, dealType: r.deal_type, dealStage: r.deal_stage,
  paymentAmount: r.payment_amount, visibleTo: r.visible_to, notes: r.notes,
  createdAt: r.created_at, dealNotes: r.deal_notes || [],
  dealFiles: r.deal_files || { folders: [], rootFiles: [] },
  paidWorkers: r.paid_workers || {},
});

// ─────────────────────────────────────────────────────────────
// UPDATED LENDER CONVERTERS — Multi-phone/email support with simpler structure
// ─────────────────────────────────────────────────────────────
const toDbLender = l => ({
  id: l.id,
  name: l.name || "",
  category: l.category || "",
  location: l.location || "",
  email: l.email || "",
  emails: l.emails || [],
  phones: l.phones || [],
  lender_type: l.lenderType || "",
  notes: l.notes || "",
  rate: l.rate || 0,
  min_loan: l.minLoan || 0,
  max_loan: l.maxLoan || 0,
  address: l.address || "",
  city: l.city || "",
  created_by: l.createdBy || "",
  terms_file_name: l.termsFileName || "",
  terms_file_data: l.termsFileData || null,
  created_at: l.createdAt || new Date().toISOString().slice(0, 10),
});

const fromDbLender = r => ({
  id: r.id,
  name: r.name || "",
  category: r.category,
  location: r.location,
  email: r.email || "",
  emails: r.emails || [],
  phones: r.phones || [],
  lenderType: r.lender_type,
  notes: r.notes,
  rate: r.rate,
  minLoan: r.min_loan,
  maxLoan: r.max_loan,
  address: r.address || "",
  city: r.city || "",
  createdBy: r.created_by,
  termsFileName: r.terms_file_name,
  termsFileData: r.terms_file_data,
  createdAt: r.created_at,
});

const toDbWorker = w => ({
  id: w.id, name: w.name, email: w.email, password: w.password,
  role: w.role || "worker", commission: w.commission || "",
});
const fromDbWorker = r => ({ ...r });

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
// LENDER CATEGORIES / LOCATIONS — static config (not stored data)
// ─────────────────────────────────────────────────────────────
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
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      body { margin: 0; font-family: 'Georgia', serif; background: ${C.bg}; overflow-x: hidden; }
      input, select, textarea, button { font-family: 'Georgia', serif; }
      .btn-transition { transition: all 0.2s ease; }
      .anim-fade-up { animation: fadeUp 0.3s ease forwards; }
      .anim-fade-down { animation: fadeDown 0.3s ease forwards; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
      @media (max-width: 768px) {
        input, select, textarea, button { font-size: 16px !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
};

const inputStyle = {
  padding: "11px 14px", background: "white", border: `1.5px solid ${C.ivoryDark}`,
  borderRadius: 10, fontSize: 13, color: C.charcoal, outline: "none",
  transition: "border-color 0.2s",
};

const fieldLabel = {
  fontSize: 10, fontWeight: "bold", color: "#888", letterSpacing: 2, marginBottom: 6,
};

// ─────────────────────────────────────────────────────────────
// REUSABLE FORM COMPONENTS
// ─────────────────────────────────────────────────────────────
const FormField = ({ label, value, onChange, type = "text", required, span2, placeholder, textarea }) => (
  <div style={{ gridColumn: span2 ? "1/-1" : "auto" }}>
    <div style={fieldLabel}>{label} {required && <span style={{ color: C.danger }}>*</span>}</div>
    {textarea ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ ...inputStyle, minHeight: 100, fontFamily: "Georgia, serif", resize: "vertical" }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    )}
  </div>
);

const Modal = ({ onClose, maxWidth = 500, children }) => (
  <div onClick={onClose} style={{
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", zIndex: 1000,
  }}>
    <div onClick={e => e.stopPropagation()} style={{
      width: "100%", maxWidth, background: C.bg, borderRadius: "20px 20px 0 0",
      maxHeight: "90vh", overflowY: "auto",
    }}>
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// UPDATED LENDER FORM — With Multiple Phone Numbers & Emails
// ─────────────────────────────────────────────────────────────
function LenderForm({ initial, onSave, onCancel, currentUser }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name || "",
    category: initial.category || "Permanent",
    lenderType: initial.lenderType || "",
    location: initial.location || "",
    address: initial.address || "",
    city: initial.city || "",
    email: initial.email || "",
    emails: initial.emails || [],
    phones: initial.phones || [{ number: "", tag: "Work" }],
    rate: initial.rate || "",
    minLoan: initial.minLoan || "",
    maxLoan: initial.maxLoan || "",
    notes: initial.notes || "",
    termsFileName: initial.termsFileName || "",
    termsFileData: initial.termsFileData || null,
    createdBy: initial.createdBy || "",
    createdAt: initial.createdAt || "",
  } : {
    name: "",
    category: "Permanent",
    lenderType: getLenderTypes("Permanent")[0],
    location: "",
    address: "",
    city: "",
    email: "",
    emails: [],
    phones: [{ number: "", tag: "Work" }],
    rate: "",
    minLoan: "",
    maxLoan: "",
    notes: "",
    termsFileName: "",
    termsFileData: null,
    createdBy: currentUser?.name || "",
    createdAt: new Date().toISOString().slice(0, 10),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCategoryChange = newCat => {
    const types = getLenderTypes(newCat);
    setForm(f => ({ ...f, category: newCat, lenderType: types[0] }));
  };

  const addPhoneField = () => {
    setForm(f => ({ ...f, phones: [...f.phones, { number: "", tag: "Work" }] }));
  };

  const removePhoneField = idx => {
    setForm(f => ({ ...f, phones: f.phones.filter((_, i) => i !== idx) }));
  };

  const addEmailField = () => {
    setForm(f => ({ ...f, emails: [...f.emails, ""] }));
  };

  const removeEmailField = idx => {
    setForm(f => ({ ...f, emails: f.emails.filter((_, i) => i !== idx) }));
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.category) {
      alert("Name and Category are required");
      return;
    }
    onSave({ ...form, id: initial?.id });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginTop: 0, marginBottom: 20 }}>
        {initial ? "Edit Lender" : "Add New Lender"}
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <FormField label="Lender Name" value={form.name} onChange={v => set("name", v)} required />
        <FormField label="City" value={form.city} onChange={v => set("city", v)} />
        <FormField
          label="Category"
          value={form.category}
          onChange={handleCategoryChange}
        />
        <FormField
          label="Lender Type"
          value={form.lenderType}
          onChange={v => set("lenderType", v)}
        />
        <FormField label="Location" value={form.location} onChange={v => set("location", v)} />
        <FormField label="Address" value={form.address} onChange={v => set("address", v)} />
        
        {/* Phone Numbers */}
        <div style={{ gridColumn: "1/-1" }}>
          <div style={fieldLabel}>Phone Numbers</div>
          {form.phones.map((p, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <input
                type="tel"
                placeholder="Phone"
                value={p.number}
                onChange={e => {
                  const newPhones = [...form.phones];
                  newPhones[i].number = e.target.value;
                  set("phones", newPhones);
                }}
                style={{ ...inputStyle, flex: 1 }}
              />
              <select
                value={p.tag}
                onChange={e => {
                  const newPhones = [...form.phones];
                  newPhones[i].tag = e.target.value;
                  set("phones", newPhones);
                }}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option>Work</option>
                <option>Mobile</option>
                <option>Home</option>
              </select>
              {form.phones.length > 1 && (
                <button
                  onClick={() => removePhoneField(i)}
                  style={{
                    padding: "8px 12px", background: C.danger, color: "white",
                    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addPhoneField}
            style={{
              padding: "8px 14px", background: C.gold, color: "white", border: "none",
              borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold",
            }}
          >
            + Add Phone
          </button>
        </div>

        {/* Email Addresses */}
        <div style={{ gridColumn: "1/-1" }}>
          <div style={fieldLabel}>Email Addresses</div>
          {form.emails.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type="email"
                placeholder="Email"
                value={e}
                onChange={evt => {
                  const newEmails = [...form.emails];
                  newEmails[i] = evt.target.value;
                  set("emails", newEmails);
                }}
                style={{ ...inputStyle, flex: 1 }}
              />
              {form.emails.length > 1 && (
                <button
                  onClick={() => removeEmailField(i)}
                  style={{
                    padding: "8px 12px", background: C.danger, color: "white",
                    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addEmailField}
            style={{
              padding: "8px 14px", background: C.gold, color: "white", border: "none",
              borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold",
            }}
          >
            + Add Email
          </button>
        </div>

        <FormField label="Interest Rate (%)" value={form.rate} onChange={v => set("rate", v)} type="number" />
        <FormField label="Min Loan ($)" value={form.minLoan} onChange={v => set("minLoan", v)} type="number" />
        <FormField label="Max Loan ($)" value={form.maxLoan} onChange={v => set("maxLoan", v)} type="number" />
        <FormField label="Notes" value={form.notes} onChange={v => set("notes", v)} span2 textarea />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "10px 20px", background: C.ivoryDark, color: C.charcoal,
            border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px", background: C.gold, color: "white",
            border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold",
          }}
        >
          Save Lender
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LENDER LIST VIEW
// ─────────────────────────────────────────────────────────────
function LenderList({ lenders, category, location, onEdit, onDelete, onAdd, onBack }) {
  const filtered = lenders.filter(l => 
    (!category || l.category === category) &&
    (!location || location === "All Locations" || l.location === location)
  );

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <button onClick={onBack} style={{
          padding: "8px 12px", background: C.charcoal, color: "white",
          border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12,
        }}>← Back</button>
        <h2 style={{ margin: 0 }}>{category || "All"} Lenders</h2>
        <button onClick={onAdd} style={{
          marginLeft: "auto", padding: "8px 16px", background: C.gold, color: "white",
          border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold",
        }}>+ Add Lender</button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
          No lenders found
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map(l => (
            <div key={l.id} style={{
              background: "white", padding: "16px", borderRadius: 10,
              border: `1px solid ${C.ivory}`, cursor: "pointer",
              transition: "all 0.2s", _hover: { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div onClick={() => onEdit(l)} style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: "bold", color: C.charcoal }}>{l.name}</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    {l.category} • {l.location} • {l.city}
                  </div>
                  {l.phones && l.phones.length > 0 && (
                    <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
                      {l.phones.map((p, i) => <div key={i}>{p.tag}: {p.number}</div>)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDelete(l.id)}
                  style={{
                    padding: "6px 10px", background: C.danger, color: "white",
                    border: "none", borderRadius: 4, cursor: "pointer", fontSize: 11,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOCATION SELECT
// ─────────────────────────────────────────────────────────────
function LocationSelect({ category, lenders, onSelect, onAdd }) {
  const uniqueLocations = [...new Set(
    lenders.filter(l => !category || l.category === category).map(l => l.location || "Other")
  )].sort();

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: 20 }}>Select Location</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {uniqueLocations.map(loc => (
          <button
            key={loc}
            onClick={() => onSelect(loc)}
            style={{
              padding: "20px", background: "white", border: `2px solid ${C.ivory}`,
              borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: "bold",
              transition: "all 0.2s", color: C.charcoal,
            }}
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CATEGORY SELECT
// ─────────────────────────────────────────────────────────────
function CategorySelect({ onSelect }) {
  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: 20 }}>Select Lender Category</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            style={{
              padding: "20px", background: "white", border: `2px solid ${C.gold}`,
              borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: "bold",
              transition: "all 0.2s", color: C.charcoal,
            }}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CLIENTS VIEW (Placeholder)
// ─────────────────────────────────────────────────────────────
function ClientsView() {
  return <div style={{ padding: "20px" }}><h2>Clients Module - Coming Soon</h2></div>;
}

// ─────────────────────────────────────────────────────────────
// ORGS VIEW (Placeholder)
// ─────────────────────────────────────────────────────────────
function OrgsView() {
  return <div style={{ padding: "20px" }}><h2>Organizations Module - Coming Soon</h2></div>;
}

// ─────────────────────────────────────────────────────────────
// DEALS VIEW (Placeholder)
// ─────────────────────────────────────────────────────────────
function DealsView() {
  return <div style={{ padding: "20px" }}><h2>Deals Module - Coming Soon</h2></div>;
}

// ─────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (email && password) {
      onLogin({ name: email.split("@")[0], email, role: "user" });
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.charcoal, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "white", padding: "40px", borderRadius: 12,
        maxWidth: 300, width: "100%",
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 30 }}>PCB Group Login</h2>
        <div style={{ marginBottom: 14 }}>
          <div style={fieldLabel}>Email</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={fieldLabel}>Password</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>
        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: "12px", background: C.gold, color: "white",
            border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 13,
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [lenders, setLenders] = useState([]);
  const [view, setView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editingLender, setEditingLender] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  // Load lenders from Supabase
  useEffect(() => {
    if (!user) return;
    const loadLenders = async () => {
      const { data, error } = await supabase.from("lenders").select("*");
      if (!error && data) setLenders(data.map(fromDbLender));
    };
    loadLenders();
  }, [user]);

  const handleLenderAdd = () => {
    setEditingLender(null);
    setFormOpen(true);
  };

  const handleLenderEdit = (lender) => {
    setEditingLender(lender);
    setFormOpen(true);
  };

  const handleLenderSave = async (lender) => {
    const dbLender = toDbLender(lender);
    if (lender.id) {
      // Update
      const { error } = await supabase.from("lenders").update(dbLender).eq("id", lender.id);
      if (error) { alert(error.message); return; }
      setLenders(lenders.map(l => l.id === lender.id ? lender : l));
    } else {
      // Insert
      const { data, error } = await supabase.from("lenders").insert([dbLender]).select();
      if (error) { alert(error.message); return; }
      if (data) setLenders([...lenders, data[0] ? fromDbLender(data[0]) : lender]);
    }
    setFormOpen(false);
    setEditingLender(null);
  };

  const handleLenderDelete = async (id) => {
    if (!confirm("Delete this lender?")) return;
    const { error } = await supabase.from("lenders").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setLenders(lenders.filter(l => l.id !== id));
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setView("location");
  };

  const handleLocationSelect = (loc) => {
    setSelectedLocation(loc);
    setView("lenders");
  };

  if (!user) {
    return (
      <>
        <GlobalStyles />
        <LoginScreen onLogin={u => setUser(u)} />
      </>
    );
  }

  const renderMain = () => {
    switch (view) {
      case "categories":
        return <CategorySelect onSelect={handleCategorySelect} />;
      case "location":
        return <LocationSelect category={selectedCategory} lenders={lenders} onSelect={handleLocationSelect} onAdd={handleLenderAdd} />;
      case "lenders":
        return <LenderList lenders={lenders} category={selectedCategory} location={selectedLocation}
          onEdit={handleLenderEdit} onDelete={handleLenderDelete} onAdd={handleLenderAdd} onBack={() => setView("location")} />;
      case "clients":
        return <ClientsView />;
      case "orgs":
        return <OrgsView />;
      case "deals":
        return <DealsView />;
      default:
        return <CategorySelect onSelect={handleCategorySelect} />;
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ fontFamily: "Georgia, serif", background: C.bg, minHeight: "100vh", overflowX: "hidden" }}>
        <header style={{
          height: 58, background: C.charcoal, color: C.ivory, display: "flex",
          alignItems: "center", justifyContent: "space-between", padding: "0 20px", gap: 16,
        }}>
          <div style={{ fontSize: 16, fontWeight: "bold", letterSpacing: 2 }}>PCB GROUP</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12 }}>Hello, {user.name}</span>
            <button onClick={() => setUser(null)} style={{
              padding: "6px 12px", background: C.danger, color: "white", border: "none",
              borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: "bold",
            }}>Logout</button>
          </div>
        </header>

        <nav style={{
          background: "white", borderBottom: `1px solid ${C.ivory}`, padding: "12px 20px",
          display: "flex", gap: 20, overflowX: "auto",
        }}>
          {[
            { label: "Lenders", key: "categories" },
            { label: "Clients", key: "clients" },
            { label: "Orgs", key: "orgs" },
            { label: "Deals", key: "deals" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              style={{
                padding: "8px 16px", background: view === item.key || (view === "location" && item.key === "categories") || (view === "lenders" && item.key === "categories") ? C.goldDark : "transparent",
                color: view === item.key || (view === "location" && item.key === "categories") || (view === "lenders" && item.key === "categories") ? "white" : C.charcoal, border: "none",
                borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "bold",
                whiteSpace: "nowrap", transition: "all 0.2s",
              }}>
              {item.label}
            </button>
          ))}
        </nav>

        <main style={{ minHeight: "calc(100vh - 58px)", paddingBottom: 24, width: "100%", overflowX: "hidden" }}>
          {renderMain()}
        </main>

        {formOpen && (
          <Modal onClose={() => { setFormOpen(false); setEditingLender(null); }} maxWidth={640}>
            <LenderForm
              initial={editingLender}
              onSave={handleLenderSave}
              onCancel={() => { setFormOpen(false); setEditingLender(null); }}
              currentUser={user}
            />
          </Modal>
        )}
      </div>
    </>
  );
                                }
