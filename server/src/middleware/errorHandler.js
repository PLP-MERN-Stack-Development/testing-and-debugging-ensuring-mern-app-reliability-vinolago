// server/src/middleware/errorHandler.js - Global error handling middleware

const { createLogger } = require('../utils/logger');

const errorLogger = createLogger('ErrorHandler');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  errorLogger.error('Unhandled error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Determine error type and status code
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && {
      details: err.message,
      stack: err.stack,
    }),
  });
};

/**
 * 404 handler middleware
 */
const notFoundHandler = (req, res, next) => {
  errorLogger.warn(`Route not found: ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
  });
};

/**
 * Async error wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (server) => {
  const shutdown = (signal) => {
    errorLogger.info(`Received ${signal}, shutting down gracefully`);

    server.close(() => {
      errorLogger.info('Server closed successfully');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      errorLogger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    errorLogger.error('Uncaught Exception', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    errorLogger.error('Unhandled Rejection', {
      reason: reason?.toString(),
      promise,
    });
    process.exit(1);
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  gracefulShutdown,
};