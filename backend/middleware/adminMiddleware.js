const { sendError } = require('../utils/helpers');

// Must run AFTER `protect`, since it relies on req.user being set.
// Blocks any request from a non-admin user, even if they have a valid token.
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, 403, 'Admin access required.');
  }
  next();
}

module.exports = { adminOnly };
