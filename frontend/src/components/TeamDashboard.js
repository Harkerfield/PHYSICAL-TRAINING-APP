import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TeamDashboard = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get('/api/teams'); // Adjust the endpoint as necessary
        setTeams(response.data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, []);

  return (
    <div className="team-dashboard">
      <h1>Team Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Members</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.members.join(', ')}</td>
              <td>{team.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamDashboard;