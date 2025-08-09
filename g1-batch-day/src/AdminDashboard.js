import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminDashboard({ onBack }) {
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState([]);
  const [quizActive, setQuizActive] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const statusDoc = await getDocs(collection(db, "status"));
      if (!statusDoc.empty) {
        const statusData = statusDoc.docs[0].data();
        setQuizActive(statusData.quizActive);
        setPollingActive(statusData.pollingActive);
      }
    };


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

    const fetchQuestions = async () => {
      const questionsSnapshot = await getDocs(collection(db, "quiz"));
      setQuestions(questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchScores = async () => {
        const scoresSnapshot = await getDocs(collection(db, "scores"));
        setScores(scoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    
    fetchStatus();
    fetchVotes();
    fetchQuestions();
    fetchScores();
  }, []);

  const handleQuestionChange = (e) => {
    setNewQuestion({ ...newQuestion, question: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const options = [...newQuestion.options];
    options[index] = value;
    setNewQuestion({ ...newQuestion, options });
  };

  const handleCorrectAnswerChange = (e) => {
    setNewQuestion({ ...newQuestion, correctAnswer: e.target.value });
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question || newQuestion.options.some(opt => !opt) || !newQuestion.correctAnswer) {
      alert("Please fill out all fields");
      return;
    }
    await addDoc(collection(db, "quiz"), newQuestion);
    setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: '' });
    const questionsSnapshot = await getDocs(collection(db, "quiz"));
    setQuestions(questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteQuestion = async (id) => {
    await deleteDoc(doc(db, "quiz", id));
    setQuestions(questions.filter(q => q.id !== id));
  };
  
  const toggleQuiz = async () => {
    const newQuizStatus = !quizActive;
    setQuizActive(newQuizStatus);
    await setDoc(doc(db, "status", "appStatus"), { quizActive: newQuizStatus, pollingActive }, { merge: true });
  };

  const togglePolling = async () => {
    const newPollingStatus = !pollingActive;
    setPollingActive(newPollingStatus);
    await setDoc(doc(db, "status", "appStatus"), { pollingActive: newPollingStatus, quizActive }, { merge: true });
  };


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

      <div className="result-card">
        <h3>Controls</h3>
        <button onClick={toggleQuiz} className="submit-button">{quizActive ? 'Stop Quiz' : 'Start Quiz'}</button>
        <button onClick={togglePolling} className="submit-button" style={{marginTop: '10px'}}>{pollingActive ? 'End Polling' : 'Start Polling'}</button>
      </div>

      <div className="result-card">
        <h3>Add Quiz Question</h3>
        <input
          type="text"
          placeholder="Question"
          value={newQuestion.question}
          onChange={handleQuestionChange}
          style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
        />
        {newQuestion.options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
          />
        ))}
        <input
          type="text"
          placeholder="Correct Answer"
          value={newQuestion.correctAnswer}
          onChange={handleCorrectAnswerChange}
          style={{ marginBottom: '10px', width: '100%', padding: '8px' }}
        />
        <button onClick={handleAddQuestion} className="submit-button">Add Question</button>
      </div>

      <div className="result-card">
        <h3>Existing Questions</h3>
        {questions.map((q) => (
          <div key={q.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <p>{q.question}</p>
            <button onClick={() => handleDeleteQuestion(q.id)} style={{ float: 'right' }}>Delete</button>
          </div>
        ))}
      </div>

       <div className="result-card">
        <h3>Quiz Scores</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map(score => (
              <tr key={score.id}>
                <td>{score.name}</td>
                <td>{score.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


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