// server/src/config/database.js - Database configuration

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.NODE_ENV === 'test'
      ? process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/mern-testing-test'
      : process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-testing';

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;