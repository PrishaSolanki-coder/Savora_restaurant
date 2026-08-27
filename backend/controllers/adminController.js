const { pool } = require('../config/db');
const userModel = require('../models/userModel');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

// GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [[orderCount]] = await pool.query('SELECT COUNT(*) as count FROM orders');
  const [[todayOrders]] = await pool.query(
    'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
  );
  const [[revenue]] = await pool.query(
    "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE order_status != 'CANCELLED'"
  );
  const [[pendingOrders]] = await pool.query(
    "SELECT COUNT(*) as count FROM orders WHERE order_status = 'PENDING'"
  );
  const [[userCount]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'");
  const [[reservationCount]] = await pool.query('SELECT COUNT(*) as count FROM reservations');
  const [[menuItemCount]] = await pool.query('SELECT COUNT(*) as count FROM menu_items');

  sendSuccess(res, 200, 'Dashboard stats retrieved.', {
    totalOrders: orderCount.count,
    todaysOrders: todayOrders.count,
    totalRevenue: Number(revenue.total),
    pendingOrders: pendingOrders.count,
    totalUsers: userCount.count,
    totalReservations: reservationCount.count,
    totalMenuItems: menuItemCount.count,
  });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await userModel.getAllUsers();
  sendSuccess(res, 200, 'Users retrieved.', users);
});

// PUT /api/admin/users/:id/role  { role }
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['CUSTOMER', 'ADMIN'].includes(role)) {
    return sendError(res, 400, 'Invalid role.');
  }
  if (Number(req.params.id) === req.user.id) {
    return sendError(res, 400, 'You cannot change your own role.');
  }
  const user = await userModel.updateRole(req.params.id, role);
  sendSuccess(res, 200, 'User role updated.', user);
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return sendError(res, 400, 'You cannot delete your own account.');
  }
  await userModel.deleteUser(req.params.id);
  sendSuccess(res, 200, 'User deleted.');
});

module.exports = { getDashboardStats, getUsers, changeUserRole, deleteUser };
