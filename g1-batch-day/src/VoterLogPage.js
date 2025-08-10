// src/VoterLogPage.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './App.css';

function VoterLogPage({ onBack }) {
  const [votes, setVotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const votesSnapshot = await getDocs(collection(db, "votes"));
        const votesData = votesSnapshot.docs.map(doc => doc.data());
        setVotes(votesData);
      } catch (error) {
        console.error("Error fetching votes: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVotes();
  }, []);

  return (
    <div className="dashboard-container">
      <button onClick={onBack} className="back-button">← Back to Home</button>
      <h1>Voter Log</h1>
      <div className="result-card">
        <h3>Vote Details</h3>
        {isLoading ? (
          <p>Loading votes...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Voter</th>
                <th>Award</th>
                <th>Voted For</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote, index) => (
                <tr key={index}>
                  <td>{vote.voter}</td>
                  <td>{vote.awardTitle}</td>
                  <td>{vote.votedFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default VoterLogPage;