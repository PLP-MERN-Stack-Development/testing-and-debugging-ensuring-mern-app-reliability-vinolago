// server/src/routes/auth.js - Authentication routes

const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/auth');
const { createLogger } = require('../utils/logger');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const logger = createLogger('AuthRoutes');

// Validation middleware
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Registration validation failed', { errors: errors.array() });
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    logger.warn('Registration failed: User already exists', { email, username });
    return res.status(409).json({
      error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();

  // Generate token
  const token = generateToken(user);

  logger.info('User registered successfully', { userId: user._id, username, email });

  res.status(201).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  });
}));

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Login validation failed', { errors: errors.array() });
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    logger.warn('Login failed: User not found', { email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn('Login failed: Invalid password', { userId: user._id, email });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate token
  const token = generateToken(user);

  logger.info('User logged in successfully', { userId: user._id, username: user.username, email });

  res.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
    token,
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');

  if (!user) {
    logger.warn('User not found for token', { userId: req.user.userId });
    return res.status(404).json({ error: 'User not found' });
  }

  logger.debug('User info retrieved', { userId: user._id, username: user.username });

  res.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    }
  });
}));

module.exports = router;