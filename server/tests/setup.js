// server/tests/setup.js - Setup file for server-side tests

const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global setup for all tests
beforeAll(async () => {
  // Set up any global test configuration here
  console.log('Setting up test environment...');
});

// Global teardown for all tests
afterAll(async () => {
  // Close database connections
  await mongoose.disconnect();
  console.log('Test environment cleaned up.');
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});