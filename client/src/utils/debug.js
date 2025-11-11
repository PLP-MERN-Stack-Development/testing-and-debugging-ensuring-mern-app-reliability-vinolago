// client/src/utils/debug.js - Client-side debugging utilities

/**
 * Debug utilities for client-side development
 */

// Performance monitoring
export const performanceMonitor = {
  // Start timing an operation
  startTiming: (label) => {
    if (process.env.NODE_ENV === 'development') {
      console.time(label);
      performance.mark(`${label}-start`);
    }
  },

  // End timing and log result
  endTiming: (label) => {
    if (process.env.NODE_ENV === 'development') {
      console.timeEnd(label);
      performance.mark(`${label}-end`);
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label)[0];
        console.log(`🚀 ${label}: ${measure.duration.toFixed(2)}ms`);
      } catch (error) {
        console.warn('Performance measure failed:', error);
      }
    }
  },

  // Log component render
  logRender: (componentName, props = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 ${componentName} rendered`, props);
    }
  },

  // Log API calls
  logApiCall: (method, url, data = null, response = null, error = null) => {
    if (process.env.NODE_ENV === 'development') {
      const emoji = error ? '❌' : '✅';
      console.group(`${emoji} API ${method} ${url}`);
      if (data) console.log('Request:', data);
      if (response) console.log('Response:', response);
      if (error) console.error('Error:', error);
      console.groupEnd();
    }
  },
};

// Memory usage monitoring
export const memoryMonitor = {
  logMemoryUsage: () => {
    if (process.env.NODE_ENV === 'development' && performance.memory) {
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
      console.log('🧠 Memory Usage:', {
        used: `${(usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        usagePercent: `${((usedJSHeapSize / jsHeapSizeLimit) * 100).toFixed(2)}%`,
      });
    }
  },

  startMemoryMonitoring: (interval = 30000) => {
    if (process.env.NODE_ENV === 'development') {
      return setInterval(() => {
        memoryMonitor.logMemoryUsage();
      }, interval);
    }
  },
};

// Network monitoring
export const networkMonitor = {
  // Intercept fetch calls for debugging
  interceptFetch: () => {
    if (process.env.NODE_ENV === 'development') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const start = performance.now();
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - start;

          performanceMonitor.logApiCall(
            args[1]?.method || 'GET',
            args[0],
            args[1]?.body,
            { status: response.status, duration: `${duration.toFixed(2)}ms` }
          );

          return response;
        } catch (error) {
          const duration = performance.now() - start;
          performanceMonitor.logApiCall(
            args[1]?.method || 'GET',
            args[0],
            args[1]?.body,
            null,
            error
          );
          throw error;
        }
      };
    }
  },
};

// React DevTools helpers
export const reactDebug = {
  // Log component lifecycle
  logLifecycle: (componentName, method, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚛️ ${componentName}.${method}`, data);
    }
  },

  // Debug state changes
  logStateChange: (componentName, prevState, nextState) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔄 ${componentName} state changed`);
      console.log('Previous:', prevState);
      console.log('Next:', nextState);
      console.groupEnd();
    }
  },

  // Debug prop changes
  logPropChange: (componentName, prevProps, nextProps) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`📥 ${componentName} props changed`);
      console.log('Previous:', prevProps);
      console.log('Next:', nextProps);
      console.groupEnd();
    }
  },
};

// Global error handler for unhandled errors
export const setupGlobalErrorHandler = () => {
  if (process.env.NODE_ENV === 'development') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      // Prevent the default handler
      event.preventDefault();
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('🚨 Uncaught Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    // Handle React errors (fallback for when ErrorBoundary doesn't catch)
    window.addEventListener('error', (event) => {
      if (event.error && event.error.stack && event.error.stack.includes('React')) {
        console.error('🚨 React Error:', event.error);
      }
    });
  }
};

// Initialize all debugging tools
export const initDebugTools = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🐛 Debug tools initialized');
    networkMonitor.interceptFetch();
    setupGlobalErrorHandler();

    // Log initial memory usage
    memoryMonitor.logMemoryUsage();

    // Start memory monitoring
    const memoryInterval = memoryMonitor.startMemoryMonitoring();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (memoryInterval) {
        clearInterval(memoryInterval);
      }
    });
  }
};