// src/Poll.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { db } from './firebase';
import { collection, addDoc } from "firebase/firestore";

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

function Poll({ title, description }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Effect to clear notification after 3 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);
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
    setInputValue(name);
    setSuggestions([]);
  };

  const handleReasonChange = (event) => {
    setReason(event.target.value);
  };

  const handleSubmit = async () => {
    if (!inputValue || !reason) {
      setNotification({ message: 'Please select a name and provide a reason.', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "votes"), {
        awardTitle: title,
        votedFor: inputValue,
        reason: reason,
        timestamp: new Date()
      });
      setNotification({ message: 'Vote submitted successfully!', type: 'success' });
      setInputValue('');
      setReason('');
    } catch (error) {
      console.error("Error adding document: ", error);
      setNotification({ message: 'Failed to submit vote. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="poll-container">
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <h2>{title}</h2>
      <p>{description}</p>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter a name..."
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
      <textarea
        value={reason}
        onChange={handleReasonChange}
        placeholder="Why this person?"
        className="reason-input"
      />
      <button onClick={handleSubmit} disabled={isSubmitting} className="submit-button">
        {isSubmitting ? 'Submitting...' : 'Submit Vote'}
      </button>
    </div>
  );
}

export default Poll;
