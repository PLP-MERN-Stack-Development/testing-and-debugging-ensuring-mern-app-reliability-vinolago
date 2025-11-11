// server/src/utils/logger.js - Logging utilities for server-side debugging

const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.colorize({ all: true })
);

// Define transports
const transports = [
  // Console transport for development
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} ${level}: ${message}${metaStr}`;
      })
    ),
  }),

  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});

// Custom logging functions with context
const createLogger = (context) => ({
  error: (message, meta = {}) => logger.error(message, { context, ...meta }),
  warn: (message, meta = {}) => logger.warn(message, { context, ...meta }),
  info: (message, meta = {}) => logger.info(message, { context, ...meta }),
  http: (message, meta = {}) => logger.http(message, { context, ...meta }),
  debug: (message, meta = {}) => logger.debug(message, { context, ...meta }),

  // Specialized logging methods
  request: (req, res, responseTime) => {
    const { method, url, ip } = req;
    const { statusCode } = res;
    const message = `${method} ${url} ${statusCode} - ${responseTime}ms`;

    const level = statusCode >= 400 ? 'warn' : 'http';
    logger.log(level, message, {
      context,
      method,
      url,
      statusCode,
      responseTime,
      ip,
      userAgent: req.get('User-Agent'),
    });
  },

  database: (operation, collection, query = {}, result = null, error = null) => {
    const message = `DB ${operation} on ${collection}`;
    const meta = { context, operation, collection, query };

    if (error) {
      logger.error(message, { ...meta, error: error.message, stack: error.stack });
    } else {
      logger.debug(message, { ...meta, result });
    }
  },

  auth: (action, userId = null, success = true, details = {}) => {
    const message = `Auth ${action}${success ? ' successful' : ' failed'}`;
    const level = success ? 'info' : 'warn';

    logger.log(level, message, {
      context,
      action,
      userId,
      success,
      ...details,
    });
  },

  performance: (operation, duration, details = {}) => {
    const message = `Performance: ${operation} took ${duration}ms`;
    const level = duration > 1000 ? 'warn' : 'debug';

    logger.log(level, message, {
      context,
      operation,
      duration,
      ...details,
    });
  },
});

module.exports = {
  logger,
  createLogger,
};