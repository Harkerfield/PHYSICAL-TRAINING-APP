const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');
const path = require('path');
const { authenticate } = require('./middleware');

const escapePgIdentifier = (value) => value.replace(/"/g, '""');

// Override the escapePgIdentifier function in pgSession
pgSession.escapePgIdentifier = escapePgIdentifier;

const app = express();

// Global config from Environment
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const SESSION_SECRET =
  process.env.SESSION_SECRET || '6f646a6c6e6775306d7a68686d64637';

const store = new pgSession({
  pool: pool, // Use the existing pool instance
  tableName: 'sessions',
});

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
app.use(
  session({
    store: store,
    name: 'connect.sid',
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 5, // in milliseconds: ms * s * m * h * d = 5 days
    },
  })
);

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

const userRouter = require('./routes/user.route.js');
const gameRouter = require('./routes/game.route.js');
app.use('/user', userRouter);
app.use('/game', gameRouter);

app.get('/api/routes', (req, res) => {
  const routes = [
    { path: '/user/teams', method: 'GET', protected: false },
    { path: '/user/register-team', method: 'POST', protected: false },
    { path: '/user/login-team', method: 'POST', protected: false },
    { path: '/user/logout', method: 'POST', protected: false },
    { path: '/user/update-points', method: 'PUT', protected: true },
    { path: '/user/submit-location', method: 'POST', protected: true },
    { path: '/user/update-location', method: 'PUT', protected: true },
    { path: '/user/upload', method: 'POST', protected: true },
    { path: '/user/fetch-user', method: 'POST', protected: true }
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
