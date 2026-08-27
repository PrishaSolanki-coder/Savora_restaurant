const { sendError } = require('../utils/helpers');

// Called when a route doesn't match anything (404).
function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}

// Centralized error handler. Every thrown error in the app (including ones
// forwarded by asyncHandler) ends up here. Never leaks stack traces or raw
// DB error messages to the client in production.
function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Log full detail server-side for debugging.
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err);

  const isProd = process.env.NODE_ENV === 'production';
  const message = isProd && statusCode === 500 ? 'Something went wrong on our end.' : err.message;

  sendError(res, statusCode, message);
}

module.exports = { notFound, errorHandler };
