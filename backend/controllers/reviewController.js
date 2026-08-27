const reviewModel = require('../models/reviewModel');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

// POST /api/reviews  { rating, comment }
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const review = await reviewModel.create({ userId: req.user.id, rating, comment });
  sendSuccess(res, 201, 'Thank you for your review!', review);
});

// GET /api/reviews  (public, approved only)
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewModel.getApproved();
  sendSuccess(res, 200, 'Reviews retrieved.', reviews);
});

// DELETE /api/reviews/:id  (admin, or the review's own author)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await reviewModel.getById(req.params.id);
  if (!review) return sendError(res, 404, 'Review not found.');
  if (review.user_id !== req.user.id && req.user.role !== 'ADMIN') {
    return sendError(res, 403, 'You cannot delete this review.');
  }
  await reviewModel.remove(req.params.id);
  sendSuccess(res, 200, 'Review deleted.');
});

// ---- Admin ----

const getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const reviews = await reviewModel.getAll();
  sendSuccess(res, 200, 'Reviews retrieved.', reviews);
});

const moderateReview = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return sendError(res, 400, 'Invalid review status.');
  }
  const review = await reviewModel.updateStatus(req.params.id, status);
  if (!review) return sendError(res, 404, 'Review not found.');
  sendSuccess(res, 200, 'Review updated.', review);
});

module.exports = { createReview, getReviews, deleteReview, getAllReviewsAdmin, moderateReview };
