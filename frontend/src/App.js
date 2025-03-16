import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import UserAuth from './authentication/UserAuth.js';
import SignUp from './authentication/SignUp.js';
import Logout from './authentication/Logout.js';
import NavBar from './components/NavBar.js';
import Game from './components/Game.js';
import TeamsPage from './components/TeamsPage';
import './styles/App.css';
import React, { useState, useEffect, useContext } from 'react';
import AdminPage from './components/AdminPage.js';

export const appContext = React.createContext();

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const { user } = useContext(appContext);
  return user && user.name ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/" />
  );
};

function App({ srvPort }) {
  const [user, setUser] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    // Load user state from local storage
    const storedUser = localStorage.getItem('user');
    console.log('storedUser', storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      navigate('/game');
    }
  }, [setUser]);

  useEffect(() => {
    if (user && user.name) {
      // Save user state to local storage
      localStorage.setItem('user', JSON.stringify(user));
      fetch(`http://localhost:${srvPort}/user/fetch-user`, {
        method: 'POST',
        credentials: 'include', // Include credentials (cookies)
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log(data);
          setUser(data);
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    }
  }, []);

  return (
    <appContext.Provider value={{ srvPort, user, setUser }}>
      <NavBar />
      <section>
        <div>
          <Routes>
            <Route exact path="/game" element={<ProtectedRoute element={Game} />} />
            <Route exact path="/admin" element={<ProtectedRoute element={AdminPage} />} />
            <Route exact path="/" element={<UserAuth />} />
            <Route path="/login" element={<UserAuth />} />
            <Route path="/logout" element={<Logout />} />
            <Route exact path="/teams" element={<ProtectedRoute element={TeamsPage} />} />
            <Route path="*" element={<UserAuth />} />
          </Routes>
        </div>
      </section>
    </appContext.Provider>
  );
}

export default App;
