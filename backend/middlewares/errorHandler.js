// middlewares/errorHandler.js
const ApiError = require('../utils/apiError');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log only real unexpected errors
  if (!(err instanceof ApiError)) {
    console.error('Unexpected error:', err);
  }

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
