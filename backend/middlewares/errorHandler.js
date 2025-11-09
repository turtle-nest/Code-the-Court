// backend/middlewares/errorHandler.js
// Global error-handling middleware for Express

const ApiError = require('../utils/apiError');

const isDev = process.env.NODE_ENV === 'development';

/**
 * Express global error handler.
 * Formats all errors as JSON and hides stack traces in production.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log details only in development
  if (isDev) {
    if (err instanceof ApiError) {
      console.warn(`[errorHandler] ${statusCode}: ${message}`);
    } else {
      console.error('[errorHandler] Unexpected error:', err);
    }
  }

  const payload = { status: statusCode, error: message };

  // Add stack trace for local debugging only
  if (isDev && !(err instanceof ApiError)) {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
}

module.exports = errorHandler;
