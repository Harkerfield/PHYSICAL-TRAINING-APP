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
      <div className="button-container">
        <button className="button" onClick={() => navigateTo('/login')}>Login</button>
        <button className="button" onClick={() => navigateTo('/register')}>Register</button>
        <button className="button" onClick={() => navigateTo('/admin')}>Admin</button>
      </div>
    </div>
  );
};

export default LandingPage;