const express = require('express');
const router = express.Router();
const connection = require('../../db');
const { cacheWrapper, invalidateCache } = require('../../cache');

// GET /api/flights
router.get('/', async (req, res) => {
  const { dep, arr, airline, from, to } = req.query;
  const hasFilter = [dep, arr, airline, from, to].some(v => v && String(v).trim() !== '');
  console.log('🔍 Flights search API called', req.query);
  
  // Create cache key based on search parameters
  const cacheKey = `flights:${dep || 'any'}:${arr || 'any'}:${airline || 'any'}:${from || 'any'}:${to || 'any'}`;
  
  try {
    // Wrap the database queries in cacheWrapper
    const cachedData = await cacheWrapper(
      cacheKey,
      300, 
      async () => {
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

        const norm = s => s?.trim().replace('T', ' ') + (s ? (s.includes(':') ? ':00' : ' 00:00') : '');
        const fromDt = from ? norm(from) : null;
        const toDt   = to   ? norm(to)   : null;

        if (fromDt && toDt) {
          sql += ' AND rf.ScheduledDeparture < ? AND rf.ScheduledArrival > ?';
          values.push(toDt, fromDt);
        } else if (fromDt) {
          sql += ' AND rf.ScheduledArrival > ?';
          values.push(fromDt);
        } else if (toDt) {
          sql += ' AND rf.ScheduledDeparture < ?';
          values.push(toDt);
        }

        sql += ` GROUP BY rf.FlightID, rf.AirlineName, rf.Status, rf.ScheduledDeparture, rf.DepartureAirportName, 
        rf.ScheduledArrival, rf.ArrivalAirportName`;
        sql += ' ORDER BY rf.ScheduledDeparture DESC LIMIT 30';

        const [results] = await connection.query(sql, values);

        // Fetch popular routes
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
          console.error('❌ PopularRoutes fetch error:', err.message);
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

        // Return data to be cached
        return {
          flights,
          popularRoutes,
          resultsCount: flights.length
        };
      }
    );

    // Handle saved searches
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

    // Send response with cached data
    res.json({
      flights: cachedData.flights,
      filters: req.query,
      resultsCount: cachedData.resultsCount,
      user: req.session.userId || null,
      popularRoutes: cachedData.popularRoutes
    });
  } catch (err) {
    console.error('❌ Filtered search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flights/popular_airports
router.get('/popular_airports', async (req, res) => {
  try {
    const cachedData = await cacheWrapper(
      'popular_airports_and_routes',
      600,
      async() => {
        const [airports] = await connection.query(`SELECT AirportID, Latitude, Longitude FROM Airport`);
        const [routes] = await connection.query(
          `SELECT depAirport, arrAirport, searchCount FROM PopularRoutes
          ORDER BY searchCount DESC
          LIMIT 10`
        );

        return {airports, routes};
      }
    )
    res.json({ cachedData });
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
    // Update the database
    await connection.query(`
      INSERT INTO PopularRoutes (depAirport, arrAirport, searchCount)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE searchCount = searchCount + 1
    `, [dep.toUpperCase(), arr.toUpperCase()]);
    
    // Invalidate related cache
    invalidateCache('popular_airports_and_routes');
    invalidateCache('popular_routes');

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
    // Invalidate cache for this flight's details and reviews
    await invalidateCache('flights:*');

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

    // Invalidate cache for this flight's details and reviews
    await invalidateCache('flights:*');

    res.json({ success: true, counts: rows[0], myVote: 'dislike' });
  } catch (err) {
    console.error('❌ Dislike error:', err.message);
    res.status(500).json({ error: 'Failed to dislike flight' });
  }
});
// Get flight reviews
router.get('/:id/reviews', async (req, res) => {
  const flightId = req.params.id;
  try {
    const cachedData = await cacheWrapper(
      `flight_reviews:${flightId}`,
      300,
      async () => {
        const [reviews] = await connection.query(`
          SELECT CommentText, Score, CreatedAt 
          FROM Review WHERE FlightID = ? 
          ORDER BY CreatedAt DESC LIMIT 10`,
          [flightId]
        );
        return reviews;
      }
    );
    res.json({ reviews: cachedData});
  } catch (err) {
    console.error('❌ Error fetching reviews:', err.message);
    res.status(500).json({ error: err.message });
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

    // Invalidate cache for this flight's reviews
    await invalidateCache(`flight_reviews:${flightId}`);

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
