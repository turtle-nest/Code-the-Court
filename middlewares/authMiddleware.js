// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError('Unauthorized', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError('Invalid token', 403));
  }
};

module.exports = authMiddleware;
