const express = require('express');
const router = express.Router();
const connection = require('../../db');

// GET /api/flights
router.get('/', async (req, res) => {
  const { dep, arr, airline, from, to } = req.query;
  const hasFilter = [dep, arr, airline, from, to].some(v => v && String(v).trim() !== '');
  console.log('🔍 Flights search API called', req.query);
  
  let sql = `
    SELECT 
      rf.FlightID,
      rf.AirlineName,
      rf.Status,
      rf.ScheduledDeparture,
      rf.DepartureAirportName,
      rf.ScheduledArrival,
      rf.ArrivalAirportName,
      SUM(CASE WHEN rv.VoteType = 'like' THEN 1 ELSE 0 END) AS FlightLikes,
      SUM(CASE WHEN rv.VoteType = 'dislike' THEN 1 ELSE 0 END) AS FlightDislikes
    FROM RealtimeFlight rf
    LEFT JOIN ReviewVotes rv ON rf.FlightID = rv.FlightID
    WHERE 1=1
  `;
  let values = [];

  if (dep) {
    sql += ' AND (LOWER(rf.DepartureAirportID) LIKE ? OR LOWER(rf.DepartureAirportName) LIKE ?)';
    values.push(`%${dep.toLowerCase()}%`, `%${dep.toLowerCase()}%`);
  }
  if (arr) {
    sql += ' AND (LOWER(rf.ArrivalAirportID) LIKE ? OR LOWER(rf.ArrivalAirportName) LIKE ?)';
    values.push(`%${arr.toLowerCase()}%`, `%${arr.toLowerCase()}%`);
  }
  if (airline) {
    sql += ' AND (LOWER(rf.AirlineName) LIKE ?)';
    values.push(`%${airline.toLowerCase()}%`);
  }
  if (from) {
    sql += ' AND DATE(rf.ScheduledDeparture) >= ?';
    values.push(from);
  }
  if (to) {
    sql += ' AND DATE(rf.ScheduledDeparture) <= ?';
    values.push(to);
  }
  sql += ` GROUP BY rf.FlightID, rf.AirlineName, rf.Status, rf.ScheduledDeparture, rf.DepartureAirportName, 
  rf.ScheduledArrival, rf.ArrivalAirportName`;
  sql += ' ORDER BY rf.ScheduledDeparture DESC LIMIT 30';

  try {
    const [results] = await connection.query(sql, values);

    let popularRoutes = [];
    try {
      const [rows] = await connection.query(
        `SELECT depAirport, arrAirport, searchCount
         FROM PopularRoutes
         ORDER BY searchCount DESC
         LIMIT 10`
      );
      popularRoutes = rows.length > 0 ? rows : [
        { depAirport: 'JFK', arrAirport: 'LAX', searchCount: 1 },
        { depAirport: 'ORD', arrAirport: 'SFO', searchCount: 1 },
        { depAirport: 'ATL', arrAirport: 'SEA', searchCount: 0 },
        { depAirport: 'DFW', arrAirport: 'DEN', searchCount: 0 },
        { depAirport: 'MIA', arrAirport: 'BOS', searchCount: 0 },
      ];
    } catch (err) {
      console.error ('❌ PopularRoutes fetch error:', err.message);
    }

    const flights = results.map(flight => ({
      FlightID: flight.FlightID,
      Airline: flight.AirlineName,
      Status: flight.Status,
      Date: flight.ScheduledDeparture?.toISOString().split('T')[0] || 'N/A',
      ScheduledDeparture: flight.ScheduledDeparture || 'N/A',
      DepartureAirport: flight.DepartureAirportName,
      ScheduledArrival: flight.ScheduledArrival || 'N/A',
      ArrivalAirport: flight.ArrivalAirportName,
      Likes: flight.FlightLikes || 0,
      Dislikes: flight.FlightDislikes || 0
    }));

    const userId = req.session.userId || null;
    if (userId && hasFilter) {
      const queryString = new URLSearchParams(req.query);
      const fullSearchURL = `/?${queryString}`;
      const depParam = queryString.get('dep') || null;
      const arrParam = queryString.get('arr') || null;

      const [existing] = await connection.query(
        `SELECT id FROM SavedSearches WHERE userId = ? AND searchQuery = ?`,
        [userId, fullSearchURL]
      );

      if (existing.length > 0) {
        await connection.query(
          `UPDATE SavedSearches SET createdAt = NOW() WHERE id = ?`,
          [existing[0].id]
        );
      } else {
        await connection.query(
          `INSERT INTO SavedSearches (userId, searchQuery, depAirport, arrAirport) VALUES (?, ?, ?, ?)`,
          [userId, fullSearchURL, depParam, arrParam]
        );
      }
    }

    res.json({
      flights,
      filters: req.query,
      resultsCount: flights.length,
      user: req.session.userId || null,
      popularRoutes
    });
  } catch (err) {
    console.error('❌ Filtered search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flights/popular_airports
router.get('/popular_airports', async (req, res) => {
  try {
    const [airports] = await connection.query(`SELECT AirportID, Latitude, Longitude FROM Airport`);
    const [routes] = await connection.query(
      `SELECT depAirport, arrAirport, searchCount FROM PopularRoutes
       ORDER BY searchCount DESC
       LIMIT 10`
    );

    res.json({ airports, routes });
  } catch (err) {
    console.error('❌ Error fetching airport or route data:', err.message);
    res.status(500).send({ error: err.message });
  }
});

// Populate popular routes
router.post('/popular_routes', async (req, res) => {
  const { dep, arr } = req.body;
  if (!dep || !arr) {
    return res.status(400).json({ error: 'Missing dep or arr' });
  }

  try {
    await connection.query(`
      INSERT INTO PopularRoutes (depAirport, arrAirport, searchCount)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE searchCount = searchCount + 1
    `, [dep.toUpperCase(), arr.toUpperCase()]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error incrementing PopularRoutes:', err.message);
    res.status(500).json({ error: 'DB update failed' });
  }
}); 

// Like a flight
router.post('/:id/like', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json();
  }
  const userId = req.session.userId;
  const flightId = req.params.id;
  try {
    await connection.query(`
      INSERT INTO ReviewVotes (FlightID, UserId, VoteType)
      VALUE (?, ?, 'like')
      ON DUPLICATE KEY UPDATE VoteType = 'like'
      `, [flightId, userId]);
    const [rows] = await connection.query(
      `SELECT
         SUM(CASE WHEN VoteType='like' THEN 1 ELSE 0 END) + 0 AS Likes,
         SUM(CASE WHEN VoteType='dislike' THEN 1 ELSE 0 END) + 0 AS Dislikes
       FROM ReviewVotes
       WHERE FlightID = ?`,
      [flightId]
    );
    res.json({ success: true, counts: rows[0], myVote: 'like' });
  } catch (err) {
    console.error('❌ Like error:', err.message);
    res.status(500).json({ error: 'Failed to like flight' });
  }
});
// Dislike a flight
router.post('/:id/dislike', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json();
  }
  const userId = req.session.userId;
  const flightId = req.params.id;
  try {
    await connection.query(`
      INSERT INTO ReviewVotes (FlightID, UserId, VoteType)
      VALUE (?, ?, 'dislike')
      ON DUPLICATE KEY UPDATE VoteType = 'dislike'
      `, [flightId, userId]);
    const [rows] = await connection.query(
      `SELECT
         SUM(CASE WHEN VoteType='like' THEN 1 ELSE 0 END) + 0 AS Likes,
         SUM(CASE WHEN VoteType='dislike' THEN 1 ELSE 0 END) + 0 AS Dislikes
       FROM ReviewVotes
       WHERE FlightID = ?`,
      [flightId]
    );
    res.json({ success: true, counts: rows[0], myVote: 'dislike' });
  } catch (err) {
    console.error('❌ Dislike error:', err.message);
    res.status(500).json({ error: 'Failed to dislike flight' });
  }
});
// Get flight reviews
router.post('/:id/dislike', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json();
  }
  const userId = req.session.userId;
  const flightId = req.params.id;
  try {
    await connection.query(`
      INSERT INTO ReviewVotes (FlightID, UserId, VoteType)
      VALUE (?, ?, 'dislike')
      ON DUPLICATE KEY UPDATE VoteType = 'dislike'
      `, [flightId, userId]);
    const [rows] = await connection.query(
      `SELECT
         SUM(CASE WHEN VoteType='like' THEN 1 ELSE 0 END) + 0 AS Likes,
         SUM(CASE WHEN VoteType='dislike' THEN 1 ELSE 0 END) + 0 AS Dislikes
       FROM ReviewVotes
       WHERE FlightID = ?`,
      [flightId]
    );
    res.json({ success: true, counts: rows[0] });
  } catch (err) {
    console.error('❌ Dislike error:', err.message);
    res.status(500).json({ error: 'Failed to dislike flight' });
  }
});

// Post a review
router.post('/:id/reviews', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to leave a review' });
  }
  const userId = req.session.userId;
  const flightId = req.params.id;
  const { comment, score } = req.body;
  const sql = `
    INSERT INTO Review (PassengerID, FlightID, CommentText, Score, CreatedAt)
      VALUES (?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        CommentText = VALUES(CommentText),
        Score = VALUES(Score),
        CreatedAt = NOW()
  `;
  try {
    await connection.query(sql, [userId, flightId, comment, score]);
    // Return updated review after insert
    const[reviews] = await connection.query(
      `SELECT CommentText, Score, CreatedAt
       FROM Review 
       WHERE FlightID = ? 
       ORDER BY CreatedAt DESC 
       LIMIT 10`, 
      [flightId]
    );
    res.status(201).json({ reviews });
  } catch (err) {
    console.error('❌ Review insert error:', err.message);
    res.status(500).json({ error: 'Adding review failed' });
  }
});

module.exports = router;
