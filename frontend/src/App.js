import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Map from './components/Map';
import TeamDashboard from './components/TeamDashboard';
import AdminPage from './components/AdminPage';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import Game from './components/Game';
import LocationPassword from './components/LocationPassword';
import './styles/App.css';

function App() {
  console.log('App component rendered'); // Debugging log
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={LandingPage} />
          <Route path="/map" component={Map} />
          <Route path="/dashboard" component={TeamDashboard} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/game" component={Game} />
          <Route path="/submit-location" component={LocationPassword} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;