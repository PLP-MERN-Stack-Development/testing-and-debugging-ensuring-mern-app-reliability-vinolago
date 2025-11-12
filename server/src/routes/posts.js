// server/src/routes/posts.js - Posts routes

const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');
const { createLogger } = require('../utils/logger');
const { authenticate, requireOwnership } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const logger = createLogger('PostsRoutes');

// Validation middleware
const createPostValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
];

const updatePostValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
];

// @route   GET /api/posts
// @desc    Get all posts with pagination and filtering
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category').optional().isMongoId(),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { page = 1, limit = 10, category } = req.query;

  // Build query
  const query = {};
  if (category) {
    query.category = category;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get posts with author info
  const posts = await Post.find(query)
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Get total count for pagination
  const total = await Post.countDocuments(query);

  logger.debug('Posts retrieved', {
    count: posts.length,
    page,
    limit,
    total,
    category: category || 'all'
  });

  res.json({
    posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}));

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username')
    .lean();

  if (!post) {
    logger.warn('Post not found', { postId: req.params.id });
    return res.status(404).json({ error: 'Post not found' });
  }

  logger.debug('Post retrieved', { postId: post._id, title: post.title });

  res.json({ post });
}));

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authenticate, createPostValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Post creation validation failed', {
      userId: req.user.userId,
      errors: errors.array()
    });
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { title, content, category } = req.body;

  // Create post
  const post = new Post({
    title,
    content,
    category,
    author: req.user.userId,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  });

  await post.save();

  // Populate author info
  await post.populate('author', 'username');

  logger.info('Post created', {
    postId: post._id,
    userId: req.user.userId,
    title: post.title
  });

  res.status(201).json({ post });
}));

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (Author only)
router.put('/:id', authenticate, requireOwnership, updatePostValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Post update validation failed', {
      userId: req.user.userId,
      postId: req.params.id,
      errors: errors.array()
    });
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { title, content, category } = req.body;

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;

  // Update slug if title changed
  if (title) {
    updateData.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  updateData.updatedAt = new Date();

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('author', 'username');

  if (!post) {
    logger.warn('Post not found for update', { postId: req.params.id, userId: req.user.userId });
    return res.status(404).json({ error: 'Post not found' });
  }

  logger.info('Post updated', {
    postId: post._id,
    userId: req.user.userId,
    title: post.title
  });

  res.json({ post });
}));

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (Author only)
router.delete('/:id', authenticate, requireOwnership, asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    logger.warn('Post not found for deletion', { postId: req.params.id, userId: req.user.userId });
    return res.status(404).json({ error: 'Post not found' });
  }

  logger.info('Post deleted', {
    postId: post._id,
    userId: req.user.userId,
    title: post.title
  });

  res.json({ message: 'Post deleted successfully' });
}));

module.exports = router;