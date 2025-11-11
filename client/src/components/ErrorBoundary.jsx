// client/src/components/ErrorBoundary.jsx - React Error Boundary component

import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and/or external service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
      this.logErrorToService(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  logErrorToService = (error, errorInfo) => {
    // Simulate logging to external service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In a real app, you would send this to your error reporting service
    console.log('Error report:', errorReport);

    // Example: sendBeacon or fetch to error reporting endpoint
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/errors', JSON.stringify(errorReport));
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary" role="alert" data-testid="error-boundary">
          <div className="error-boundary__content">
            <h2 className="error-boundary__title">Oops! Something went wrong</h2>
            <p className="error-boundary__message">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-boundary__details">
                <summary>Error Details (Development Only)</summary>
                <pre className="error-boundary__stack">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="error-boundary__actions">
              <button
                className="error-boundary__reset-btn"
                onClick={this.handleReset}
                data-testid="reset-error-button"
              >
                Try Again
              </button>
              <button
                className="error-boundary__reload-btn"
                onClick={() => window.location.reload()}
                data-testid="reload-page-button"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default ErrorBoundary;