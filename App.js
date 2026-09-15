import React, { useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  // ... baki code
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
    <div className="container">
      {!isLoggedIn ? (
        /* 1. LOGIN SECTION */
        <div id="login-section">
          <h2>User Login</h2>

          {/* Error Message if Login Fails */}
          {loginError && (
            <div className="error-msg">
              User ID and Password do not match!
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>User ID</label>
              <input
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn">Login</button>
          </form>
        </div>
      ) : (
        /* 2. DASHBOARD SECTION */
        <div id="dashboard-section">
          <h2>Course Subjects</h2>

          {/* Subject Item 1 */}
          <div className="subject-card">
            <div className="subject-header" onClick={() => toggleSubject('sub1')}>
              <span>Computer Science</span>
              <span>{openSubject === 'sub1' ? '▲' : '▼'}</span>
            </div>
            {openSubject === 'sub1' && (
              <div className="resource-options">
                <button className="res-btn">Notes</button>
                <button className="res-btn">Quiz</button>
                <button className="res-btn">Papers</button>
              </div>
            )}
          </div>

          {/* Subject Item 2 */}
          <div className="subject-card">
            <div className="subject-header" onClick={() => toggleSubject('sub2')}>
              <span>Mathematics</span>
              <span>{openSubject === 'sub2' ? '▲' : '▼'}</span>
            </div>
            {openSubject === 'sub2' && (
              <div className="resource-options">
                <button className="res-btn">Notes</button>
                <button className="res-btn">Quiz</button>
                <button className="res-btn">Papers</button>
              </div>
            )}
          </div>

          {/* Gallery File Upload Section */}
          <div className="upload-box">
            <p>Upload Homework / Doubts</p>
            <label htmlFor="gallery-file" className="file-label">
              Choose from Gallery / Files
            </label>
            <input
              type="file"
              id="gallery-file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {selectedFile && <div className="file-name">Selected: {selectedFile}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
