const { pool } = require('../config/db');

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

async function createOrder(conn, { userId, subtotal, tax, deliveryFee, total, address, phone, paymentMethod }) {
  const [result] = await conn.query(
    `INSERT INTO orders
      (user_id, subtotal, tax, delivery_fee, total_amount, address, phone, payment_method, payment_status, order_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 'PENDING')`,
    [userId, subtotal, tax, deliveryFee, total, address, phone, paymentMethod]
  );
  return result.insertId;
}

async function addOrderItem(conn, { orderId, menuItemId, quantity, price }) {
  await conn.query(
    'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
    [orderId, menuItemId, quantity, price]
  );
}

async function getOrderById(id) {
  const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
  if (!orders[0]) return null;
  const [items] = await pool.query(
    `SELECT oi.*, m.name, m.image
     FROM order_items oi
     LEFT JOIN menu_items m ON oi.menu_item_id = m.id
     WHERE oi.order_id = ?`,
    [id]
  );
  return { ...orders[0], items };
}

async function getOrdersByUser(userId) {
  const [rows] = await pool.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function getAllOrders({ status, search } = {}) {
  let sql = `SELECT o.*, u.name AS customer_name, u.email AS customer_email
             FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1`;
  const params = [];
  if (status) {
    sql += ' AND o.order_status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (u.name LIKE ? OR u.email LIKE ? OR o.id = ?)';
    params.push(`%${search}%`, `%${search}%`, Number(search) || 0);
  }
  sql += ' ORDER BY o.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function updateStatus(id, status) {
  await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
  return getOrderById(id);
}

async function cancelOrder(id, userId) {
  // Only allow cancelling your own order, and only while still early in the flow.
  const [rows] = await pool.query(
    "UPDATE orders SET order_status = 'CANCELLED' WHERE id = ? AND user_id = ? AND order_status IN ('PENDING','CONFIRMED')",
    [id, userId]
  );
  return rows.affectedRows > 0;
}

module.exports = {
  VALID_STATUSES, createOrder, addOrderItem, getOrderById, getOrdersByUser,
  getAllOrders, updateStatus, cancelOrder,
};
