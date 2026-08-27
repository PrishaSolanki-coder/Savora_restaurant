const { validationResult } = require('express-validator');
const { sendError } = require('../utils/helpers');

// Runs after express-validator's check(...) rules on a route.
// If any rule failed, responds with 400 and a list of field-level errors
// instead of letting the request continue into the controller.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation failed.', errors.array());
  }
  next();
}

module.exports = { validate };
