const express = require('express');
const { body } = require('express-validator');
const {
  getCategories, createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getCategories);

router.post(
  '/',
  protect, adminOnly,
  [body('name').trim().notEmpty().withMessage('Category name is required.')],
  validate,
  createCategory
);

router.put(
  '/:id',
  protect, adminOnly,
  [body('name').trim().notEmpty().withMessage('Category name is required.')],
  validate,
  updateCategory
);

router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
