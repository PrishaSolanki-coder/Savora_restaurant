const reservationModel = require('../models/reservationModel');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

// POST /api/reservations
const createReservation = asyncHandler(async (req, res) => {
  const { name, email, phone, date, time, guests, message } = req.body;

  // Basic server-side sanity checks (express-validator handles the detailed
  // rules on the route; this is a second guard specific to business logic).
  const reservationDateTime = new Date(`${date}T${time}`);
  if (isNaN(reservationDateTime.getTime()) || reservationDateTime < new Date()) {
    return sendError(res, 400, 'Please choose a valid future date and time.');
  }
  if (Number(guests) < 1 || Number(guests) > 20) {
    return sendError(res, 400, 'Guest count must be between 1 and 20. Call us directly for larger parties.');
  }

  const reservation = await reservationModel.create({
    userId: req.user ? req.user.id : null,
    name, email, phone, date, time, guests: Number(guests), message,
  });
  sendSuccess(res, 201, 'Reservation request submitted. We will confirm shortly.', reservation);
});

// GET /api/reservations (own reservations)
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await reservationModel.getByUser(req.user.id);
  sendSuccess(res, 200, 'Reservations retrieved.', reservations);
});

// GET /api/reservations/:id
const getReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationModel.getById(req.params.id);
  if (!reservation) return sendError(res, 404, 'Reservation not found.');
  if (reservation.user_id !== req.user.id && req.user.role !== 'ADMIN') {
    return sendError(res, 403, 'You do not have access to this reservation.');
  }
  sendSuccess(res, 200, 'Reservation retrieved.', reservation);
});

// PUT /api/reservations/:id/cancel
const cancelReservation = asyncHandler(async (req, res) => {
  const ok = await reservationModel.cancelByUser(req.params.id, req.user.id);
  if (!ok) return sendError(res, 400, 'This reservation can no longer be cancelled.');
  sendSuccess(res, 200, 'Reservation cancelled.');
});

// ---- Admin ----

// GET /api/admin/reservations (?status=&date=)
const getAllReservations = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const reservations = await reservationModel.getAll({ status, date });
  sendSuccess(res, 200, 'Reservations retrieved.', reservations);
});

// PUT /api/admin/reservations/:id/status  { status }
const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
    return sendError(res, 400, 'Invalid reservation status.');
  }
  const reservation = await reservationModel.updateStatus(req.params.id, status);
  if (!reservation) return sendError(res, 404, 'Reservation not found.');
  sendSuccess(res, 200, 'Reservation status updated.', reservation);
});

module.exports = {
  createReservation, getMyReservations, getReservation, cancelReservation,
  getAllReservations, updateReservationStatus,
};
