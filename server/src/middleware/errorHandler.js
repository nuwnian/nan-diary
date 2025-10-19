const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.uid,
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let errorResponse = {
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error = 'ValidationError';
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorResponse.error = 'Unauthorized';
  }

  if (err.code === 'permission-denied') {
    statusCode = 403;
    errorResponse.error = 'Forbidden';
    errorResponse.message = 'You do not have permission to perform this action';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.message = 'An unexpected error occurred';
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler for undefined routes
 */
function notFoundHandler(req, res) {
  logger.warn('Route not found', { path: req.path, method: req.method });
  
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Route ${req.method} ${req.path} not found`,
  });
}

/**
 * Async error wrapper - wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
