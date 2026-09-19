import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// -------------------------------------------------------------
// 1. FIREBASE CONFIGURATION (FREE TIER)
// Firebase Console (console.firebase.google.com) se apni keys yahan daalein
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// -------------------------------------------------------------
// MAIN APP COMPONENT
// -------------------------------------------------------------
export default function App() {
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz', 'pdf', 'admin'
  
  // Quiz State
  const [quizData, setQuizData] = useState([
    {
      id: 1,
      question: "Which article is used before a singular countable noun starting with a consonant sound?",
      options: ["A", "An", "The", "No article"],
      correctAnswer: 0,
      explanation: "'A' is used before consonant sounds (e.g., A book, A cat)."
    },
    {
      id: 2,
      question: "Which article is used for specific or unique nouns?",
      options: ["A", "An", "The", "None of these"],
      correctAnswer: 2,
      explanation: "'The' is a definite article used for specific things (e.g., The Sun)."
    }
  ]);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Quiz Option Select Handler
  const handleOptionSelect = (questionId, optionIndex) => {
    if (isSubmitted) return; // Prevent change after submit
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex
    });
  };

  // Quiz Submit Handler
  const handleQuizSubmit = () => {
    let calculatedScore = 0;
    quizData.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        calculatedScore += 1;
      }
    });
    setScore(calculatedScore);
    setIsSubmitted(true);
  };

  // Quiz Reset Handler
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      
      {/* Navigation Header */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('quiz')}
          style={{ padding: '10px 20px', background: activeTab === 'quiz' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Live Quiz Engine
        </button>
        <button 
          onClick={() => setActiveTab('pdf')}
          style={{ padding: '10px 20px', background: activeTab === 'pdf' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Notes PDF Viewer
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* LIVE QUIZ ENGINE SECTION */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'quiz' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2>Class 1th - Articles Quiz (Live)</h2>
          <hr />

          {quizData.map((q, index) => (
            <div key={q.id} style={{ marginBottom: '20px', textAlign: 'left' }}>
              <p style={{ fontWeight: 'bold' }}>Q{index + 1}. {q.question}</p>
              
              {q.options.map((opt, i) => {
                let btnStyle = {
                  display: 'block',
                  width: '100%',
                  padding: '10px',
                  margin: '5px 0',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  textAlign: 'left',
                  cursor: 'pointer',
                  backgroundColor: '#fff'
                };

                // Selection highlight
                if (selectedAnswers[q.id] === i) {
                  btnStyle.backgroundColor = '#e2e3e5';
                  btnStyle.borderColor = '#6c757d';
                }

                // After submit - Green for correct, Red for wrong
                if (isSubmitted) {
                  if (i === q.correctAnswer) {
                    btnStyle.backgroundColor = '#d4edda';
                    btnStyle.borderColor = '#28a745';
                    btnStyle.color = '#155724';
                  } else if (selectedAnswers[q.id] === i && i !== q.correctAnswer) {
                    btnStyle.backgroundColor = '#f8d7da';
                    btnStyle.borderColor = '#dc3545';
                    btnStyle.color = '#721c24';
                  }
                }

                return (
                  <button 
                    key={i} 
                    onClick={() => handleOptionSelect(q.id, i)}
                    style={btnStyle}
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                );
              })}

              {/* Explanation after submit */}
              {isSubmitted && (
                <div style={{ fontSize: '13px', color: '#555', marginTop: '5px', background: '#eef', padding: '8px', borderRadius: '4px' }}>
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}

          {/* Submit / Result Section */}
          {!isSubmitted ? (
            <button 
              onClick={handleQuizSubmit}
              style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}
            >
              Submit Test
            </button>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '20px', padding: '15px', background: '#e9ecef', borderRadius: '8px' }}>
              <h3>Test Completed! 🎉</h3>
              <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                Your Score: {score} / {quizData.length}
              </p>
              <button 
                onClick={handleResetQuiz}
                style={{ padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Re-take Quiz
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PDF VIEWER SECTION */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'pdf' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '700px', margin: '0 auto' }}>
          <h2>Study Notes (PDF)</h2>
          <p>Firebase Storage se link hone ke baad aapki real PDF yahan render hogi:</p>
          
          {/* Sample PDF Embed (Free & Built-in browser support) */}
          <iframe 
            src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" 
            title="PDF Viewer"
            width="100%" 
            height="500px" 
            style={{ border: '1px solid #ccc', borderRadius: '5px' }}
          />
        </div>
      )}

    </div>
  );
}
