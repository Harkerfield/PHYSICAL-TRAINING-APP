import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { appContext } from '../App';
import '../styles/App.css';

const AdminPage = () => {
  const { srvPort } = useContext(appContext);
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState('');
  const [points, setPoints] = useState('');
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`http://localhost:${srvPort}/user/teams`);
        setTeams(response.data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
    const interval = setInterval(fetchTeams, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [srvPort]);

  const handleAddPoints = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`http://localhost:${srvPort}/game/add-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId, points, source }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to add points');
      }

      const data = await response.json();
      console.log("data", data);
      setMessage(`${data.message} to ${data.teamName} for ${data.points} points`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <form onSubmit={handleAddPoints}>
        <div>
          <label>Team ID:</label>
          <input
            type="text"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Points:</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Points</button>
      </form>
      {message && <p>{message}</p>}
      <h2>Current Scores</h2>
      <table>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;