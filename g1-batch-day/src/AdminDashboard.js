import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './App.css';

function AdminDashboard({ onBack }) {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const votesSnapshot = await getDocs(collection(db, "votes"));
        const votes = votesSnapshot.docs.map(doc => doc.data());
        
        // Process votes to count occurrences
        const voteCounts = votes.reduce((acc, vote) => {
          const { awardTitle, votedFor } = vote;
          if (!acc[awardTitle]) {
            acc[awardTitle] = {};
          }
          if (!acc[awardTitle][votedFor]) {
            acc[awardTitle][votedFor] = 0;
          }
          acc[awardTitle][votedFor]++;
          return acc;
        }, {});

        // Sort the results for each award
        for (const awardTitle in voteCounts) {
          const sortedVotes = Object.entries(voteCounts[awardTitle])
            .sort(([, a], [, b]) => b - a);
          voteCounts[awardTitle] = sortedVotes;
        }

        setResults(voteCounts);
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
      <button onClick={onBack} className="back-button">← Back to Polls</button>
      <h1>Admin Dashboard</h1>
      {isLoading ? (
        <p>Loading results...</p>
      ) : (
        Object.keys(results).length === 0 ? <p>No votes have been submitted yet.</p> :
        Object.entries(results).map(([awardTitle, votes], index) => (
          <div key={index} className="result-card">
            <h3>{awardTitle}</h3>
            <ul>
              {votes.map(([name, count], i) => (
                <li key={i}>
                  {name}: <strong>{count} vote(s)</strong>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;
