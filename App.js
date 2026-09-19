import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('admin');
  
  // PDF Upload State
  const [pdfUrl, setPdfUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [pdfName, setPdfName] = useState('Default Dummy PDF');

  // AI & Generator States
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [basket, setBasket] = useState([]);
  
  // Worksheets Management
  const [worksheets, setWorksheets] = useState([]);
  const [splitCount, setSplitCount] = useState(10);

  // File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
      setPdfName(file.name);
      alert(`PDF "${file.name}" successfully loaded!`);
    } else {
      alert('Kripya sirf valid PDF file select karein.');
    }
  };

  // Mock Question Generation
  const handleGenerateQuestions = () => {
    if (!topic) {
      alert('Kripya Topic enter karein!');
      return;
    }

    const count = parseInt(numQuestions) || 5;
    const newQuestions = [];

    for (let i = 1; i <= count; i++) {
      const qId = Date.now() + i;
      newQuestions.push({
        id: qId,
        question: `[${topic} ${subTopic ? `- ${subTopic}` : ''}] Question #${i}: Identify the correct grammar rule?`,
        options: [`Option A for Q${i}`, `Option B for Q${i}`, `Option C for Q${i}`, `Option D for Q${i}`],
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
        title: `${topic || 'Grammar'} - Worksheet #${newWorksheets.length + 1}`,
        questions: chunk
      });
    }

    setWorksheets([...worksheets, ...newWorksheets]);
    alert(`${newWorksheets.length} Worksheet(s) Successfully Created!`);
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Top Header Navigation */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>📚 AIMS Tutorial Portal</h2>
        
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setActiveTab('admin')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              background: activeTab === 'admin' ? '#ffffff' : 'transparent',
              color: activeTab === 'admin' ? '#2563eb' : '#64748b',
              boxShadow: activeTab === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            ⚙️ Admin Panel
          </button>
          
          <button 
            onClick={() => setActiveTab('quiz')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              background: activeTab === 'quiz' ? '#ffffff' : 'transparent',
              color: activeTab === 'quiz' ? '#2563eb' : '#64748b',
              boxShadow: activeTab === 'quiz' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            📝 Student Worksheets ({worksheets.length})
          </button>

          <button 
            onClick={() => setActiveTab('pdf')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              background: activeTab === 'pdf' ? '#ffffff' : 'transparent',
              color: activeTab === 'pdf' ? '#2563eb' : '#64748b',
              boxShadow: activeTab === 'pdf' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            📄 PDF Viewer
          </button>
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ADMIN PANEL */}
        {activeTab === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. PDF Upload Section */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a' }}>📁 Upload Study Notes / PDF</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileUpload} 
                  style={{ fontSize: '14px', color: '#64748b' }}
                />
                <span style={{ fontSize: '13px', color: '#059669', background: '#ecfdf5', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' }}>
                  Active: {pdfName}
                </span>
              </div>
            </div>

            {/* 2. AI Generator Form */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>⚡ AI Worksheet & Question Generator</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Main Topic</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Noun, Tenses" 
                    value={topic} 
                    onChange={(e) => setTopic(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Sub-Topic (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Types of Noun" 
                    value={subTopic} 
                    onChange={(e) => setSubTopic(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Count</label>
                  <input 
                    type="number" 
                    value={numQuestions} 
                    onChange={(e) => setNumQuestions(e.target.value)} 
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', outline: 'none' }} 
                  />
                </div>
              </div>

              <button 
                onClick={handleGenerateQuestions} 
                style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
              >
                ✨ Generate Questions
              </button>
            </div>

            {/* 3. Question Selection Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* Generated Pool */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: '420px', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>
                  Generated Questions ({generatedQuestions.length})
                </h4>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                  {generatedQuestions.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginTop: '40px' }}>Topic enter karke questions generate karein.</p>
                  ) : (
                    generatedQuestions.map((q) => (
                      <div key={q.id} style={{ border: '1px solid #f1f5f9', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '500' }}>{q.question}</p>
                        <button 
                          onClick={() => addToBasket(q)} 
                          style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          ➕ Add to Basket
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Basket & Splitter */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', height: '420px', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>
                  🧺 Selected Basket ({basket.length})
                </h4>
                
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                  {basket.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginTop: '40px' }}>Koi question select nahi kiya gaya.</p>
                  ) : (
                    basket.map((q) => (
                      <div key={q.id} style={{ borderBottom: '1px solid #f1f5f9', padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#334155' }}>{q.question}</span>
                        <button onClick={() => removeFromBasket(q.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                      </div>
                    ))
                  )}
                </div>

                {basket.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>Questions per Worksheet:</label>
                      <input 
                        type="number" 
                        value={splitCount} 
                        onChange={(e) => setSplitCount(e.target.value)} 
                        style={{ width: '60px', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }} 
                      />
                    </div>
                    <button 
                      onClick={handleCreateWorksheets} 
                      style={{ width: '100%', background: '#10b981', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                    >
                      🚀 Publish Worksheets
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* STUDENT WORKBOOK */}
        {activeTab === 'quiz' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0f172a' }}>Available Worksheets</h3>
            {worksheets.length === 0 ? (
              <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <p>Abhi koi worksheet created nahi hai. Admin panel se generate karein!</p>
              </div>
            ) : (
              worksheets.map((ws) => (
                <div key={ws.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#1e293b' }}>{ws.title}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Contains {ws.questions.length} questions</span>
                  </div>
                  <button style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', fontSize: '13px' }}>
                    Start Test
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* PDF VIEWER */}
        {activeTab === 'pdf' && (
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', maxWidth: '900px', margin: '0 auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a' }}>Document: {pdfName}</h3>
            <iframe 
              src={pdfUrl} 
              title="PDF Viewer"
              width="100%" 
              height="650px" 
              style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
          </div>
        )}

      </main>
    </div>
  );
}
