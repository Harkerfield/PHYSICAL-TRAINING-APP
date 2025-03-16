import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { appContext } from '../App';

const Logout = () => {
  const { setUser, srvPort } = useContext(appContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const response = await fetch(`http://localhost:${srvPort}/user/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          console.log('Logged out successfully', response);
          localStorage.removeItem('user');
          setUser(null);
          navigate('/');
        } else {
          console.error('Failed to log out');
        }
      } catch (error) {
        console.error('Error logging out:', error);
      }
    };
   handleLogout();
  }, []);

  return (
    <div>
      <h1>Logging out...</h1>
      <p>You are being logged out. Please wait...</p>
    </div>
  );
};

export default Logout;
