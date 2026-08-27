const { pool } = require('../config/db');

// Base SELECT reused everywhere so every menu item comes back with its
// category name joined in, instead of just a raw category_id.
const BASE_SELECT = `
  SELECT m.*, c.name AS category_name
  FROM menu_items m
  LEFT JOIN categories c ON m.category_id = c.id
`;

async function getAll({ category, search, veg, sort } = {}) {
  let sql = BASE_SELECT + ' WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND c.name = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (m.name LIKE ? OR m.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (veg === 'veg') {
    sql += ' AND m.is_vegetarian = 1';
  } else if (veg === 'nonveg') {
    sql += ' AND m.is_vegetarian = 0';
  }

  if (sort === 'price_asc') sql += ' ORDER BY m.price ASC';
  else if (sort === 'price_desc') sql += ' ORDER BY m.price DESC';
  else if (sort === 'popular') sql += ' ORDER BY m.is_featured DESC, m.created_at DESC';
  else sql += ' ORDER BY m.created_at DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query(BASE_SELECT + ' WHERE m.id = ?', [id]);
  return rows[0] || null;
}

async function getRelated(categoryId, excludeId, limit = 4) {
  const [rows] = await pool.query(
    BASE_SELECT + ' WHERE m.category_id = ? AND m.id != ? LIMIT ?',
    [categoryId, excludeId, limit]
  );
  return rows;
}

async function create(data) {
  const {
    category_id, name, description, ingredients, price, image,
    is_vegetarian, is_available, is_featured,
  } = data;
  const [result] = await pool.query(
    `INSERT INTO menu_items
      (category_id, name, description, ingredients, price, image, is_vegetarian, is_available, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      category_id, name, description || null, ingredients || null, price, image || null,
      is_vegetarian ? 1 : 0, is_available === false ? 0 : 1, is_featured ? 1 : 0,
    ]
  );
  return getById(result.insertId);
}

async function update(id, data) {
  const {
    category_id, name, description, ingredients, price, image,
    is_vegetarian, is_available, is_featured,
  } = data;
  await pool.query(
    `UPDATE menu_items SET
      category_id = ?, name = ?, description = ?, ingredients = ?, price = ?,
      image = ?, is_vegetarian = ?, is_available = ?, is_featured = ?
     WHERE id = ?`,
    [
      category_id, name, description || null, ingredients || null, price, image || null,
      is_vegetarian ? 1 : 0, is_available ? 1 : 0, is_featured ? 1 : 0, id,
    ]
  );
  return getById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);
}

// Used by the order controller: the backend must never trust a price
// sent from the frontend, so orders look prices up here directly.
async function getPriceAndAvailability(id) {
  const [rows] = await pool.query(
    'SELECT id, price, is_available, name FROM menu_items WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

module.exports = {
  getAll, getById, getRelated, create, update, remove, getPriceAndAvailability,
};
