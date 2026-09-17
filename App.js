import React, { useState } from 'react';

function App() {
  const [userRole, setUserRole] = useState(null); // 'student', 'admin', 'register'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Login State
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dynamic Users Data (Registration System)
  const [registeredStudents, setRegisteredStudents] = useState([
    { id: 'student', pass: '1234', name: 'Student 1' }
  ]);
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // UI Interactive States
  const [openSubject, setOpenSubject] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'notes', 'quiz', 'papers', 'adminUpload'
  const [modalTitle, setModalTitle] = useState('');

  // Default Credentials for Admin
  const ADMIN_ID = "admin";
  const ADMIN_PASS = "admin123";

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (userRole === 'admin') {
      if (userId === ADMIN_ID && password === ADMIN_PASS) {
        setLoginError('');
        setIsLoggedIn(true);
      } else {
        setLoginError('Incorrect Admin ID or Password!');
      }
    } else {
      const foundStudent = registeredStudents.find(s => s.id === userId && s.pass === password);
      if (foundStudent) {
        setLoginError('');
        setIsLoggedIn(true);
      } else {
        setLoginError('Invalid Student ID or Password! Please register if new.');
      }
    }
  };

  // Handle Registration
  const handleRegister = (e) => {
    e.preventDefault();
    if (!regId || !regPass || !regName) {
      setRegSuccess('Please fill all fields!');
      return;
    }
    setRegisteredStudents([...registeredStudents, { id: regId, pass: regPass, name: regName }]);
    setRegSuccess('Registration successful! You can now login.');
    setTimeout(() => {
      setUserRole('student');
      setRegSuccess('');
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserId('');
    setPassword('');
    setLoginError('');
  };

  // Gallery File Handler
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        date: new Date().toLocaleTimeString()
      };
      setUploadedFiles([newFile, ...uploadedFiles]);
      alert(`File "${file.name}" uploaded successfully!`);
    }
  };

  const openContentModal = (title) => {
    setModalTitle(title);
    setActiveModal('view');
  };

  return (
    <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', width: '100%', margin: 0, padding: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", boxSizing: 'border-box' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div style={{ width: '90%', maxWidth: '480px', backgroundColor: '#1e1e1e', padding: '25px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)', border: '1px solid #2a2a2a' }}>

        {/* 1. ROLE SELECTION SCREEN */}
        {!userRole && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '10px', fontSize: '1.5rem', color: '#fff' }}>Welcome to AIMS Tutorial</h2>
            <p style={{ color: '#aaaaaa', fontSize: '0.9rem', marginBottom: '25px' }}>Please select an option to continue</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button 
                onClick={() => setUserRole('student')} 
                style={{ padding: '15px', background: '#282828', border: '2px solid #0084ff', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <i className="fa-solid fa-user-graduate" style={{ fontSize: '1.4rem', color: '#0084ff' }}></i>
                Student Login
              </button>

              <button 
                onClick={() => setUserRole('admin')} 
                style={{ padding: '15px', background: '#282828', border: '2px solid #ff9900', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <i className="fa-solid fa-user-shield" style={{ fontSize: '1.4rem', color: '#ff9900' }}></i>
                Admin Login
              </button>

              <button 
                onClick={() => setUserRole('register')} 
                style={{ padding: '12px', background: 'transparent', border: '1px dashed #aaaaaa', borderRadius: '10px', color: '#aaa', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }}></i>
                New Student? Register Here
              </button>
            </div>
          </div>
        )}

        {/* 2. REGISTRATION FORM */}
        {userRole === 'register' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button onClick={() => setUserRole(null)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }}>
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>Student Registration</h2>
            </div>

            {regSuccess && (
              <div style={{ background: regSuccess.includes('successful') ? 'rgba(0, 200, 83, 0.2)' : 'rgba(255, 77, 77, 0.2)', color: regSuccess.includes('successful') ? '#00c853' : '#ff4d4d', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px' }}>
                {regSuccess}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaaaaa' }}>Full Name</label>
                <input type="text" placeholder="Enter Full Name" value={regName} onChange={(e) => setRegName(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#282828', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaaaaa' }}>Choose User ID</label>
                <input type="text" placeholder="Create User ID" value={regId} onChange={(e) => setRegId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#282828', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaaaaa' }}>Create Password</label>
                <input type="password" placeholder="Create Password" value={regPass} onChange={(e) => setRegPass(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#282828', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#00c853', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                Complete Registration
              </button>
            </form>
          </div>
        )}

        {/* 3. LOGIN FORM */}
        {(userRole === 'student' || userRole === 'admin') && !isLoggedIn && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <button onClick={() => setUserRole(null)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }}>
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                {userRole === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </h2>
            </div>

            {loginError && (
              <div style={{ background: 'rgba(255, 77, 77, 0.15)', color: '#ff4d4d', padding: '10px', borderRadius: '8px', border: '1px solid #ff4d4d', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px' }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaaaaa' }}>User ID</label>
                <input type="text" placeholder={`Enter ${userRole} ID`} value={userId} onChange={(e) => setUserId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#282828', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#aaaaaa' }}>Password</label>
                <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#282828', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: userRole === 'admin' ? '#ff9900' : '#0084ff', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                Login as {userRole}
              </button>
            </form>
          </div>
        )}

        {/* 4. DASHBOARD */}
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

            {/* --- STUDENT VIEW --- */}
            {userRole === 'student' && (
              <div>
                <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '15px' }}>Select subject to view material or upload doubts:</p>

                {/* CS Subject */}
                <div style={{ background: '#262626', marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
                  <div onClick={() => setOpenSubject(openSubject === 'sub1' ? null : 'sub1')} style={{ padding: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a2a' }}>
                    <span><i className="fa-solid fa-code" style={{ marginRight: '8px' }}></i> Computer Science</span>
                    <i className={`fa-solid ${openSubject === 'sub1' ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </div>
                  {openSubject === 'sub1' && (
                    <div style={{ padding: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#202020', borderTop: '1px solid #333' }}>
                      <button onClick={() => openContentModal('CS Notes')} style={{ flex: 1, padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-file-lines"></i> Notes</button>
                      <button onClick={() => openContentModal('CS Quiz')} style={{ flex: 1, padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-pen-to-square"></i> Quiz</button>
                      <button onClick={() => openContentModal('CS Papers')} style={{ flex: 1, padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-scroll"></i> Papers</button>
                    </div>
                  )}
                </div>

                {/* Math Subject */}
                <div style={{ background: '#262626', marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
                  <div onClick={() => setOpenSubject(openSubject === 'sub2' ? null : 'sub2')} style={{ padding: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a2a' }}>
                    <span><i className="fa-solid fa-calculator" style={{ marginRight: '8px' }}></i> Mathematics</span>
                    <i className={`fa-solid ${openSubject === 'sub2' ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </div>
                  {openSubject === 'sub2' && (
                    <div style={{ padding: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap', background: '#202020', borderTop: '1px solid #333' }}>
                      <button onClick={() => openContentModal('Math Notes')} style={{ flex: 1, padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-file-lines"></i> Notes</button>
                      <button onClick={() => openContentModal('Math Quiz')} style={{ flex: 1, padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-pen-to-square"></i> Quiz</button>
                      <button onClick={() => openContentModal('Math Papers')} style={{ flex: 1, padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-scroll"></i> Papers</button>
                    </div>
                  )}
                </div>

                {/* Upload Section */}
                <div style={{ marginTop: '20px', padding: '15px', border: '2px dashed #444', borderRadius: '10px', textAlign: 'center', background: '#181818' }}>
                  <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.8rem', color: '#0084ff' }}></i>
                  <p style={{ fontSize: '0.85rem', marginTop: '5px', color: '#bbb' }}>Upload Homework / Doubts</p>
                  <label htmlFor="gallery-file" style={{ display: 'inline-block', padding: '10px 18px', background: '#0084ff', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '8px' }}>
                    <i className="fa-regular fa-image" style={{ marginRight: '6px' }}></i> Choose from Gallery
                  </label>
                  <input type="file" id="gallery-file" accept="image/*,application/pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                </div>

                {/* Submitted Files List */}
                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: '15px', background: '#252525', padding: '10px', borderRadius: '8px' }}>
                    <h5 style={{ margin: '0 0 8px 0', color: '#0084ff' }}>Uploaded Documents:</h5>
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📄 {file.name}</span>
                        <span style={{ color: '#aaa' }}>{file.size}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- ADMIN VIEW --- */}
            {userRole === 'admin' && (
              <div>
                <p style={{ color: '#ff9900', fontSize: '0.85rem', marginBottom: '15px' }}>Admin Controls & Live Actions</p>

                <div onClick={() => alert('New study material upload menu opened!')} style={{ background: '#282828', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #ff9900', cursor: 'pointer' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}><i className="fa-solid fa-plus-circle"></i> Upload New Notes / Papers</h4>
                  <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>Click to add material for students</p>
                </div>

                <div onClick={() => alert(`Total Submissions: ${uploadedFiles.length}`)} style={{ background: '#282828', padding: '15px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #0084ff', cursor: 'pointer' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}><i className="fa-solid fa-folder-open"></i> Review Submitted Doubts</h4>
                  <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>Uploaded student files: {uploadedFiles.length}</p>
                </div>

                <div onClick={() => alert(`Registered Students List: \n${registeredStudents.map(s => s.name + ' (' + s.id + ')').join('\n')}`)} style={{ background: '#282828', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #00c853', cursor: 'pointer' }}>
                  <h4 style={{ margin: '0 0 5px 0' }}><i className="fa-solid fa-users"></i> Manage Student Accounts</h4>
                  <p style={{ fontSize: '0.8rem', color: '#aaa', margin: 0 }}>Total Enrolled Students: {registeredStudents.length}</p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Modal Viewer */}
        {activeModal === 'view' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: '#222', padding: '20px', borderRadius: '10px', width: '80%', maxWidth: '350px', textAlign: 'center' }}>
              <h3>{modalTitle}</h3>
              <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '15px 0' }}>📄 Document / PDF successfully loaded for reading.</p>
              <button onClick={() => setActiveModal(null)} style={{ padding: '8px 20px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
