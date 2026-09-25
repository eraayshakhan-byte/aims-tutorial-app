import React, { useState, useEffect } from "react";

// ---------------- Theme ----------------
const C = {
  bg: "#0f172a",
  card: "#1e293b",
  border: "#334155",
  accent: "#38bdf8",
  ok: "#10b981",
  bad: "#991b1b",
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
  formCol: { flex: "1 1 180px", minWidth: 140 },
  tab: (active) => ({ padding: "8px 14px", borderRadius: 20, border: `1px solid ${active ? C.accent : C.border}`, background: active ? C.accent : "transparent", color: active ? "#04121c" : C.text, cursor: "pointer", fontSize: 13 }),
  opt: (state) => ({
    display: "block", width: "100%", textAlign: "left", padding: 10, borderRadius: 8, marginBottom: 8, cursor: "pointer",
    background: state === "correct" ? "#062b20" : state === "wrong" ? "#3a0f0f" : state === "selected" ? "#0c2433" : "#0b1222",
    border: `1px solid ${state === "correct" ? C.ok : state === "wrong" ? C.bad : state === "selected" ? C.accent : C.border}`,
    color: C.text,
  }),
  badge: (ok) => ({ display: "inline-block", padding: "3px 8px", borderRadius: 6, fontSize: 12, marginLeft: 6, background: ok ? C.ok : C.bad, color: ok ? "#04120c" : "#fff" }),
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  muted: { color: C.muted, fontSize: 13 },
  placeholder: { padding: "30px 10px", textAlign: "center", color: C.muted },
};

// ---------------- Helpers ----------------
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const MOCK_USERS = [
  { email: "admin@aims.com", pass: "123", role: "admin", name: "Admin" },
  { email: "student@aims.com", pass: "123", role: "student", name: "Student", class: "10", subject: "Maths" },
];

const CLASSES = Array.from({ length: 12 }, (_, i) => String(i + 1));
function subjectsFor(cls) {
  const n = parseInt(cls, 10);
  if (n >= 11) return ["Informatics Practices", "Computer Science", "Physics", "Chemistry", "Maths"];
  if (n >= 9) return ["Science", "Maths", "Social Science", "English", "Hindi"];
  return ["EVS", "Maths", "English", "Hindi"];
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
    const u = MOCK_USERS.find((u) => u.email === email.trim() && u.pass === pass.trim());
    if (!u) { setErr("Invalid credentials"); return; }
    onLogin(u);
  };
  return (
    <div style={{ width: "100%", maxWidth: 380, margin: "auto", padding: "0 16px" }}>
      <div style={s.card}>
        <h2>AIMS Login</h2>
        <p style={s.muted}>Admin: admin@aims.com / 123 · Student: student@aims.com / 123</p>
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
      <div><strong>AIMS</strong> <span style={s.muted}>· {session.name} ({session.role})</span></div>
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

function SubjectGrid({ cls, onBack, onPick }) {
  return (
    <div>
      <button style={s.secondary} onClick={onBack}>← Back</button>
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

// ---------------- Attendance ----------------
function AttendanceTab({ cls, subject, session }) {
  const key = `${cls}|${subject}`;
  const [store, setStore] = useState(LS.get("aims_attendance", {}));
  const [name, setName] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const records = store[key] || [];

  const mark = (status) => {
    if (!name.trim()) { alert("Enter a student name."); return; }
    const all = LS.get("aims_attendance", {});
    const list = all[key] || [];
    const idx = list.findIndex((r) => r.name === name.trim() && r.date === today);
    if (idx >= 0) list[idx].status = status; else list.push({ name: name.trim(), date: today, status });
    all[key] = list;
    LS.set("aims_attendance", all);
    setStore({ ...all });
  };

  const visible = session.role === "admin" ? records : records.filter((r) => r.name.toLowerCase() === String(session.name).toLowerCase());

  return (
    <div>
      {session.role === "admin" && (
        <div style={s.card}>
          <h3>Mark Attendance — {today}</h3>
          <input style={s.input} placeholder="Student name" value={name} onChange={(e) => setName(e.target.value)} />
          <button style={s.button} onClick={() => mark("Present")}>Mark Present</button>
          <button style={{ ...s.secondary, marginLeft: 8 }} onClick={() => mark("Absent")}>Mark Absent</button>
        </div>
      )}
      <div style={s.card}>
        <h3>Attendance Records</h3>
        {!visible.length ? (
          <p style={s.muted}>No records yet.</p>
        ) : (
          [...visible].reverse().map((r, i) => (
            <p key={i}>{r.date} — {r.name} <span style={s.badge(r.status === "Present")}>{r.status}</span></p>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------- Fees ----------------
function FeesTab({ cls, subject, session }) {
  const key = `${cls}|${subject}`;
  const [store, setStore] = useState(LS.get("aims_fees", {}));
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Paid");
  const records = store[key] || [];

  const add = () => {
    if (!name.trim() || !amount) { alert("Enter name and amount."); return; }
    const all = LS.get("aims_fees", {});
    const list = all[key] || [];
    list.push({ name: name.trim(), amount, status, date: new Date().toISOString().slice(0, 10) });
    all[key] = list;
    LS.set("aims_fees", all);
    setStore({ ...all });
    setName(""); setAmount("");
  };

  const visible = session.role === "admin" ? records : records.filter((r) => r.name.toLowerCase() === String(session.name).toLowerCase());

  return (
    <div>
      {session.role === "admin" && (
        <div style={s.card}>
          <h3>Add Fee Record</h3>
          <input style={s.input} placeholder="Student name" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={s.input} placeholder="Amount (₹)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <select style={s.input} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Paid">Paid</option>
            <option value="Due">Due</option>
          </select>
          <button style={s.button} onClick={add}>Add Record</button>
        </div>
      )}
      <div style={s.card}>
        <h3>Fee Records</h3>
        {!visible.length ? (
          <p style={s.muted}>No records yet.</p>
        ) : (
          [...visible].reverse().map((r, i) => (
            <p key={i}>{r.date} — {r.name} — ₹{r.amount} <span style={s.badge(r.status === "Paid")}>{r.status}</span></p>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------- Student Management (Admin) ----------------
function StudentsTab() {
  const [students, setStudents] = useState(LS.get("aims_students", []));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cls, setCls] = useState(CLASSES[0]);
  const [rollId, setRollId] = useState("");

  const addStudent = () => {
    if (!name.trim() || !email.trim()) { alert("Enter name and email."); return; }
    const list = LS.get("aims_students", []);
    list.push({ id: Date.now(), name: name.trim(), email: email.trim(), cls, rollId: rollId.trim() || "-" });
    LS.set("aims_students", list);
    setStudents(list);
    setName(""); setEmail(""); setRollId("");
  };

  const removeStudent = (id) => {
    if (!window.confirm("Remove this student record?")) return;
    const list = LS.get("aims_students", []).filter((st) => st.id !== id);
    LS.set("aims_students", list);
    setStudents(list);
  };

  return (
    <div>
      <div style={s.card}>
        <h3>Register New Student</h3>
        <div style={s.formRow}>
          <div style={s.formCol}><input style={s.input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div style={s.formCol}><input style={s.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div style={s.formCol}>
            <select style={s.input} value={cls} onChange={(e) => setCls(e.target.value)}>
              {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div style={s.formCol}><input style={s.input} placeholder="Roll / ID" value={rollId} onChange={(e) => setRollId(e.target.value)} /></div>
        </div>
        <button style={s.button} onClick={addStudent}>Add Student</button>
      </div>

      <div style={s.card}>
        <h3>Registered Students ({students.length})</h3>
        {!students.length ? (
          <p style={s.muted}>No students registered yet.</p>
        ) : (
          students.map((st) => (
            <div key={st.id} style={{ ...s.row, borderBottom: `1px solid ${C.border}`, padding: "8px 0" }}>
              <div>
                <strong>{st.name}</strong> <span style={s.muted}>· {st.email} · Class {st.cls} · Roll {st.rollId}</span>
              </div>
              <button style={{ ...s.secondary, borderColor: C.bad, color: "#f87171" }} onClick={() => removeStudent(st.id)}>Remove</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------- Subject Dashboard ----------------
function SubjectDashboard({ cls, subject, session, onBack }) {
  const [tab, setTab] = useState("quizzes");
  const tabList = ["quizzes", ...(session.role === "admin" ? ["create", "students"] : []), "attendance", "fees", "material", "live"];
  const labels = { quizzes: "Quizzes", create: "Create Quiz (AI)", students: "Student Management", attendance: "Attendance", fees: "Fees", material: "Study Material", live: "Live Classes" };

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
      {tab === "students" && <StudentsTab />}
      {tab === "attendance" && <AttendanceTab cls={cls} subject={subject} session={session} />}
      {tab === "fees" && <FeesTab cls={cls} subject={subject} session={session} />}
      {(tab === "material" || tab === "live") && (
        <div style={{ ...s.card, ...s.placeholder }}>{labels[tab]} module — coming soon in this panel.</div>
      )}
    </div>
  );
}

// ---------------- Root App ----------------
export default function App() {
  const [session, setSession] = useState(() => LS.get("aims_session", null));
  const [view, setView] = useState("classes");
  const [cls, setCls] = useState(null);
  const [subject, setSubject] = useState(null);

  useEffect(() => { LS.set("aims_session", session); }, [session]);

  const logout = () => { setSession(null); setView("classes"); setCls(null); setSubject(null); };

  if (!session) {
    return (
      <div style={{ ...s.app, alignItems: "center", justifyContent: "center" }}>
        <GlobalStyle />
        <LoginView onLogin={setSession} />
      </div>
    );
  }

  return (
    <div style={s.app}>
      <GlobalStyle />
      <div style={s.inner}>
        <TopBar session={session} onLogout={logout} />
        {view === "classes" && (
          <ClassGrid onPick={(c) => { setCls(c); setView("subjects"); }} />
        )}
        {view === "subjects" && (
          <SubjectGrid cls={cls} onBack={() => setView("classes")} onPick={(sub) => { setSubject(sub); setView("dashboard"); }} />
        )}
        {view === "dashboard" && (
          <SubjectDashboard cls={cls} subject={subject} session={session} onBack={() => setView("subjects")} />
        )}
      </div>
    </div>
  );
}
