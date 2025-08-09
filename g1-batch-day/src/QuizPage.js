// src/QuizPage.js
import React from 'react';
import './App.css';

function QuizPage({ onBack }) {
  return (
    <div className="page-container">
      <button onClick={onBack} className="back-button">← Back to Home</button>
      <h1>Timed Quiz</h1>
      <div className="quiz-card">
        <p>This feature is coming soon!</p>
      </div>
    </div>
  );
}

export default QuizPage;
