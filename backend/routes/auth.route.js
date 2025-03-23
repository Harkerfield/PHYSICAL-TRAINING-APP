const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming you have a pool instance for PostgreSQL
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware');

// Register team route
router.post('/register-team', async (req, res) => {
  const { teamName, pinCode, teamMembers } = req.body;
  try {
    const teamExists = await pool.query('SELECT * FROM teams WHERE name = $1', [teamName]);
    if (teamExists.rows.length > 0) {
      return res.status(400).json({ error: 'Team name already exists' });
    }
    const result = await pool.query(
      'INSERT INTO teams (name, pin_code, team_members) VALUES ($1, $2, $3) RETURNING *',
      [teamName, pinCode, JSON.stringify(teamMembers)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login team route
router.post('/login-team', async (req, res) => {
  const { teamName, pinCode } = req.body;
  try {
    const result = await pool.query('SELECT * FROM teams WHERE name = $1', [teamName]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const team = result.rows[0];
    if (team.pin_code !== pinCode) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: team.id }, process.env.SESSION_SECRET, { expiresIn: '1h' });
    req.session.team = { id: team.id, name: team.name, isAdmin: team.is_admin };
    res.json({ token, teamId: team.id, name: team.name, isAdmin: team.is_admin });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
