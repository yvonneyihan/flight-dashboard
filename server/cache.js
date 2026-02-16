const redis = require('redis');

// Connection config
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis reconnection failed after 10 attempts');
        return new Error('Redis connection failed');
      }
      return retries * 100; // Exponential backoff
    }
  }
});

// Event listeners
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

client.on('ready', () => {
  console.log('✅ Redis ready to accept commands');
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

/**
 * Cache wrapper function
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @param {function} fetchFunction - Function to fetch data if cache miss
 * @returns {Promise} - Cached or fresh data
 */
async function cacheWrapper(key, ttl, fetchFunction) {
  console.log('🔍 cacheWrapper called with key:', key);
  try {
    // Try to get from cache
    const cached = await client.get(key);
    console.log('🔍 Redis get result:', cached ? 'FOUND' : 'NOT FOUND');
    if (cached) {
      console.log(`🎯 Cache HIT: ${key}`);
      return JSON.parse(cached);
    }
    
    // Cache miss - fetch fresh data
    console.log(`❌ Cache MISS: ${key}`);
    const data = await fetchFunction();
    
    // Store in cache with expiration
    if (data) {
      console.log('🔍 About to store in Redis:', key);
      await client.setEx(key, ttl, JSON.stringify(data));
      console.log(`💾 Cached: ${key} (TTL: ${ttl}s)`);
    }
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback: fetch directly if cache fails
    return await fetchFunction();
  }
}

/**
 * Invalidate cache by key or pattern
 * @param {string} pattern - Key or pattern (e.g., "search:*")
 */
async function invalidateCache(pattern) {
  try {
    if (pattern.includes('*')) {
      // Delete multiple keys matching pattern
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(`🗑️  Invalidated ${keys.length} cache entries: ${pattern}`);
      }
    } else {
      // Delete single key
      await client.del(pattern);
      console.log(`🗑️  Invalidated cache: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

module.exports = { client, cacheWrapper, invalidateCache };
