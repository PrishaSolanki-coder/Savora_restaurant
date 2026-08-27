// Small shared helpers used across controllers so every endpoint returns
// JSON in the exact same shape: { success, message, data } or
// { success: false, message, errors? }.

function sendSuccess(res, statusCode, message, data = null) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
}

function sendError(res, statusCode, message, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

// Wraps an async route handler so any thrown error / rejected promise is
// forwarded to Express's error-handling middleware instead of crashing
// the process or hanging the request.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { sendSuccess, sendError, asyncHandler };
