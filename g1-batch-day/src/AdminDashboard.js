import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import './App.css';

function AdminDashboard({ onBack }) {
  const [results, setResults] = useState({});
  const [finalResults, setFinalResults] = useState({}); // State for final poll results
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState([]);
  const [quizActive, setQuizActive] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [totalVoters, setTotalVoters] = useState(0);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Status
        const statusDoc = await getDocs(collection(db, "status"));
        if (!statusDoc.empty) {
          const statusData = statusDoc.docs[0].data();
          setQuizActive(statusData.quizActive);
          setPollingActive(statusData.pollingActive);
        }

        // Fetch Initial Votes
        const votesSnapshot = await getDocs(collection(db, "votes"));
        const votes = votesSnapshot.docs.map(doc => doc.data());
        const uniqueVoters = new Set(votes.map(vote => vote.voter));
        setTotalVoters(uniqueVoters.size);

        const voteCounts = votes.reduce((acc, vote) => {
          const { awardTitle, votedFor } = vote;
          if (!acc[awardTitle]) acc[awardTitle] = {};
          if (!acc[awardTitle][votedFor]) acc[awardTitle][votedFor] = 0;
          acc[awardTitle][votedFor]++;
          return acc;
        }, {});

        for (const awardTitle in voteCounts) {
          const sortedVotes = Object.entries(voteCounts[awardTitle]).sort(([, a], [, b]) => b - a);
          voteCounts[awardTitle] = sortedVotes;
        }
        setResults(voteCounts);

        // Fetch Final Votes
        const finalVotesSnapshot = await getDocs(collection(db, "final_votes"));
        const finalVotesData = finalVotesSnapshot.docs.map(doc => doc.data());

        const finalVoteCounts = finalVotesData.reduce((acc, vote) => {
            const { awardTitle, votedFor } = vote;
            if (!acc[awardTitle]) acc[awardTitle] = {};
            if (!acc[awardTitle][votedFor]) acc[awardTitle][votedFor] = 0;
            acc[awardTitle][votedFor]++;
            return acc;
        }, {});

        for (const awardTitle in finalVoteCounts) {
            const sortedVotes = Object.entries(finalVoteCounts[awardTitle]).sort(([, a], [, b]) => b - a);
            finalVoteCounts[awardTitle] = sortedVotes;
        }
        setFinalResults(finalVoteCounts);


        // Fetch Questions
        const questionsSnapshot = await getDocs(collection(db, "quiz"));
        setQuestions(questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Scores
        const scoresSnapshot = await getDocs(collection(db, "scores"));
        setScores(scoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
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
            {scores.sort((a, b) => b.score - a.score).map(score => (
              <tr key={score.id}>
                <td>{score.name}</td>
                <td>{score.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Final Polling Results */}
      <div className="result-card">
        <h3>Final Polling Results</h3>
        {isLoading ? (
          <p>Loading results...</p>
        ) : (
          <>
            {Object.keys(finalResults).length === 0 ? <p>No final votes have been submitted yet.</p> :
            Object.entries(finalResults).map(([awardTitle, votes], index) => {
              return (
                <div key={index} className="result-card">
                  <h4>{awardTitle}</h4>
                  <ul>
                    {votes.map(([name, count], voteIndex) => (
                      <li key={name} style={voteIndex === 0 ? { backgroundColor: 'gold' } : {}}>
                        <span>{name}</span>
                        <span>{count} vote(s)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Initial Polling Results */}
      <div className="result-card">
        <h3>Initial Polling Results (Top 5)</h3>
        {isLoading ? (
          <p>Loading results...</p>
        ) : (
          <>
            <p>Total number of voters: {totalVoters}</p>
            {Object.keys(results).length === 0 ? <p>No votes have been submitted yet.</p> :
            Object.entries(results).map(([awardTitle, votes], index) => {
              return (
                <div key={index} className="result-card">
                  <h4>{awardTitle}</h4>
                  <ul>
                    {votes.slice(0, 5).map(([name, count], voteIndex) => (
                      <li key={name}>
                        <span>{name}</span>
                        <span>{count} vote(s)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
