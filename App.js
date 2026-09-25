import React, { useState, useEffect } from 'react';

export default function App() {
  // --- Auth States ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState([
    { email: 'admin@aims.com', password: '123', name: 'Admin Teacher', role: 'admin' },
    { email: 'student@aims.com', password: '123', name: 'Rahul Sharma', role: 'student', class: '10' }
  ]);

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState('student');
  const [authClass, setAuthClass] = useState('10');

  // Navigation States
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Quiz / Text Converter States
  const [rawText, setRawText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [worksheets, setWorksheets] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Load Worksheets on Mount
  useEffect(() => {
    const saved = localStorage.getItem('aims_worksheets');
    if (saved) {
      try { setWorksheets(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveWorksheetsToStorage = (updated) => {
    setWorksheets(updated);
    localStorage.setItem('aims_worksheets', JSON.stringify(updated));
  };

  // Auth Logic
  const handleAuthSubmit = () => {
    if (isRegistering) {
      if (!authEmail || !authPassword || !authName) {
        alert('Kripya saari details bharein.');
        return;
      }
      const newUser = { email: authEmail, password: authPassword, name: authName, role: authRole, class: authClass };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
    } else {
      const user = users.find(u => u.email === authEmail && u.password === authPassword);
      if (user) {
        setCurrentUser(user);
      } else {
        alert('Galat Email ya Password!');
      }
    }
  };

  // Gemini Text Parsing Engine
  const handleParseTextToQuiz = () => {
    if (!rawText.trim()) return;
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const questionsArr = [];
    let currentQ = null;

    lines.forEach(line => {
      const qMatch = line.match(/^(?:Q\d*[\.:\)]|\d+[\.:\)])\s*(.*)/i);
      const optMatch = line.match(/^(?:[A-Da-d][\.:\)]|\([A-Da-d]\))\s*(.*)/i);
      const ansMatch = line.match(/(?:Answer|Ans|Correct Option)[\s:]*([A-Da-d])/i);

      if (qMatch) {
        if (currentQ) questionsArr.push(currentQ);
        currentQ = { id: Date.now() + Math.random(), question: qMatch[1], options: [], correctAnswer: 0 };
      } else if (optMatch && currentQ) {
        currentQ.options.push(optMatch[1]);
      } else if (ansMatch && currentQ) {
        const letter = ansMatch[1].toUpperCase();
        currentQ.correctAnswer = letter.charCodeAt(0) - 65;
      }
    });
    if (currentQ) questionsArr.push(currentQ);

    if (questionsArr.length === 0) {
      alert('Text format samajh nahi aaya. Kripya Gemini se aane waale questions sahi format me paste karein.');
    } else {
      setParsedQuestions(questionsArr);
    }
  };

  const handleSaveWorksheet = () => {
    if (!quizTitle.trim()) {
      alert('Kripya Quiz ka Title daalein!');
      return;
    }
    const newWs = {
      id: Date.now(),
      title: quizTitle,
      className: selectedClass,
      subject: selectedSubject,
      questions: parsedQuestions
    };
    const updated = [newWs, ...worksheets];
    saveWorksheetsToStorage(updated);
    setRawText('');
    setParsedQuestions([]);
    setQuizTitle('');
    alert('Quiz safaltapoorvak publish ho gaya!');
  };

  const deleteWorksheet = (id) => {
    const updated = worksheets.filter(w => w.id !== id);
    saveWorksheetsToStorage(updated);
  };

  const handleSubmitQuiz = () => {
    let calcScore = 0;
    activeQuiz.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        calcScore += 1;
      }
    });
    setScore(calcScore);
    setQuizSubmitted(true);
  };

  const getSubjectsForClass = (cls) => {
    if (cls >= 11) return ['Informatics Practices', 'Computer Science', 'Physics', 'Chemistry', 'Mathematics'];
    if (cls >= 9) return ['Science', 'Mathematics', 'Social Science', 'English', 'Hindi'];
    return ['EVS', 'Mathematics', 'English', 'Hindi'];
  };

  const currentFilteredWorksheets = worksheets.filter(ws =>
    String(ws.className) === String(selectedClass) && ws.subject === selectedSubject
  );

  // --- UI RENDER ---
  if (!currentUser) {
    return (
