const { pool } = require('../config/db');

async function create({ userId, rating, comment }) {
  const [result] = await pool.query(
    "INSERT INTO reviews (user_id, rating, comment, status) VALUES (?, ?, ?, 'APPROVED')",
    [userId, rating, comment]
  );
  return getById(result.insertId);
}

async function getById(id) {
  const [rows] = await pool.query(
    `SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function getApproved() {
  const [rows] = await pool.query(
    `SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON r.user_id = u.id
     WHERE r.status = 'APPROVED' ORDER BY r.created_at DESC`
  );
  return rows;
}

async function getAll() {
  const [rows] = await pool.query(
    `SELECT r.*, u.name AS user_name, u.email AS user_email FROM reviews r
     JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC`
  );
  return rows;
}

async function remove(id) {
  await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
}

async function updateStatus(id, status) {
  await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
  return getById(id);
}

module.exports = { create, getById, getApproved, getAll, remove, updateStatus };
