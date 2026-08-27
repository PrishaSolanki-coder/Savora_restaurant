const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/helpers');
const { pool } = require('../config/db');

// Verifies the JWT sent in the Authorization header ("Bearer <token>").
// On success, attaches the authenticated user's { id, role } to req.user.
// This is what every "protected" route uses to know who is calling it —
// the frontend can never simply claim to be a given user or admin.
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Not authorized. Please log in.');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return sendError(res, 401, 'Session expired or invalid. Please log in again.');
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [decoded.id]
    );
    if (rows.length === 0) {
      return sendError(res, 401, 'User account no longer exists.');
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };
