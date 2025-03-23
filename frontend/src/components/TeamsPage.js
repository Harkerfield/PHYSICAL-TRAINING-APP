import React, { useEffect, useState, useContext } from 'react';
import { appContext } from '../App';
import '../styles/Teams.css';
import '../styles/TableStyles.css'; // Import the new TableStyles.css

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);

  const { srvPort } = useContext(appContext);

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
        // Assuming the current team is stored in localStorage
        const teamId = localStorage.getItem('teamId');
        if (teamId) {
          const teamResponse = await fetch(`http://localhost:${srvPort}/team/${teamId}`, {
            method: 'GET',
            credentials: 'include',
          });
          if (!teamResponse.ok) {
            throw new Error('Network response was not ok');
          }
          const teamData = await teamResponse.json();
          setCurrentTeam(teamData);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, [srvPort]);


  return (
    <div className="team-rankings">
     <table className="table"> {/* Apply the table class */}
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
  );
};

export default TeamsPage;
