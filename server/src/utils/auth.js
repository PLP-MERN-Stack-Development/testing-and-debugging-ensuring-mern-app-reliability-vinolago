// server/src/utils/auth.js - Authentication utilities

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Generates a JWT token for a user
 * @param {Object} user - The user object
 * @returns {string} The JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '7d' }
  );
};

/**
 * Verifies a JWT token
 * @param {string} token - The JWT token
 * @returns {Object} The decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Hashes a password
 * @param {string} password - The plain text password
 * @returns {string} The hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plain text password with a hashed password
 * @param {string} password - The plain text password
 * @param {string} hashedPassword - The hashed password
 * @returns {boolean} True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Extracts token from Authorization header
 * @param {string} authHeader - The Authorization header
 * @returns {string|null} The token or null if not found
 */
const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7).trim();
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  extractToken,
};