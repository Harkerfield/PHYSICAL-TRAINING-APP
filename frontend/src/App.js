import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import TeamAuth from './authentication/TeamAuth.js';
import Logout from './authentication/Logout.js';
import NavBar from './components/NavBar/NavBar.js';
import Game from './components/Game/Game.js';
import TeamScores from './components/TeamScores/TeamsScores.js';
import './styles/App.css';
import './styles/Button.css';
import React, { useState, useEffect, useContext } from 'react';
import AdminPage from './components/AdminPage.js';
import Media from './components/Media/Media.js';
import locationPage from './components/LocationsPage/LocationsPage.js';
import MyTeamsPage from './components/MyTeamsPage/MyTeamsPage.js';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const { team } = useContext(appContext);
  return team && team.name ? (
    <Component {...rest} />
  ) : (
    <Navigate to="/" />
  );
};

function App({ srvPort }) {
  const [team, setTeam] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    // Load team state from local storage
    const storedTeam = localStorage.getItem('team');
    console.log('storedTeam', storedTeam);
    if (storedTeam) {
      setTeam(JSON.parse(storedTeam));
      navigate('/game');
    }
  }, [setTeam]);

  useEffect(() => {
    if (team && team.name) {
      // Save team state to local storage
      localStorage.setItem('team', JSON.stringify(team));
      fetch(`http://localhost:${srvPort}/team/fetch-team`, {
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
          setTeam(data);
        })
        .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
        });
    }
  }, []);

  return (
    <appContext.Provider value={{ srvPort, team, setTeam }}>
      <NavBar />
      <section>
        <div>
          <Routes>
            <Route exact path="/game" element={<ProtectedRoute element={Game} />} />
            <Route exact path="/admin" element={<ProtectedRoute element={AdminPage} />} />
            <Route exact path="/media" element={<ProtectedRoute element={Media} />} />
            <Route exact path="/locations" element={<ProtectedRoute element={locationPage} />} />
            <Route exact path="/" element={<TeamAuth />} />
            <Route path="/login" element={<TeamAuth />} />
            <Route path="/logout" element={<Logout />} />
            <Route exact path="/teamScores" element={<ProtectedRoute element={TeamScores} />} />
            <Route exact path="/my-team" element={<ProtectedRoute element={MyTeamsPage} />} />
            <Route path="*" element={<TeamAuth />} />
          </Routes>
        </div>
      </section>
    </appContext.Provider>
  );
}

export const appContext = React.createContext();

export default App;
