const { pool } = require('../config/db');

// Every user has exactly one cart, created lazily the first time they add
// an item. Cart items reference the live menu_items table for price/name
// so the cart always reflects current prices while browsing.

async function getOrCreateCart(userId) {
  const [rows] = await pool.query('SELECT * FROM carts WHERE user_id = ?', [userId]);
  if (rows[0]) return rows[0];
  const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return { id: result.insertId, user_id: userId };
}

async function getCartWithItems(userId) {
  const cart = await getOrCreateCart(userId);
  const [items] = await pool.query(
    `SELECT ci.id, ci.menu_item_id, ci.quantity,
            m.name, m.price, m.image, m.is_available
     FROM cart_items ci
     JOIN menu_items m ON ci.menu_item_id = m.id
     WHERE ci.cart_id = ?`,
    [cart.id]
  );
  return { cartId: cart.id, items };
}

async function addItem(userId, menuItemId, quantity) {
  const cart = await getOrCreateCart(userId);
  const [existing] = await pool.query(
    'SELECT * FROM cart_items WHERE cart_id = ? AND menu_item_id = ?',
    [cart.id, menuItemId]
  );
  if (existing[0]) {
    await pool.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [
      quantity,
      existing[0].id,
    ]);
  } else {
    await pool.query(
      'INSERT INTO cart_items (cart_id, menu_item_id, quantity) VALUES (?, ?, ?)',
      [cart.id, menuItemId, quantity]
    );
  }
  return getCartWithItems(userId);
}

async function updateItemQuantity(userId, cartItemId, quantity) {
  const cart = await getOrCreateCart(userId);
  await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?', [
    quantity,
    cartItemId,
    cart.id,
  ]);
  return getCartWithItems(userId);
}

async function removeItem(userId, cartItemId) {
  const cart = await getOrCreateCart(userId);
  await pool.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [cartItemId, cart.id]);
  return getCartWithItems(userId);
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
}

module.exports = {
  getOrCreateCart, getCartWithItems, addItem, updateItemQuantity, removeItem, clearCart,
};
