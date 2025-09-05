// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

const authMiddleware = (req, res, next) => {
  // (Debug) désactive en prod si besoin
  console.log('🔒 Incoming request headers:', req.headers);

  // 1) Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  const headerToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  // 2) Cookie httpOnly "token" (nécessite cookie-parser + CORS credentials)
  const cookieToken = req.cookies?.token || null;

  const token = headerToken || cookieToken;

  if (!token) {
    console.warn('❌ Unauthorized: no token in header or cookie');
    return next(new ApiError('Unauthorized', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Convention OAuth2: "sub" (subject) ou fallback "id"
    const userId = decoded.sub || decoded.id;

    if (!userId) {
      console.warn('❌ JWT payload missing user id');
      return next(new ApiError('Unauthorized', 401));
    }

    req.user = { id: userId, ...decoded };
    // (Debug) désactive en prod si besoin
    console.log('✅ JWT verified. user_id =', userId);
    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError('Unauthorized: Token expired', 401));
    }
    return next(new ApiError('Unauthorized', 401));
  }
};

module.exports = authMiddleware;
