const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming you have a pool instance for PostgreSQL
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware');

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register team route
router.post('/register-team', async (req, res) => {
  const { teamName, pinCode } = req.body;
  try {
    const teamExists = await pool.query('SELECT * FROM teams WHERE name = $1', [teamName]);
    if (teamExists.rows.length > 0) {
      return res.status(400).json({ error: 'Team name already exists' });
    }
    const result = await pool.query(
      'INSERT INTO teams (name, pin_code) VALUES ($1, $2) RETURNING *',
      [teamName, pinCode]
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

// Route to get all teams with their current points
router.get('/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM teams');
    const pointsResult = await pool.query('SELECT team_id, SUM(points) AS total_points FROM points_transactions GROUP BY team_id');
    const pointsMap = pointsResult.rows.reduce((acc, row) => {
      acc[row.team_id] = row.total_points;
      return acc;
    }, {});
    const teams = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      totalPoints: pointsMap[row.id] || 0,
    }));
    res.json(teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get total points for each team
router.get('/total-points', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT team_name, SUM(points) AS total_points FROM points_transactions GROUP BY team_name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to fetch team data
router.post('/fetch-team', authenticate, async (req, res) => {
  if (req.session && req.session.team) {
    res.json(req.session.team);
  } else {
    res.status(401).json({ error: 'Team not authenticated' });
  }
});

module.exports = router;
