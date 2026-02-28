const express = require('express');
const router = express.Router();
const axios = require('axios');
const { cacheWrapper, invalidateCache } = require('../../cache');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ||'http://ml-service:5001';

// POST /api/predictions/price
router.post('/price', async (req, res) => {
    try {
        const { departure, arrival, departureDate } = req.body;
        if (!departure || !arrival || !departureDate) {
            return res.status(400).json({
                error: 'Missing required fields: departure, arrival, departureDate'
            })
        }
        // Create cache key
        const cacheKey = `price_prediction:${departure}:${arrival}:${departureDate}`;

        // Use cachewrapper (cached for 10 minutes)
        const prediction = await cacheWrapper(cacheKey, 600, async () => {
            // Call ML service
            const response = await axios.post(
                `${ML_SERVICE_URL}/predict`,
                { departure, arrival, departureDate },
                { timeout: 5000, headers: { 'Content-Type': 'application/json'} }
            )
            return response.data;
        })
        // Return prediction
        res.json({success: true, prediction});
    }
    catch (error) {
        console.error('Price predcition error:', error.message);
        // Handel different error types
        if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
            error: 'ML service unavailable',
            message: 'Price prediction service is not running'
        });
        }
        
        if (error.code === 'ETIMEDOUT') {
        return res.status(504).json({
            error: 'ML service timeout',
            message: 'Price prediction took too long'
        });
        }
        res.status(500).json({
            error: 'Prediction failed',
            message: error.message
        })
    }
});

// Get /api/predictions/health - Check ML service health
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${ML_SERVICE_URL}/health`, {timeout: 3000});
        res.json({
            backend: 'healthy',
            ml_service: response.data
        });
    } catch (error) {
        res.status(503).json({
        backend: 'healthy',
        ml_service: 'unavailable',
        error: error.message
        });
    }
});

module.exports = router;