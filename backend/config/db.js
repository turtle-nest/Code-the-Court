// db.js
// PostgreSQL database connection setup

const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Optional: log only when in development
if (process.env.NODE_ENV === 'development') {
  pool.on('connect', () => {
    console.log('🟢 Connected to PostgreSQL database');
  });
}

module.exports = pool;
