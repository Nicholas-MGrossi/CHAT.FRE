// routes/auth.js - Authentication routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, auth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate('register'),
  asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with that email or username',
      });
    }

    // Create user
    const user = new User({
      email,
      username,
      password,
    });

    await user.save();
    const token = generateToken(user._id);

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      user: user.toJSON(),
      token,
    });
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validate('login'),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and select password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      logger.warn(`Failed login attempt for ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      user: user.toJSON(),
      token,
    });
  })
);

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post(
  '/logout',
  auth,
  asyncHandler(async (req, res) => {
    logger.info(`User logged out: ${req.user.email}`);
    res.json({ success: true, message: 'Logged out successfully' });
  })
);

/**
 * GET /api/auth/me
 * Get current user
 */
router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      user: req.user.toJSON(),
    });
  })
);

/**
 * PUT /api/auth/update-profile
 * Update user profile
 */
router.put(
  '/update-profile',
  auth,
  asyncHandler(async (req, res) => {
    const { username, preferences } = req.body;

    if (username) {
      const exists = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (exists) {
        return res.status(409).json({
          success: false,
          error: 'Username already taken',
        });
      }
      req.user.username = username;
    }

    if (preferences) {
      req.user.preferences = { ...req.user.preferences, ...preferences };
    }

    await req.user.save();

    logger.info(`User profile updated: ${req.user.email}`);

    res.json({
      success: true,
      user: req.user.toJSON(),
    });
  })
);

module.exports = router;
