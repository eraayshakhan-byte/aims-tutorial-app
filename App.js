import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection, query, where, onSnapshot,
  doc, getDoc, setDoc, addDoc, deleteDoc,
} from "firebase/firestore";
import { auth, db, ADMIN_EMAIL, createStudentAuthAccount } from "./firebase";

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
  // No fixed/clipped heights — minHeight only, overflow left free so the page scrolls naturally on mobile.
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
// Local (device) date as YYYY-MM-DD — avoids the UTC off-by-one that toISOString() causes in India.
const todayStr = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

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

const sortStudents = (a, b) => (parseInt(a.cls, 10) - parseInt(b.cls, 10)) || String(a.name).localeCompare(String(b.name));

const fail = (e) => {
  console.error(e);
  alert("Action failed: " + (e && e.message ? e.message : e));
};

function authMessage(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Invalid credentials";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    default:
      return "Login failed. Please try again.";
  }
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

// ---------------- Firestore real-time hook ----------------
// Subscribes to a collection with equality filters: filters = [["cls","==","10"], ...]
// Pass filters = null to skip. Returns live { docs, loading } that update on every change.
function useCollection(name, filters) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(filters);

  useEffect(() => {
    if (!filters) { setDocs([]); setLoading(false); return undefined; }
    setLoading(true);
    const q = query(collection(db, name), ...filters.map(([f, op, v]) => where(f, op, v)));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error(`Firestore listener error (${name}):`, err);
        setLoading(false);
      }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key]);

  return { docs, loading };
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
        overflow-y: auto;
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

// ---------------- Login (Firebase Authentication) ----------------
function LoginView({ authError, clearAuthError }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !pass.trim()) { setErr("Enter email and password"); return; }
    setBusy(true);
    setErr("");
    clearAuthError();
    try {
      // Email is trimmed + lowercased; session is then picked up by onAuthStateChanged in <App />.
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass.trim());
    } catch (e) {
      setErr(authMessage(e.code));
    }
    setBusy(false);
  };

  return (
    <div style={{ width: "100%", maxWidth: 380, margin: "auto", padding: "0 16px" }}>
      <div style={s.card}>
        <h2>AIMS Login</h2>
        <input style={s.input} placeholder="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          style={s.input}
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
        {(err || authError) && <p style={{ color: "#f87171", fontSize: 13 }}>{err || authError}</p>}
        <button style={{ ...s.button, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={submit}>
          {busy ? "Signing in…" : "Log In"}
        </button>
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

// ---------------- Quiz: Create (Admin) → Firestore `worksheets` ----------------
function CreateQuizTab({ cls, subject }) {
  const [raw, setRaw] = useState("");
  const [title, setTitle] = useState("");
  const [parsed, setParsed] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const doParse = () => {
    const p = parseQuiz(raw);
    setParsed(p);
    setMsg(`${p.length} question(s) parsed. Answer key: ${p.map((q) => q.answer).join(", ")}`);
  };

  const publish = async () => {
    if (!parsed.length) { alert("Parse the text first."); return; }
    if (!title.trim()) { alert("Enter a title."); return; }
    setBusy(true);
    try {
      await addDoc(collection(db, "worksheets"), {
        cls, subject, title: title.trim(), questions: parsed, createdAt: new Date().toISOString(),
      });
      alert("Worksheet published!");
      setRaw(""); setTitle(""); setParsed([]); setMsg("");
    } catch (e) { fail(e); }
    setBusy(false);
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
      <button style={{ ...s.button, marginLeft: 8, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={publish}>Publish Worksheet</button>
    </div>
  );
}

// ---------------- Quiz: Take → saves attempt to Firestore `quiz_results` ----------------
function TakeQuiz({ quiz, session, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    setSubmitted(true);
    if (session.role === "student") {
      const correct = quiz.questions.filter((q, i) => answers[i] === q.answer).length;
      const total = quiz.questions.length;
      const percentage = Math.round((100 * correct) / total);
      try {
        await addDoc(collection(db, "quiz_results"), {
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
      } catch (e) { fail(e); }
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

// Admin-only: live results / scorecard table for the current class + subject
function ScorecardPanel({ cls, subject }) {
  const { docs, loading } = useCollection("quiz_results", [["cls", "==", cls], ["subject", "==", subject]]);
  const results = [...docs].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

  return (
    <div style={s.card}>
      <h3>Quiz Results — Class {cls} · {subject}</h3>
      {loading ? (
        <p style={s.muted}>Loading…</p>
      ) : !results.length ? (
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
  const { docs, loading } = useCollection("worksheets", [["cls", "==", cls], ["subject", "==", subject]]);
  const all = [...docs].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (active) return <TakeQuiz quiz={active} session={session} onBack={() => setActive(null)} />;

  return (
    <div>
      {session.role === "admin" && (
        <button style={{ ...s.secondary, marginBottom: 12 }} onClick={() => setShowResults(!showResults)}>
          {showResults ? "Hide" : "View"} Results / Scorecard
        </button>
      )}
      {showResults && <ScorecardPanel cls={cls} subject={subject} />}

      {loading ? (
        <p style={s.muted}>Loading quizzes…</p>
      ) : !all.length ? (
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

// ================= STUDENT MANAGEMENT (Admin) → Auth account + Firestore `students` =================
function StudentManagementPanel() {
  const { docs, loading } = useCollection("students", []);
  const students = [...docs].sort(sortStudents);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cls, setCls] = useState(CLASSES[0]);
  const [rollId, setRollId] = useState("");
  const [busy, setBusy] = useState(false);

  const addStudent = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) { alert("Enter name, email and password."); return; }
    if (password.trim().length < 6) { alert("Password must be at least 6 characters (Firebase requirement)."); return; }
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === ADMIN_EMAIL) { alert("This email is reserved for the admin account."); return; }

    setBusy(true);
    try {
      const existing = await getDoc(doc(db, "students", normalizedEmail));
      if (existing.exists()) {
        alert("A student with this email is already registered.");
      } else {
        // 1) Create the Firebase login (secondary app → admin stays signed in)
        await createStudentAuthAccount(normalizedEmail, password.trim());
        // 2) Save the profile. Doc ID = lowercase email. Password is NEVER stored in Firestore.
        await setDoc(doc(db, "students", normalizedEmail), {
          name: name.trim(),
          email: normalizedEmail,
          cls,
          rollId: rollId.trim() || "-",
          createdAt: new Date().toISOString(),
        });
        setName(""); setEmail(""); setPassword(""); setRollId("");
      }
    } catch (e) {
      if (e.code === "auth/invalid-credential" || e.code === "auth/wrong-password") {
        alert("This email already has a login with a different password. Delete that user in Firebase Console → Authentication, then register again.");
      } else if (e.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (e.code === "auth/weak-password") {
        alert("Password is too weak. Use at least 6 characters.");
      } else {
        fail(e);
      }
    }
    setBusy(false);
  };

  const removeStudent = async (st) => {
    if (!window.confirm(`Remove ${st.name}? They will be logged out and can no longer access the app.`)) return;
    try {
      await deleteDoc(doc(db, "students", st.id));
    } catch (e) { fail(e); }
  };

  return (
    <div>
      <div style={{ ...s.card, background: "#152238" }}>
        <h3>Register New Student</h3>
        <div style={s.formRow}>
          <div style={s.formCol}><input style={s.input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div style={s.formCol}><input style={s.input} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div style={s.formCol}><input style={s.input} placeholder="Password (min 6 chars)" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <div style={s.formCol}>
            <select style={s.input} value={cls} onChange={(e) => setCls(e.target.value)}>
              {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div style={s.formCol}><input style={s.input} placeholder="Roll / Student ID" value={rollId} onChange={(e) => setRollId(e.target.value)} /></div>
        </div>
        <button style={{ ...s.button, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={addStudent}>
          {busy ? "Registering…" : "Add Student"}
        </button>
      </div>

      <div style={s.card}>
        <h3>Registered Students ({students.length})</h3>
        {loading ? (
          <p style={s.muted}>Loading…</p>
        ) : !students.length ? (
          <p style={s.muted}>No students registered yet.</p>
        ) : (
          students.map((st) => (
            <div key={st.id} style={s.studentRow}>
              <div>
                <strong>{st.name}</strong>{" "}
                <span style={s.muted}>· {st.email} · Class {st.cls} · Roll {st.rollId}</span>
              </div>
              <button style={{ ...s.secondary, borderColor: C.bad, color: "#f87171" }} onClick={() => removeStudent(st)}>Delete Student</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ================= ATTENDANCE MANAGEMENT (Admin) → Firestore `attendance` =================
// One document per student per day: id = `${date}_${email}`
function AttendanceManagementPanel() {
  const [selClass, setSelClass] = useState(CLASSES[0]);
  const today = todayStr();

  const { docs: studentDocs } = useCollection("students", [["cls", "==", selClass]]);
  const { docs: records } = useCollection("attendance", [["cls", "==", selClass], ["date", "==", today]]);

  const students = [...studentDocs].sort(sortStudents);
  const statusByEmail = {};
  records.forEach((r) => { statusByEmail[r.email] = r.status; });

  const mark = async (email, status) => {
    try {
      await setDoc(doc(db, "attendance", `${today}_${email}`), { cls: selClass, date: today, email, status });
    } catch (e) { fail(e); }
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
          const status = statusByEmail[st.email];
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

// Student-facing: live, read-only history of THEIR OWN attendance
function AttendanceHistoryCard({ session }) {
  const { docs, loading } = useCollection("attendance", [["email", "==", session.email]]);
  const rows = [...docs].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div style={s.card}>
      <h3>My Attendance History</h3>
      {loading ? (
        <p style={s.muted}>Loading…</p>
      ) : !rows.length ? (
        <p style={s.muted}>No attendance records yet.</p>
      ) : (
        rows.map((r) => (
          <p key={r.id}>{r.date} <span style={s.badge(r.status === "Present" ? C.ok : C.bad)}>{r.status}</span></p>
        ))
      )}
    </div>
  );
}

// ================= FEE MANAGEMENT (Admin) → Firestore `fees` =================
// One document per student per month: id = `${month}_${email}`
function FeeManagementPanel() {
  const [selClass, setSelClass] = useState(CLASSES[0]);
  const [selMonth, setSelMonth] = useState(MONTHS[new Date().getMonth()]);
  const [drafts, setDrafts] = useState({});

  const { docs: studentDocs } = useCollection("students", [["cls", "==", selClass]]);
  const { docs: feeDocs } = useCollection("fees", [["cls", "==", selClass], ["month", "==", selMonth]]);

  const students = [...studentDocs].sort(sortStudents);
  const recByEmail = {};
  feeDocs.forEach((f) => { recByEmail[f.email] = f; });

  const getRecord = (email) => recByEmail[email] || {};
  const draftKey = (email) => `${selMonth}|${email}`;

  const getDraft = (email) => {
    const k = draftKey(email);
    if (drafts[k]) return drafts[k];
    const r = getRecord(email);
    return { total: r.total ?? "", paid: r.paid ?? "" };
  };

  const setDraft = (email, field, value) => {
    setDrafts({ ...drafts, [draftKey(email)]: { ...getDraft(email), [field]: value } });
  };

  const writeRecord = async (email, patch) => {
    try {
      await setDoc(
        doc(db, "fees", `${selMonth}_${email}`),
        { cls: selClass, month: selMonth, email, ...patch },
        { merge: true }
      );
    } catch (e) { fail(e); }
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

// Student-facing: live, read-only month-wise fee status for THEIR OWN account
function FeeStatusCard({ session }) {
  const { docs, loading } = useCollection("fees", [["email", "==", session.email]]);
  const rows = [...docs].sort((a, b) => MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month));

  return (
    <div style={s.card}>
      <h3>My Fee Status</h3>
      {loading ? (
        <p style={s.muted}>Loading…</p>
      ) : !rows.length ? (
        <p style={s.muted}>No fee records yet.</p>
      ) : (
        rows.map((r) => (
          <div key={r.id} style={{ marginBottom: 8 }}>
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

// ================= STUDY MATERIAL (per Class + Subject) → Firestore `study_materials` =================
function StudyMaterialTab({ cls, subject, session }) {
  const { docs, loading } = useCollection("study_materials", [["cls", "==", cls], ["subject", "==", subject]]);
  const items = [...docs].sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1));

  const [title, setTitle] = useState("");
  const [type, setType] = useState(MATERIAL_TYPES[0]);
  const [detail, setDetail] = useState("");

  const addMaterial = async () => {
    if (!title.trim() || !detail.trim()) { alert("Enter a title and a URL / description."); return; }
    try {
      await addDoc(collection(db, "study_materials"), {
        cls, subject, title: title.trim(), type, detail: detail.trim(), addedAt: new Date().toISOString(),
      });
      setTitle(""); setDetail("");
    } catch (e) { fail(e); }
  };

  const removeMaterial = async (id) => {
    if (!window.confirm("Remove this study material?")) return;
    try { await deleteDoc(doc(db, "study_materials", id)); } catch (e) { fail(e); }
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
      {loading ? (
        <p style={s.muted}>Loading…</p>
      ) : !items.length ? (
        <p style={s.muted}>No study material published yet for this subject.</p>
      ) : (
        items.map((m) => (
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

// ================= LIVE CLASSES (per Class + Subject) → Firestore `live_classes` =================
function LiveClassesTab({ cls, subject, session }) {
  const { docs, loading } = useCollection("live_classes", [["cls", "==", cls], ["subject", "==", subject]]);
  const items = [...docs].sort((a, b) => (a.when < b.when ? -1 : 1));

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState(LIVE_PLATFORMS[0]);
  const [link, setLink] = useState("");
  const [when, setWhen] = useState("");

  const addClass = async () => {
    if (!title.trim() || !link.trim() || !when) { alert("Enter a title, link and date/time."); return; }
    try {
      await addDoc(collection(db, "live_classes"), {
        cls, subject, title: title.trim(), platform, link: link.trim(), when,
      });
      setTitle(""); setLink(""); setWhen("");
    } catch (e) { fail(e); }
  };

  const removeClass = async (id) => {
    if (!window.confirm("Remove this live class?")) return;
    try { await deleteDoc(doc(db, "live_classes", id)); } catch (e) { fail(e); }
  };

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
      {loading ? (
        <p style={s.muted}>Loading…</p>
      ) : !items.length ? (
        <p style={s.muted}>No live classes scheduled yet for this subject.</p>
      ) : (
        items.map((c) => (
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
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [view, setView] = useState("classes");
  const [cls, setCls] = useState(null);
  const [subject, setSubject] = useState(null);

  // Persistent session: Firebase restores the signed-in user on every page load.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setSession(null);
        setView("classes");
        setCls(null);
        setSubject(null);
        setAuthLoading(false);
        return;
      }

      const email = (user.email || "").trim().toLowerCase();

      if (email === ADMIN_EMAIL) {
        setSession({ email, name: "Admin", role: "admin", cls: null, rollId: null });
        setView("classes");
        setCls(null);
        setSubject(null);
        setAuthError("");
        setAuthLoading(false);
        return;
      }

      // Everyone else must have a profile in `students` (created by the admin).
      try {
        const snap = await getDoc(doc(db, "students", email));
        if (snap.exists()) {
          const d = snap.data();
          setSession({ email, name: d.name, role: "student", cls: d.cls, rollId: d.rollId });
          setView("subjects");     // students are locked to their own class
          setCls(d.cls);
          setSubject(null);
          setAuthError("");
        } else {
          setAuthError("This account is not registered as a student, or access was removed. Please contact your institute.");
          await signOut(auth);
        }
      } catch (e) {
        console.error(e);
        setAuthError("Could not load your profile. Check your connection and try again.");
        await signOut(auth);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Real-time access revocation: if the admin deletes this student, log them out immediately.
  useEffect(() => {
    if (!session || session.role !== "student") return undefined;
    const unsub = onSnapshot(doc(db, "students", session.email), (snap) => {
      if (!snap.exists()) {
        setAuthError("Your access has been removed by the institute.");
        signOut(auth);
      }
    });
    return unsub;
  }, [session]);

  const logout = () => { signOut(auth); };

  if (authLoading) {
    return (
      <div style={{ ...s.app, alignItems: "center", justifyContent: "center" }}>
        <GlobalStyle />
        <p style={s.muted}>Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ ...s.app, alignItems: "center", justifyContent: "center" }}>
        <GlobalStyle />
        <LoginView authError={authError} clearAuthError={() => setAuthError("")} />
      </div>
    );
  }

  const isAdmin = session.role === "admin";

  return (
    <div style={s.app}>
      <GlobalStyle />
      <div style={s.inner}>
        <TopBar session={session} onLogout={logout} />

        {/* Admin-only main dashboard: Class slider + Student/Attendance/Fee management. */}
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
