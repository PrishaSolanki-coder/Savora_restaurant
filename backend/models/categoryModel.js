const { pool } = require('../config/db');

async function getAll() {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ name, description }) {
  const [result] = await pool.query(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description || null]
  );
  return getById(result.insertId);
}

async function update(id, { name, description }) {
  await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [
    name,
    description || null,
    id,
  ]);
  return getById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM categories WHERE id = ?', [id]);
}

async function hasMenuItems(id) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM menu_items WHERE category_id = ?',
    [id]
  );
  return rows[0].count > 0;
}

module.exports = { getAll, getById, create, update, remove, hasMenuItems };
