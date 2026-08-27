const express = require('express');
const { body } = require('express-validator');
const { getCart, addItem, updateItem, removeItem, clearCart } = require('../controllers/cartController');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // every cart route requires login

router.get('/', getCart);

router.post(
  '/items',
  [
    body('menuItemId').isInt({ min: 1 }).withMessage('A valid menu item is required.'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer.'),
  ],
  validate,
  addItem
);

router.put(
  '/items/:id',
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer.')],
  validate,
  updateItem
);

router.delete('/items/:id', removeItem);
router.delete('/', clearCart);

module.exports = router;
