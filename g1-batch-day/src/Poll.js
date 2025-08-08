// src/Poll.js
import React, { useState } from 'react';
import './App.css';

// Names extracted from the PDF
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

  return (
    <div className="poll-container">
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
    </div>
  );
}

export default Poll;