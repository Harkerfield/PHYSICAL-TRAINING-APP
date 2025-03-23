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

// Route to get all teams with their current points
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, team_members FROM teams');
    const pointsResult = await pool.query('SELECT team_id, SUM(points) AS total_points FROM points_transactions GROUP BY team_id');
    const pointsMap = pointsResult.rows.reduce((acc, row) => {
      acc[row.team_id] = row.total_points;
      return acc;
    }, {});
    const teams = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      team_members: row.team_members,
      totalPoints: pointsMap[row.id] || 0,
    }));
    res.json(teams);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get a single team by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, name, team_members FROM teams WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(result.rows[0]);
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

// Route to add a team member
router.post('/add-team-member', authenticate, async (req, res) => {
  const { teamId, memberName } = req.body;
  try {
    const result = await pool.query('SELECT team_members FROM teams WHERE id = $1', [teamId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    const teamMembers = result.rows[0].team_members;
    teamMembers.push(memberName);
    await pool.query('UPDATE teams SET team_members = $1 WHERE id = $2', [teamMembers, teamId]);
    res.status(200).json({ message: 'Team member added successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to update a team member
router.put('/team-members/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName } = req.body;
  if (req.session && req.session.team) {
    const teamId = req.session.team.id;
    try {
      const result = await pool.query('SELECT team_members FROM teams WHERE id = $1', [teamId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }
      const teamMembers = result.rows[0].team_members;
      const memberIndex = teamMembers.findIndex(member => member.id === parseInt(id));
      if (memberIndex === -1) {
        return res.status(404).json({ error: 'Team member not found' });
      }
      teamMembers[memberIndex] = { id: parseInt(id), firstName, lastName };
      await pool.query('UPDATE teams SET team_members = $1 WHERE id = $2', [teamMembers, teamId]);
      res.status(200).json({ message: 'Team member updated successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.status(401).json({ error: 'Team not authenticated' });
  }
});

// Route to delete a team member
router.delete('/team-members/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  if (req.session && req.session.team) {
    const teamId = req.session.team.id;
    try {
      const result = await pool.query('SELECT team_members FROM teams WHERE id = $1', [teamId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Team not found' });
      }
      let teamMembers = result.rows[0].team_members;
      teamMembers = teamMembers.filter(member => member.id !== parseInt(id));
      await pool.query('UPDATE teams SET team_members = $1 WHERE id = $2', [teamMembers, teamId]);
      res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  } else {
    res.status(401).json({ error: 'Team not authenticated' });
  }
});

module.exports = router;
