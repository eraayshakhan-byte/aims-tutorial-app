import React, { useState } from 'react';

export default function App() {
  // Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState([
    { email: 'admin@aims.com', password: '123', name: 'Admin Teacher', role: 'admin' },
    { email: 'student@aims.com', password: '123', name: 'Rahul Sharma', role: 'student' }
  ]);

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('student');

  // App Flow Navigation
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz', 'papers', 'notes'
  const [showStudentsList, setShowStudentsList] = useState(false);

  // Upload States (Papers & Notes)
  const [paperUrl, setPaperUrl] = useState(null);
  const [paperName, setPaperName] = useState('No Paper Uploaded Yet');
  
  const [noteUrl, setNoteUrl] = useState(null);
  const [noteName, setNoteName] = useState('No Note Uploaded Yet');
  const [noteFileType, setNoteFileType] = useState('pdf');

  // AI Quiz & Generator States
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [basket, setBasket] = useState([]);
  const [worksheets, setWorksheets] = useState([]);
  const [splitCount, setSplitCount] = useState(10);

  // Subject Mapping Logic
  const getSubjectsForClass = (cls) => {
    if (cls >= 1 && cls <= 4) {
      return ['English', 'Hindi', 'Maths', 'EVS', 'English Grammar', 'Hindi Grammar', 'Computer'];
    } else if (cls >= 5 && cls <= 10) {
      return ['English', 'Hindi', 'Science', 'So. Science', 'Maths', 'Sanskrit', 'English Grammar', 'Hindi Grammar', 'Computer'];
    } else {
      return ['English', 'Physics', 'Chemistry', 'Maths', 'Biology', 'Accountancy', 'Economics'];
    }
  };

  // Auth Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    const foundUser = users.find(u => u.email.toLowerCase() === authEmail.toLowerCase() && u.password === authPassword);
    if (foundUser) {
      setCurrentUser(foundUser);
      setAuthEmail('');
      setAuthPassword('');
    } else {
      alert('Invalid Email or Password! Please try again.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName) {
      alert('Please fill all required fields.');
      return;
    }
    
    if (users.some(u => u.email.toLowerCase() === authEmail.toLowerCase())) {
      alert('An account with this email already exists!');
      return;
    }

    const newUser = { email: authEmail, password: authPassword, name: authName, role: authRole };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    alert('Account Registered Successfully!');
  };

  // File Upload Handlers
  const handlePaperUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPaperUrl(URL.createObjectURL(file));
      setPaperName(file.name);
      alert(`Question Paper "${file.name}" uploaded successfully!`);
    } else {
      alert('Please upload a valid PDF file for Question Papers.');
    }
  };

  const handleNotesUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isPdf = file.type === 'application/pdf';
      const isImg = file.type.startsWith('image/');
      if (isPdf || isImg) {
        setNoteUrl(URL.createObjectURL(file));
        setNoteName(file.name);
        setNoteFileType(isPdf ? 'pdf' : 'image');
        alert(`Study Note "${file.name}" uploaded successfully!`);
      } else {
        alert('Please upload a valid PDF or Image file (.jpg, .png).');
      }
    }
  };

  // AI Question Generator
  const handleGenerateQuestions = async () => {
    if (!topic) {
      alert('Please enter a Topic name!');
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      const count = parseInt(numQuestions) || 5;
      const mockList = [];
      for (let i = 1; i <= count; i++) {
        mockList.push({
          id: Date.now() + i,
          question: `Sample Question #${i} for ${topic}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: `Correct explanation for ${topic}.`
        });
      }
      setGeneratedQuestions(mockList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
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
      alert('Please add at least 1 question to the basket.');
      return;
    }
    const chunkSize = parseInt(splitCount) || 10;
    const newWorksheets = [];
    for (let i = 0; i < basket.length; i += chunkSize) {
      const chunk = basket.slice(i, i + chunkSize);
      newWorksheets.push({
        id: Date.now() + i,
        title: `Class ${selectedClass} - ${selectedSubject} (${topic || 'General'}) Worksheet #${worksheets.length + newWorksheets.length + 1}`,
        questions: chunk
      });
    }
    setWorksheets([...worksheets, ...newWorksheets]);
    setBasket([]);
    alert(`${newWorksheets.length} Worksheet(s) created!`);
  };

  // 1. LOGIN SCREEN
  if (!currentUser) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', color: '#0f172a' }}>📚 AIMS Tutorial Portal</h2>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            {isRegistering ? 'New Student Registration' : 'Sign in to your account'}
          </p>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isRegistering && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Full Name</label>
                <input type="text" required placeholder="Enter full name" value={authName} onChange={(e) => setAuthName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Email Address</label>
              <input type="email" required placeholder="admin@aims.com or student@aims.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Password</label>
              <input type="password" required placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>

            {isRegistering && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Account Role</label>
                <select value={authRole} onChange={(e) => setAuthRole(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }}>
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
              <span>Already have an account? <button onClick={() => setIsRegistering(false)} style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Sign In</button></span>
            ) : (
              <span>New Student? <button onClick={() => setIsRegistering(true)} style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600' }}>Create Account</button></span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN DASHBOARD
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', color: '#1e293b', boxSizing: 'border-box' }}>
      
      {/* HEADER WITH ADMIN ACTION BUTTONS */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
        <div>
          <h3 style={{ margin: 0, color: '#0f172a' }}>📚 AIMS Tutorial Portal</h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>User: <b>{currentUser.name}</b> ({currentUser.role.toUpperCase()})</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {currentUser.role === 'admin' && (
            <button 
              onClick={() => setShowStudentsList(!showStudentsList)} 
              style={{ background: showStudentsList ? '#0f172a' : '#2563eb', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              👥 View All Accounts
            </button>
          )}

          <button onClick={() => { setCurrentUser(null); setShowStudentsList(false); }} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', fontWeight: '600' }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* ADMIN VIEW ALL ACCOUNTS PANEL */}
        {currentUser.role === 'admin' && showStudentsList && (
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>📋 Registered User Accounts ({users.length})</h3>
              <button onClick={() => setShowStudentsList(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>✕</button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '10px' }}>Name</th>
                  <th style={{ padding: '10px' }}>Email (User ID)</th>
                  <th style={{ padding: '10px' }}>Password</th>
                  <th style={{ padding: '10px' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', fontWeight: '600' }}>{u.name}</td>
                    <td style={{ padding: '10px', color: '#2563eb' }}>{u.email}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 'bold', color: '#dc2626' }}>{u.password}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', background: u.role === 'admin' ? '#fef3c7' : '#dcfce7', color: u.role === 'admin' ? '#d97706' : '#15803d' }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BREADCRUMB NAVIGATION */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
          <button onClick={() => { setSelectedClass(null); setSelectedSubject(null); }} style={{ border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>
            Classes
          </button>
          {selectedClass && <span>›</span>}
          {selectedClass && (
            <button onClick={() => setSelectedSubject(null)} style={{ border: 'none', background: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>
              Class {selectedClass}
            </button>
          )}
          {selectedSubject && <span>›</span>}
          {selectedSubject && <span style={{ fontWeight: '600', color: '#0f172a' }}>{selectedSubject}</span>}
        </div>

        {/* STEP 1: CLASS SELECTION */}
        {!selectedClass && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>Select Class</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', width: '100%' }}>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '24px', borderRadius: '12px', fontSize: '18px', fontWeight: '700', color: '#1e293b', cursor: 'pointer', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                >
                  Class {cls}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SUBJECT SELECTION */}
        {selectedClass && !selectedSubject && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>Select Subject for Class {selectedClass}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
              {getSubjectsForClass(selectedClass).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '20px', borderRadius: '12px', fontSize: '15px', fontWeight: '600', color: '#2563eb', cursor: 'pointer', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                >
                  📖 {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: SUBJECT MODULES */}
        {selectedClass && selectedSubject && (
          <div>
            
            {/* TABS HEADER */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px' }}>
              <button 
                onClick={() => setActiveTab('quiz')}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', background: activeTab === 'quiz' ? '#2563eb' : '#e2e8f0', color: activeTab === 'quiz' ? '#fff' : '#475569' }}
              >
                ⚡ Quiz & Worksheets
              </button>
              
              <button 
                onClick={() => setActiveTab('papers')}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', background: activeTab === 'papers' ? '#2563eb' : '#e2e8f0', color: activeTab === 'papers' ? '#fff' : '#475569' }}
              >
                📜 Papers (PDF)
              </button>

              <button 
                onClick={() => setActiveTab('notes')}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', background: activeTab === 'notes' ? '#2563eb' : '#e2e8f0', color: activeTab === 'notes' ? '#fff' : '#475569' }}
              >
                📚 Notes (PDF/Image)
              </button>
            </div>

            {/* TAB 1: QUIZ & WORKSHEETS */}
            {activeTab === 'quiz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Admin Controls */}
                {currentUser.role === 'admin' && (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>⚡ Generate Questions for {selectedSubject}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Topic Name</label>
                        <input type="text" placeholder="e.g. Noun" value={topic} onChange={(e) => setTopic(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Sub-Topic</label>
                        <input type="text" placeholder="e.g. Types of Noun" value={subTopic} onChange={(e) => setSubTopic(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>Quantity</label>
                        <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <button 
                      onClick={handleGenerateQuestions} 
                      disabled={isGenerating}
                      style={{ background: isGenerating ? '#94a3b8' : '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: isGenerating ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                    >
                      {isGenerating ? '⌛ Generating Real AI Questions...' : '✨ Generate Questions'}
                    </button>
                  </div>
                )}

                {/* Question Selection Basket */}
                {currentUser.role === 'admin' && generatedQuestions.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: '400px', overflowY: 'auto' }}>
                      <h4>Generated Questions Pool ({generatedQuestions.length})</h4>
                      {generatedQuestions.map((q, idx) => (
                        <div key={q.id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                          <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '600' }}>Q{idx + 1}. {q.question}</p>
                          <button onClick={() => addToBasket(q)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                            ➕ Add to Basket
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: '400px', display: 'flex', flexDirection: 'column' }}>
                      <h4>🧺 Selected Basket ({basket.length})</h4>
                      <div style={{ flex: 1, overflowY: 'auto' }}>
                        {basket.map((q) => (
                          <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                            <span style={{ fontWeight: '500' }}>{q.question}</span>
                            <button onClick={() => removeFromBasket(q.id)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
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
                )}

                {/* Published Worksheets List */}
                <div>
                  <h4 style={{ marginBottom: '12px' }}>Available Worksheets for Class {selectedClass} ({selectedSubject})</h4>
                  {worksheets.length === 0 ? (
                    <div style={{ background: '#ffffff', padding: '30px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
                      No worksheets created yet for this subject.
                    </div>
                  ) : (
                    worksheets.map((ws) => (
                      <div key={ws.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0' }}>{ws.title}</h4>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{ws.questions.length} Questions</span>
                        </div>
                        <button style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                          Start Test
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: PAPERS MODULE */}
            {activeTab === 'papers' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0' }}>📜 Question Papers - Class {selectedClass} ({selectedSubject})</h4>
                
                {currentUser.role === 'admin' && (
                  <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Upload Question Paper (PDF from Device):</label>
                    <input type="file" accept="application/pdf" onChange={handlePaperUpload} />
                  </div>
                )}

                {paperUrl ? (
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>Active Paper: {paperName}</p>
                    <iframe src={paperUrl} title="Paper Viewer" width="100%" height="600px" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '12px' }} />
                  </div>
                ) : (
                  <p style={{ color: '#64748b', textAlign: 'center', margin: '40px 0' }}>No Question Paper uploaded for this subject yet.</p>
                )}
              </div>
            )}

            {/* TAB 3: NOTES MODULE */}
            {activeTab === 'notes' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0' }}>📚 Study Notes - Class {selectedClass} ({selectedSubject})</h4>

                {currentUser.role === 'admin' && (
                  <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Upload Notes (PDF or Image):</label>
                    <input type="file" accept="application/pdf, image/*" onChange={handleNotesUpload} />
                  </div>
                )}

                {noteUrl ? (
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>Active Note File: {noteName}</p>
                    {noteFileType === 'pdf' ? (
                      <iframe src={noteUrl} title="Notes Viewer" width="100%" height="600px" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '12px' }} />
                    ) : (
                      <div style={{ textAlign: 'center', marginTop: '12px' }}>
                        <img src={noteUrl} alt="Study Note" style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', textAlign: 'center', margin: '40px 0' }}>No Study Notes uploaded for this subject yet.</p>
                )}
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
