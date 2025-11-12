// server/src/index.js - Main server entry point

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import utilities
const connectDB = require('./config/database');
const { createLogger } = require('./utils/logger');
const { performanceMonitor } = require('./utils/performance');

// Import middleware
const { logRequests } = require('./middleware/requestLogger');
const { authenticate } = require('./middleware/auth');
const {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  gracefulShutdown,
} = require('./middleware/errorHandler');

// Import routes (placeholder - these would need to be created)
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

// Create Express app
const app = express();

// Create logger
const logger = createLogger('Server');

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging and performance monitoring
app.use(logRequests);
app.use(performanceMonitor.requestMonitor.bind(performanceMonitor));

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: performanceMonitor.getHealthMetrics().memory,
  };
  res.json(healthData);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Test database reset endpoint (for testing only)
if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  app.post('/api/test/reset-db', async (req, res) => {
    try {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
      res.json({ message: 'Database reset successful' });
    } catch (error) {
      logger.error('Database reset failed', { error: error.message });
      res.status(500).json({ error: 'Database reset failed' });
    }
  });
}

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server function
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // Graceful shutdown
    gracefulShutdown(server);

    return server;
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Export for testing
module.exports = app;

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}