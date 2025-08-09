import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc } from "firebase/firestore";
import './App.css';

const names = [
  "AR Sivakuhan", "Aadhav Nagaraja", "Aashiq Elahi R", "Abinandhana V",
  "Ahilesh Roy", "Akhil Ramalingar", "Aldric Anto A", "Anbuchandiran K",
  "Anto Francis Var", "Arunmozhivarma", "Ashwin Tom", "Balachandran I",
  "Bharath Ragav S", "Bommuraj E", "Chandra K", "Chinthiya E", "Dharshana S",
  "Divakaran A", "Eswari S", "Gandhimathi B", "Ganesh V", "Gautam Kumar M",
  "Gobiraj D", "Gokul krishna", "Gowtham V", "Harini P", "Hemashri S",
  "Jeyaprakash J", "KS Nithish Kumar", "Kanishka AC", "Kavinsharvesh S",
  "Keerthanasree I", "Keerti Dhanyaa F", "Lisha V", "Mohammed Fazal",
  "Mohan Prasath M", "Naghulan Sivam", "Narayanan", "Naveenasri R",
  "Neelesh Padmar", "Nikhil Kannan", "Nitish Balamurali", "Nivetha",
  "Padmawathy S", "Pranav A", "Preethi Reena S", "Prem Raj T", "Priyadharshini K",
  "Ratnesh", "Rechivarthini S K", "Richitha Elango", "Ridhu Shree VS", "Rithanya S",
  "S S Pramodh", "Sandhiya S", "Sanjeev R K", "Sanjith Harshan", "Saravana Kumar",
  "Saumiyaa Sri V L", "Shanmithaa", "Shree Shanthi M", "Shreyaa Vijayakumar",
  "Sindhu Kalyani M", "Sindhu Vardhini I", "Sobanarani S M", "Soniya J",
  "Sowndarya Elango", "Srinath M", "Srinithi Srinivasa", "Sruthi A",
  "Therdhana JP", "Thrisha", "Varsha", "Vetriselvan V", "Vishnu S",
  "Vishnu Preethi G", "Yogesh T", "Harish V", "Akhil MG", "Desigaa R",
  "Mughilan R", "Sarvesh", "Velumani S", "Vijaya Ragavan I", "Yashwanth B"
];


function QuizPage({ onBack }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [name, setName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [timer, setTimer] = useState(20);
  const [quizActive, setQuizActive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);


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
      setTimer(20);
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
  
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value.length > 0) {
      const filteredSuggestions = names.filter(name =>
        name.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };
  
  const handleSuggestionClick = (name) => {
    setName(name);
    setSuggestions([]);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setNameSubmitted(true);
      setSuggestions([]);
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
              onChange={handleNameChange}
              required
              style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
            />
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                  {suggestions.map((name, index) => (
                    <li key={index} onClick={() => handleSuggestionClick(name)}>
                      {name}
                    </li>
                  ))}
                </ul>
              )}
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