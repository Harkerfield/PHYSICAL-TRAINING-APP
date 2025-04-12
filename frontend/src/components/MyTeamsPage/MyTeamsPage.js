import React, { useState, useEffect } from 'react';
import './MyTeamsPage.css';
import '../../styles/TableStyles.css';

const MyTeamsPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberFirstName, setNewMemberFirstName] = useState('');
  const [newMemberLastName, setNewMemberLastName] = useState('');
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    const teamData = localStorage.getItem('team');
    const teamId = teamData ? JSON.parse(teamData).teamId : null;
    setTeamId(teamId);
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (teamId) {
        try {
          const response = await fetch(`http://localhost:3001/team/${teamId}`, {
            method: 'GET',
            credentials: 'include',
          });
          if (!response.ok) {
            throw new Error('Failed to fetch team members');
          }
          const data = await response.json();
          setTeamMembers(data.team_members || []);
        } catch (error) {
          console.error('Error fetching team members:', error);
        }
      }
    };

    fetchTeamMembers();
  }, [teamId]);

  const handleAddMember = async () => {
    if (newMemberFirstName.trim() !== '' && newMemberLastName.trim() !== '') {
      const newMember = {
        teamId: teamId,
        memberName: {
          firstName: newMemberFirstName.trim(),
          lastName: newMemberLastName.trim(),
        },
      };
      try {
        const response = await fetch('http://localhost:3001/team/add-team-member', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMember),
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to add team member');
        }
        setTeamMembers([...teamMembers, newMember.memberName]);
        setNewMemberFirstName('');
        setNewMemberLastName('');
      } catch (error) {
        console.error('Error adding team member:', error);
      }
    }
  };

  const handleEditMember = async (id, updatedMember) => {
    try {
      const response = await fetch(`http://localhost:3001/team/team-members/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMember),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to edit team member');
      }
      setTeamMembers((prevMembers) =>
        prevMembers.map((member) => (member.id === id ? updatedMember : member))
      );
    } catch (error) {
      console.error('Error editing team member:', error);
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/team/team-members/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete team member');
      }
      setTeamMembers((prevMembers) => prevMembers.filter((member) => member.id !== id));
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  return (
    <div className="my-teams-page">
      <div className="add-member-form">
        <input
          type="text"
          value={newMemberFirstName}
          onChange={(e) => setNewMemberFirstName(e.target.value)}
          placeholder="Enter first name"
        />
        <input
          type="text"
          value={newMemberLastName}
          onChange={(e) => setNewMemberLastName(e.target.value)}
          placeholder="Enter last name"
        />
        <button onClick={handleAddMember}>Add Member</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <tr key={member.id}>
                <td>
                  <input
                    type="text"
                    value={member.firstName}
                    onChange={(e) => handleEditMember(member.id, { ...member, firstName: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={member.lastName}
                    onChange={(e) => handleEditMember(member.id, { ...member, lastName: e.target.value })}
                  />
                </td>
                <td>
                  <button onClick={() => handleDeleteMember(member.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No team members found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyTeamsPage;
