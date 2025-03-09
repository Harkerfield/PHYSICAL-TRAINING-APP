import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Map from './components/Map';
import TeamDashboard from './components/TeamDashboard';
import AdminPage from './components/AdminPage';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import './styles/App.css';

function App() {
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
        </Switch>
      </div>
    </Router>
  );
}

export default App;