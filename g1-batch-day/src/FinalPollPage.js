// src/FinalPollPage.js
import React, { useState, useMemo } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import './App.css';
import './FinalPoll.css';

// Finalists based on the provided poll results from all images
const finalists = {
  "Mr./Ms. Always Late": ["Sanjith Harshan", "Nikhil Kannan", "Neelesh", "Yogesh T", "Gautam Kumar M", "Saravana Kumar"],
  "Backbencher Boss": ["Nikhil Kannan", "Ganesh V", "Gautam Kumar M", "Abinandhana V", "Sanjith Harshan"],
  "The Walking Google": ["Mohan Prasath M", "Saravana Kumar", "Sanjeev R K", "Aadhav Nagaraja", "Shree Shanthi M"],
  "Unsung Hero / Heroine": ["Narayanan", "Harini P", "Kanishka AC", "Keerti Dhanyaa F", "Sarvesh"],
  "Sleeper Hit": ["Gautam Kumar M", "Saravana Kumar", "Shanmithaa", "Bommuraj E", "Nikhil Kannan", "Ratnesh"],
  "Kalakkal Comedian": ["Sanjith Harshan", "Gautam Kumar M", "Nikhil Kannan", "Neelesh", "Saumiyaa Sri V L"],
  "Flash Entry": ["Pranav A", "Nikhil Kannan", "KS Nithish Kumar", "Srinath M", "Nitish Balamurali", "Rithanya S"],
  "Lab Partner Goals": ["Nikhil Kannan", "Richitha Elango", "Narayanan", "Akhil Ramalingar", "Lisha V"],
  "Assignment Copy Center": ["Mohan Prasath M", "Gandhimathi B", "Keerti Dhanyaa F", "Preethi Reena S", "Srinithi Srinivasa"],
  "The Helping Hand": ["Narayanan", "Nikhil Kannan", "S S Pramodh", "Prem Raj T", "Kanishka AC"],
  "Silent Achiever": ["Pranav A", "Mohan Prasath M", "Jeyaprakash J", "Saravana Kumar", "Aadhav Nagaraja"],
  "Team Spirit Award": ["Kanishka AC", "Sanjeev R K", "Ahilesh Roy", "Richitha Elango", "Ratnesh"],
  "Creative Mind": ["Narayanan", "Harini P", "Saumiyaa Sri V L", "Nikhil Kannan", "Ashwin Tom"],
  "Born Leader": ["Narayanan", "Harini P", "Kanishka AC", "Nikhil Kannan", "Anbuchandiran K"],
  "Kindest Soul": ["Thrisha", "Pranav A", "Aadhav Nagaraja", "Rithanya S", "Sanjeev R K"],
  "The Motivator": ["Sanjeev R K", "Eswari S", "Mohammed Fazal", "Kanishka AC", "Ratnesh", "Chinthiya E", "Sindhu Vardhini I"],
  "Best Smile": ["Thrisha", "Pranav A", "Abinandhana V", "Rithanya S", "Narayanan"],
  "Fashion Icon": ["Shreyaa Vijayakumar", "Shanmithaa", "Abinandhana V", "Thrisha", "Ridhu Shree VS"],
  "Chameleon Award 🦎": ["Anbuchandiran K", "Divakaran A", "Neelesh", "Ashwin Tom", "Nikhil Kannan"],
  "Egoless Friend of the Class": ["Narayanan", "Preethi Reena S", "Chandra K", "Prem Raj T", "Nikhil Kannan"]
};

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

function FinalPollPage({ onBack }) {
  const [votes, setVotes] = useState(Array(awards.length).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState('');
  const [name, setName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Filter awards to only those with finalists
  const awardsWithFinalists = useMemo(() => awards.filter(award => finalists[award.title] && finalists[award.title].length > 0), []);

  const handleVoteChange = (index, value) => {
    const newVotes = [...votes];
    newVotes[index] = value;
    setVotes(newVotes);
  };

  const allPollsFilled = useMemo(() => {
    return awardsWithFinalists.every((_, index) => votes[index] && votes[index].trim() !== '');
  }, [votes, awardsWithFinalists]);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    setIsChecking(true);
    const votesQuery = query(collection(db, "final_votes"), where("voter", "==", name));
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
      setNotification('Please vote in all categories before submitting.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setNotification('');

    try {
      const finalVotesCollection = collection(db, 'final_votes');
      const promises = awardsWithFinalists.map((award, index) => {
        const voteData = {
          awardTitle: award.title,
          votedFor: votes[index],
          voter: name,
          timestamp: new Date()
        };
        return addDoc(finalVotesCollection, voteData);
      });

      await Promise.all(promises);

      setNotification('All votes submitted successfully!');
      setTimeout(() => {
          setNotification('');
          setAlreadyVoted(true);
      }, 3000);
      setVotes(Array(awards.length).fill('')); // Reset form
    } catch (error) {
      console.error("Error submitting final votes: ", error);
      setNotification('Failed to submit votes. Please try again.');
      setTimeout(() => setNotification(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (alreadyVoted) {
    return (
        <div className="page-container">
            <button onClick={onBack} className="back-button">← Back to Home</button>
            <h1>You have already voted in the final poll.</h1>
        </div>
    );
  }

  if (!nameSubmitted) {
    return (
      <div className="page-container">
        <button onClick={onBack} className="back-button">← Back to Home</button>
        <h1>Enter Your Name for the Final Vote</h1>
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
            <button type="submit" className="submit-button" disabled={isChecking}>
              {isChecking ? 'Checking...' : 'Start Final Voting'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button onClick={onBack} className="back-button">← Back to Home</button>
      <h1>Final Round: Batch Day Awards</h1>
      {awardsWithFinalists.map((award, index) => (
        <div key={index} className="final-poll-container">
          <h2>{award.title}</h2>
          <p>{award.description}</p>
          <div className="final-poll-options">
            {finalists[award.title].map((nominee, nomineeIndex) => (
              <label key={nomineeIndex} className="final-poll-label">
                <input
                  type="radio"
                  name={`award-${index}`}
                  value={nominee}
                  checked={votes[index] === nominee}
                  onChange={(e) => handleVoteChange(index, e.target.value)}
                />
                {nominee}
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="submit-all-container">
        <button
          onClick={handleSubmitAll}
          disabled={!allPollsFilled || isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Final Votes'}
        </button>
        {notification && <p className="notification-main">{notification}</p>}
      </div>
    </div>
  );
}

export default FinalPollPage;