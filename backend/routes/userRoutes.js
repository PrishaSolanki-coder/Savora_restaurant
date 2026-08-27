const express = require('express');
const { body } = require('express-validator');
const { updateMe } = require('../controllers/userController');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.put(
  '/me',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('phone').trim().isLength({ min: 7 }).withMessage('A valid phone number is required.'),
  ],
  validate,
  updateMe
);

module.exports = router;
