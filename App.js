import React, { useState } from 'react';

function App() {
  const [userRole, setUserRole] = useState(null); // 'student' or 'admin' or null
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openSubject, setOpenSubject] = useState(null);

  // Credentials
  const STUDENT_ID = "student";
  const STUDENT_PASS = "1234";

  const ADMIN_ID = "admin";
  const ADMIN_PASS = "admin123";

  const handleLogin = (e) => {
    e.preventDefault();
    if (userRole === 'student' && userId === STUDENT_ID && password === STUDENT_PASS) {
      setLoginError(false);
      setIsLoggedIn(true);
    } else if (userRole === 'admin' && userId === ADMIN_ID && password === ADMIN_PASS) {
      setLoginError(false);
      setIsLoggedIn(true);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserId('');
    setPassword('');
    setLoginError(false);
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
    <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#1e1e1e', padding: '25px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)', border: '1px solid #2a2a2a' }}>

        {/* 1. ROLE SELECTION STEP */}
        {!userRole && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '10px', fontSize: '1.5rem', color: '#fff' }}>Welcome to AIMS Tutorial</h2>
            <p style={{ color: '#aaaaaa', fontSize: '0.9rem', marginBottom: '25px' }}>Please select your login type</p>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setUserRole('student')} 
                style={{ flex: 1, padding: '20px 10px', background: '#282828', border: '2px solid #0084ff', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <i className="fa-solid fa-user-graduate" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px', color: '#0084ff' }}></i>
                Student Login
              </button>
              
              <button 
                onClick={() => setUserRole('admin')} 
                style={{ flex: 1, padding: '20px 10px', background: '#282828', border: '2px solid #ff9900', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <i className="fa-solid fa-user-shield" style={{ fontSize: '2rem', display: 'block', marginBottom: '10px', color: '#ff9900' }}></i>
                Admin Login
              </button>
            </div>
          </div>
        )}

        {/* 2. LOGIN FORM STEP */}
        {userRole && !isLoggedIn && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button onClick={() => setUserRole(null)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }}>
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                <i className={`fa-solid ${userRole === 'admin' ? 'fa-user-shield' : 'fa-user-graduate'}`} style={{ marginRight: '8px', color: userRole === 'admin' ? '#ff9900' : '#0084ff' }}></i> 
                {userRole === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </h2>
            </div>

            {loginError && (
              <div style={{ background: 'rgba(255, 77, 77, 0.15)', color: '#ff4d4d', padding: '10px', borderRadius: '8px', border: '1px solid #ff4d4d', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px' }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '5px' }}></i> Incorrect ID or Password for {userRole}!
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaaaaa' }}>User ID</label>
                <input
                  type="text"
                  placeholder={`Enter ${userRole} ID`}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #333', background: '#282828', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaaaaa' }}>Password</label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #333', background: '#282828', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: userRole === 'admin' ? '#ff9900' : '#0084ff', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                Login as {userRole}
              </button>
            </form>
          </div>
        )}

        {/* 3. DASHBOARD STEP */}
        {isLoggedIn && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', margin: 0 }}>
                {userRole === 'admin' ? '⚙️ Admin Dashboard' : '📖 Student Dashboard'}
              </h2>
              <button onClick={handleLogout} style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                Logout
              </button>
            </div>

            {/* --- STUDENT DATA --- */}
            {userRole === 'student' && (
              <div>
                <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '15px' }}>Access your study material & upload homework below:</p>
                
                {/* Computer Science Subject */}
                <div style={{ background: '#262626', marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
                  <div onClick={() => toggleSubject('sub1')} style={{ padding: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a2a' }}>
                    <span><i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i> Computer Science</span>
                    <i className={`fa-solid ${openSubject === 'sub1' ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </div>
                  {openSubject === 'sub1' && (
                    <div style={{ padding: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', background: '#202020', borderTop: '1px solid #333' }}>
                      <button style={{ flex: 1, padding: '8px 12px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-file-lines"></i> Notes</button>
                      <button style={{ flex: 1, padding: '8px 12px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-pen-to-square"></i> Quiz</button>
                      <button style={{ flex: 1, padding: '8px 12px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-scroll"></i> Papers</button>
                    </div>
                  )}
                </div>

                {/* Mathematics Subject */}
                <div style={{ background: '#262626', marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
                  <div onClick={() => toggleSubject('sub2')} style={{ padding: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a2a' }}>
                    <span><i className="fa-solid fa-calculator" style={{ marginRight: '8px' }}></i> Mathematics</span>
                    <i className={`fa-solid ${openSubject === 'sub2' ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </div>
                  {openSubject === 'sub2' && (
                    <div style={{ padding: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', background: '#202020', borderTop: '1px solid #333' }}>
                      <button style={{ flex: 1, padding: '8px 12px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-file-lines"></i> Notes</button>
                      <button style={{ flex: 1, padding: '8px 12px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-pen-to-square"></i> Quiz</button>
                      <button style={{ flex: 1, padding: '8px 12px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-scroll"></i> Papers</button>
                    </div>
                  )}
                </div>

                {/* Upload Section */}
                <div style={{ marginTop: '20px', padding: '15px', border: '2px dashed #444', borderRadius: '10px', textAlign: 'center', background: '#181818' }}>
                  <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.8rem', color: '#0084ff' }}></i>
                  <p style={{ fontSize: '0.85rem', marginTop: '5px', color: '#bbb' }}>Upload Homework / Doubts</p>
                  <label htmlFor="gallery-file" style={{ display: 'inline-block', padding: '10px 18px', background: '#333', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '8px' }}>
                    <i className="fa-regular fa-image" style={{ marginRight: '6px' }}></i> Choose File
                  </label>
                  <input type="file" id="gallery-file" accept="image/*,application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                  {selectedFile && <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#0084ff' }}>Selected: {selectedFile}</div>}
                </div>
              </div>
            )}

            {/* --- ADMIN DATA --- */}
            {userRole === 'admin' && (
              <div>
                <p style={{ color: '#ff9900', fontSize: '0.85rem', marginBottom: '15px' }}>Admin Controls & Student Submissions</p>
                
                <div style={{ background: '#282828', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #ff9900' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}><i className="fa-solid fa-plus-circle"></i> Upload New Notes / Papers</h4>
                  <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>Add study material for students</p>
                </div>

                <div style={{ background: '#282828', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #0084ff' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}><i className="fa-solid fa-folder-open"></i> Review Submitted Doubts</h4>
                  <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>View homework uploaded by students</p>
                </div>

                <div style={{ background: '#282828', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #00c853' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}><i className="fa-solid fa-users"></i> Manage Student Accounts</h4>
                  <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>Total Enrolled Students: 25</p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default App;
