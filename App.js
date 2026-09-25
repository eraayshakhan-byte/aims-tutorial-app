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
  app: { width: "100%", minHeight: "100vh", margin: 0, padding: "16px", background: C.bg, color: C.text, fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", boxSizing: "border-box", display: "flex", flexDirection: "column" },
  inner: { width: "100%", maxWidth: 1100, margin: "0 auto", flex: 1 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12, width: "100%", boxSizing: "border-box" },
  input: { width: "100%", background: "#0b1222", border: `1px solid ${C.border}`, color: C.text, padding: 10, borderRadius: 8, marginBottom: 10, fontSize: 15, boxSizing: "border-box" },
  button: { background: C.accent, color: "#04121c", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  secondary: { background: "transparent", border: `1px solid ${C.border}`, color: C.text, padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", gap: 10, width: "100%" },
  tile: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 8px", textAlign: "center", cursor: "pointer" },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 },
  row: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", justifyContent: "space-between" },
  formRow: { display: "flex", flexWrap: "wrap", gap: 10 },
  formCol: { flex: "1 1 160px", minWidth: 130 },
  tab: (active) => ({ padding: "8px 14px", borderRadius: 20, border: `1px solid ${active ? C.accent : C.border}`, background: active ? C.accent : "transparent", color: active ? "#04121c" : C.text, cursor: "pointer", fontSize: 13 }),
  opt: (state) => ({
    display: "block", width: "100%", textAlign: "left", padding: 10, borderRadius: 8, marginBottom: 8, cursor: "pointer",
    background: state === "correct" ? "#062b20" : state === "wrong" ? "#3a0f0f" : state === "selected" ? "#0c2433" : "#0b1222",
    border: `1px solid ${state === "correct" ? C.ok : state === "wrong" ? C.bad : state === "selected" ? C.accent : C.border}`,
    color: C.text,
  }),
  badge: (color) => ({ display: "inline-block", padding: "3px 8px", borderRadius: 6, fontSize: 12, marginLeft: 6, background: color, color: color === C.warn ? "#04121c" : "#fff" }),
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  muted: { color: C.muted, fontSize: 13 },
  placeholder: { padding: "30px 10px", textAlign: "center", color: C.muted },
  studentRow: { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, padding: "10px 0" },
};

// ---------------- Helpers ----------------
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// Admin credential + one legacy demo student (kept for quick testing)
const MOCK_USERS = [
  { email: "admin@aims.com", pass: "123", role: "admin", name: "Admin" },
  { email: "student@aims.com", pass: "123", role: "student", name: "Student", cls: "10" },
];

const CLASSES = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function subjectsFor(cls) {
  const n = parseInt(cls, 10);
  if (n >= 11) return ["Informatics Practices", "Computer Science", "Physics", "Chemistry", "Maths"];
  if (n >= 9) return ["Science", "Maths", "Social Science", "English", "Hindi"];
  return ["EVS", "Maths", "English", "Hindi"];
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
      html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100%; background: ${C.bg}; }
      * { box-sizing: border-box; }
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
        <p style={s.muted}>Admin: admin@aims.com / 123 · Demo student: student@aims.com / 123</p>
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

// ---------------- Class / Subject grids ----------------
function ClassGrid({ onPick }) {
  return (
    <div>
      <h2>Select Class</h2>
      <div style={s.grid}>
        {CLASSES.map((c) => (
          <div key={c} style={s.tile} onClick={() => onPick(c)}>Class {c}</div>
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

// ---------------- Quiz: Take (Student/Admin preview) ----------------
function TakeQuiz({ quiz, session, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

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
        <button style={s.button} onClick={() => setSubmitted(true)}>Submit</button>
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

function QuizzesTab({ cls, subject, session }) {
  const [active, setActive] = useState(null);
  const all = LS.get("aims_worksheets", []).filter((w) => w.cls === cls && w.subject === subject);

  if (active) return <TakeQuiz quiz={active} session={session} onBack={() => setActive(null)} />;

  if (!all.length) return <div style={{ ...s.card, ...s.placeholder }}>No quizzes published yet for this class/subject.</div>;

  return (
    <div>
      {all.map((w) => (
        <div key={w.id} style={s.card}>
          <h3>{w.title}</h3>
          <p style={s.muted}>{w.questions.length} questions</p>
          <button style={s.button} onClick={() => setActive(w)}>Take Quiz</button>
        </div>
      ))}
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

// ================= ATTENDANCE MANAGEMENT (Admin, main dashboard) =================
function AttendanceManagementPanel() {
  const [selClass, setSelClass] = useState(CLASSES[0]);
  const [selDate, setSelDate] = useState(new Date().toISOString().slice(0, 10));
  const [store, setStore] = useState(LS.get("aims_attendance", {}));

  const students = LS.get("aims_students", []).filter((st) => st.cls === selClass);
  const dayRecord = (store[selClass] && store[selClass][selDate]) || {};

  const mark = (email, status) => {
    const all = LS.get("aims_attendance", {});
    const clsData = all[selClass] || {};
    const dateData = { ...(clsData[selDate] || {}), [email]: status };
    all[selClass] = { ...clsData, [selDate]: dateData };
    LS.set("aims_attendance", all);
    setStore({ ...all });
  };

  return (
    <div>
      <div style={s.card}>
        <h3>Mark Attendance</h3>
        <div style={s.formRow}>
          <div style={s.formCol}>
            <label style={s.muted}>Class</label>
            <select style={s.input} value={selClass} onChange={(e) => setSelClass(e.target.value)}>
              {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div style={s.formCol}>
            <label style={s.muted}>Date</label>
            <input style={s.input} type="date" value={selDate} onChange={(e) => setSelDate(e.target.value)} />
          </div>
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
                  {status && <span style={s.badge(status === "Present" ? C.ok : C.bad)}>{status}</span>}
                </div>
                <div>
                  <button style={{ ...s.secondary, borderColor: C.ok }} onClick={() => mark(st.email, "Present")}>Present</button>
                  <button style={{ ...s.secondary, borderColor: C.bad, marginLeft: 8 }} onClick={() => mark(st.email, "Absent")}>Absent</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Student-facing read-only attendance history for their own class
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

// ================= FEE MANAGEMENT (Admin, main dashboard) =================
function computeFeeStatus(total, paid) {
  const t = parseFloat(total) || 0;
  const p = parseFloat(paid) || 0;
  if (p <= 0) return "Pending";
  if (p >= t && t > 0) return "Paid";
  return "Partial";
}

function FeeManagementPanel() {
  const [selClass, setSelClass] = useState(CLASSES[0]);
  const [selMonth, setSelMonth] = useState(MONTHS[new Date().getMonth()]);
  const [store, setStore] = useState(LS.get("aims_fees", {}));
  const [drafts, setDrafts] = useState({});

  const students = LS.get("aims_students", []).filter((st) => st.cls === selClass);
  const classData = store[selClass] || {};

  const getDraft = (email) => {
    if (drafts[email]) return drafts[email];
    const existing = (classData[email] && classData[email][selMonth]) || { total: "", paid: "" };
    return { total: existing.total ?? "", paid: existing.paid ?? "" };
  };

  const setDraft = (email, field, value) => {
    setDrafts({ ...drafts, [email]: { ...getDraft(email), [field]: value } });
  };

  const saveFee = (email) => {
    const d = getDraft(email);
    if (d.total === "" || d.paid === "") { alert("Enter total and paid amount."); return; }
    const total = parseFloat(d.total) || 0;
    const paid = parseFloat(d.paid) || 0;
    const due = Math.max(total - paid, 0);
    const status = computeFeeStatus(total, paid);
    const all = LS.get("aims_fees", {});
    const clsData = all[selClass] || {};
    const studentData = { ...(clsData[email] || {}), [selMonth]: { total, paid, due, status } };
    all[selClass] = { ...clsData, [email]: studentData };
    LS.set("aims_fees", all);
    setStore({ ...all });
  };

  return (
    <div>
      <div style={s.card}>
        <h3>Update Month-wise Fees</h3>
        <div style={s.formRow}>
          <div style={s.formCol}>
            <label style={s.muted}>Class</label>
            <select style={s.input} value={selClass} onChange={(e) => setSelClass(e.target.value)}>
              {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div style={s.formCol}>
            <label style={s.muted}>Month</label>
            <select style={s.input} value={selMonth} onChange={(e) => setSelMonth(e.target.value)}>
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {!students.length ? (
          <p style={s.muted}>No students registered in Class {selClass} yet.</p>
        ) : (
          students.map((st) => {
            const d = getDraft(st.email);
            const saved = classData[st.email] && classData[st.email][selMonth];
            return (
              <div key={st.id} style={{ ...s.card, background: "#152238" }}>
                <div style={s.row}>
                  <strong>{st.name}</strong>
                  {saved && (
                    <span>
                      <span style={s.badge(saved.status === "Paid" ? C.ok : saved.status === "Partial" ? C.warn : C.bad)}>{saved.status}</span>
                    </span>
                  )}
                </div>
                <div style={s.formRow}>
                  <div style={s.formCol}>
                    <input style={s.input} type="number" placeholder="Total Amount (₹)" value={d.total} onChange={(e) => setDraft(st.email, "total", e.target.value)} />
                  </div>
                  <div style={s.formCol}>
                    <input style={s.input} type="number" placeholder="Paid Amount (₹)" value={d.paid} onChange={(e) => setDraft(st.email, "paid", e.target.value)} />
                  </div>
                  <div style={s.formCol}>
                    <input style={s.input} disabled value={`Due: ₹${Math.max((parseFloat(d.total) || 0) - (parseFloat(d.paid) || 0), 0)}`} />
                  </div>
                </div>
                <button style={s.button} onClick={() => saveFee(st.email)}>Save {selMonth} Fee</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Student-facing read-only month-wise fee status for their own account
function FeeStatusCard({ session }) {
  const store = LS.get("aims_fees", {});
  const classData = store[session.cls] || {};
  const myRecords = classData[session.email] || {};
  const months = MONTHS.filter((m) => myRecords[m]);

  return (
    <div style={s.card}>
      <h3>My Fee Status</h3>
      {!months.length ? (
        <p style={s.muted}>No fee records yet.</p>
      ) : (
        months.map((m) => {
          const r = myRecords[m];
          return (
            <p key={m}>
              {m} — Total ₹{r.total}, Paid ₹{r.paid}, Due ₹{r.due}{" "}
              <span style={s.badge(r.status === "Paid" ? C.ok : r.status === "Partial" ? C.warn : C.bad)}>{r.status}</span>
            </p>
          );
        })
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
      <ClassGrid onPick={onPickClass} />
      <div style={{ marginTop: 8 }}>
        <div style={s.tabs}>
          {tabs.map((t) => (
            <div key={t.id} style={s.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</div>
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
      <div style={s.tabs}>
        {tabList.map((t) => (
          <div key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>{labels[t]}</div>
        ))}
      </div>
      {tab === "quizzes" && <QuizzesTab cls={cls} subject={subject} session={session} />}
      {tab === "create" && <CreateQuizTab cls={cls} subject={subject} />}
      {(tab === "material" || tab === "live") && (
        <div style={{ ...s.card, ...s.placeholder }}>{labels[tab]} module — coming soon in this panel.</div>
      )}
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

        {/* Admin-only main dashboard: Class grid + Student/Attendance/Fee management. Students never reach this view. */}
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
