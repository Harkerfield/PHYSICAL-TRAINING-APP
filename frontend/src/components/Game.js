import React, { useEffect, useState } from 'react';
import MapComponent from './Map';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import '../styles/Game.css';

const Game = () => {
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams'); // Adjust the endpoint as necessary
        setTeams(response.data);
        // Assuming the current team is stored in localStorage
        const teamId = localStorage.getItem('teamId');
        if (teamId) {
          const teamResponse = await axios.get(`/api/teams/${teamId}`);
          setCurrentTeam(teamResponse.data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  const handleQRCodeScan = () => {
    history.push('/submit-location'); // Navigate to the LocationPassword component
  };

  return (
    <div className="game-container">
      <h1>Game</h1>
      <MapComponent />
      {currentTeam && (
        <div className="current-team-info">
          <h2>Current Team: {currentTeam.name}</h2>
          <p>Score: {currentTeam.totalPoints}</p>
        </div>
      )}
      <div className="team-rankings">
        <h2>Team Rankings</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {teams.sort((a, b) => b.totalPoints - a.totalPoints).map((team, index) => (
              <tr key={team.id}>
                <td>{index + 1}</td>
                <td>{team.name}</td>
                <td>{team.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="button" onClick={handleQRCodeScan}>Scan QR Code</button>
    </div>
  );
};

export default Game;
