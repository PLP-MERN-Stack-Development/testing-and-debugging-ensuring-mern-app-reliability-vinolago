// auth.test.js - Integration tests for authentication endpoints

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.username).toBe(userData.username);
    expect(res.body.user.email).toBe(userData.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 400 for duplicate email', async () => {
    // Create first user
    await User.create({
      username: 'user1',
      email: 'duplicate@example.com',
      password: 'hashedpassword',
    });

    // Try to register with same email
    const userData = {
      username: 'user2',
      email: 'duplicate@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid data', async () => {
    const invalidData = {
      username: '', // Empty username
      email: 'invalid-email',
      password: '123', // Too short
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(invalidData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Create a test user for login tests
    await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8lWZQjzQH6', // 'password123' hashed
    });
  });

  it('should login successfully with correct credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(loginData.email);
  });

  it('should return 401 for incorrect password', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 for non-existent user', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for missing fields', async () => {
    const incompleteData = {
      email: 'test@example.com',
      // Missing password
    };

    const res = await request(app)
      .post('/api/auth/login')
      .send(incompleteData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    // Create a test user and get token
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
    });

    // Generate token (assuming we have the generateToken function)
    const jwt = require('jsonwebtoken');
    token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );
  });

  it('should return current user info when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 for invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});