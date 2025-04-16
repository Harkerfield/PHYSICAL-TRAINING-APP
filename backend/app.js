const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const pool = require('./db');
const path = require('path');
const { authenticate } = require('./middleware');

const app = express();

// Global config from Environment
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8000';
const SESSION_SECRET =
  process.env.SESSION_SECRET || '6f646a6c6e6775306d7a68686d64637';

// express app configuration
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: CLIENT_URL,
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
    credentials: true,
  })
);

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Middleware to log all requests and responses
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  const originalSend = res.send;
  res.send = function (body) {
    originalSend.call(this, body);
  };
  next();
});

// Serve the uploads directory as a static directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRouter = require('./routes/auth.route.js');
const locationsRouter = require('./routes/locations.route.js');
const teamRouter = require('./routes/team.route.js');
const gameTransactionsRouter = require('./routes/gameTransactions.route.js');
app.use('/api/auth', authRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/team', teamRouter);
app.use('/api/gameTransactions', gameTransactionsRouter);

app.get('/api/routes', (req, res) => {
  const routes = [
    { path: '/team/teams', method: 'GET', protected: false },
    { path: '/team/register-team', method: 'POST', protected: false },
    { path: '/team/login-team', method: 'POST', protected: false },
    { path: '/team/logout', method: 'POST', protected: false },
    { path: '/team/update-points', method: 'PUT', protected: true },
    { path: '/team/submit-location', method: 'POST', protected: true },
    { path: '/team/update-location', method: 'PUT', protected: true },
    { path: '/team/upload', method: 'POST', protected: true }
  ];
  res.json(routes);
});

app.get('/', (req, res) => {
  console.log(app);
  res.status(200).json('server running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = app;
