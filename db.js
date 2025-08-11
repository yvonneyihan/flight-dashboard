require('dotenv').config();
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // fallback to 3306
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  (async () => {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Successfully connected to MySQL using pool.');
      connection.release(); // release the connection back to the pool
    } catch (err) {
      console.error('❌ MySQL connection failed:', err.message);
      process.exit(1); // exit the app if connection fails
    }
  })();
  
  module.exports = pool;