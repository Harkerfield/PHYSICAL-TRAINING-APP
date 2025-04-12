import React, { useEffect, useState, useContext } from 'react';
import { appContext } from '../../App';
import './TeamScores.css';
import '../../styles/TableStyles.css';

const TeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [expandedTeams, setExpandedTeams] = useState({});

  const { srvPort } = useContext(appContext);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/team`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch teams');
        }
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, [srvPort]);

  const toggleTeamMembers = (teamId) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  return (
    <div className="team-rankings">
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team Name</th>
            <th>Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.sort((a, b) => b.totalPoints - a.totalPoints).map((team, index) => (
            <React.Fragment key={team.id}>
              <tr>
                <td>{index + 1}</td>
                <td>{team.name}</td>
                <td>{team.totalPoints}</td>
                <td>
                  <button className='button' onClick={() => toggleTeamMembers(team.id)}>
                    {expandedTeams[team.id] ? 'Hide Members' : 'Show Members'}
                  </button>
                </td>
              </tr>
              {expandedTeams[team.id] && team.team_members && (
                <tr>
                  <td colSpan="4">
                    <ul>
                      {team.team_members.map((member) => (
                        <li key={member.id}>{member.firstName} {member.lastName}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeamsPage;
