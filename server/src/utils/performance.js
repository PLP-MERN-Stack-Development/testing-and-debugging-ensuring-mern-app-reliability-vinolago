// server/src/utils/performance.js - Performance monitoring utilities

const { createLogger } = require('./logger');

const perfLogger = createLogger('Performance');

/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.slowQueryThreshold = 100; // ms
    this.slowRequestThreshold = 1000; // ms
  }

  /**
   * Start timing an operation
   */
  startTiming(operationId) {
    this.metrics.set(operationId, {
      startTime: process.hrtime.bigint(),
      operationId,
    });
  }

  /**
   * End timing and log the result
   */
  endTiming(operationId, additionalData = {}) {
    const metric = this.metrics.get(operationId);
    if (!metric) {
      perfLogger.warn(`No timing started for operation: ${operationId}`);
      return;
    }

    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - metric.startTime) / 1000000; // Convert to milliseconds

    perfLogger.performance(operationId, duration, additionalData);

    // Clean up
    this.metrics.delete(operationId);

    return duration;
  }

  /**
   * Time a function execution
   */
  async timeFunction(operationId, fn, additionalData = {}) {
    this.startTiming(operationId);
    try {
      const result = await fn();
      this.endTiming(operationId, additionalData);
      return result;
    } catch (error) {
      this.endTiming(operationId, { ...additionalData, error: error.message });
      throw error;
    }
  }

  /**
   * Middleware to monitor request performance
   */
  requestMonitor(req, res, next) {
    const operationId = `request-${req.method}-${req.url}-${Date.now()}`;
    this.startTiming(operationId);

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = (...args) => {
      const duration = this.endTiming(operationId, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });

      // Log slow requests
      if (duration > this.slowRequestThreshold) {
        perfLogger.warn(`Slow request detected: ${req.method} ${req.url} took ${duration}ms`, {
          method: req.method,
          url: req.url,
          duration,
          statusCode: res.statusCode,
        });
      }

      originalEnd.apply(res, args);
    };

    next();
  }

  /**
   * Monitor database query performance
   */
  async monitorDatabaseQuery(operation, collection, query, fn) {
    const operationId = `db-${operation}-${collection}-${Date.now()}`;
    return this.timeFunction(operationId, fn, {
      operation,
      collection,
      query: JSON.stringify(query).substring(0, 200), // Limit query size
    });
  }

  /**
   * Monitor memory usage
   */
  logMemoryUsage() {
    const memUsage = process.memoryUsage();
    const usage = {
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)} MB`,
    };

    perfLogger.debug('Memory usage', usage);

    // Warn if heap usage is high
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (heapUsagePercent > 80) {
      perfLogger.warn(`High memory usage detected: ${heapUsagePercent.toFixed(2)}%`, usage);
    }

    return usage;
  }

  /**
   * Monitor event loop lag
   */
  monitorEventLoop() {
    let lastCheck = process.hrtime.bigint();
    const interval = setInterval(() => {
      const now = process.hrtime.bigint();
      const lag = Number(now - lastCheck) / 1000000 - 1000; // Expected 1000ms interval

      if (lag > 100) { // More than 100ms lag
        perfLogger.warn(`Event loop lag detected: ${lag.toFixed(2)}ms`);
      }

      lastCheck = now;
    }, 1000);

    return interval;
  }

  /**
   * Health check endpoint data
   */
  getHealthMetrics() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
      },
      uptime,
      timestamp: new Date().toISOString(),
      activeMetrics: this.metrics.size,
    };
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  PerformanceMonitor,
  performanceMonitor,
};