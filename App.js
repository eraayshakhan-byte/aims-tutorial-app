import React, { useState, useEffect } from 'react';

// 🔑 Gemini API Key
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; 

export default function App() {
  // Auth States
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState([
    { email: 'admin@aims.com', password: '123', name: 'Admin Teacher', role: 'admin', studentClass: 'All' },
    { email: 'student@aims.com', password: '123', name: 'Rahul Sharma', role: 'student', studentClass: '7' }
  ]);

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('student');
  const [authClass, setAuthClass] = useState('7');

  // Navigation States
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Generator & Worksheet States
  const [topic, setTopic] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [basket, setBasket] = useState([]);

  // Persistent Worksheets (Save/Load from LocalStorage)
  const [worksheets, setWorksheets] = useState(() => {
    const saved = localStorage.getItem('aims_worksheets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('aims_worksheets', JSON.stringify(worksheets));
  }, [worksheets]);

  // Active Quiz View for Students
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Dynamic Subjects Mapping
  const getSubjectsForClass = (cls) => {
    const c = parseInt(cls);
    if (c >= 1 && c <= 4) {
      return ['English', 'Hindi', 'Maths', 'EVS', 'Computer'];
    } else if (c >= 5 && c <= 10) {
      return ['English', 'Hindi', 'Science', 'So. Science', 'Maths', 'Sanskrit', 'Computer'];
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
      // Auto redirect student to their class
      if (foundUser.role === 'student' && foundUser.studentClass !== 'All') {
        setSelectedClass(foundUser.studentClass);
      }
    } else {
      alert('Invalid Email or Password!');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authName) return alert('Fill required fields');
    const newUser = { 
      email: authEmail, 
      password: authPassword, 
      name: authName, 
      role: authRole,
      studentClass: authRole === 'student' ? authClass : 'All'
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    if (authRole === 'student') setSelectedClass(authClass);
    setAuthEmail(''); setAuthPassword(''); setAuthName('');
  };

  // Gemini API Generation
  const handleGenerateQuestions = async () => {
    if (!topic) return alert('Enter Topic name!');
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
      return alert("⚠️ Please add your Gemini API Key first!");
    }

    setIsGenerating(true);
    const promptText = `Generate \({numQuestions} multiple choice questions for Class\){selectedClass} \({selectedSubject} on Topic: "\){topic}". 
    Return ONLY a raw JSON array of objects without markdown formatting.
    Structure: [{"question": "string", "options": ["opt1", "opt2", "opt3", "opt4"], "correctAnswer": 0}]`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });
      const data = await response.json();
      let rawText = data.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(rawText).map((q, idx) => ({ id: Date.now() + idx, ...q }));
      setGeneratedQuestions(parsed);
    } catch (err) {
      alert('Error generating questions. Please check API Key.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Basket & Worksheet Management
  const addToBasket = (q) => {
    if (!basket.some(i => i.id === q.id)) setBasket([...basket, q]);
  };

  const handleCreateWorksheet = () => {
    if (basket.length === 0) return alert('Add questions to basket first.');
    const newWs = {
      id: Date.now(),
      className: String(selectedClass),
      subject: selectedSubject,
      title: `Class \({selectedClass} -\){selectedSubject} (${topic || 'General'})`,
      questions: [...basket]
    };
    setWorksheets([...worksheets, newWs]);
    setBasket([]);
    alert('✅ Worksheet / Quiz Published Successfully!');
  };

  const deleteWorksheet = (id) => {
    if (window.confirm("Delete this worksheet permanently?")) {
      setWorksheets(worksheets.filter(ws => ws.id !== id));
    }
  };

  // Printable View Function
  const downloadPDF = (wsId) => {
    const printContent = document.getElementById(`pdf-content-${wsId}`).innerHTML;
    const printWindow = window.open('', '', 'height=700,width=900');
    printWindow.document.write(`Worksheet${printContent}`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  // ---------------- UI: AUTH LOGIN / REGISTER ----------------
  if (!currentUser) {
    return (
