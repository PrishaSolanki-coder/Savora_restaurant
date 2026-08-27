const express = require('express');
const { body } = require('express-validator');
const { createReview, getReviews, deleteReview } = require('../controllers/reviewController');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getReviews); // public

router.post(
  '/',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
    body('comment').trim().isLength({ min: 3 }).withMessage('Please write a short review.'),
  ],
  validate,
  createReview
);

router.delete('/:id', protect, deleteReview);

module.exports = router;
