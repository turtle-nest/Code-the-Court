// backend/controllers/usersController.js
// Controller: user management (legacy/simple registration endpoint)

const db = require('../config/db');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/apiError');

const isDev = process.env.NODE_ENV === 'development';

/**
 * POST /api/users/register
 * Minimal registration (kept for compatibility).
 * Prefer /api/register from authController for the main flow.
 */
const registerUser = async (req, res, next) => {
  try {
    const { email, password, username = null, institution = null } = req.body || {};

    if (!email || !password) {
      return next(new ApiError('Email and password required', 400));
    }

    // Optional early check to return a clean 409 before hitting a UNIQUE constraint
    const existing = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return next(new ApiError('Email already in use', 409));
    }

    const hash = await bcrypt.hash(password, 10);

    const insertSql = `
      INSERT INTO users (email, password_hash, username, institution, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING id, email, role, status, username, institution
    `;
    const { rows } = await db.query(insertSql, [email, hash, username, institution]);

    return res.status(201).json({
      message: 'Registration request submitted. Awaiting admin approval.',
      user: rows[0],
    });
  } catch (err) {
    if (isDev) console.error('[users] registerUser error:', err);
    // UNIQUE violation (email)
    if (err && err.code === '23505') {
      return next(new ApiError('Email already in use', 409));
    }
    return next(new ApiError('Registration error', 500));
  }
};

module.exports = { registerUser };
