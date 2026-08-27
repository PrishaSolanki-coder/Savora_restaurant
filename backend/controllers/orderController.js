const { pool } = require('../config/db');
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

const TAX_RATE = 0.05; // 5% — adjust to your local tax rules
const DELIVERY_FEE = 40; // flat fee in your currency's smallest sensible unit (e.g. rupees)

// POST /api/orders  { address, phone, paymentMethod }
// This is the most security-sensitive endpoint in the app: it NEVER trusts
// prices or totals sent by the frontend. Every price is re-read from the
// menu_items table at the moment the order is placed.
const placeOrder = asyncHandler(async (req, res) => {
  const { address, phone, paymentMethod } = req.body;
  if (!address || !phone || !paymentMethod) {
    return sendError(res, 400, 'Address, phone, and payment method are required.');
  }
  if (!['COD', 'UPI', 'CARD'].includes(paymentMethod)) {
    return sendError(res, 400, 'Invalid payment method.');
  }

  const { cartId, items } = await cartModel.getCartWithItems(req.user.id);
  if (items.length === 0) {
    return sendError(res, 400, 'Your cart is empty.');
  }

  const unavailable = items.find((i) => !i.is_available);
  if (unavailable) {
    return sendError(res, 400, `${unavailable.name} is no longer available. Please remove it from your cart.`);
  }

  // Prices come from `items`, which were joined from menu_items in the
  // model layer — never from anything the client sent for this order.
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const deliveryFee = DELIVERY_FEE;
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const orderId = await orderModel.createOrder(conn, {
      userId: req.user.id,
      subtotal,
      tax,
      deliveryFee,
      total,
      address,
      phone,
      paymentMethod,
    });

    for (const item of items) {
      await orderModel.addOrderItem(conn, {
        orderId,
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price, // snapshot price at time of purchase
      });
    }

    await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await conn.commit();

    const order = await orderModel.getOrderById(orderId);
    sendSuccess(res, 201, 'Order placed successfully.', order);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// GET /api/orders  (own orders)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel.getOrdersByUser(req.user.id);
  sendSuccess(res, 200, 'Orders retrieved.', orders);
});

// GET /api/orders/:id  (must be own order, unless admin)
const getOrder = asyncHandler(async (req, res) => {
  const order = await orderModel.getOrderById(req.params.id);
  if (!order) return sendError(res, 404, 'Order not found.');
  if (order.user_id !== req.user.id && req.user.role !== 'ADMIN') {
    return sendError(res, 403, 'You do not have access to this order.');
  }
  sendSuccess(res, 200, 'Order retrieved.', order);
});

// PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const ok = await orderModel.cancelOrder(req.params.id, req.user.id);
  if (!ok) {
    return sendError(res, 400, 'This order can no longer be cancelled.');
  }
  const order = await orderModel.getOrderById(req.params.id);
  sendSuccess(res, 200, 'Order cancelled.', order);
});

// ---- Admin ----

// GET /api/admin/orders  (?status=&search=)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const orders = await orderModel.getAllOrders({ status, search });
  sendSuccess(res, 200, 'Orders retrieved.', orders);
});

// PUT /api/admin/orders/:id/status  { status }
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!orderModel.VALID_STATUSES.includes(status)) {
    return sendError(res, 400, 'Invalid order status.');
  }
  const order = await orderModel.updateStatus(req.params.id, status);
  if (!order) return sendError(res, 404, 'Order not found.');
  sendSuccess(res, 200, 'Order status updated.', order);
});

module.exports = {
  placeOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus,
};
