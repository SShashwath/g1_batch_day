// src/App.js
import React, { useState } from 'react';
import './App.css';
import AdminDashboard from './AdminDashboard';
import PollsPage from './PollsPage';
import QuizPage from './QuizPage';

// Landing Page Component
function LandingPage({ navigate }) {
  return (
    <div className="landing-container">
      <h1>Welcome to the Batch Day App</h1>
      <p>Choose an activity</p>
      <div className="navigation-buttons">
        <button onClick={() => navigate('polls')} className="nav-button">
          Vote for Awards
        </button>
        <button onClick={() => navigate('quiz')} className="nav-button">
          Start the Quiz
        </button>
        <button onClick={() => navigate('admin')} className="nav-button admin-nav-button">
          Admin Dashboard
        </button>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const navigate = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'polls':
        return <PollsPage onBack={() => navigate('landing')} />;
      case 'admin':
        return <AdminDashboard onBack={() => navigate('landing')} />;
      case 'quiz':
        return <QuizPage onBack={() => navigate('landing')} />;
      case 'landing':
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {renderPage()}
      </header>
    </div>
  );
}

export default App;
