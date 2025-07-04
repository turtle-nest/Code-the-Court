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

    // ✅ Log payload pour debug (ATTENTION à retirer en prod)
    console.log('✅ JWT verified. Payload:', decoded);

    // Utilise `sub` par convention OAuth2, fallback sur `id` si besoin
    req.user = { id: decoded.sub || decoded.id };

    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    return next(new ApiError('Unauthorized: Invalid or expired token', 401));
  }
};

module.exports = authMiddleware;
