import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appContext } from '../App';

const Logout = () => {
  const { setTeam, srvPort } = useContext(appContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleLogout = async () => {
      const confirmLogout = window.confirm('Are you sure you want to log out?');
      if (!confirmLogout) {
        navigate('/');
        return;
      }
      try {
        const response = await fetch(`/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          console.log('Logged out successfully', response);
          localStorage.removeItem('team');
          setTeam(null);
          navigate('/');
        } else {
          const errorMessage = await response.text();
          console.error('Failed to log out:', errorMessage);

          localStorage.removeItem('team');
          setTeam(null);
          navigate('/');

          setError(`Failed to log out: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error logging out:', error);

        setError('Error logging out. Please try again.');
      }
    };
    handleLogout();
  }, [srvPort, setTeam, navigate]);

  return (
    <div>
      <h1>Logging out...</h1>
      <p>You are being logged out. Please wait...</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Logout;
