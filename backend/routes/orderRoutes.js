const express = require('express');
const { body } = require('express-validator');
const { placeOrder, getMyOrders, getOrder, cancelOrder } = require('../controllers/orderController');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('address').trim().notEmpty().withMessage('Delivery address is required.'),
    body('phone').trim().isLength({ min: 7 }).withMessage('A valid phone number is required.'),
    body('paymentMethod').isIn(['COD', 'UPI', 'CARD']).withMessage('Invalid payment method.'),
  ],
  validate,
  placeOrder
);

router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
