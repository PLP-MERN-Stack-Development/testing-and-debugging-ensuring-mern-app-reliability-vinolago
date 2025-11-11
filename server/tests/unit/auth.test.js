// auth.test.js - Unit tests for authentication utilities

const {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  extractToken,
} = require('../../src/utils/auth');

describe('generateToken', () => {
  it('should generate a JWT token for a user', () => {
    const user = { _id: '123', username: 'testuser' };
    const token = generateToken(user);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should include user ID and username in token', () => {
    const user = { _id: '456', username: 'johndoe' };
    const token = generateToken(user);
    const decoded = require('jsonwebtoken').verify(
      token,
      process.env.JWT_SECRET || 'default-secret-key'
    );

    expect(decoded.userId).toBe('456');
    expect(decoded.username).toBe('johndoe');
  });
});

describe('verifyToken', () => {
  it('should verify a valid token and return decoded payload', () => {
    const user = { _id: '789', username: 'validuser' };
    const token = generateToken(user);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe('789');
    expect(decoded.username).toBe('validuser');
  });

  it('should throw error for invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow('Invalid token');
  });

  it('should throw error for expired token', () => {
    // Create a token that expires immediately
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { userId: '123', username: 'user' },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '-1h' }
    );

    expect(() => verifyToken(expiredToken)).toThrow('Invalid token');
  });
});

describe('hashPassword', () => {
  it('should hash a password', async () => {
    const password = 'mypassword123';
    const hashed = await hashPassword(password);

    expect(typeof hashed).toBe('string');
    expect(hashed).not.toBe(password);
    expect(hashed.length).toBeGreaterThan(0);
  });

  it('should generate different hashes for same password', async () => {
    const password = 'samepassword';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });
});

describe('comparePassword', () => {
  it('should return true for matching password', async () => {
    const password = 'testpassword';
    const hashed = await hashPassword(password);
    const isMatch = await comparePassword(password, hashed);

    expect(isMatch).toBe(true);
  });

  it('should return false for non-matching password', async () => {
    const password = 'correctpassword';
    const wrongPassword = 'wrongpassword';
    const hashed = await hashPassword(password);
    const isMatch = await comparePassword(wrongPassword, hashed);

    expect(isMatch).toBe(false);
  });
});

describe('extractToken', () => {
  it('should extract token from Bearer header', () => {
    const authHeader = 'Bearer abc123def456';
    const token = extractToken(authHeader);

    expect(token).toBe('abc123def456');
  });

  it('should return null for invalid header format', () => {
    expect(extractToken('')).toBe(null);
    expect(extractToken('Basic abc123')).toBe(null);
    expect(extractToken('Bearer')).toBe(null);
    expect(extractToken(null)).toBe(null);
  });

  it('should handle headers with extra spaces', () => {
    const authHeader = 'Bearer   spaced-token   ';
    const token = extractToken(authHeader);

    expect(token).toBe('spaced-token');
  });
});