import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const LocationPassword = () => {
  const [locationPassword, setLocationPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const teamId = localStorage.getItem('teamId');
      const response = await fetch('http://localhost:3001/user/submit-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId, locationPassword }),
      });

      if (!response.ok) {
        throw new Error('Invalid location password');
      }

      const data = await response.json();
      history.push('/game'); // Redirect to game after successful submission
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="location-password-container">
      <h2>Submit Location Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Location Password:</label>
          <input
            type="text"
            value={locationPassword}
            onChange={(e) => setLocationPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LocationPassword;
