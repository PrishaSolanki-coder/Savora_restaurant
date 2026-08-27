// Sets up a MySQL connection pool using credentials from environment
// variables. A pool (rather than a single connection) lets many requests
// share a small number of open connections efficiently.
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // return DATE/DATETIME as plain strings, easier for the frontend
});

// Quick helper used at server startup to confirm the DB is reachable.
async function testConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}

module.exports = { pool, testConnection };
