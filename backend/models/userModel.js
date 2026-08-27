const { pool } = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, phone, hashedPassword, role = 'CUSTOMER' }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, hashedPassword, role]
  );
  return findById(result.insertId);
}

async function updateProfile(id, { name, phone }) {
  await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, id]);
  return findById(id);
}

async function getAllUsers() {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
  );
  return rows;
}

async function updateRole(id, role) {
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
  return findById(id);
}

async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateProfile,
  getAllUsers,
  updateRole,
  deleteUser,
};
