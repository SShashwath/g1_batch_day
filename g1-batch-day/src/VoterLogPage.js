// src/VoterLogPage.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './App.css';

function VoterLogPage({ onBack }) {
  const [initialVoteLog, setInitialVoteLog] = useState({});
  const [finalVoteLog, setFinalVoteLog] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVoteLogs = async () => {
      setIsLoading(true);
      try {
        // Fetch both initial and final votes in parallel
        const [initialVotesSnapshot, finalVotesSnapshot] = await Promise.all([
          getDocs(collection(db, "votes")),
          getDocs(collection(db, "final_votes"))
        ]);

        // Process initial votes
        const initialVotesData = initialVotesSnapshot.docs.map(doc => doc.data());
        const processedInitialLog = processVotes(initialVotesData);
        setInitialVoteLog(processedInitialLog);

        // Process final votes
        const finalVotesData = finalVotesSnapshot.docs.map(doc => doc.data());
        const processedFinalLog = processVotes(finalVotesData);
        setFinalVoteLog(processedFinalLog);

      } catch (error) {
        console.error("Error fetching vote logs: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to group and sort votes
    const processVotes = (votes) => {
      const groupedVotes = votes.reduce((acc, vote) => {
        const { awardTitle, votedFor, voter } = vote;
        if (!acc[awardTitle]) {
          acc[awardTitle] = [];
        }
        acc[awardTitle].push({ votedFor, voter });
        return acc;
      }, {});

      // Sort votes within each award category
      for (const awardTitle in groupedVotes) {
        groupedVotes[awardTitle].sort((a, b) => {
          // Sort first by the person voted for, then by the voter
          if (a.votedFor < b.votedFor) return -1;
          if (a.votedFor > b.votedFor) return 1;
          if (a.voter < b.voter) return -1;
          if (a.voter > b.voter) return 1;
          return 0;
        });
      }
      return groupedVotes;
    };

    fetchVoteLogs();
  }, []);

  // Helper component to render a log table
  const renderLogTable = (logData) => {
    const sortedAwards = Object.keys(logData).sort();

    if (sortedAwards.length === 0) {
        return <p>No votes have been submitted for this round yet.</p>
    }

    return sortedAwards.map(awardTitle => (
      <div key={awardTitle} style={{ marginBottom: '2rem' }}>
        <h4>{awardTitle}</h4>
        <table className="log-table">
          <thead>
            <tr>
              <th>Voted For</th>
              <th>Voted By</th>
            </tr>
          </thead>
          <tbody>
            {logData[awardTitle].map((vote, index) => (
              <tr key={index}>
                <td>{vote.votedFor}</td>
                <td>{vote.voter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <button onClick={onBack} className="back-button">← Back to Home</button>
        <h1>Loading Voter Logs...</h1>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <button onClick={onBack} className="back-button">← Back to Home</button>
      <h1>Voter Logs</h1>

      <div className="result-card">
        <h3>Final Poll Voter Log</h3>
        {renderLogTable(finalVoteLog)}
      </div>

      <div className="result-card">
        <h3>Initial Poll Voter Log</h3>
        {renderLogTable(initialVoteLog)}
      </div>
    </div>
  );
}

export default VoterLogPage;