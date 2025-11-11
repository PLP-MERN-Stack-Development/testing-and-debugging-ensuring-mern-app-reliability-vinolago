// auth.middleware.test.js - Unit tests for authentication middleware

const { authenticate, requireOwnership, requireRole, rateLimit } = require('../../src/middleware/auth');
const { generateToken } = require('../../src/utils/auth');

describe('authenticate middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next() for valid token', () => {
    const user = { _id: '123', username: 'testuser' };
    const token = generateToken(user);
    req.headers.authorization = `Bearer ${token}`;

    authenticate(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('123');
    expect(req.user.username).toBe('testuser');
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 for missing token', () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid token', () => {
    req.headers.authorization = 'Bearer invalid-token';

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for malformed authorization header', () => {
    req.headers.authorization = 'InvalidFormat token123';

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireOwnership middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      user: { userId: '123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next() when user owns the resource', () => {
    req.params.userId = '123';

    requireOwnership(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 403 when user does not own the resource', () => {
    req.params.userId = '456';

    requireOwnership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. Not the owner.' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireRole middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { role: 'admin' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next() when user has required role', () => {
    const middleware = requireRole('admin');

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should return 403 when user has different role', () => {
    req.user.role = 'user';
    const middleware = requireRole('admin');

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 when user has no role', () => {
    delete req.user.role;
    const middleware = requireRole('admin');

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Role information not found' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('rateLimit middleware', () => {
  let req, res, next;
  const maxRequests = 2;
  const windowMs = 1000;

  beforeEach(() => {
    req = {
      ip: '127.0.0.1',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should allow requests within limit', () => {
    const middleware = rateLimit(maxRequests, windowMs);

    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    next.mockClear();
    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should block requests over limit', () => {
    const middleware = rateLimit(maxRequests, windowMs);

    middleware(req, res, next);
    middleware(req, res, next);
    middleware(req, res, next); // This should be blocked

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Too many requests' });
  });

  it('should allow requests after window expires', () => {
    const middleware = rateLimit(maxRequests, windowMs);
    const originalNow = Date.now;

    // Mock time progression
    let currentTime = originalNow();
    Date.now = jest.fn(() => currentTime);

    middleware(req, res, next);
    middleware(req, res, next);

    // Advance time beyond window
    currentTime += windowMs + 1;
    middleware(req, res, next); // Should be allowed again

    expect(next).toHaveBeenCalledTimes(3);

    Date.now = originalNow;
  });
});