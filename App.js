import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';

// 🔑 Gemini API Key
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 

export default function App() {
  // Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState([
    { email: 'admin@aims.com', password: '123', name: 'Admin Teacher', role: 'admin', studentClass: 'All' },
    { email: 'student@aims.com', password: '123', name: 'Rahul Sharma', role: 'student', studentClass: '10' }
  ]);

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('student');
  const [authClass, setAuthClass] = useState('1');

  // Navigation States
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Generator States
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [basket, setBasket] = useState([]);
  const [worksheets, setWorksheets] = useState([]);

  // Class Subject Mapping
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
      alert('Invalid Email or Password!');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName) {
      alert('Please fill all required fields.');
      return;
    }
    const newUser = { 
      email: authEmail, 
      password: authPassword, 
      name: authName, 
      role: authRole,
      studentClass: authRole === 'student' ? authClass : 'All'
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
  };

  // 🤖 GEMINI API QUESTION GENERATION
  const handleGenerateQuestions = async () => {
    if (!topic) {
      alert('Please enter a Topic name!');
      return;
    }

    if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE" || !GEMINI_API_KEY) {
      alert("⚠️ Please add your Gemini API Key in the code first!");
      return;
    }

    setIsGenerating(true);

    const promptText = `Generate exactly ${numQuestions} multiple choice questions for Class ${selectedClass}${selectedSubject} on Topic: "${topic}" and Sub-Topic: "${subTopic || 'General'}".
    Return ONLY a raw JSON array of objects without any markdown formatting or \`\`\`json wrappers.
    Structure:
    [
      {
        "question": "string",
        "options": ["opt1", "opt2", "opt3", "opt4"],
        "correctAnswer": 0
      }
    ]`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      const data = await response.json();
      let rawText = data.candidates[0].content.parts[0].text;
      
      // Clean JSON formatting if Gemini adds markdown tags
      rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedQuestions = JSON.parse(rawText);

      const formatted = parsedQuestions.map((q, idx) => ({
        id: Date.now() + idx,
        ...q
      }));

      setGeneratedQuestions(formatted);
    } catch (err) {
      console.error(err);
      alert('Error generating questions with Gemini API. Please check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Basket & Delete Handlers
  const addToBasket = (q) => {
    if (!basket.some(item => item.id === q.id)) {
      setBasket([...basket, q]);
    }
  };

  const removeFromBasket = (id) => {
    setBasket(basket.filter(q => q.id !== id));
  };

  const deleteGeneratedQuestion = (id) => {
    setGeneratedQuestions(generatedQuestions.filter(q => q.id !== id));
  };

  const deleteWorksheet = (id) => {
    if (window.confirm("Are you sure you want to delete this worksheet?")) {
      setWorksheets(worksheets.filter(ws => ws.id !== id));
    }
  };

  const handleCreateWorksheet = () => {
    if (basket.length === 0) {
      alert('Please add questions to basket first.');
      return;
    }
    const newWs = {
      id: Date.now(),
      title: `Class ${selectedClass} - ${selectedSubject} (${topic || 'General'})`,
      questions: [...basket]
    };
    setWorksheets([...worksheets, newWs]);
    setBasket([]);
    alert('Worksheet Created Successfully!');
  };

  // 📄 DOWNLOAD WORKSHEET AS PDF
 // 📄 DOWNLOAD / PRINT WORKSHEET AS PDF
  const downloadPDF = (wsId) => {
    const printContent = document.getElementById(`pdf-content-${wsId}`).innerHTML;
    const printWindow = window.open('', '', 'height=700,width=900');

    printWindow.document.write(`
      <html>
        <head>
          <title>Worksheet</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #000; background: #fff; }
            h2, h4 { text-align: center; margin: 5px 0; }
            hr { border: 0.5px solid #ccc; margin-bottom: 20px; }
            .question-box { margin-bottom: 16px; page-break-inside: avoid; }
            .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px; padding-left: 10px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // ---------------- LOGIN / REGISTER UI ----------------
  if (!currentUser) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', padding: '30px', borderRadius: '12px', width: '380px' }}>
          <h2 style={{ textAlign: 'center', color: '#38bdf8' }}>📚 AIMS Portal</h2>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            {isRegistering && (
              <input type="text" required placeholder="Full Name" value={authName} onChange={(e) => setAuthName(e.target.value)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }} />
            )}
            <input type="email" required placeholder="Email Address" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }} />
            <input type="password" required placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }} />
            
            {isRegistering && (
              <select value={authRole} onChange={(e) => setAuthRole(e.target.value)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }}>
                <option value="student">Student</option>
                <option value="admin">Teacher / Admin</option>
              </select>
            )}

            <button type="submit" style={{ background: '#0284c7', color: '#fff', padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isRegistering ? 'Register' : 'Sign In'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            <button onClick={() => setIsRegistering(!isRegistering)} style={{ color: '#38bdf8', border: 'none', background: 'none', cursor: 'pointer' }}>
              {isRegistering ? 'Already have an account? Sign In' : "New User? Create Account"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- MAIN DASHBOARD UI ----------------
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', minHeight: '100vh', color: '#fff', padding: '20px' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '16px', marginBottom: '20px' }}>
        <h3 style={{ color: '#38bdf8', margin: 0 }}>📚 AIMS Portal ({currentUser.name})</h3>
        <button onClick={() => setCurrentUser(null)} style={{ background: '#991b1b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
      </header>

      {/* Class Selection */}
      {!selectedClass && (
        <div>
          <h3>Select Class</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(cls => (
              <button key={cls} onClick={() => setSelectedClass(cls)} style={{ background: '#1e293b', border: '1px solid #38bdf8', padding: '20px', borderRadius: '8px', color: '#38bdf8', fontSize: '18px', cursor: 'pointer' }}>
                Class {cls}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject Selection */}
      {selectedClass && !selectedSubject && (
        <div>
          <button onClick={() => setSelectedClass(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginBottom: '16px', cursor: 'pointer' }}>← Back to Classes</button>
          <h3>Class {selectedClass} - Select Subject</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {getSubjectsForClass(selectedClass).map(sub => (
              <button key={sub} onClick={() => setSelectedSubject(sub)} style={{ background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generator & Worksheet Section */}
      {selectedClass && selectedSubject && (
        <div>
          <button onClick={() => setSelectedSubject(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginBottom: '16px', cursor: 'pointer' }}>← Back to Subjects</button>

          {/* Gemini Generator Panel */}
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#38bdf8', marginTop: 0 }}>✨ Gemini AI Question Generator ({selectedSubject})</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <input type="text" placeholder="Topic Name (e.g. Noun)" value={topic} onChange={(e) => setTopic(e.target.value)} style={{ padding: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }} />
              <input type="text" placeholder="Sub-Topic (e.g. Types of Noun)" value={subTopic} onChange={(e) => setSubTopic(e.target.value)} style={{ padding: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }} />
              <input type="number" min="1" max="20" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} style={{ padding: '8px', background: '#0f172a', border: '1px solid #475569', color: '#fff', borderRadius: '4px' }} />
            </div>
            <button onClick={handleGenerateQuestions} disabled={isGenerating} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isGenerating ? '⌛ Gemini is Generating...' : '✨ Generate Questions'}
            </button>
          </div>

          {/* Question Pool & Basket Side-by-Side */}
          {generatedQuestions.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              
              {/* Question Pool */}
              <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                <h4>Generated Questions ({generatedQuestions.length})</h4>
                {generatedQuestions.map((q, idx) => (
                  <div key={q.id} style={{ background: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #334155' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Q{idx + 1}. {q.question}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => addToBasket(q)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>➕ Add to Basket</button>
                      <button onClick={() => deleteGeneratedQuestion(q.id)} style={{ background: '#991b1b', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Basket */}
              <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', maxHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                <h4>🧺 Selected Basket ({basket.length})</h4>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {basket.map(q => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155', fontSize: '13px' }}>
                      <span>{q.question}</span>
                      <button onClick={() => removeFromBasket(q.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️ Delete</button>
                    </div>
                  ))}
                </div>
                {basket.length > 0 && (
                  <button onClick={handleCreateWorksheet} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', marginTop: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🚀 Create Printable Worksheet
                  </button>
                )}
              </div>

            </div>
          )}

          {/* Worksheets Output & PDF Generation */}
          <div>
            <h3>Generated Worksheets</h3>
            {worksheets.map(ws => (
              <div key={ws.id} style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, color: '#38bdf8' }}>{ws.title}</h4>
                  <div>
                    <button onClick={() => downloadPDF(ws.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>📄 Download PDF</button>
                    <button onClick={() => deleteWorksheet(ws.id)} style={{ background: '#991b1b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>🗑️ Delete</button>
                  </div>
                </div>

                {/* PDF Content Area */}
                <div id={`pdf-content-${ws.id}`} style={{ padding: '20px', background: '#ffffff', color: '#000000', borderRadius: '6px' }}>
                  <h2 style={{ textAlign: 'center', margin: '0 0 10px 0', color: '#000' }}>AIMS TUTORIAL</h2>
                  <h4 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#555' }}>{ws.title}</h4>
                  <hr style={{ borderColor: '#ddd', marginBottom: '20px' }} />
                  
                  {ws.questions.map((q, idx) => (
                    <div key={idx} style={{ marginBottom: '16px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 6px 0' }}>Q{idx + 1}. {q.question}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingLeft: '10px' }}>
                        {q.options && q.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{ fontSize: '13px' }}>
                            ({String.fromCharCode(65 + oIdx)}) {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
