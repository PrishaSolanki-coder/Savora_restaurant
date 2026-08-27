const express = require('express');
const { body } = require('express-validator');
const {
  getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
} = require('../controllers/menuController');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

const menuItemRules = [
  body('category_id').isInt({ min: 1 }).withMessage('A valid category is required.'),
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
];

router.get('/', getMenu);
router.get('/:id', getMenuItem);

router.post('/', protect, adminOnly, menuItemRules, validate, createMenuItem);
router.put('/:id', protect, adminOnly, menuItemRules, validate, updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
