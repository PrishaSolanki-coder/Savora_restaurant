const cartModel = require('../models/cartModel');
const menuModel = require('../models/menuModel');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await cartModel.getCartWithItems(req.user.id);
  sendSuccess(res, 200, 'Cart retrieved.', cart);
});

// POST /api/cart/items  { menuItemId, quantity }
const addItem = asyncHandler(async (req, res) => {
  const { menuItemId, quantity } = req.body;
  const qty = Number(quantity) || 1;
  if (qty < 1) return sendError(res, 400, 'Quantity must be at least 1.');

  const item = await menuModel.getPriceAndAvailability(menuItemId);
  if (!item) return sendError(res, 404, 'Menu item not found.');
  if (!item.is_available) return sendError(res, 400, `${item.name} is currently unavailable.`);

  const cart = await cartModel.addItem(req.user.id, menuItemId, qty);
  sendSuccess(res, 200, 'Item added to cart.', cart);
});

// PUT /api/cart/items/:id  { quantity }
const updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const qty = Number(quantity);
  if (!qty || qty < 1) return sendError(res, 400, 'Quantity must be at least 1.');

  const cart = await cartModel.updateItemQuantity(req.user.id, req.params.id, qty);
  sendSuccess(res, 200, 'Cart updated.', cart);
});

// DELETE /api/cart/items/:id
const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartModel.removeItem(req.user.id, req.params.id);
  sendSuccess(res, 200, 'Item removed from cart.', cart);
});

// DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  await cartModel.clearCart(req.user.id);
  sendSuccess(res, 200, 'Cart cleared.');
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
