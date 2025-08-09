// src/AdminLogin.js
import React, { useState } from 'react';
import './App.css';

function AdminLogin({ onLoginSuccess, onBack }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // IMPORTANT: This is a simple, insecure way to handle a password.
    // In a real application, you should use a proper authentication system.
    if (password === '2309') {
      onLoginSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="page-container">
      <button onClick={onBack} className="back-button">← Back to Home</button>
      <div className="login-container">
        <h2>Admin Login</h2>
        <p>Please enter the password to view the results.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Password"
          className="password-input"
        />
        <button onClick={handleLogin} className="submit-button">
          Login
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default AdminLogin;
