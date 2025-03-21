const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware');
const pool = require('../db');

// Create a new location
router.post('/', authenticate, async (req, res) => {
  const { name, points, latitude, longitude } = req.body;
  try {
    const newLocation = await pool.query(
      'INSERT INTO locations (name, points, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id, name, points, latitude, longitude',
      [name, points, latitude, longitude]
    );
    res.status(201).json(newLocation.rows[0]); // Return 201 status for created resource
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Read all locations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, points, latitude, longitude FROM locations');
    const locations = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      points: row.points,
      coordinates: [row.longitude, row.latitude]
    }));
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Read a single location by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, name, points, latitude, longitude FROM locations WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    const location = result.rows[0];
    res.json({
      id: location.id,
      name: location.name,
      points: location.points,
      coordinates: [location.longitude, location.latitude]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a location
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, points, latitude, longitude } = req.body;
  try {
    const updatedLocation = await pool.query(
      'UPDATE locations SET name = $1, points = $2, latitude = $3, longitude = $4 WHERE id = $5 RETURNING id, name, points, latitude, longitude',
      [name, points, latitude, longitude, id]
    );
    if (updatedLocation.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(updatedLocation.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a location
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  console.log("ID will go here .", req.params);
  try {
    const deletedLocation = await pool.query(
      'DELETE FROM locations WHERE id = $1 RETURNING id, name, points, latitude, longitude',
      [id]
    );
    if (deletedLocation.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(deletedLocation.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
