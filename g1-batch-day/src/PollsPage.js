import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import Poll from './Poll';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const names = [
  "AR Sivakuhan", "Aadhav Nagaraja", "Aashiq Elahi R", "Abinandhana V",
  "Ahilesh Roy", "Akhil Ramalingar", "Aldric Anto A", "Anbuchandiran K",
  "Anto Francis Varsha", "Arunmozhivarma", "Ashwin Tom", "Balachandran I",
  "Bharath Ragav S", "Bommuraj E", "Chandra K", "Chinthiya E", "Dharshana S",
  "Divakaran A", "Eswari S", "Gandhimathi B", "Ganesh V", "Gautam Kumar M",
  "Gobiraj D", "Gokul krishna", "Gowtham V", "Harini P", "Hemashri S",
  "Jeyaprakash J", "KS Nithish Kumar", "Kanishka AC", "Kavinsharvesh S",
  "Keerthanasree I", "Keerti Dhanyaa F", "Lisha V", "Mohammed Fazal",
  "Mohan Prasath M", "Naghulan Sivam", "Narayanan", "Naveenasri R",
  "Neelesh ", "Nikhil Kannan", "Nitish Balamurali", "Nivetha",
  "Padmawathy S", "Pranav A", "Preethi Reena S", "Prem Raj T", "Priyadharshini K",
  "Ratnesh", "Rechivarthini S K", "Richitha Elango", "Ridhu Shree VS", "Rithanya S",
  "S S Pramodh", "Sandhiya S", "Sanjeev R K", "Sanjith Harshan", "Saravana Kumar",
  "Saumiyaa Sri V L", "Shanmithaa", "Shree Shanthi M", "Shreyaa Vijayakumar",
  "Sindhu Kalyani M", "Sindhu Vardhini I", "Sobanarani S M", "Soniya J",
  "Sowndarya Elango", "Srinath M", "Srinithi Srinivasa", "Sruthi A",
  "Therdhana JP", "Thrisha", "Varsha", "Vetriselvan V", "Vishnu S",
  "Vishnu Preethi G", "Yogesh T", "Harish V", "Akhil MG", "Desigaa R",
  "Mughilan R", "Sarvesh", "Velumani S", "Vijaya Ragavan I", "Yashwanth B","Venkatraman"
];

const awards = [
  { title: "Mr./Ms. Always Late", description: "Makes grand entrances to class — usually after roll call." },
  { title: "Backbencher Boss", description: "Silently ruling the last bench like a mafia don." },
  { title: "The Walking Google", description: "Knows every answer — even the ones not in the syllabus." },
  { title: "Unsung Hero / Heroine", description: "Does all the work behind the scenes but never asks for credit." },
  { title: "Sleeper Hit", description: "Sleeps in class, tops in marks — science still can’t explain it." },
  { title: "Kalakkal Comedian", description: "Turns every situation into a comedy show — laughter guaranteed." },
  { title: "Flash Entry", description: "Appears suddenly, like they teleported." },
  { title: "Lab Partner Goals", description: "The duo who carry each other through every practical — true lab loyalty." },
  { title: "Assignment Copy Center", description: "Shares notes and assignments faster than Xerox shops." },
  { title: "The Helping Hand", description: "Always ready to support friends — emotionally and academically." },
  { title: "Silent Achiever", description: "Quiet in class, loud on results day." },
  { title: "Team Spirit Award", description: "Brings unity and good vibes to every group activity." },
  { title: "Creative Mind", description: "The aesthetic brain behind posters, videos, and ideas." },
  { title: "Born Leader", description: "Can handle any crisis — from group projects to class drama." },
  { title: "Kindest Soul", description: "Soft-spoken, warm-hearted, everyone’s comfort person." },
  { title: "The Motivator", description: "Pushes others to do better, even when they’re ready to give up." },
  { title: "Best Smile", description: "Their smile works like Ctrl+Z for a bad day." },
  { title: "Fashion Icon", description: "No repeat outfits. Always ready for an insta story." },
  { title: "Chameleon Award 🦎", description: "Jumps from one group to another depending on their need. Adapt to everyone." },
  { title: "Egoless Friend of the Class", description: "Helps everyone without expecting anything in return — pure hearted and drama-free." }
];

function PollsPage({ onBack }) {
  const [votes, setVotes] = useState(Array(awards.length).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState('');
  const [pollingActive, setPollingActive] = useState(true);
  const [name, setName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const statusDoc = await getDocs(collection(db, "status"));
      if (!statusDoc.empty) {
        setPollingActive(statusDoc.docs[0].data().pollingActive);
      }
    };
    fetchStatus();
  }, []);

  const handleVoteChange = (index, value) => {
    const newVotes = [...votes];
    newVotes[index] = value;
    setVotes(newVotes);
  };

  const allPollsFilled = useMemo(() => {
    return votes.every(vote => vote.trim() !== '');
  }, [votes]);

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

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!names.includes(name)) {
      alert("Name not found in the list.");
      return;
    }
    
    setIsChecking(true);
    const votesQuery = query(collection(db, "votes"), where("voter", "==", name));
    const querySnapshot = await getDocs(votesQuery);

    if (!querySnapshot.empty) {
      setAlreadyVoted(true);
    } else {
      setNameSubmitted(true);
    }
    setIsChecking(false);
  };


  const handleSubmitAll = async () => {
    if (!allPollsFilled) {
      setNotification('Please fill out all award nominations before submitting.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setNotification('');

    try {
      const votesCollection = collection(db, "votes");
      const promises = awards.map((award, index) => {
        const voteData = {
          awardTitle: award.title,
          votedFor: votes[index],
          voter: name,
          timestamp: new Date()
        };
        return addDoc(votesCollection, voteData);
      });

      await Promise.all(promises);

      setNotification('All votes submitted successfully!');
      setTimeout(() => {
          setNotification('');
          setAlreadyVoted(true); // Prevent re-voting after successful submission
      }, 3000);
      setVotes(Array(awards.length).fill('')); // Reset form
    } catch (error) {
      console.error("Error submitting votes: ", error);
      setNotification('Failed to submit votes. Please try again.');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pollingActive) {
    return (
      <div className="page-container">
        <button onClick={onBack} className="back-button">← Back to Home</button>
        <h1>Polling has ended.</h1>
      </div>
    );
  }
  
  if (alreadyVoted) {
    return (
        <div className="page-container">
            <button onClick={onBack} className="back-button">← Back to Home</button>
            <h1>You have already voted.</h1>
        </div>
    );
  }

  if (!nameSubmitted) {
    return (
      <div className="page-container">
        <button onClick={onBack} className="back-button">← Back to Home</button>
        <h1>Enter Your Name to Vote</h1>
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
            <button type="submit" className="submit-button" disabled={isChecking}>
              {isChecking ? 'Checking...' : 'Start Voting'}
            </button>
          </form>
        </div>
      </div>
    );
  }


  return (
    <div className="page-container">
      <button onClick={onBack} className="back-button">← Back to Home</button>
      <h1>Batch Day Awards</h1>
      {awards.map((award, index) => (
        <Poll
          key={index}
          title={award.title}
          description={award.description}
          selectedValue={votes[index]}
          onValueChange={(value) => handleVoteChange(index, value)}
        />
      ))}
      <div className="submit-all-container">
        <button
          onClick={handleSubmitAll}
          disabled={!allPollsFilled || isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit All Votes'}
        </button>
        {notification && <p className="notification-main">{notification}</p>}
      </div>
    </div>
  );
}

export default PollsPage;