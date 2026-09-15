import React, { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Subject Toggle States
  const [openSubject, setOpenSubject] = useState(null);

  const CORRECT_ID = "student";
  const CORRECT_PASS = "1234";

  const handleLogin = (e) => {
    e.preventDefault();
    if (userId === CORRECT_ID && password === CORRECT_PASS) {
      setLoginError(false);
      setIsLoggedIn(true);
    } else {
      setLoginError(true);
    }
  };

  const toggleSubject = (subjectId) => {
    setOpenSubject(openSubject === subjectId ? null : subjectId);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {!isLoggedIn ? (
        /* 1. LOGIN SECTION */
        <div id="login-section">
          <h2>User Login</h2>

          {/* Error Message if Login Fails */}
          {loginError && (
            <div style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
              User ID and Password do not match!
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>User ID</label>
              <input
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0084ff', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
              Login
            </button>
          </form>
        </div>
      ) : (
        /* 2. DASHBOARD SECTION */
        <div id="dashboard-section">
          <h2>Course Subjects</h2>

          {/* Subject Item 1 */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px', overflow: 'hidden' }}>
            <div 
              onClick={() => toggleSubject('sub1')} 
              style={{ padding: '12px', background: '#f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}
            >
              <span>Computer Science</span>
              <span>{openSubject === 'sub1' ? '▲' : '▼'}</span>
            </div>
            {openSubject === 'sub1' && (
              <div style={{ padding: '12px', display: 'flex', gap: '8px', background: '#fff' }}>
                <button style={{ flex: 1, padding: '8px' }}>Notes</button>
                <button style={{ flex: 1, padding: '8px' }}>Quiz</button>
                <button style={{ flex: 1, padding: '8px' }}>Papers</button>
              </div>
            )}
          </div>

          {/* Subject Item 2 */}
          <div style={{ border: '1px solid #ccc', borderRadius: '8px', marginBottom: '10px', overflow: 'hidden' }}>
            <div 
              onClick={() => toggleSubject('sub2')} 
              style={{ padding: '12px', background: '#f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}
            >
              <span>Mathematics</span>
              <span>{openSubject === 'sub2' ? '▲' : '▼'}</span>
            </div>
            {openSubject === 'sub2' && (
              <div style={{ padding: '12px', display: 'flex', gap: '8px', background: '#fff' }}>
                <button style={{ flex: 1, padding: '8px' }}>Notes</button>
                <button style={{ flex: 1, padding: '8px' }}>Quiz</button>
                <button style={{ flex: 1, padding: '8px' }}>Papers</button>
              </div>
            )}
          </div>

          {/* Gallery File Upload Section */}
          <div style={{ border: '2px dashed #aaa', padding: '20px', textAlign: 'center', borderRadius: '8px', marginTop: '20px' }}>
            <p style={{ margin: '0 0 10px 0' }}>Upload Homework / Doubts</p>
            <label htmlFor="gallery-file" style={{ display: 'inline-block', padding: '8px 16px', background: '#333', color: '#fff', borderRadius: '5px', cursor: 'pointer' }}>
              Choose from Gallery / Files
            </label>
            <input
              type="file"
              id="gallery-file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {selectedFile && <div style={{ marginTop: '10px', color: '#0084ff', fontSize: '0.9rem' }}>Selected: {selectedFile}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
