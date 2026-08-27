const { pool } = require('../config/db');

async function create({ userId, name, email, phone, date, time, guests, message }) {
  const [result] = await pool.query(
    `INSERT INTO reservations (user_id, name, email, phone, reservation_date, reservation_time, guests, message, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
    [userId, name, email, phone, date, time, guests, message || null]
  );
  return getById(result.insertId);
}

async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ?', [id]);
  return rows[0] || null;
}

async function getByUser(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM reservations WHERE user_id = ? ORDER BY reservation_date DESC, reservation_time DESC',
    [userId]
  );
  return rows;
}

async function getAll({ status, date } = {}) {
  let sql = 'SELECT * FROM reservations WHERE 1=1';
  const params = [];
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (date) {
    sql += ' AND reservation_date = ?';
    params.push(date);
  }
  sql += ' ORDER BY reservation_date DESC, reservation_time DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function updateStatus(id, status) {
  await pool.query('UPDATE reservations SET status = ? WHERE id = ?', [status, id]);
  return getById(id);
}

async function cancelByUser(id, userId) {
  const [result] = await pool.query(
    "UPDATE reservations SET status = 'CANCELLED' WHERE id = ? AND user_id = ? AND status = 'PENDING'",
    [id, userId]
  );
  return result.affectedRows > 0;
}

module.exports = { create, getById, getByUser, getAll, updateStatus, cancelByUser };
