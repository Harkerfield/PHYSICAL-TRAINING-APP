const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Update team points route
router.put('/update-points', authenticate, async (req, res) => {
  const { teamId, points, source } = req.body;
  try {
    const result = await pool.query(
      'UPDATE teams SET total_points = total_points + $1 WHERE id = $2 RETURNING *',
      [points, teamId]
    );
    await pool.query(
      'INSERT INTO points_transactions (team_id, team_name, source, points) VALUES ($1, $2, $3, $4)',
      [teamId, result.rows[0].name, source, points]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit location password route
router.post('/submit-location', authenticate, async (req, res) => {
  const { teamId, locationPassword } = req.body;
  try {
    const locationResult = await pool.query('SELECT * FROM locations WHERE password = $1', [locationPassword]);
    if (locationResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid location password' });
    }
    const location = locationResult.rows[0];
    const points = location.points; // Assuming the location has a points field
    const updateResult = await pool.query(
      'UPDATE teams SET total_points = total_points + $1 WHERE id = $2 RETURNING *',
      [points, teamId]
    );
    await pool.query(
      'INSERT INTO points_transactions (team_id, team_name, source, points) VALUES ($1, $2, $3, $4)',
      [teamId, updateResult.rows[0].name, location.name, points]
    );
    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin route to add custom points
router.post('/add-points', authenticate, async (req, res) => {
  const { teamId, points, source } = req.body;
  if (!req.session.team.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const teamResult = await pool.query('SELECT name FROM teams WHERE id = $1', [teamId]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    const teamName = teamResult.rows[0].name;
    await pool.query(
      'INSERT INTO points_transactions (team_id, source, points) VALUES ($1, $2, $3)',
      [teamId, source, points]
    );
    res.json({ message: `Points added successfully`, teamName: teamName, points: points });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update team location route
router.put('/update-location', authenticate, async (req, res) => {
  const { teamId, latitude, longitude } = req.body;
  try {
    const result = await pool.query(
      'UPDATE teams SET current_location = POINT($1, $2), total_points = total_points + 1 WHERE id = $3 RETURNING *',
      [latitude, longitude, teamId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload file and update team points route
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  const { teamId } = req.body;
  const fileData = req.file.buffer;
  const fileName = req.file.originalname;
  try {
    await pool.query(
      'INSERT INTO files (team_id, file_data, file_name) VALUES ($1, $2, $3)',
      [teamId, fileData, fileName]
    );
    const result = await pool.query(
      'UPDATE teams SET total_points = total_points + 10 WHERE id = $1 RETURNING *',
      [teamId]
    );
    res.json({ team: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to get all point transactions and map them to team id and name
router.get('/points-transactions', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT pt.team_id, t.name as team_name, pt.source, pt.points, pt.created_at FROM points_transactions pt JOIN teams t ON pt.team_id = t.id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add route to set countdown timer
router.post('/set-countdown', authenticate, async (req, res) => {
  if (!req.session.team.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { endTime } = req.body;
  try {
    await pool.query('INSERT INTO countdown_timer (end_time) VALUES ($1)', [endTime]);
    res.status(200).json({ message: 'Countdown timer set successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update the route to fetch the countdown timer from the settings table
router.get('/countdown', async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', ['countdown_timer']);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Countdown timer not found' });
    }
    res.json({ end_time: result.rows[0].value });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add route to get random events
router.get('/random-events', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM random_events');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get random event frequency
router.get('/random-event-frequency', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', ['random_event_frequency']);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Frequency setting not found' });
    }
    res.json({ frequency: parseInt(result.rows[0].value, 10) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update random event frequency
router.put('/random-event-frequency', authenticate, async (req, res) => {
  const { frequency } = req.body;
  if (!req.session.team.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    await pool.query('UPDATE settings SET value = $1 WHERE key = $2', [frequency, 'random_event_frequency']);
    res.json({ message: 'Frequency updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add route to update team location
router.post('/update-location', authenticate, async (req, res) => {
  const { teamId, latitude, longitude } = req.body;

  try {
    // Insert into team_locations
    const locationResult = await pool.query(
      'INSERT INTO team_locations (team_id, latitude, longitude) VALUES ($1, $2, $3) RETURNING id',
      [teamId, latitude, longitude]
    );

    res.json({ message: 'Location updated successfully', locationId: locationResult.rows[0].id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add route to upload media
router.post('/upload-media', authenticate, upload.single('file'), async (req, res) => {
  const { teamLocationId, description, mediaType } = req.body;

  // Validate required fields
  if (!teamLocationId || !description || !mediaType) {
    return res.status(400).json({ error: 'Missing required fields: teamLocationId, description, or mediaType' });
  }

  const fileData = req.file?.buffer;
  if (!fileData) {
    return res.status(400).json({ error: 'File is required' });
  }

  try {
    // Insert into media
    await pool.query(
      'INSERT INTO media (team_location_id, media_type, content, description) VALUES ($1, $2, $3, $4)',
      [teamLocationId, mediaType, fileData, description]
    );

    res.json({ message: 'Media uploaded successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add route to get all uploaded media
router.get('/all-media', authenticate, async (req, res) => {
  if (!req.session.team.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const result = await pool.query(
      'SELECT id, team_location_id, media_type, description, content FROM media'
    );

    const media = result.rows.map((row) => ({
      id: row.id,
      teamLocationId: row.team_location_id,
      mediaType: row.media_type,
      description: row.event_description,
      content: row.content.toString('base64'), // Convert binary content to base64
    }));

    res.json(media);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;