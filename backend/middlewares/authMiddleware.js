// backend/middlewares/authMiddleware.js
// Middleware: verify JWT from Authorization header or httpOnly cookie

const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

const isDev = process.env.NODE_ENV === 'development';

/**
 * Validate JWT token (Bearer or cookie).
 * Adds decoded payload to req.user if valid.
 */
const authMiddleware = (req, res, next) => {
  try {
    if (isDev) console.debug('[authMiddleware] headers:', req.headers);

    // 1) Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    // 2) Cookie httpOnly "token" (requires cookie-parser + CORS credentials)
    const cookieToken = req.cookies?.token || null;

    const token = headerToken || cookieToken;

    if (!token) {
      if (isDev) console.warn('[authMiddleware] Missing token');
      return next(new ApiError('Unauthorized', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Convention OAuth2: "sub" (subject) or fallback "id"
    const userId = decoded.sub || decoded.id;
    if (!userId) {
      if (isDev) console.warn('[authMiddleware] Missing user id in payload');
      return next(new ApiError('Unauthorized', 401));
    }

    req.user = { id: userId, ...decoded };

    if (isDev) console.debug('[authMiddleware] JWT verified:', req.user);
    return next();
  } catch (err) {
    if (isDev) console.error('[authMiddleware] JWT verification failed:', err.message);

    if (err.name === 'TokenExpiredError') {
      return next(new ApiError('Unauthorized: token expired', 401));
    }
    return next(new ApiError('Unauthorized: invalid token', 401));
  }
};

module.exports = authMiddleware;
