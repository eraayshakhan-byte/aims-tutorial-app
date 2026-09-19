import React, { useState } from 'react';

export default function App() {
  // Auth States
  const [currentUser, setCurrentUser] = useState(null); // null means logged out
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState([
    { email: 'admin@aims.com', password: '123', name: 'Admin Teacher', role: 'admin' },
    { email: 'student@aims.com', password: '123', name: 'Rahul Sharma', role: 'student' }
  ]);

  // Form Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('student');

  // Navigation State
  const [activeTab, setActiveTab] = useState('worksheets'); // 'worksheets', 'generator', 'pdf'

  // PDF Viewer State
  const [pdfUrl, setPdfUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [pdfName, setPdfName] = useState('Default Study Notes.pdf');

  // Question Generator & Worksheets States
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [basket, setBasket] = useState([]);
  const [worksheets, setWorksheets] = useState([
    {
      id: 1,
      title: 'Class 1th - Articles Basic Practice',
      questions: [
        { id: 101, question: 'Which article is used before "Apple"?', options: ['A', 'An', 'The', 'None'], correctAnswer: 1, explanation: 'Vowel sound starts with An.' },
        { id: 102, question: 'Which article is used before "Sun"?', options: ['A', 'An', 'The', 'None'], correctAnswer: 2, explanation: 'Unique objects use The.' }
      ]
    }
  ]);
  const [splitCount, setSplitCount] = useState(10);

  // AUTH HANDLERS
  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(u => u.email === authEmail && u.password === authPassword);
    if (foundUser) {
      setCurrentUser(foundUser);
      setActiveTab(foundUser.role === 'admin' ? 'generator' : 'worksheets');
      setAuthEmail('');
      setAuthPassword('');
    } else {
      alert('Galat Email ya Password! Try again.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName) {
      alert('Kripya saari details bharein.');
      return;
    }
    const newUser = { email: authEmail, password: authPassword, name: authName, role: authRole };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setActiveTab(newUser.role === 'admin' ? 'generator' : 'worksheets');
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    alert('Registration Successful!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // FILE UPLOAD HANDLER
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfUrl(URL.createObjectURL(file));
      setPdfName(file.name);
      alert(`PDF "${file.name}" uploaded successfully!`);
    } else {
      alert('Kripya sirf valid PDF file select karein.');
    }
  };

  // GENERATOR HANDLERS
  const handleGenerateQuestions = () => {
    if (!topic) {
      alert('Kripya Topic enter karein!');
      return;
    }
    const count = parseInt(numQuestions) || 5;
    const newQuestions = [];
    for (let i = 1; i <= count; i++) {
      newQuestions.push({
        id: Date.now() + i,
        question: `[${topic} ${subTopic ? `- ${subTopic}` : ''}] Practice Question #${i} for students?`,
        options: [`Option A`, `Option B`, `Option C`, `Option D`],
        correctAnswer: 0,
        explanation: `Explanation for ${topic} question #${i}.`
      });
    }
    setGeneratedQuestions(newQuestions);
  };

  const addToBasket = (q) => {
    if (!basket.some(item => item.id === q.id)) {
      setBasket([...basket, q]);
    }
  };

  const removeFromBasket = (id) => {
    setBasket(basket.filter(q => q.id !== id));
  };

  const handleCreateWorksheets = () => {
    if (basket.length === 0) {
      alert('Basket me kam se kam 1 question hona chahiye!');
      return;
    }
    const chunkSize = parseInt(splitCount) || 10;
    const newWorksheets = [];
    for (let i = 0; i < basket.length; i += chunkSize) {
      const chunk = basket.slice(i, i + chunkSize);
      newWorksheets.push({
        id: Date.now() + i,
        title: `${topic || 'Grammar'} Worksheet #${worksheets.length + newWorksheets.length + 1}`,
        questions: chunk
      });
    }
    setWorksheets([...worksheets, ...newWorksheets]);
    setBasket([]);
    alert(`${newWorksheets.length} Worksheet(s) successfully created and published!`);
  };

  // 1. LOGIN / REGISTRATION SCREEN
  if (!currentUser) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', color: '#0f172a' }}>📚 AIMS Tutorial Portal</h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            {isRegistering ? 'Create Student/Teacher Account' : 'Sign in to access worksheets'}
          </p>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegistering && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Full Name</label>
                <input type="text" required placeholder="Aapka Naam" value={authName} onChange={(e) => setAuthName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Email Address</label>
              <input type="email" required placeholder="name@domain.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Password</label>
              <input type="password" required placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            </div>

            {isRegistering && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Account Role</label>
                <select value={authRole} onChange={(e) => setAuthRole(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                  <option value="student">Student</option>
                  <option value="admin">Teacher / Admin</option>
                </select>
              </div>
            )}

            <button type="submit" style={{ background: '#2563eb', color: '#fff', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
              {isRegistering ? 'Register Account' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
            {isRegistering ? (
              <span>Pehle se account hai? <button onClick={() => setIsRegistering(false)} style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Login Karein</button></span>
            ) : (
              <span>Naya Student Account? <button onClick={() => setIsRegistering(true)} style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Register Karein</button></span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN DASHBOARD SCREEN (LOGGED IN)
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* HEADER NAVIGATION */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, color: '#0f172a' }}>📚 AIMS Tutorial Portal</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Logged in as: <b>{currentUser.name}</b> ({currentUser.role.toUpperCase()})</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button onClick={() => setActiveTab('worksheets')} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: activeTab === 'worksheets' ? '#ffffff' : 'transparent', fontWeight: '600', color: activeTab === 'worksheets' ? '#2563eb' : '#64748b' }}>
            📝 Worksheets ({worksheets.length})
          </button>

          {currentUser.role === 'admin' && (
            <button onClick={() => setActiveTab('generator')} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: activeTab === 'generator' ? '#ffffff' : 'transparent', fontWeight: '600', color: activeTab === 'generator' ? '#2563eb' : '#64748b' }}>
              ⚡ Admin Generator
            </button>
          )}

          <button onClick={() => setActiveTab('pdf')} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: activeTab === 'pdf' ? '#ffffff' : 'transparent', fontWeight: '600', color: activeTab === 'pdf' ? '#2563eb' : '#64748b' }}>
            📄 PDF Notes
          </button>

          <button onClick={handleLogout} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', fontWeight: '600' }}>
            Logout
          </button>
        </div>
      </header>

      {/* BODY CONTENT */}
      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* TAB 1: STUDENT WORKSHEETS VIEW */}
        {activeTab === 'worksheets' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Available Student Worksheets</h3>
            {worksheets.map((ws) => (
              <div key={ws.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0' }}>{ws.title}</h4>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{ws.questions.length} Questions Available</span>
                </div>
                <button style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Start Practice
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: ADMIN QUESTION GENERATOR */}
        {activeTab === 'generator' && currentUser.role === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* PDF Uploader */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>📁 Browse & Upload PDF Notes from System</h4>
              <input type="file" accept="application/pdf" onChange={handleFileUpload} />
              <p style={{ fontSize: '12px', color: '#059669', margin: '8px 0 0 0' }}>Active File: {pdfName}</p>
            </div>

            {/* Generator Inputs */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0' }}>⚡ Generate Questions by Topic</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Main Topic</label>
                  <input type="text" placeholder="e.g. Noun" value={topic} onChange={(e) => setTopic(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Sub-Topic</label>
                  <input type="text" placeholder="e.g. Types of Noun" value={subTopic} onChange={(e) => setSubTopic(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Count</label>
                  <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                </div>
              </div>
              <button onClick={handleGenerateQuestions} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                ✨ Generate Questions Pool
              </button>
            </div>

            {/* Selection Pool & Basket */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: '400px', overflowY: 'auto' }}>
                <h4>Questions Pool ({generatedQuestions.length})</h4>
                {generatedQuestions.map((q) => (
                  <div key={q.id} style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '8px', border: '1px solid #f1f5f9' }}>
                    <p style={{ margin: '0 0 6px 0', fontSize: '13px' }}>{q.question}</p>
                    <button onClick={() => addToBasket(q)} style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      ➕ Add to Basket
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: '400px', display: 'flex', flexDirection: 'column' }}>
                <h4>🧺 Basket ({basket.length})</h4>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {basket.map((q) => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                      <span>{q.question}</span>
                      <button onClick={() => removeFromBasket(q.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
                {basket.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600' }}>Split per Worksheet: </label>
                    <input type="number" value={splitCount} onChange={(e) => setSplitCount(e.target.value)} style={{ width: '60px', padding: '4px', marginLeft: '8px' }} />
                    <button onClick={handleCreateWorksheets} style={{ width: '100%', marginTop: '8px', background: '#10b981', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                      🚀 Publish Worksheets
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: PDF VIEWER */}
        {activeTab === 'pdf' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <h3>Document Notes: {pdfName}</h3>
            <iframe src={pdfUrl} title="PDF Viewer" width="100%" height="650px" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '12px' }} />
          </div>
        )}

      </main>
    </div>
  );
}
