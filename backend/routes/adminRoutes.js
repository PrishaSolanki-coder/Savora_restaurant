const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const { getDashboardStats, getUsers, changeUserRole, deleteUser } = require('../controllers/adminController');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { getAllReservations, updateReservationStatus } = require('../controllers/reservationController');
const { getAllReviewsAdmin, moderateReview, deleteReview } = require('../controllers/reviewController');

const router = express.Router();

// Every route below requires a logged-in admin.
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/reservations', getAllReservations);
router.put('/reservations/:id/status', updateReservationStatus);

router.get('/users', getUsers);
router.put('/users/:id/role', changeUserRole);
router.delete('/users/:id', deleteUser);

router.get('/reviews', getAllReviewsAdmin);
router.put('/reviews/:id/moderate', moderateReview);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
