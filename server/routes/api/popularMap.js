const express = require('express');
const router = express.Router();
const connection = require('../../db');

router.get('/', async (req, res) => {
  try {
    const [airports] = await connection.query(`
      SELECT AirportID, Latitude, Longitude FROM Airport
    `);

    const [routes] = await connection.query(`
      SELECT depAirport, arrAirport, COUNT(*) as searchCount
      FROM PopularRoutes
      GROUP BY depAirport, arrAirport
      ORDER BY searchCount DESC
      LIMIT 100
    `);

    res.json({ airports, routes });
  } catch (err) {
    console.error('❌ Error in /popular_airports:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
