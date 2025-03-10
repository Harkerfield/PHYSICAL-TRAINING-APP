import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Login = () => {
  const [teamName, setTeamName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/user/login-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName, pinCode }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('teamId', data.teamId); // Store teamId in localStorage
      history.push('/game'); // Redirect to game after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Team Name:</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Pin Code:</label>
          <input
            type="password"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;