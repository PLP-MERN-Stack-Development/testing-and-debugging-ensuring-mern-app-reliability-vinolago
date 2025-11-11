// server/src/middleware/auth.js - Authentication middleware

const { verifyToken, extractToken } = require('../utils/auth');

/**
 * Middleware to authenticate requests using JWT tokens
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user is the owner of a resource
 */
const requireOwnership = (req, res, next) => {
  const { userId } = req.params;
  const currentUserId = req.user.userId;

  if (userId !== currentUserId) {
    return res.status(403).json({ error: 'Access denied. Not the owner.' });
  }

  next();
};

/**
 * Middleware for role-based access control
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Role information not found' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Middleware to validate request body
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

/**
 * Middleware for rate limiting (simplified version)
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [ip, timestamps] of requests) {
      requests.set(ip, timestamps.filter(timestamp => timestamp > windowStart));
      if (requests.get(ip).length === 0) {
        requests.delete(ip);
      }
    }

    // Check current requests
    const userRequests = requests.get(key) || [];
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);

    next();
  };
};

module.exports = {
  authenticate,
  requireOwnership,
  requireRole,
  validateBody,
  rateLimit,
};