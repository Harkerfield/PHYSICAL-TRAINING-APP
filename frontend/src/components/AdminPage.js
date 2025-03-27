import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { appContext } from '../App';
import '../styles/App.css';
import '../styles/Modal.css';
import '../styles/TableStyles.css'; // Import the new TableStyles.css

const AdminPage = () => {
  const { team, srvPort } = useContext(appContext);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [points, setPoints] = useState('');
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [endTime, setEndTime] = useState('2025-04-02T07:30');
  const [randomEventFrequency, setRandomEventFrequency] = useState(300000); // Default: 5 minutes
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/team`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
    const interval = setInterval(fetchTeams, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [srvPort]);

  useEffect(() => {
    const fetchFrequency = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/game/random-event-frequency`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRandomEventFrequency(data.frequency);
      } catch (error) {
        console.error('Error fetching random event frequency:', error);
      }
    };

    fetchFrequency();
  }, [srvPort]);

  useEffect(() => {
    const fetchCountdown = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/game/random-event-frequency`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEndTime(data.frequency);
      } catch (error) {
        console.error('Error fetching countdown timer:', error);
      }
    };

    fetchCountdown();
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

  const handleSetCountdown = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:${srvPort}/game/random-event-frequency`,
        { frequency: endTime },
        { withCredentials: true }
      );
      alert('Countdown timer updated successfully');
    } catch (error) {
      console.error('Error updating countdown timer:', error);
    }
  };

  const handleFrequencyChange = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:${srvPort}/game/random-event-frequency`,
        { frequency: randomEventFrequency },
        { withCredentials: true }
      );
      alert('Random event frequency updated successfully');
    } catch (error) {
      console.error('Error updating random event frequency:', error);
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
      <div>
        <h2>Set Countdown Timer</h2>
        <form onSubmit={handleSetCountdown}>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
          <button type="submit">Set Timer</button>
        </form>
      </div>
      <div>
        <h2>Set Random Event Frequency</h2>
        <form onSubmit={handleFrequencyChange}>
          <label>
            Frequency (in milliseconds):
            <input
              type="number"
              value={randomEventFrequency}
              onChange={(e) => setRandomEventFrequency(e.target.value)}
              required
            />
          </label>
          <button type="submit">Update Frequency</button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;