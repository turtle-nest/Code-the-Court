// controllers/usersController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/apiError');

// POST /api/users/register
const registerUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ApiError('Email and password required', 400));
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, role, status`,
      [email, hash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return next(new ApiError('Email already exists', 409));
    }
    next(new ApiError('Registration error', 500));
  }
};

module.exports = { registerUser };
