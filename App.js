import React, { useState } from 'react';

function App() {
  const [userRole, setUserRole] = useState(null); // 'student', 'admin', 'register'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Login State
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dynamic Users Data with Paid Access Status
  const [registeredStudents, setRegisteredStudents] = useState([
    { id: 'student', pass: '1234', name: 'Rahul Sharma', isPaid: false }
  ]);
  const [currentStudent, setCurrentStudent] = useState(null);

  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Class Selection & Verification State
  const [selectedClass, setSelectedClass] = useState('');
  const [isClassVerified, setIsClassVerified] = useState(false);

  // Dynamic Materials & Submissions
  const [adminMaterials, setAdminMaterials] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // UI & Modal States
  const [openSubject, setOpenSubject] = useState(null);
  const [activeModal, setActiveModal] = useState(null); 
  const [modalTitle, setModalTitle] = useState('');
  
  // Admin Form State
  const [newMaterialSubject, setNewMaterialSubject] = useState('English Grammar');
  const [newMaterialTitle, setNewMaterialTitle] = useState('');
  const [newMaterialType, setNewMaterialType] = useState('Notes');

  const ADMIN_ID = "admin";
  const ADMIN_PASS = "admin123";

  // Classes List (1st to 12th)
  const classesList = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}th`);

  // Subjects List including English Grammar & Hindi Grammar
  const allSubjectsList = [
    { id: 'math', name: 'Mathematics', icon: 'fa-calculator' },
    { id: 'cs', name: 'Computer Science', icon: 'fa-code' },
    { id: 'sci', name: 'Science', icon: 'fa-flask' },
    { id: 'sst', name: 'Social Science (SST)', icon: 'fa-earth-americas' },
    { id: 'eng', name: 'English Literature', icon: 'fa-book-open' },
    { id: 'eng_gram', name: 'English Grammar', icon: 'fa-pen-nib' },
    { id: 'hin', name: 'Hindi Literature', icon: 'fa-language' },
    { id: 'hin_gram', name: 'Hindi Grammar (व्याकरण)', icon: 'fa-file-signature' }
  ];

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
        setCurrentStudent(foundStudent);
        setIsLoggedIn(true);
      } else {
        setLoginError('Invalid Student ID or Password! Please register.');
      }
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regId || !regPass || !regName) {
      setRegSuccess('Please fill all fields!');
      return;
    }
    const newStudent = { id: regId, pass: regPass, name: regName, isPaid: false };
    setRegisteredStudents([...registeredStudents, newStudent]);
    setRegSuccess('Registration successful! You can now login.');
    setTimeout(() => {
      setUserRole('student');
      setRegSuccess('');
    }, 1200);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentStudent(null);
    setUserId('');
    setPassword('');
    setLoginError('');
    setSelectedClass('');
    setIsClassVerified(false);
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setIsClassVerified(true);
  };

  // Toggle Paid Access (Admin Only)
  const toggleStudentPaidStatus = (studentId) => {
    setRegisteredStudents(registeredStudents.map(std => {
      if (std.id === studentId) {
        const updatedStatus = !std.isPaid;
        if (currentStudent && currentStudent.id === studentId) {
          setCurrentStudent({ ...currentStudent, isPaid: updatedStatus });
        }
        return { ...std, isPaid: updatedStatus };
      }
      return std;
    }));
  };

  // File Upload Handler (Ask Doubts)
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        date: new Date().toLocaleTimeString(),
        student: currentStudent ? currentStudent.name : 'Student',
        className: selectedClass
      };
      setUploadedFiles([newFile, ...uploadedFiles]);
    }
  };

  const handleAdminAddMaterial = (e) => {
    e.preventDefault();
    if (!newMaterialTitle) return;
    const newItem = {
      subject: newMaterialSubject,
      title: newMaterialTitle,
      type: newMaterialType,
      date: new Date().toLocaleTimeString()
    };
    setAdminMaterials([newItem, ...adminMaterials]);
    setNewMaterialTitle('');
    setActiveModal(null);
  };

  // Content Access Control Logic
  const handleFolderClick = (folderType, title) => {
    const classNum = parseInt(selectedClass.replace('Class ', '').replace('th', ''));
    const isPaidStudent = currentStudent ? currentStudent.isPaid : false;

    // Access Rules:
    // 1st - 9th: All Free
    // 10th, 11th, 12th: Notes & Quiz Free, Papers & Sample Papers Locked unless Paid
    if ((classNum >= 10) && (folderType === 'paper' || folderType === 'sample_paper') && !isPaidStudent) {
      setActiveModal('lockedPrompt');
    } else {
      setModalTitle(`${selectedClass} - ${title}`);
      setActiveModal('view');
    }
  };

  return (
    <div style={{ backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh', width: '100%', margin: 0, padding: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", boxSizing: 'border-box' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div style={{ width: '90%', maxWidth: '480px', backgroundColor: '#1e1e1e', padding: '25px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)', border: '1px solid #2a2a2a' }}>

        {/* 1. ROLE SELECTION */}
        {!userRole && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '10px', fontSize: '1.5rem', color: '#fff' }}>Welcome to AIMS Tutorial</h2>
            <p style={{ color: '#aaaaaa', fontSize: '0.9rem', marginBottom: '25px' }}>Please select an option to continue</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button onClick={() => setUserRole('student')} style={{ padding: '15px', background: '#282828', border: '2px solid #0084ff', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <i className="fa-solid fa-user-graduate" style={{ fontSize: '1.4rem', color: '#0084ff' }}></i>
                Student Login
              </button>

              <button onClick={() => setUserRole('admin')} style={{ padding: '15px', background: '#282828', border: '2px solid #ff9900', borderRadius: '10px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <i className="fa-solid fa-user-shield" style={{ fontSize: '1.4rem', color: '#ff9900' }}></i>
                Admin Login
              </button>

              <button onClick={() => setUserRole('register')} style={{ padding: '12px', background: 'transparent', border: '1px dashed #aaaaaa', borderRadius: '10px', color: '#aaa', cursor: 'pointer', fontSize: '0.9rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
                  {userRole === 'admin' ? '⚙️ Admin Dashboard' : `📖 Welcome, ${currentStudent ? currentStudent.name : 'Student'}`}
                </h2>
                {userRole === 'student' && (
                  <span style={{ fontSize: '0.75rem', color: currentStudent?.isPaid ? '#00c853' : '#ff9900', fontWeight: 'bold' }}>
                    Status: {currentStudent?.isPaid ? 'Unlocked (Full Access)' : 'Free Tier'}
                  </span>
                )}
              </div>
              <button onClick={handleLogout} style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                Logout
              </button>
            </div>

            {/* --- STUDENT VIEW --- */}
            {userRole === 'student' && (
              <div>
                {/* STEP 1: CLASS SELECTION (1st to 12th) */}
                {!isClassVerified ? (
                  <div>
                    <h4 style={{ color: '#0084ff', marginBottom: '12px', fontSize: '1rem' }}>Select Your Class (1 to 12):</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
                      {classesList.map((cls, idx) => (
                        <button key={idx} onClick={() => handleClassSelect(cls)} style={{ padding: '12px', background: '#262626', border: '1px solid #333', borderRadius: '8px', color: '#fff', cursor: 'pointer', textAlign: 'left', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem' }}><i className="fa-solid fa-graduation-cap" style={{ marginRight: '6px', color: '#0084ff' }}></i> {cls}</span>
                          <i className="fa-solid fa-chevron-right" style={{ color: '#aaa', fontSize: '0.7rem' }}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* STEP 2: VERIFIED CLASS SUBJECTS & FOLDERS */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 200, 83, 0.15)', border: '1px solid #00c853', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px' }}>
                      <span style={{ color: '#00c853', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <i className="fa-solid fa-circle-check" style={{ marginRight: '6px' }}></i> Verified: {selectedClass}
                      </span>
                      <button onClick={() => setIsClassVerified(false)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Change Class</button>
                    </div>

                    <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '12px' }}>All Subjects & Options:</p>

                    {/* Dynamic Subjects List */}
                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                      {['11th', '12th'].includes(selectedClass.replace('Class ', '')) ? (
                        /* Class 11th & 12th: IP Full Course */
                        <div style={{ background: '#262626', marginBottom: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
                          <div onClick={() => setOpenSubject(openSubject === 'ip' ? null : 'ip')} style={{ padding: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a2a' }}>
                            <span><i className="fa-solid fa-laptop-code" style={{ marginRight: '8px', color: '#0084ff' }}></i> IP (Informatics Practices)</span>
                            <i className={`fa-solid ${openSubject === 'ip' ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                          </div>
                          {openSubject === 'ip' && (
                            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#202020', borderTop: '1px solid #333' }}>
                              <button onClick={() => handleFolderClick('notes', 'IP Notes')} style={{ padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><i className="fa-solid fa-folder-open" style={{ color: '#ff9900' }}></i> Notes (Free)</button>
                              <button onClick={() => handleFolderClick('quiz', 'IP Quiz')} style={{ padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><i className="fa-solid fa-folder-open" style={{ color: '#00c853' }}></i> Quiz (Free)</button>
                              <button onClick={() => handleFolderClick('paper', 'IP Papers')} style={{ padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><i className={`fa-solid ${currentStudent?.isPaid ? 'fa-folder-open' : 'fa-lock'}`} style={{ color: currentStudent?.isPaid ? '#0084ff' : '#ff4d4d' }}></i> Papers {!currentStudent?.isPaid && '(Paid)'}</button>
                              <button onClick={() => handleFolderClick('sample_paper', 'IP Sample Papers')} style={{ padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><i className={`fa-solid ${currentStudent?.isPaid ? 'fa-folder-open' : 'fa-lock'}`} style={{ color: currentStudent?.isPaid ? '#0084ff' : '#ff4d4d' }}></i> Sample Papers {!currentStudent?.isPaid && '(Paid)'}</button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Classes 1st to 10th All Subjects including English & Hindi Grammar */
                        allSubjectsList.map((subj) => (
                          <div key={subj.id} style={{ background: '#262626', marginBottom: '10px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
                            <div onClick={() => setOpenSubject(openSubject === subj.id ? null : subj.id)} style={{ padding: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a2a' }}>
                              <span><i className={`fa-solid ${subj.icon}`} style={{ marginRight: '8px', color: '#0084ff' }}></i> {subj.name}</span>
                              <i className={`fa-solid ${openSubject === subj.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            </div>
                            {openSubject === subj.id && (
                              <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#202020', borderTop: '1px solid #333' }}>
                                <button onClick={() => handleFolderClick('notes', `${subj.name} Notes`)} style={{ padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><i className="fa-solid fa-folder-open" style={{ color: '#ff9900' }}></i> Notes PDF</button>
                                <button onClick={() => handleFolderClick('quiz', `${subj.name} Quiz`)} style={{ padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><i className="fa-solid fa-folder-open" style={{ color: '#00c853' }}></i> Quiz</button>
                                <button onClick={() => handleFolderClick('paper', `${subj.name} Papers`)} style={{ padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><i className={`fa-solid ${selectedClass === 'Class 10th' && !currentStudent?.isPaid ? 'fa-lock' : 'fa-folder-open'}`} style={{ color: selectedClass === 'Class 10th' && !currentStudent?.isPaid ? '#ff4d4d' : '#0084ff' }}></i> Papers {!currentStudent?.isPaid && selectedClass === 'Class 10th' && '(Paid)'}</button>
                                <button onClick={() => handleFolderClick('sample_paper', `${subj.name} Sample Papers`)} style={{ padding: '8px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}><i className={`fa-solid ${selectedClass === 'Class 10th' && !currentStudent?.isPaid ? 'fa-lock' : 'fa-folder-open'}`} style={{ color: selectedClass === 'Class 10th' && !currentStudent?.isPaid ? '#ff4d4d' : '#0084ff' }}></i> Sample Paper {!currentStudent?.isPaid && selectedClass === 'Class 10th' && '(Paid)'}</button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* ASK DOUBT SECTION */}
                    <div style={{ marginTop: '18px', padding: '12px', border: '2px dashed #444', borderRadius: '10px', textAlign: 'center', background: '#181818' }}>
                      <i className="fa-solid fa-circle-question" style={{ fontSize: '1.6rem', color: '#0084ff' }}></i>
                      <p style={{ fontSize: '0.85rem', marginTop: '4px', color: '#bbb', marginBottom: '8px' }}>Ask Doubt / Upload Solution ({selectedClass})</p>
                      <label htmlFor="gallery-file" style={{ display: 'inline-block', padding: '8px 16px', background: '#0084ff', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        <i className="fa-regular fa-image" style={{ marginRight: '6px' }}></i> Upload File from Gallery
                      </label>
                      <input type="file" id="gallery-file" accept="image/*,application/pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div style={{ marginTop: '12px', background: '#252525', padding: '10px', borderRadius: '8px' }}>
                        <h5 style={{ margin: '0 0 6px 0', color: '#0084ff', fontSize: '0.8rem' }}>Your Submissions:</h5>
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} style={{ fontSize: '0.75rem', padding: '4px 0', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between' }}>
                            <span>📄 {file.name}</span>
                            <span style={{ color: '#aaa' }}>{file.size}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* --- ADMIN VIEW --- */}
            {userRole === 'admin' && (
              <div>
                <p style={{ color: '#ff9900', fontSize: '0.85rem', marginBottom: '15px' }}>Admin Control Panel</p>

                <div onClick={() => setActiveModal('adminUpload')} style={{ background: '#282828', padding: '14px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #ff9900', cursor: 'pointer' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}><i className="fa-solid fa-plus-circle"></i> Upload New Notes / Papers</h4>
                  <p style={{ fontSize: '0.75rem', color: '#aaa', margin: 0 }}>Add study material for students</p>
                </div>

                <div onClick={() => setActiveModal('adminDoubts')} style={{ background: '#282828', padding: '14px', borderRadius: '8px', marginBottom: '10px', borderLeft: '4px solid #0084ff', cursor: 'pointer' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}><i className="fa-solid fa-folder-open"></i> Review Student Doubts</h4>
                  <p style={{ fontSize: '0.75rem', color: '#aaa', margin: 0 }}>Uploaded files: {uploadedFiles.length}</p>
                </div>

                <div onClick={() => setActiveModal('adminUsers')} style={{ background: '#282828', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #00c853', cursor: 'pointer' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}><i className="fa-solid fa-user-check"></i> Student Access Management</h4>
                  <p style={{ fontSize: '0.75rem', color: '#aaa', margin: 0 }}>Allow/Unlock paid access for offline fees</p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* --- MODAL DIALOGS --- */}

        {/* Locked Content Prompt */}
        {activeModal === 'lockedPrompt' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#222', padding: '20px', borderRadius: '12px', width: '85%', maxWidth: '350px', textAlign: 'center', border: '1px solid #ff4d4d' }}>
              <i className="fa-solid fa-lock" style={{ fontSize: '2.5rem', color: '#ff4d4d', marginBottom: '10px' }}></i>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#fff' }}>Paid Version Required</h3>
              <p style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.4', marginBottom: '15px' }}>
                Sample Papers and Papers for this class are locked. Payment is offline. Please contact Admin to unlock access after fee submission.
              </p>
              <button onClick={() => setActiveModal(null)} style={{ padding: '8px 20px', background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {activeModal === 'view' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#222', padding: '20px', borderRadius: '10px', width: '85%', maxWidth: '350px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{modalTitle}</h3>
              <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '15px 0' }}>📄 Material loaded successfully for viewing.</p>
              <button onClick={() => setActiveModal(null)} style={{ padding: '8px 20px', background: '#0084ff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )}

        {/* Admin Upload Modal */}
        {activeModal === 'adminUpload' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#222', padding: '20px', borderRadius: '10px', width: '85%', maxWidth: '380px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#ff9900', fontSize: '1.1rem' }}>Upload Material for Students</h3>
              <form onSubmit={handleAdminAddMaterial}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Subject</label>
                  <input type="text" required placeholder="Subject Name" value={newMaterialSubject} onChange={(e) => setNewMaterialSubject(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#333', color: '#fff', border: '1px solid #444', outline: 'none', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Type</label>
                  <select value={newMaterialType} onChange={(e) => setNewMaterialType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#333', color: '#fff', border: '1px solid #444', outline: 'none', marginTop: '4px' }}>
                    <option value="Notes">Notes (Free)</option>
                    <option value="Quiz">Quiz (Free)</option>
                    <option value="Paper">Paper</option>
                    <option value="Sample Paper">Sample Paper (Paid)</option>
                  </select>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#aaa' }}>Title/Topic Name</label>
                  <input type="text" required placeholder="e.g. Chapter 1 Notes" value={newMaterialTitle} onChange={(e) => setNewMaterialTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#333', color: '#fff', border: '1px solid #444', outline: 'none', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#ff9900', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Add Material</button>
                  <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '10px 15px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Review Submissions Modal */}
        {activeModal === 'adminDoubts' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#222', padding: '20px', borderRadius: '10px', width: '85%', maxWidth: '380px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#0084ff', fontSize: '1.1rem' }}>Student Doubts</h3>
              {uploadedFiles.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#aaa' }}>No student files uploaded yet.</p>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #333', fontSize: '0.8rem' }}>
                      <div>📄 <b>{file.name}</b> ({file.size})</div>
                      <div style={{ color: '#aaa', fontSize: '0.75rem' }}>Class: {file.className} | By: {file.student} at {file.date}</div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setActiveModal(null)} style={{ marginTop: '15px', width: '100%', padding: '8px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )}

        {/* Admin Student Access Management Modal */}
        {activeModal === 'adminUsers' && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: '#222', padding: '20px', borderRadius: '10px', width: '85%', maxWidth: '380px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#00c853', fontSize: '1.1rem' }}>Offline Paid Access Control</h3>
              <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '12px' }}>Allow paid access after receiving offline fee:</p>
              <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                {registeredStudents.map((std, idx) => (
                  <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #333', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div>👤 <b>{std.name}</b></div>
                      <div style={{ color: '#aaa', fontSize: '0.75rem' }}>ID: {std.id}</div>
                    </div>
                    <button onClick={() => toggleStudentPaidStatus(std.id)} style={{ padding: '6px 10px', background: std.isPaid ? '#00c853' : '#ff9900', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {std.isPaid ? 'Unlocked (Paid)' : 'Unlock Access'}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setActiveModal(null)} style={{ marginTop: '15px', width: '100%', padding: '8px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
