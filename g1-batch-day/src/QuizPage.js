import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc } from "firebase/firestore";
import './App.css';

function QuizPage({ onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [name, setName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [timer, setTimer] = useState(15);
  const [quizActive, setQuizActive] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const statusDoc = await getDocs(collection(db, "status"));
      if (!statusDoc.empty) {
        setQuizActive(statusDoc.docs[0].data().quizActive);
      }
    };
    fetchStatus();
  }, []);

  const handleNextQuestion = useCallback(() => {
    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
      setTimer(15);
    } else {
      setShowScore(true);
      addDoc(collection(db, "scores"), {
        name: name,
        score: score,
        timestamp: new Date()
      });
    }
  }, [currentQuestionIndex, questions.length, name, score]);


  useEffect(() => {
    if (nameSubmitted && quizActive && !showScore) {
      if (timer > 0) {
        const interval = setInterval(() => {
          setTimer(timer - 1);
        }, 1000);
        return () => clearInterval(interval);
      } else {
        handleNextQuestion();
      }
    }
  }, [timer, nameSubmitted, showScore, handleNextQuestion, quizActive]);



  useEffect(() => {
    const fetchQuestions = async () => {
      const questionsSnapshot = await getDocs(collection(db, "quiz"));
      setQuestions(questionsSnapshot.docs.map(doc => doc.data()));
    };
    fetchQuestions();
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setNameSubmitted(true);
    }
  };

  const handleAnswerOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    handleNextQuestion();
  };

  if (!quizActive) {
    return (
      <div className="page-container">
        <button onClick={onBack} className="back-button">← Back to Home</button>
        <h1>Quiz is not active yet.</h1>
      </div>
    );
  }

  if (!nameSubmitted) {
    return (
      <div className="page-container">
        <button onClick={onBack} className="back-button">← Back to Home</button>
        <h1>Enter Your Name</h1>
        <div className="quiz-card">
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
            />
            <button type="submit" className="submit-button">Start Quiz</button>
          </form>
        </div>
      </div>
    );
  }


  return (
    <div className="page-container">
      <button onClick={onBack} className="back-button">← Back to Home</button>
      <h1>Timed Quiz</h1>
      <div className="quiz-card">
        {showScore ? (
          <div className='score-section'>
            You scored {score} out of {questions.length}
          </div>
        ) : (
          <>
            {questions.length > 0 && currentQuestionIndex < questions.length ?
              <>
                <div className='question-section'>
                  <div className='question-count'>
                    <span>Question {currentQuestionIndex + 1}</span>/{questions.length}
                    <div style={{ float: 'right' }}>Time left: {timer}</div>
                  </div>
                  <div className='question-text'>{questions[currentQuestionIndex].question}</div>
                </div>
                <div className='answer-section'>
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <button key={index} onClick={() => handleAnswerOptionClick(option === questions[currentQuestionIndex].correctAnswer)}>{option}</button>
                  ))}
                </div>
              </>
              : <p>Loading quiz...</p>
            }
          </>
        )}
      </div>
    </div>
  );
}

export default QuizPage;