import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Map from './components/Map';
import TeamDashboard from './components/TeamDashboard';
import AdminPage from './components/AdminPage';
import Login from './components/Login';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Map} />
          <Route path="/dashboard" component={TeamDashboard} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/login" component={Login} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;