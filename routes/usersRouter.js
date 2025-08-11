const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('../db');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = `
    INSERT INTO Passenger (Name, Email, Password)
    VALUES (?, ?, ?)
  `;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const [result] = await connection.query(sql, [name, email, hashedPassword]);
    res.status(200).json({ success: true, message: 'Registration successful.', userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  
  try {
    const [rows] = await connection.query('SELECT * FROM Passenger WHERE Email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'No user found' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.Password);

    if (!match) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    req.session.userId = user.PassengerID;

    // Send success response to frontend
    return res.status(200).json({ success: true, userId: user.PassengerID });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Dashboard - saved searches
router.get('/searches', async (req, res) => {
  if (!req.session.userId) return res.status(403).json({ error: 'Unauthorized' });
  const userId = req.session.userId;
  const [searches] = await connection.query(
    'SELECT * FROM SavedSearches WHERE userId = ? ORDER BY createdAt DESC LIMIT 10',
    [userId]
  );
  res.json(searches);
});

// Dashboard - manual flight
router.get('/manual-flights', async (req, res) => {
  if (!req.session.userId) return res.status(403).json({ error: 'Unauthorized' });
  const userId = req.session.userId;
  const [manuals] = await connection.query(
    'SELECT * FROM ManualFlights WHERE userId = ? ORDER BY id DESC LIMIT 10',
    [userId]
  );
  res.json(manuals);
});

// Re-search
router.get('/search-again/:id', async (req, res) => {
  const searchId = req.params.id;
  try {
    const [rows] = await connection.query('SELECT searchQuery FROM SavedSearches WHERE id = ?', [searchId]);
    if (rows.length === 0) return res.status(404).json({ error: 'Search not found' });
    res.json({ redirectUrl: rows[0].searchQuery });
  } catch (err) {
    console.error('❌ Error updating search:', err.message);
    res.status(500).json({ error: 'Failed to process search again' });
  }
});
// Autocomplete
router.get('/autocomplete', async (req, res) => {
  const query = req.query.query?.trim();
  if (!query) return res.json([]);

  try {
    const [rows] = await connection.query(
      `SELECT AirportID AS code, Name AS name
       FROM Airport
       WHERE Name LIKE ? OR AirportID LIKE ?
       ORDER BY
         CASE 
           WHEN AirportID = ? THEN 1
           WHEN AirportID LIKE ? THEN 2
           WHEN Name LIKE ? THEN 3
           ELSE 4
         END,
         Name ASC
       LIMIT 30`,
      [
        `%${query}%`,
        `%${query}%`,
        query,
        `${query}%`,
        `%${query}%`
      ]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Autocomplete error:', err.message);
    res.status(500).json({ error: 'Autocomplete failed' });
  }
});

// Create manual flight
router.post('/manual-flight', async (req, res) => {
  if (!req.session.userId) return res.status(403).json({ error: 'Unauthorized' });
  const userId = req.session.userId;
  const { FlightID, Airline, ScheduledDeparture, ScheduledArrival, DepartureAirport, ArrivalAirport, Note } = req.body;
  const sql = `
    INSERT INTO ManualFlights (userId, flightID, airline, departure, arrival, depAirport, arrAirport, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    await connection.query(sql, [userId, FlightID, Airline, ScheduledDeparture, ScheduledArrival, DepartureAirport, ArrivalAirport, Note]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('❌ Manual flight insert error:', err.message);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// Delete manual flight
router.delete('/manual-flight/:id', async (req, res) => {
  const manualId = req.params.id;
  try {
    await connection.query('DELETE FROM ManualFlights WHERE id = ?', [manualId]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete manual flight error:', err.message);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Get manual flight by id
router.get('/manual-flights/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await connection.query('SELECT * FROM ManualFlights WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Flight not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Failed to fetch flight:', err.message);
    res.status(500).json({ error: 'Failed to fetch flight' });
  }
});

// Update manual flight
router.put('/manual-flight/:id', async (req, res) => {
  const manualId = req.params.id;
  const { FlightID, Airline, ScheduledDeparture, ScheduledArrival, DepartureAirport, ArrivalAirport, Note } = req.body;
  const sql = `
    UPDATE ManualFlights SET flightID = ?, airline = ?, departure = ?, arrival = ?, depAirport = ?, arrAirport = ?, note = ?
    WHERE id = ?
  `;
  try {
    await connection.query(sql, [FlightID, Airline, ScheduledDeparture, ScheduledArrival, DepartureAirport, ArrivalAirport, Note, manualId]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Update manual flight error:', err.message);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid', { path: '/' }); 
    res.json({ success: true });
  });
});

router.get('/check-auth', (req, res) => {
  if (req.session.userId) {
    res.json({ authenticated: true, userId: req.session.userId });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
