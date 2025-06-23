// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ApiError('Email and password required', 400));

  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0)
      return next(new ApiError('Invalid credentials', 401));

    const user = userRes.rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);

    if (!validPass)
      return next(new ApiError('Invalid credentials', 401));

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    next(new ApiError('Internal server error', 500));
  }
};

module.exports = {
  login,
};
