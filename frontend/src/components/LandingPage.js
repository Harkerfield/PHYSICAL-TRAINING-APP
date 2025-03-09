import React from 'react';
import { useHistory } from 'react-router-dom';

const LandingPage = () => {
  const history = useHistory();

  const navigateTo = (path) => {
    history.push(path);
  };

  return (
    <div className="landing-page">
      <h1>Welcome to the Physical Training App</h1>
      <button onClick={() => navigateTo('/login')}>Login</button>
      <button onClick={() => navigateTo('/register')}>Register</button>
      <button onClick={() => navigateTo('/admin')}>Admin</button>
    </div>
  );
};

export default LandingPage;