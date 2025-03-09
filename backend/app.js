const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./db');

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

const userRouter = require('./routes/user.route.js');
app.use('/user', userRouter);


app.get('/', (req, res) => {
  console.log(app);
  res.status(200).json('server running');
});

module.exports = app;
