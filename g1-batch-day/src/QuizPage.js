// src/QuizPage.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from "firebase/firestore";
import './App.css';

function QuizPage({ onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const questionsSnapshot = await getDocs(collection(db, "quiz"));
      setQuestions(questionsSnapshot.docs.map(doc => doc.data()));
    };
    fetchQuestions();
  }, []);

  const handleAnswerOptionClick = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestionIndex + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestionIndex(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

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
            {questions.length > 0 &&
              <>
                <div className='question-section'>
                  <div className='question-count'>
                    <span>Question {currentQuestionIndex + 1}</span>/{questions.length}
                  </div>
                  <div className='question-text'>{questions[currentQuestionIndex].question}</div>
                </div>
                <div className='answer-section'>
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <button key={index} onClick={() => handleAnswerOptionClick(option === questions[currentQuestionIndex].correctAnswer)}>{option}</button>
                  ))}
                </div>
              </>
            }
          </>
        )}
      </div>
    </div>
  );
}

export default QuizPage;