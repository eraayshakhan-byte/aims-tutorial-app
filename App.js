import React, { useState, useEffect } from "react";

// ---------------- Theme ----------------
const C = {
  bg: "#0f172a",
  card: "#1e293b",
  border: "#334155",
  accent: "#38bdf8",
  ok: "#10b981",
  bad: "#991b1b",
  warn: "#f59e0b",
  text: "#e2e8f0",
  muted: "#94a3b8",
};

const s = {
  app: { width: "100%", minHeight: "100vh", margin: 0, padding: "16px", background: C.bg, color: C.text, fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", boxSizing: "border-box", display: "flex", flexDirection: "column", overflowY: "visible", overflowX: "hidden" },
  inner: { width: "100%", maxWidth: 1100, margin: "0 auto", flex: "1 0 auto" },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, width: "100%", boxSizing: "border-box" },
  input: { width: "100%", background: "#0b1222", border: `1px solid ${C.border}`, color: C.text, padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 15, boxSizing: "border-box" },
  button: { background: C.accent, color: "#04121c", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  secondary: { background: "transparent", border: `1px solid ${C.border}`, color: C.text, padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  row: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" },
  formRow: { display: "flex", flexWrap: "wrap", gap: 10 },
  formCol: { flex: "1 1 160px", minWidth: 130 },
  muted: { color: C.muted, fontSize: 13 },
  placeholder: { padding: "30px 10px", textAlign: "center", color: C.muted },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  studentRow: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "10px 0" },

  scrollRow: { display: "flex", gap: 8, overflowX: "auto", WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity", paddingBottom: 8, marginBottom: 8 },
  chip: (active) => ({
    flex: "0 0 auto", scrollSnapAlign: "start", padding: "10px 16px", borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer", fontSize: 13,
    border: `1px solid ${active ? C.accent : C.border}`, background: active ? C.accent : C.card, color: active ? "#04121c" : C.text, fontWeight: active ? 700 : 500,
  }),

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", gap: 10, width: "100%" },
  tile: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 8px", textAlign: "center", cursor: "pointer" },

  opt: (state) => ({
    display: "block", width: "100%", textAlign: "left", padding: 10, borderRadius: 8, marginBottom: 8, cursor: "pointer",
    background: state === "correct" ? "#062b20" : state === "wrong" ? "#3a0f0f" : state === "selected" ? "#0c2433" : "#0b1222",
    border: `1px solid ${state === "correct" ? C.ok : state === "wrong" ? C.bad : state === "selected" ? C.accent : C.border}`,
    color: C.text,
  }),
  badge: (color) => ({ display: "inline-block", padding: "3px 8px", borderRadius: 6, fontSize: 12, marginLeft: 6, background: color, color: color === C.warn ? "#04121c" : "#fff" }),

  toggleBtn: (active, activeColor) => ({
    padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, marginLeft: 8,
    border: `1px solid ${active ? activeColor : C.border}`, background: active ? activeColor : "transparent", color: active ? "#fff" : C.text,
  }),

  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 6px", borderBottom: `1px solid ${C.border}`, color: C.muted, fontWeight: 600, whiteSpace: "nowrap" },
  td: { padding: "8px 6px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" },
  tableWrap: { width: "100%", overflowX: "auto" },

  resourceCard: { background: "#152238", border: `1px solid ${C.border}`, borderRadius: 10, padding: 14, marginBottom: 10 },
  link: { color: C.accent, textDecoration: "none", fontWeight: 600 },
};

// ---------------- Helpers ----------------
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const keyFor = (cls, subject) => `\({cls}|\){subject}`;

const MOCK_USERS = [
  { email: "admin@aims.com", pass: "123", role: "admin", name: "Admin" },
  { email: "student@aims.com", pass: "123", role: "student", name: "Student", cls: "10" },
];

const CLASSES = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MATERIAL_TYPES = ["PDF", "Link", "Notes"];
const LIVE_PLATFORMS = ["Google Meet", "Zoom", "YouTube"];

function subjectsFor(cls) {
  const n = parseInt(cls, 10);
  if (n >= 11) return ["Informatics Practices", "Computer Science", "Physics", "Chemistry", "Maths"];
  if (n >= 5) return ["Science", "Social Science", "Sanskrit", "Hindi Grammar", "English Grammar", "Computer", "Maths"];
  return ["Maths", "English", "Hindi", "EVS"];
}

function authenticate(email, pass) {
  const e = email.trim().toLowerCase();
  const p = pass.trim();
  const mock = MOCK_USERS.find((u) => u.email.trim().toLowerCase() === e && u.pass.trim() === p);
  if (mock) return { email: mock.email, name: mock.name, role: mock.role, cls: mock.cls || null, rollId: null };
  const students = LS.get("aims_students", []);
  const st = students.find((u) => u.email.trim().toLowerCase() === e && u.password.trim() === p);
  if (st) return { email: st.email, name: st.name, role: "student", cls: st.cls, rollId: st.rollId };
  return null;
}

function parseQuiz(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length);
  const questions = [];
  let cur = null;
  const qRe = /^(?:Q\.?\s*\d+[.):]?|\d+[.)])\s*(.*)/i;
  const optRe = /^([A-D])[.)]\s*(.*)/i;
  const ansRe = /^(?:Answer|Ans)\s*[:\-]?\s*([A-D])/i;
  lines.forEach((line) => {
    let m;
    if ((m = line.match(qRe))) {
      cur = { text: m[1], options: {}, answer: null };
      questions.push(cur);
    } else if (cur && (m = line.match(optRe))) {
      cur.options[m[1].toUpperCase()] = m[2];
    } else if (cur && (m = line.match(ansRe))) {
      cur.answer = m[1].toUpperCase();
    } else if (cur) {
      cur.text += " " + line;
    }
  });
  return questions.filter((q) => q.text && Object.keys(q.options).length >= 2 && q.answer);
}

// ---------------- Global reset ----------------
function GlobalStyle() {
  return (
    
  );
}

// ---------------- Login ----------------
function LoginView({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    const u = authenticate(email, pass);
    if (!u) { setErr("Invalid credentials"); return; }
    onLogin(u);
  };
  return (
