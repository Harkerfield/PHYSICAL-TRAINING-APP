const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming you have a pool instance for PostgreSQL
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Route to get all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Register route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).send('Invalid credentials');
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ id: user.id }, process.env.SESSION_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Register team route
router.post('/register-team', async (req, res) => {
  const { teamName, pinCode } = req.body;
  try {
    const teamExists = await pool.query('SELECT * FROM teams WHERE name = $1', [teamName]);
    if (teamExists.rows.length > 0) {
      return res.status(400).send('Team name already exists');
    }
    const result = await pool.query(
      'INSERT INTO teams (name, pin_code) VALUES ($1, $2) RETURNING *',
      [teamName, pinCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get all teams route
router.get('/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
