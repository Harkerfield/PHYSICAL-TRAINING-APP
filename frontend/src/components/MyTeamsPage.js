import React, { useState, useEffect } from 'react';
import '../styles/Teams.css';

const MyTeamsPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberFirstName, setNewMemberFirstName] = useState('');
  const [newMemberLastName, setNewMemberLastName] = useState('');

  useEffect(() => {
    const teamId = localStorage.getItem('teamId');
    if (teamId) {
      // Fetch team members for the currently logged-in team
      const fetchTeamMembers = async () => {
        const response = await fetch(`http://localhost:3001/team/${id}`, {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        setTeamMembers(data);
      };
      fetchTeamMembers();
    }
  }, []);

  const handleAddMember = async () => {
    if (newMemberFirstName.trim() !== '' && newMemberLastName.trim() !== '') {
      const newMember = {
        firstName: newMemberFirstName.trim(),
        lastName: newMemberLastName.trim()
      };
      const response = await fetch('http://localhost:3001/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMember),
        credentials: 'include'
      });
      if (response.ok) {
        setTeamMembers([...teamMembers, newMember]);
        setNewMemberFirstName('');
        setNewMemberLastName('');
      }
    }
  };

  const handleEditMember = async (id, updatedMember) => {
    const response = await fetch(`http://localhost:3001/team/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedMember),
      credentials: 'include'
    });
    if (response.ok) {
      const updatedTeamMembers = teamMembers.map(member =>
        member.id === id ? updatedMember : member
      );
      setTeamMembers(updatedTeamMembers);
    }
  };

  const handleDeleteMember = async (id) => {
    const response = await fetch(`http://localhost:3001/team/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (response.ok) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
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
      <ul className="team-members-list">
        {teamMembers.map((member) => (
          <li key={member.id}>
            <input
              type="text"
              value={member.firstName}
              onChange={(e) => handleEditMember(member.id, { ...member, firstName: e.target.value })}
            />
            <input
              type="text"
              value={member.lastName}
              onChange={(e) => handleEditMember(member.id, { ...member, lastName: e.target.value })}
            />
            <button onClick={() => handleDeleteMember(member.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyTeamsPage;
