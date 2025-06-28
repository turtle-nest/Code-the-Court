const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/apiError');

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError('Email and password are required', 400));
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return next(new ApiError('Invalid credentials', 401));
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ message: 'pending' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      token,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    next(new ApiError('Internal server error', 500));
  }
};

module.exports = { login };
