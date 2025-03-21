import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { appContext } from '../App';
import '../styles/App.css';
import '../styles/Modal.css';

const AdminPage = () => {
  const { team, srvPort } = useContext(appContext);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [points, setPoints] = useState('');
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();



    
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`http://localhost:${srvPort}/team/teams`);
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
  // setSource(`Admin team ${team} gave points for: ${source}`);
    try {
      const response = await fetch(`http://localhost:${srvPort}/game/add-points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId: selectedTeam.id, points, source: `Admin team ${team.name} gave points for: ${source}` }),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to add points');
      }
      const data = await response.json();
      setMessage(`${data.message} to team "${data.teamName}" for ${data.points} points`);
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === selectedTeam.id ? { ...team, totalPoints: parseInt(team.totalPoints) + parseInt(points) } : team
        )
      );
      setPoints('');
      setSource('');
      setIsModalOpen(false);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const openModal = (team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      {message && <p>{message}</p>}
      <h2>Current Scores</h2>
      <table>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.totalPoints}</td>
              <td><button onClick={() => openModal(team)}>Add Points</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Add Points to {selectedTeam.name}</h2>
            <form onSubmit={handleAddPoints}>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;