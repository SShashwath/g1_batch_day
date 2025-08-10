// src/App.js
import React, { useState } from 'react';
import './App.css';
import AdminDashboard from './AdminDashboard';
import PollsPage from './PollsPage';
import QuizPage from './QuizPage';
import AdminLogin from './AdminLogin'; // Import the new login component
import VoterLogPage from './VoterLogPage'; // Import the new VoterLogPage component

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
        <button onClick={() => navigate('adminLogin')} className="nav-button admin-nav-button">
          Admin Dashboard
        </button>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const navigate = (page) => {
    setCurrentPage(page);
  };

  // This function will be called from AdminLogin on success
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    navigate('admin');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'polls':
        return <PollsPage onBack={() => navigate('landing')} />;
      case 'adminLogin':
        // Show login page if not authenticated
        return <AdminLogin onLoginSuccess={handleAdminLogin} onBack={() => navigate('landing')} navigate={navigate} />;
      case 'admin':
        // Only show dashboard if authenticated, otherwise show login
        return isAdminAuthenticated
          ? <AdminDashboard onBack={() => navigate('landing')} />
          : <AdminLogin onLoginSuccess={handleAdminLogin} onBack={() => navigate('landing')} navigate={navigate} />;
      case 'quiz':
        return <QuizPage onBack={() => navigate('landing')} />;
      case 'voterLog': // Added new case for voterLog
        return <VoterLogPage onBack={() => navigate('landing')} />;
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