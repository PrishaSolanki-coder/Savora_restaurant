const express = require('express');
const { body } = require('express-validator');
const {
  createReservation, getMyReservations, getReservation, cancelReservation,
} = require('../controllers/reservationController');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // reservations require an account so users can view their history

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('A valid email is required.'),
    body('phone').trim().isLength({ min: 7 }).withMessage('A valid phone number is required.'),
    body('date').isISO8601().withMessage('A valid date is required.'),
    body('time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('A valid time is required (HH:MM).'),
    body('guests').isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20.'),
  ],
  validate,
  createReservation
);

router.get('/', getMyReservations);
router.get('/:id', getReservation);
router.put('/:id/cancel', cancelReservation);

module.exports = router;
