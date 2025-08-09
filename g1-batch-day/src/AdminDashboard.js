import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminDashboard({ onBack }) {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const votesSnapshot = await getDocs(collection(db, "votes"));
        const votes = votesSnapshot.docs.map(doc => doc.data());
        
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Vote Counts',
      },
    },
  };

  return (
    <div className="dashboard-container">
      <button onClick={onBack} className="back-button">← Back to Home</button>
      <h1>Admin Dashboard</h1>
      {isLoading ? (
        <p>Loading results...</p>
      ) : (
        Object.keys(results).length === 0 ? <p>No votes have been submitted yet.</p> :
        Object.entries(results).map(([awardTitle, votes], index) => {
          const chartData = {
            labels: votes.map(([name]) => name),
            datasets: [
              {
                label: 'Votes',
                data: votes.map(([, count]) => count),
                backgroundColor: 'rgba(74, 144, 226, 0.6)',
              },
            ],
          };

          return (
            <div key={index} className="result-card">
              <h3>{awardTitle}</h3>
              <Bar options={chartOptions} data={chartData} />
            </div>
          );
        })
      )}
    </div>
  );
}

export default AdminDashboard;

