// backend/middlewares/adminOnly.js
const ApiError = require('../utils/apiError');

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new ApiError('Admin access only', 403));
  }
  next();
};

module.exports = adminOnly;
