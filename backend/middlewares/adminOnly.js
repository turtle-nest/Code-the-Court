// backend/middlewares/adminOnly.js
// Middleware: restrict access to admin users only

const ApiError = require('../utils/apiError');

const isDev = process.env.NODE_ENV === 'development';

/**
 * Ensure that the authenticated user has the 'admin' role.
 * Returns HTTP 403 if not authorized.
 */
const adminOnly = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new ApiError('Admin access only', 403));
    }
    return next();
  } catch (err) {
    if (isDev) console.error('[middleware] adminOnly error:', err);
    return next(new ApiError('Authorization check failed', 500));
  }
};

module.exports = adminOnly;
