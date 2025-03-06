import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [teams, setTeams] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchLocations();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      <h2>Teams</h2>
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

      <h2>Locations</h2>
      <ul>
        {locations.map((location) => (
          <li key={location.id}>
            {location.name} - Points: {location.point_value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;