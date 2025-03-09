import React, { useEffect, useState } from 'react';

const AdminPage = () => {
  const [teams, setTeams] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchLocations();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:3001/user/teams');
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      setLocations(data);
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
            <th>Pin Code</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.pin_code}</td>
              <td>{new Date(team.created_at).toLocaleString()}</td>
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