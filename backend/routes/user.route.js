const express = require('express');
const router = express.Router();
const pool = require('../db'); // Assuming you have a pool instance for PostgreSQL
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Route to get all teams
router.get('/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams');
    res.json(result.rows);
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
      'INSERT INTO teams (name, pin_code, total_points) VALUES ($1, $2, $3) RETURNING *',
      [teamName, pinCode, 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login team route
router.post('/login-team', async (req, res) => {
  const { teamName, pinCode } = req.body;
  try {
    const result = await pool.query('SELECT * FROM teams WHERE name = $1', [teamName]);
    if (result.rows.length === 0) {
      return res.status(400).send('Invalid credentials');
    }
    const team = result.rows[0];
    if (team.pin_code !== pinCode) {
      return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ id: team.id }, process.env.SESSION_SECRET, { expiresIn: '1h' });
    res.json({ token, teamId: team.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update team points route
router.put('/update-points', async (req, res) => {
  const { teamId, points } = req.body;
  try {
    const result = await pool.query(
      'UPDATE teams SET total_points = total_points + $1 WHERE id = $2 RETURNING *',
      [points, teamId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Submit location password route
router.post('/submit-location', async (req, res) => {
  const { teamId, locationPassword } = req.body;
  try {
    const locationResult = await pool.query('SELECT * FROM locations WHERE password = $1', [locationPassword]);
    if (locationResult.rows.length === 0) {
      return res.status(400).send('Invalid location password');
    }
    const location = locationResult.rows[0];
    const points = location.points; // Assuming the location has a points field
    const updateResult = await pool.query(
      'UPDATE teams SET total_points = total_points + $1 WHERE id = $2 RETURNING *',
      [points, teamId]
    );
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
