// backend/controllers/authController.js
// Controller: authentication (login, register, refresh). All code & comments in English.

const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/apiError');

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';

/**
 * POST /api/login
 * Issue access & refresh tokens and set them as httpOnly cookies.
 */
const login = async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(new ApiError('Email and password are required', 400));
  }

  try {
    const { rows } = await db.query(
      'SELECT id, email, role, status, password_hash FROM users WHERE email = $1',
      [email]
    );
    const user = rows[0];
    if (!user) return next(new ApiError('Invalid credentials', 401));

    if (user.status !== 'approved') {
      return next(new ApiError('Account is pending approval', 403));
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }

    // Access Token (short lived)
    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Refresh Token (long lived)
    const refreshTokenValue = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Persist refresh token (optional but recommended)
    await db.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [
      refreshTokenValue,
      user.id,
    ]);

    // Cookies options
    const accessCookieOpts = {
      httpOnly: true,
      secure: isProd,                      // must be true on HTTPS
      sameSite: isProd ? 'none' : 'lax',   // 'none' for cross-site in prod
      maxAge: 2 * 60 * 60 * 1000,          // 2h
      path: '/',
    };
    const refreshCookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,     // 7d
      path: '/',
    };

    // Set httpOnly cookies
    res.cookie('token', accessToken, accessCookieOpts);
    res.cookie('refresh_token', refreshTokenValue, refreshCookieOpts);

    // Response body: keep minimal in prod; include tokens only in dev for tooling
    const payload = {
      message: 'Login successful',
      email: user.email,
      role: user.role,
    };
    if (isDev) {
      payload.token = accessToken;
      payload.refreshToken = refreshTokenValue;
    }

    return res.status(200).json(payload);
  } catch (err) {
    if (isDev) console.error('[auth] login error:', err);
    return next(new ApiError('Internal server error', 500));
  }
};

/**
 * POST /api/register
 * Create a new user with "pending" status (admin approval workflow).
 */
const registerUser = async (req, res, next) => {
  const { username, email, password, institution } = req.body || {};

  if (!username || !email || !password) {
    return next(new ApiError('Username, email, and password are required', 400));
  }

  try {
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return next(new ApiError('Email already in use', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await db.query(
      `INSERT INTO users (username, email, password_hash, institution, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
      [username, email, hashedPassword, institution || null]
    );

    return res.status(201).json({
      message: 'Registration request submitted. Awaiting admin approval.',
      userId: rows[0].id,
    });
  } catch (err) {
    if (isDev) console.error('[auth] register error:', err);
    return next(new ApiError('Internal server error', 500));
  }
};

/**
 * POST /api/refresh
 * Verify refresh token and issue a new access token.
 * Note: function name differs from exported alias to avoid confusion with variable names.
 */
const refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    return next(new ApiError('Missing refresh token', 400));
  }

  try {
    const { rows } = await db.query(
      'SELECT id, role, refresh_token FROM users WHERE refresh_token = $1',
      [refreshToken]
    );
    if (rows.length === 0) {
      return next(new ApiError('Invalid refresh token', 403));
    }

    const user = rows[0];

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (e) {
      return next(new ApiError('Invalid refresh token', 403));
    }

    if (decoded.sub !== user.id) {
      return next(new ApiError('Invalid refresh token', 403));
    }

    const newAccessToken = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // No console.log of tokens in polished code
    return res.status(200).json({
      message: 'Access token refreshed',
      token: newAccessToken,
    });
  } catch (err) {
    if (isDev) console.error('[auth] refresh error:', err);
    return next(new ApiError('Failed to refresh token', 500));
  }
};

module.exports = {
  login,
  registerUser,
  refreshToken: refreshAccessToken, // keep the exported name expected by routes
};
