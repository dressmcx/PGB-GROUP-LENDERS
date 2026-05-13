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
