const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { sendSuccess, sendError, asyncHandler } = require('../utils/helpers');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await userModel.findByEmail(email);
  if (existing) {
    return sendError(res, 409, 'An account with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.createUser({ name, email, phone, hashedPassword });
  const token = signToken(user);

  sendSuccess(res, 201, 'Account created successfully.', { user: publicUser(user), token });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) {
    return sendError(res, 401, 'Invalid email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendError(res, 401, 'Invalid email or password.');
  }

  const token = signToken(user);
  sendSuccess(res, 200, 'Logged in successfully.', { user: publicUser(user), token });
});

// GET /api/auth/me  (requires auth)
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, 'Current user retrieved.', { user: req.user });
});

module.exports = { register, login, getMe };
