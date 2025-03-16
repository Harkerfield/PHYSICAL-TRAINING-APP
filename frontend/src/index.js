import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import App from './App';
import './styles/App.css';
import './styles/Modal.css';
import cyberShisa from './assets/cyber-shisa.jpeg';

const srvPort = process.env.REACT_APP_SERVER_PORT || 3001;

const backgroundStyle = {
  backgroundImage: `url(${cyberShisa})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  width: '100%',
  height: '100%',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: -1,
};

const history = createBrowserHistory({ v7_startTransition: true, v7_relativeSplatPath: true });

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <HistoryRouter history={history}>
    <div style={backgroundStyle}></div>
    <App srvPort={srvPort} />
  </HistoryRouter>
);