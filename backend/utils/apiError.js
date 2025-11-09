// backend/utils/apiError.js
// Utility: custom error class for consistent API error handling

class ApiError extends Error {
  /**
   * Create an API error.
   * @param {string} message - Error message to display.
   * @param {number} [statusCode=500] - HTTP status code.
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;

    // Preserve correct stack trace (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'ApiError';
  }
}

module.exports = ApiError;
