const userModel = require('../models/userModel');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

// PUT /api/users/me
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updated = await userModel.updateProfile(req.user.id, { name, phone });
  sendSuccess(res, 200, 'Profile updated.', { user: updated });
});

module.exports = { updateMe };
