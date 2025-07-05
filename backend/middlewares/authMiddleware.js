// backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

const authMiddleware = (req, res, next) => {
  console.log('🔒 Incoming request headers:', req.headers);

  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    console.warn('❌ Unauthorized: No Authorization header');
    return next(new ApiError('Unauthorized: Missing Authorization header', 401));
  }

  if (!authHeader.startsWith('Bearer ')) {
    console.warn('❌ Unauthorized: Invalid Authorization format');
    return next(new ApiError('Unauthorized: Invalid Authorization format', 401));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.warn('❌ Unauthorized: Token missing after Bearer');
    return next(new ApiError('Unauthorized: Missing token', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Log de debug — à désactiver en production
    console.log('✅ JWT verified. Payload:', decoded);

    // ✅ Convention OAuth2 → `sub` OU fallback `id`
    req.user = { id: decoded.sub || decoded.id };

    if (!req.user.id) {
      console.warn('❌ JWT payload missing user id');
      return next(new ApiError('Unauthorized: Invalid token payload', 401));
    }

    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);

    // Si c’est une expiration → message explicite
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError('Unauthorized: Token expired', 401));
    }

    return next(new ApiError('Unauthorized: Invalid token', 401));
  }
};

module.exports = authMiddleware;
