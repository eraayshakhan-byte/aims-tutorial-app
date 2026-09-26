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
  // No fixed/clipped heights here — minHeight only, and overflow left free so the
  // page can grow and scroll naturally on mobile.
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

  // Horizontal sliding nav (class chips / admin management tabs)
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
const keyFor = (cls, subject) => `${cls}|${subject}`;

// Admin credential + one legacy demo student (kept for quick testing, not shown on the login screen)
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

// Authenticate against admin/demo accounts first, then registered students
function authenticate(email, pass) {
  const e = email.trim();
  const p = pass.trim();
  const mock = MOCK_USERS.find((u) => u.email === e && u.pass === p);
  if (mock) return { email: mock.email, name: mock.name, role: mock.role, cls: mock.cls || null, rollId: null };
  const students = LS.get("aims_students", []);
  const st = students.find((u) => u.email === e && u.password === p);
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
    <style>{`
      html, body, #root {
        margin: 0; padding: 0; width: 100%;
        min-height: 100%;
        background: ${C.bg};
        overflow-x: hidden;
        overflow-y: auto; /* never clip vertical scrolling on mobile */
        -webkit-overflow-scrolling: touch;
      }
      * { box-sizing: border-box; }
      ::-webkit-scrollbar { height: 6px; }
      ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      @media (max-width: 480px) {
        .aims-grid-tile { padding: 12px 6px !important; font-size: 13px; }
      }
    `}</style>
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
    <div style={{ width: "100%", maxWidth: 380, margin: "auto", padding: "0 16px" }}>
      <div style={s.card}>
        <h2>AIMS Login</h2>
        <input style={s.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={s.input} placeholder="Password" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        {err && <p style={{ color: "#f87171", fontSize: 13 }}>{err}</p>}
        <button style={s.button} onClick={submit}>Log In</button>
      </div>
    </div>
  );
}

// ---------------- Top bar ----------------
function TopBar({ session, onLogout }) {
  return (
    <div style={s.topbar}>
      <div>
        <strong>AIMS</strong>{" "}
        <span style={s.muted}>
          · {session.name} ({session.role}{session.role === "student" ? ` · Class ${session.cls}` : ""})
        </span>
      </div>
      <button style={s.secondary} onClick={onLogout}>Logout</button>
    </div>
  );
}

// ---------------- Class selector: horizontal sliding chip menu ----------------
function ClassSlider({ selected, onPick }) {
  return (
    <div>
      <h2>Select Class</h2>
      <div style={s.scrollRow}>
        {CLASSES.map((c) => (
          <div key={c} style={s.chip(selected === c)} onClick={() => onPick(c)}>Class {c}</div>
        ))}
      </div>
    </div>
  );
}

function SubjectGrid({ cls, onBack, onPick, showBack }) {
  return (
    <div>
      {showBack && <button style={s.secondary} onClick={onBack}>← Back</button>}
      <h2>Class {cls} — Select Subject</h2>
      <div style={s.grid}>
        {subjectsFor(cls).map((sub) => (
          <div key={sub} style={s.tile} onClick={() => onPick(sub)}>{sub}</div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Quiz: Create (Admin) ----------------
function CreateQuizTab({ cls, subject }) {
  const [raw, setRaw] = useState("");
  const [title, setTitle] = useState("");
  const [parsed, setParsed] = useState([]);
  const [msg, setMsg] = useState("");

  const doParse = () => {
    const p = parseQuiz(raw);
    setParsed(p);
    setMsg(`${p.length} question(s) parsed. Answer key: ${p.map((q) => q.answer).join(", ")}`);
  };

  const publish = () => {
    if (!parsed.length) { alert("Parse the text first."); return; }
    if (!title.trim()) { alert("Enter a title."); return; }
    const all = LS.get("aims_worksheets", []);
    all.push({ id: Date.now(), cls, subject, title: title.trim(), questions: parsed });
    LS.set("aims_worksheets", all);
    alert("Worksheet published!");
    setRaw(""); setTitle(""); setParsed([]); setMsg("");
  };

  return (
    <div style={s.card}>
      <h3>Paste Gemini Q&A Text</h3>
      <textarea
        style={{ ...s.input, minHeight: 180 }}
        placeholder={"Q1. What is...\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: B"}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      <input style={s.input} placeholder="Worksheet Title / Topic" value={title} onChange={(e) => setTitle(e.target.value)} />
      {msg && <p style={s.muted}>{msg}</p>}
      <button style={s.secondary} onClick={doParse}>Preview / Parse</button>
      <button style={{ ...s.button, marginLeft: 8 }} onClick={publish}>Publish Worksheet</button>
    </div>
  );
}

// ---------------- Quiz: Take (Student/Admin preview) — saves a result on student submit ----------------
function TakeQuiz({ quiz, session, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    setSubmitted(true);
    if (session.role === "student") {
      const correct = quiz.questions.filter((q, i) => answers[i] === q.answer).length;
      const total = quiz.questions.length;
      const percentage = Math.round((100 * correct) / total);
      const results = LS.get("aims_quiz_results", []);
      results.push({
        id: Date.now(),
        studentEmail: session.email,
        studentName: session.name,
        rollId: session.rollId || "-",
        cls: quiz.cls,
        subject: quiz.subject,
        quizId: quiz.id,
        quizTitle: quiz.title,
        score: correct,
        total,
        percentage,
        submittedAt: new Date().toISOString(),
      });
      LS.set("aims_quiz_results", results);
    }
  };

  return (
    <div>
      <button style={s.secondary} onClick={onBack}>← All Quizzes</button>
      <h3>{quiz.title}</h3>
      {quiz.questions.map((q, i) => (
        <div key={i} style={s.card}>
          <p>{i + 1}. {q.text}</p>
          {Object.entries(q.options).map(([k, v]) => {
            const selected = answers[i] === k;
            let st = selected ? "selected" : "default";
            if (submitted) st = k === q.answer ? "correct" : selected ? "wrong" : "default";
            return (
              <button
                key={k}
                style={s.opt(st)}
                onClick={() => { if (!submitted) setAnswers({ ...answers, [i]: k }); }}
              >
                {k}) {v}
              </button>
            );
          })}
        </div>
      ))}
      {!submitted ? (
        <button style={s.button} onClick={submit}>Submit</button>
      ) : (
        <div style={s.card}>
          <h3>Score Card</h3>
          <p>
            Correct: {quiz.questions.filter((q, i) => answers[i] === q.answer).length} / {quiz.questions.length}{" "}
            ({Math.round((100 * quiz.questions.filter((q, i) => answers[i] === q.answer).length) / quiz.questions.length)}%)
          </p>
        </div>
      )}
    </div>
  );
}

// Admin-only: results / scorecard table for the current class + subject
function ScorecardPanel({ cls, subject }) {
  const results = LS.get("aims_quiz_results", [])
    .filter((r) => r.cls === cls && r.subject === subject)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  return (
    <div style={s.card}>
      <h3>Quiz Results — Class {cls} · {subject}</h3>
      {!results.length ? (
        <p style={s.muted}>No quiz attempts recorded yet.</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Student</th>
                <th style={s.th}>Roll No</th>
                <th style={s.th}>Quiz</th>
                <th style={s.th}>Score</th>
                <th style={s.th}>%</th>
                <th style={s.th}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td style={s.td}>{r.studentName}</td>
                  <td style={s.td}>{r.rollId}</td>
                  <td style={s.td}>{r.quizTitle}</td>
                  <td style={s.td}>{r.score} / {r.total}</td>
                  <td style={s.td}>{r.percentage}%</td>
                  <td style={s.td}>{new Date(r.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuizzesTab({ cls, subject, session }) {
  const [active, setActive] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const all = LS.get("aims_worksheets", []).filter((w) => w.cls === cls && w.subject === subject);

  if (active) return <TakeQuiz quiz={active} session={session} onBack={() => setActive(null)} />;

  return (
    <div>
      {session.role === "admin" && (
        <button style={{ ...s.secondary, marginBottom: 12 }} onClick={() => setShowResults(!showResults)}>
          {showResults ? "Hide" : "View"} Results / Scorecard
        </button>
      )}
      {showResults && <ScorecardPanel cls={cls} subject={subject} />}

      {!all.length ? (
        <div style={{ ...s.card, ...s.placeholder }}>No quizzes published yet for this class/subject.</div>
      ) : (
        all.map((w) => (
          <div key={w.id} style={s.card}>
            <h3>{w.title}</h3>
            <p style={s.muted}>{w.questions.length} questions</p>
            <button style={s.button} onClick={() => setActive(w)}>Take Quiz</button>
          </div>
        ))
      )}
    </div>
  );
}

// ================= STUDENT MANAGEMENT (Admin, main dashboard) =================
function StudentManagementPanel() {
  const [students, setStudents] = useState(LS.get("aims_students", []));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cls, setCls] = useState(CLASSES[0]);
  const [rollId, setRollId] = useState("");

  const addStudent = () => {
    if (!name.trim() || !email.trim() || !password.trim()) { alert("Enter name, email and password."); return; }
    const list = LS.get("aims_students", []);
    if (list.some((st) => st.email.toLowerCase() === email.trim().toLowerCase())) {
      alert("A student with this email is already registered.");
      return;
    }
    list.push({ id: Date.now(), name: name.trim(), email: email.trim(), password: password.trim(), cls, rollId: rollId.trim() || "-" });
    LS.set("aims_students", list);
    setStudents(list);
    setName(""); setEmail(""); setPassword(""); setRollId("");
  };

  const removeStudent = (id) => {
    if (!window.confirm("Remove this student's access? They will no longer be able to log in.")) return;
    const list = LS.get("aims_students", []).filter((st) => st.id !== id);
    LS.set("aims_students", list);
    setStudents(list);
  };

  return (
    <div>
      <div style={{ ...s.card, background: "#152238" }}>
        <h3>Register New Student</h3>
        <div style={s.formRow}>
          <div style={s.formCol}><input style={s.input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div style={s.formCol}><input style={s.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div style={s.formCol}><input style={s.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <div style={s.formCol}>
            <select style={s.input} value={cls} onChange={(e) => setCls(e.target.value)}>
              {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div style={s.formCol}><input style={s.input} placeholder="Roll / Student ID" value={rollId} onChange={(e) => setRollId(e.target.value)} /></div>
        </div>
        <button style={s.button} onClick={addStudent}>Add Student</button>
      </div>

      <div style={s.card}>
        <h3>Registered Students ({students.length})</h3>
        {!students.length ? (
          <p style={s.muted}>No students registered yet.</p>
        ) : (
          students.map((st) => (
            <div key={st.id} style={s.studentRow}>
              <div>
                <strong>{st.name}</strong>{" "}
                <span style={s.muted}>· {st.email} · Class {st.cls} · Roll {st.rollId}</span>
              </div>
              <button style={{ ...s.secondary, borderColor: C.bad, color: "#f87171" }} onClick={() => removeStudent(st.id)}>Delete Student</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ================= ATTENDANCE MANAGEMENT (Admin, main dashboard) — one-click, today's date =================
function AttendanceManagementPanel() {
  const [selClass, setSelClass] = useState(CLASSES[0]);
  const [store, setStore] = useState(LS.get("aims_attendance", {}));
  const today = todayStr();

  const students = LS.get("aims_students", []).filter((st) => st.cls === selClass);
  const dayRecord = (store[selClass] && store[selClass][today]) || {};

  const mark = (email, status) => {
    const all = LS.get("aims_attendance", {});
    const clsData = all[selClass] || {};
    const dateData = { ...(clsData[today] || {}), [email]: status };
    all[selClass] = { ...clsData, [today]: dateData };
    LS.set("aims_attendance", all);
    setStore({ ...all }); // instant refresh so the change reflects immediately
  };

  return (
    <div style={s.card}>
      <h3>Attendance Checklist — {today}</h3>
      <p style={s.muted}>Class:</p>
      <div style={s.scrollRow}>
        {CLASSES.map((c) => (
          <div key={c} style={s.chip(selClass === c)} onClick={() => setSelClass(c)}>Class {c}</div>
        ))}
      </div>

      {!students.length ? (
        <p style={s.muted}>No students registered in Class {selClass} yet.</p>
      ) : (
        students.map((st) => {
          const status = dayRecord[st.email];
          return (
            <div key={st.id} style={s.studentRow}>
              <div>
                <strong>{st.name}</strong> <span style={s.muted}>· Roll {st.rollId}</span>
              </div>
              <div>
                <button style={s.toggleBtn(status === "Present", C.ok)} onClick={() => mark(st.email, "Present")}>Present</button>
                <button style={s.toggleBtn(status === "Absent", C.bad)} onClick={() => mark(st.email, "Absent")}>Absent</button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// Student-facing read-only date-wise attendance list for their own class
function AttendanceHistoryCard({ session }) {
  const store = LS.get("aims_attendance", {});
  const clsData = store[session.cls] || {};
  const rows = Object.keys(clsData)
    .filter((date) => clsData[date][session.email])
    .map((date) => ({ date, status: clsData[date][session.email] }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div style={s.card}>
      <h3>My Attendance History</h3>
      {!rows.length ? (
        <p style={s.muted}>No attendance records yet.</p>
      ) : (
        rows.map((r, i) => (
          <p key={i}>{r.date} <span style={s.badge(r.status === "Present" ? C.ok : C.bad)}>{r.status}</span></p>
        ))
      )}
    </div>
  );
}

// ================= FEE MANAGEMENT (Admin, main dashboard) — month toggle + optional amount fields =================
function FeeManagementPanel() {
  const [selClass, setSelClass] = useState(CLASSES[0]);
  const [selMonth, setSelMonth] = useState(MONTHS[new Date().getMonth()]);
  const [store, setStore] = useState(LS.get("aims_fees", {}));
  const [drafts, setDrafts] = useState({});

  const students = LS.get("aims_students", []).filter((st) => st.cls === selClass);
  const monthRecord = (store[selClass] && store[selClass][selMonth]) || {};

  const getRecord = (email) => monthRecord[email] || { status: null, total: "", paid: "", due: "" };

  const getDraft = (email) => {
    if (drafts[email]) return drafts[email];
    const existing = getRecord(email);
    return { total: existing.total ?? "", paid: existing.paid ?? "" };
  };

  const setDraft = (email, field, value) => {
    setDrafts({ ...drafts, [email]: { ...getDraft(email), [field]: value } });
  };

  const writeRecord = (email, patch) => {
    const all = LS.get("aims_fees", {});
    const clsData = all[selClass] || {};
    const monthData = { ...(clsData[selMonth] || {}) };
    monthData[email] = { ...(monthData[email] || {}), ...patch };
    all[selClass] = { ...clsData, [selMonth]: monthData };
    LS.set("aims_fees", all);
    setStore({ ...all });
  };

  const markStatus = (email, status) => writeRecord(email, { status });

  const saveAmounts = (email) => {
    const d = getDraft(email);
    const total = d.total === "" ? undefined : parseFloat(d.total) || 0;
    const paid = d.paid === "" ? undefined : parseFloat(d.paid) || 0;
    const due = total !== undefined && paid !== undefined ? Math.max(total - paid, 0) : undefined;
    const patch = {};
    if (total !== undefined) patch.total = total;
    if (paid !== undefined) patch.paid = paid;
    if (due !== undefined) patch.due = due;
    if (!Object.keys(patch).length) { alert("Enter total and/or paid amount."); return; }
    writeRecord(email, patch);
  };

  return (
    <div style={s.card}>
      <h3>Fee Status — {selMonth}</h3>
      <p style={s.muted}>Class:</p>
      <div style={s.scrollRow}>
        {CLASSES.map((c) => (
          <div key={c} style={s.chip(selClass === c)} onClick={() => setSelClass(c)}>Class {c}</div>
        ))}
      </div>
      <p style={s.muted}>Month:</p>
      <div style={s.scrollRow}>
        {MONTHS.map((m) => (
          <div key={m} style={s.chip(selMonth === m)} onClick={() => setSelMonth(m)}>{m}</div>
        ))}
      </div>

      {!students.length ? (
        <p style={s.muted}>No students registered in Class {selClass} yet.</p>
      ) : (
        students.map((st) => {
          const rec = getRecord(st.email);
          const d = getDraft(st.email);
          return (
            <div key={st.id} style={{ ...s.card, background: "#152238" }}>
              <div style={s.row}>
                <div>
                  <strong>{st.name}</strong> <span style={s.muted}>· Roll {st.rollId}</span>
                </div>
                <div>
                  <button style={s.toggleBtn(rec.status === "Paid", C.ok)} onClick={() => markStatus(st.email, "Paid")}>Paid</button>
                  <button style={s.toggleBtn(rec.status === "Due", C.warn)} onClick={() => markStatus(st.email, "Due")}>Due</button>
                </div>
              </div>
              {rec.total !== undefined && (
                <p style={s.muted}>Total ₹{rec.total} · Paid ₹{rec.paid ?? 0} · Balance Due ₹{rec.due ?? 0}</p>
              )}
              <div style={s.formRow}>
                <div style={s.formCol}>
                  <input style={s.input} type="number" placeholder="Total Fee Amount (₹)" value={d.total} onChange={(e) => setDraft(st.email, "total", e.target.value)} />
                </div>
                <div style={s.formCol}>
                  <input style={s.input} type="number" placeholder="Amount Paid (₹)" value={d.paid} onChange={(e) => setDraft(st.email, "paid", e.target.value)} />
                </div>
                <div style={s.formCol}>
                  <input style={s.input} disabled value={`Balance Due: ₹${Math.max((parseFloat(d.total) || 0) - (parseFloat(d.paid) || 0), 0)}`} />
                </div>
              </div>
              <button style={s.secondary} onClick={() => saveAmounts(st.email)}>Save Amounts</button>
            </div>
          );
        })
      )}
    </div>
  );
}

// Student-facing read-only month-wise fee status for their own account
function FeeStatusCard({ session }) {
  const store = LS.get("aims_fees", {});
  const clsData = store[session.cls] || {};
  const rows = MONTHS
    .filter((m) => clsData[m] && clsData[m][session.email])
    .map((m) => ({ month: m, ...clsData[m][session.email] }));

  return (
    <div style={s.card}>
      <h3>My Fee Status</h3>
      {!rows.length ? (
        <p style={s.muted}>No fee records yet.</p>
      ) : (
        rows.map((r) => (
          <div key={r.month} style={{ marginBottom: 8 }}>
            <p style={{ margin: "4px 0" }}>
              {r.month} {r.status && <span style={s.badge(r.status === "Paid" ? C.ok : C.warn)}>{r.status}</span>}
            </p>
            {r.total !== undefined && (
              <p style={{ ...s.muted, margin: "0 0 6px" }}>Total ₹{r.total} · Paid ₹{r.paid ?? 0} · Balance Due ₹{r.due ?? 0}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ================= STUDY MATERIAL (per Class + Subject) =================
function StudyMaterialTab({ cls, subject, session }) {
  const key = keyFor(cls, subject);
  const [store, setStore] = useState(LS.get("aims_study_materials", {}));
  const [title, setTitle] = useState("");
  const [type, setType] = useState(MATERIAL_TYPES[0]);
  const [detail, setDetail] = useState("");

  const items = store[key] || [];

  const addMaterial = () => {
    if (!title.trim() || !detail.trim()) { alert("Enter a title and a URL / description."); return; }
    const all = LS.get("aims_study_materials", {});
    const list = all[key] || [];
    list.push({ id: Date.now(), title: title.trim(), type, detail: detail.trim(), addedAt: new Date().toISOString() });
    all[key] = list;
    LS.set("aims_study_materials", all);
    setStore({ ...all });
    setTitle(""); setDetail("");
  };

  const removeMaterial = (id) => {
    if (!window.confirm("Remove this study material?")) return;
    const all = LS.get("aims_study_materials", {});
    all[key] = (all[key] || []).filter((m) => m.id !== id);
    LS.set("aims_study_materials", all);
    setStore({ ...all });
  };

  const looksLikeUrl = (v) => /^https?:\/\//i.test(v.trim());

  return (
    <div>
      {session.role === "admin" && (
        <div style={s.card}>
          <h3>Share Study Material</h3>
          <div style={s.formRow}>
            <div style={s.formCol}>
              <input style={s.input} placeholder="Resource Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div style={s.formCol}>
              <select style={s.input} value={type} onChange={(e) => setType(e.target.value)}>
                {MATERIAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <input
            style={s.input}
            placeholder={type === "Notes" ? "Notes / description" : "URL / Link"}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
          <button style={s.button} onClick={addMaterial}>Publish Material</button>
        </div>
      )}

      <h3>Study Material</h3>
      {!items.length ? (
        <p style={s.muted}>No study material published yet for this subject.</p>
      ) : (
        [...items].reverse().map((m) => (
          <div key={m.id} style={s.resourceCard}>
            <div style={s.row}>
              <strong>{m.title}</strong>
              <span style={s.badge(C.accent)}>{m.type}</span>
            </div>
            {looksLikeUrl(m.detail) ? (
              <p style={{ margin: "6px 0 0" }}>
                <a href={m.detail} target="_blank" rel="noopener noreferrer" style={s.link}>View / Download →</a>
              </p>
            ) : (
              <p style={{ ...s.muted, margin: "6px 0 0" }}>{m.detail}</p>
            )}
            {session.role === "admin" && (
              <button style={{ ...s.secondary, marginTop: 10, borderColor: C.bad, color: "#f87171" }} onClick={() => removeMaterial(m.id)}>Remove</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ================= LIVE CLASSES (per Class + Subject) =================
function LiveClassesTab({ cls, subject, session }) {
  const key = keyFor(cls, subject);
  const [store, setStore] = useState(LS.get("aims_live_classes", {}));
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState(LIVE_PLATFORMS[0]);
  const [link, setLink] = useState("");
  const [when, setWhen] = useState("");

  const items = store[key] || [];

  const addClass = () => {
    if (!title.trim() || !link.trim() || !when) { alert("Enter a title, link and date/time."); return; }
    const all = LS.get("aims_live_classes", {});
    const list = all[key] || [];
    list.push({ id: Date.now(), title: title.trim(), platform, link: link.trim(), when });
    all[key] = list;
    LS.set("aims_live_classes", all);
    setStore({ ...all });
    setTitle(""); setLink(""); setWhen("");
  };

  const removeClass = (id) => {
    if (!window.confirm("Remove this live class?")) return;
    const all = LS.get("aims_live_classes", {});
    all[key] = (all[key] || []).filter((c) => c.id !== id);
    LS.set("aims_live_classes", all);
    setStore({ ...all });
  };

  const sorted = [...items].sort((a, b) => (a.when < b.when ? -1 : 1));

  return (
    <div>
      {session.role === "admin" && (
        <div style={s.card}>
          <h3>Post a Live Class</h3>
          <div style={s.formRow}>
            <div style={s.formCol}>
              <input style={s.input} placeholder="Class Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div style={s.formCol}>
              <select style={s.input} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {LIVE_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={s.formRow}>
            <div style={s.formCol}>
              <input style={s.input} placeholder="Meeting / Video Link" value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <div style={s.formCol}>
              <input style={s.input} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
          </div>
          <button style={s.button} onClick={addClass}>Post Live Class</button>
        </div>
      )}

      <h3>Live Classes</h3>
      {!sorted.length ? (
        <p style={s.muted}>No live classes scheduled yet for this subject.</p>
      ) : (
        sorted.map((c) => (
          <div key={c.id} style={s.resourceCard}>
            <div style={s.row}>
              <strong>{c.title}</strong>
              <span style={s.badge(C.accent)}>{c.platform}</span>
            </div>
            <p style={{ ...s.muted, margin: "6px 0" }}>{new Date(c.when).toLocaleString()}</p>
            <a href={c.link} target="_blank" rel="noopener noreferrer" style={s.link}>Join Class →</a>
            {session.role === "admin" && (
              <div>
                <button style={{ ...s.secondary, marginTop: 10, borderColor: C.bad, color: "#f87171" }} onClick={() => removeClass(c.id)}>Remove</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ================= Admin Main Dashboard =================
function AdminDashboard({ onPickClass }) {
  const [tab, setTab] = useState("students");
  const tabs = [
    { id: "students", label: "Student Management" },
    { id: "attendance", label: "Attendance Management" },
    { id: "fees", label: "Fee Management" },
  ];
  return (
    <div>
      <ClassSlider selected={null} onPick={onPickClass} />
      <div style={{ marginTop: 8 }}>
        <div style={s.scrollRow}>
          {tabs.map((t) => (
            <div key={t.id} style={s.chip(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</div>
          ))}
        </div>
        {tab === "students" && <StudentManagementPanel />}
        {tab === "attendance" && <AttendanceManagementPanel />}
        {tab === "fees" && <FeeManagementPanel />}
      </div>
    </div>
  );
}

// ================= Student Dashboard (subject grid + own attendance/fees) =================
function StudentDashboard({ session, onPickSubject }) {
  return (
    <div>
      <SubjectGrid cls={session.cls} showBack={false} onPick={onPickSubject} />
      <AttendanceHistoryCard session={session} />
      <FeeStatusCard session={session} />
    </div>
  );
}

// ---------------- Subject Dashboard (Class > Subject) ----------------
function SubjectDashboard({ cls, subject, session, onBack }) {
  const [tab, setTab] = useState("quizzes");
  const tabList = ["quizzes", ...(session.role === "admin" ? ["create"] : []), "material", "live"];
  const labels = { quizzes: "Quizzes", create: "Create Quiz (AI)", material: "Study Material", live: "Live Classes" };

  return (
    <div>
      <button style={s.secondary} onClick={onBack}>← Back</button>
      <h2>Class {cls} · {subject}</h2>
      <div style={s.scrollRow}>
        {tabList.map((t) => (
          <div key={t} style={s.chip(tab === t)} onClick={() => setTab(t)}>{labels[t]}</div>
        ))}
      </div>
      {tab === "quizzes" && <QuizzesTab cls={cls} subject={subject} session={session} />}
      {tab === "create" && <CreateQuizTab cls={cls} subject={subject} />}
      {tab === "material" && <StudyMaterialTab cls={cls} subject={subject} session={session} />}
      {tab === "live" && <LiveClassesTab cls={cls} subject={subject} session={session} />}
    </div>
  );
}

// ---------------- Root App ----------------
export default function App() {
  const storedSession = LS.get("aims_session", null);
  const isStudentSession = storedSession && storedSession.role === "student";

  const [session, setSession] = useState(storedSession);
  // Students skip class selection entirely and land directly on their own class's dashboard
  const [view, setView] = useState(isStudentSession ? "subjects" : "classes");
  const [cls, setCls] = useState(isStudentSession ? storedSession.cls : null);
  const [subject, setSubject] = useState(null);

  useEffect(() => { LS.set("aims_session", session); }, [session]);

  const handleLogin = (u) => {
    setSession(u);
    if (u.role === "student") {
      setView("subjects");
      setCls(u.cls);
    } else {
      setView("classes");
      setCls(null);
    }
    setSubject(null);
  };

  const logout = () => {
    setSession(null);
    setView("classes");
    setCls(null);
    setSubject(null);
  };

  if (!session) {
    return (
      <div style={{ ...s.app, alignItems: "center", justifyContent: "center" }}>
        <GlobalStyle />
        <LoginView onLogin={handleLogin} />
      </div>
    );
  }

  const isAdmin = session.role === "admin";

  return (
    <div style={s.app}>
      <GlobalStyle />
      <div style={s.inner}>
        <TopBar session={session} onLogout={logout} />

        {/* Admin-only main dashboard: Class slider + Student/Attendance/Fee management. Students never reach this view. */}
        {view === "classes" && isAdmin && (
          <AdminDashboard onPickClass={(c) => { setCls(c); setView("subjects"); }} />
        )}

        {view === "subjects" && isAdmin && (
          <SubjectGrid
            cls={cls}
            showBack={true}
            onBack={() => setView("classes")}
            onPick={(sub) => { setSubject(sub); setView("dashboard"); }}
          />
        )}

        {/* Students are locked to their own class: subject grid + their own attendance/fee cards only */}
        {view === "subjects" && !isAdmin && (
          <StudentDashboard
            session={session}
            onPickSubject={(sub) => { setSubject(sub); setView("dashboard"); }}
          />
        )}

        {view === "dashboard" && (
          <SubjectDashboard
            cls={cls}
            subject={subject}
            session={session}
            onBack={() => setView("subjects")}
          />
        )}
      </div>
    </div>
  );
}
