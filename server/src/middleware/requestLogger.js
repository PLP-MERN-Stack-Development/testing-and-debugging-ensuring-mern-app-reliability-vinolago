// server/src/middleware/requestLogger.js - Request logging middleware

const { createLogger } = require('../utils/logger');

const requestLogger = createLogger('RequestLogger');

/**
 * Middleware to log HTTP requests with timing
 */
const logRequests = (req, res, next) => {
  const start = Date.now();

  // Log the incoming request
  requestLogger.http(`Incoming ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    headers: req.headers,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;

    requestLogger.request(req, res, duration);

    // Call original end method
    originalEnd.apply(this, args);
  };

  next();
};

/**
 * Middleware to log database operations
 */
const logDatabaseOperations = (req, res, next) => {
  // Store original methods to intercept database calls
  const originalFind = req.db?.find;
  const originalSave = req.db?.save;
  const originalUpdate = req.db?.update;
  const originalDelete = req.db?.delete;

  if (originalFind) {
    req.db.find = function(collection, query) {
      const start = Date.now();
      const result = originalFind.call(this, collection, query);
      const duration = Date.now() - start;

      requestLogger.database('find', collection, query, result, null);

      return result;
    };
  }

  next();
};

module.exports = {
  logRequests,
  logDatabaseOperations,
};