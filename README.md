# 🧪 Testing and Debugging MERN Applications

This project demonstrates a comprehensive testing strategy for MERN stack applications, featuring unit testing, integration testing, end-to-end testing, and advanced debugging techniques. The implementation achieves **93.79% code coverage** with **57 passing tests**.

## 📊 Test Results Summary

- **Unit Tests**: ✅ 57/57 passing (93.79% statement coverage)
- **Integration Tests**: ✅ Configured and ready
- **End-to-End Tests**: ✅ Cypress configured and ready
- **Coverage Threshold**: ✅ Exceeds 70% requirement

## 🏗️ Testing Strategy Overview

### **1. Testing Pyramid Implementation**

```
End-to-End Tests (E2E)     ████░░░░░░░ 20%
Integration Tests          ████████░░░ 60%
Unit Tests                 ███████████ 90%
```

### **2. Test Categories**

- **Unit Tests**: Isolated function/component testing
- **Integration Tests**: API endpoint and database testing
- **E2E Tests**: Full user workflow testing
- **Component Tests**: React component testing with Cypress

### **3. Testing Tools & Frameworks**

- **Jest**: Primary testing framework with multi-project configuration
- **React Testing Library**: Component testing utilities
- **Supertest**: HTTP endpoint testing
- **MongoDB Memory Server**: Isolated database testing
- **Cypress**: End-to-end and component testing
- **Winston**: Structured logging for debugging

## Project Structure

```
mern-testing/
├── client/                 # React front-end
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   ├── tests/          # Client-side tests
│   │   │   ├── unit/       # Unit tests
│   │   │   └── integration/ # Integration tests
│   │   └── App.jsx         # Main application component
│   └── cypress/            # End-to-end tests
├── server/                 # Express.js back-end
│   ├── src/                # Server source code
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Custom middleware
│   └── tests/              # Server-side tests
│       ├── unit/           # Unit tests
│       └── integration/    # Integration tests
├── jest.config.js          # Jest configuration
└── package.json            # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **MongoDB**: Local installation or Atlas account (for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd mern-testing
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   # This runs: npm install && cd client && npm install && cd ../server && npm install
   ```

3. **Set up environment variables**

   ```bash
   # Create .env file in server directory
   cd server
   cp .env.example .env

   # Edit .env with your MongoDB connection string
   MONGODB_URI=mongodb://localhost:27017/mern-testing
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

4. **Set up test database** (optional, for development)
   ```bash
   npm run setup-test-db
   ```

### Running the Application

1. **Development mode** (runs both client and server)

   ```bash
   npm run dev
   ```

2. **Run only server**

   ```bash
   cd server && npm run dev
   ```

3. **Run only client**
   ```bash
   cd client && npm start
   ```

## 🧪 Testing Suite

### Available Test Commands

```bash
# Run all tests
npm test

# Run unit tests only (57 tests, 93.79% coverage)
npm run test:unit

# Run integration tests (API + Database)
npm run test:integration

# Run client-side tests only
npm run test:client

# Run server-side tests only
npm run test:server

# Run end-to-end tests (requires Cypress)
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage Report

The project achieves **93.79% statement coverage** across all test categories:

```
-----------------------|---------|----------|---------|---------|-------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------|---------|----------|---------|---------|-------------------
All files              |   93.79 |     87.5 |      90 |   94.21 |
 client/src/components |    92.3 |       75 |     100 |     100 |
  Button.jsx           |    92.3 |       75 |     100 |     100 | 29-40
 client/src/hooks      |   95.45 |      100 |     100 |   95.23 |
  useLocalStorage.js   |   95.45 |      100 |     100 |   95.23 | 40
 client/src/utils      |     100 |      100 |     100 |     100 |
  helpers.js           |     100 |      100 |     100 |     100 |
 server/src/middleware |   87.75 |       80 |      70 |    87.5 |
  auth.js              |   87.75 |       80 |      70 |    87.5 | 60-68
 server/src/utils      |     100 |      100 |     100 |     100 |
  auth.js              |     100 |      100 |     100 |     100 |
-----------------------|---------|----------|---------|---------|-------------------
```

### Test Categories Breakdown

#### **Unit Tests** (57 tests passing)

- **Client Utilities**: String manipulation, date formatting, debouncing
- **React Components**: Button component with props and event handling
- **Custom Hooks**: useLocalStorage with localStorage mocking
- **Server Utilities**: JWT token generation and validation
- **Middleware**: Authentication and authorization logic

#### **Integration Tests**

- **API Endpoints**: Full CRUD operations with Supertest
- **Database Operations**: MongoDB Memory Server for isolation
- **Authentication Flows**: Registration, login, protected routes
- **Form Integration**: LoginForm with API error handling

#### **End-to-End Tests**

- **User Workflows**: Complete registration → login → CRUD flows
- **Navigation**: Route protection and redirection logic
- **Error Handling**: Network failures and validation errors
- **Component Testing**: Isolated component behavior with Cypress

### Testing Best Practices Implemented

1. **Test Isolation**: Each test runs in clean environment
2. **Mocking Strategy**: External dependencies properly mocked
3. **Coverage Goals**: Exceeds 70% requirement with 93.79% coverage
4. **CI/CD Ready**: Tests run in automated pipeline
5. **Performance**: Fast test execution with parallel processing

## 🔧 Debugging Techniques Implementation

### Server-Side Debugging

#### **1. Structured Logging with Winston**

```javascript
// server/src/utils/logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

module.exports = { createLogger: (module) => logger.child({ module }) };
```

#### **2. Request Logging Middleware**

```javascript
// server/src/middleware/requestLogger.js
const logger = require("../utils/logger").createLogger("RequestLogger");

const logRequests = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  });

  next();
};
```

#### **3. Global Error Handler**

```javascript
// server/src/middleware/errorHandler.js
const logger = require("../utils/logger").createLogger("ErrorHandler");

const errorHandler = (err, req, res, next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
  });
};
```

### Client-Side Debugging

#### **1. React Error Boundaries**

```javascript
// client/src/components/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
          {process.env.NODE_ENV === "development" && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error?.toString()}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### **2. Debug Utilities**

```javascript
// client/src/utils/debug.js
export const debug = {
  log: (message, data) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data);
  },

  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },

  performance: (label) => {
    if (process.env.NODE_ENV === "development") {
      console.time(label);
      return () => console.timeEnd(label);
    }
    return () => {};
  },
};
```

### Performance Monitoring

#### **1. Server Performance Tracking**

```javascript
// server/src/utils/performance.js
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      averageResponseTime: 0,
      memoryUsage: {},
      uptime: 0,
    };
  }

  requestMonitor(req, res, next) {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds

      this.metrics.requests++;
      this.updateAverageResponseTime(duration);
    });

    next();
  }

  updateAverageResponseTime(duration) {
    const currentAvg = this.metrics.averageResponseTime;
    const newCount = this.metrics.requests;
    this.metrics.averageResponseTime =
      (currentAvg * (newCount - 1) + duration) / newCount;
  }

  getHealthMetrics() {
    const memUsage = process.memoryUsage();
    return {
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      },
      requests: this.metrics.requests,
      averageResponseTime:
        Math.round(this.metrics.averageResponseTime * 100) / 100,
    };
  }
}

module.exports = { performanceMonitor: new PerformanceMonitor() };
```

## 📸 Test Coverage Screenshots

### Coverage Report Overview

```
-----------------------|---------|----------|---------|---------|-------------------
File                   | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------|---------|----------|---------|---------|-------------------
All files              |   93.79 |     87.5 |      90 |   94.21 |
 client/src/components |    92.3 |       75 |     100 |     100 |
  Button.jsx           |    92.3 |       75 |     100 |     100 | 29-40
 client/src/hooks      |   95.45 |      100 |     100 |   95.23 |
  useLocalStorage.js   |   95.45 |      100 |     100 |   95.23 | 40
 client/src/utils      |     100 |      100 |     100 |     100 |
  helpers.js           |     100 |      100 |     100 |     100 |
 server/src/middleware |   87.75 |       80 |      70 |    87.5 |
  auth.js              |   87.75 |       80 |      70 |    87.5 | 60-68
 server/src/utils      |     100 |      100 |     100 |     100 |
  auth.js              |     100 |      100 |     100 |     100 |
-----------------------|---------|----------|---------|---------|-------------------
```

### HTML Coverage Report

The complete HTML coverage report is available in the `coverage/` directory after running `npm run test:coverage`. Key highlights:

- **93.79% Statement Coverage**: Exceeds the 70% requirement
- **87.5% Branch Coverage**: Comprehensive conditional logic testing
- **90% Function Coverage**: All critical functions tested
- **94.21% Line Coverage**: Near-complete code execution coverage

## 📋 Submission Checklist

- ✅ **Unit Tests**: 57/57 passing with 93.79% coverage
- ✅ **Integration Tests**: API and database testing implemented
- ✅ **End-to-End Tests**: Cypress configuration complete
- ✅ **Testing Strategy**: Comprehensive documentation in README
- ✅ **Coverage Reports**: HTML and LCOV reports generated
- ✅ **Debugging Techniques**: Logging, error boundaries, performance monitoring
- ✅ **Code Quality**: Proper error handling and best practices

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest API Testing](https://github.com/visionmedia/supertest)
- [Cypress E2E Testing](https://docs.cypress.io/)
- [Winston Logging](https://github.com/winstonjs/winston)
- [MongoDB Testing Best Practices](https://www.mongodb.com/blog/post/mongodb-testing-best-practices)
