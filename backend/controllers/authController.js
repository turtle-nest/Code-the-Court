// backend/controllers/authController.js

const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/apiError');

// ✅ LOGIN with refresh token (set httpOnly cookies)
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
      return res.status(403).json({ message: 'Your account is pending approval.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return next(new ApiError('Invalid credentials', 401));
    }

    // ✅ Access Token (short)
    const accessToken = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // ✅ Refresh Token (long)
    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Save refresh token in DB (optional but you already do it)
    await db.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, user.id]
    );

    // 🔐 Cookies options (DEV vs PROD)
    const isProd = process.env.NODE_ENV === 'production';
    const accessCookieOpts = {
      httpOnly: true,
      secure: isProd,                          // true en prod (HTTPS)
      sameSite: isProd ? 'none' : 'lax',       // 'none' en prod cross-site
      maxAge: 2 * 60 * 60 * 1000,              // 2h
      // domain: 'ton-domaine-back.fr',        // optionnel en prod
      // path: '/',                            // défaut
    };
    const refreshCookieOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,         // 7 jours
    };

    // ✅ Set httpOnly cookies
    res.cookie('token', accessToken, accessCookieOpts);
    res.cookie('refresh_token', refreshToken, refreshCookieOpts);

    // (optionnel) garder aussi la réponse JSON
    return res.status(200).json({
      message: '✅ Login successful',
      token: accessToken,          // utile pour debug / Postman
      refreshToken: refreshToken,  // idem
      email: user.email,
      role: user.role,
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    next(new ApiError('Internal server error', 500));
  }
};

// ✅ REGISTER
const registerUser = async (req, res, next) => {
  const { username, email, password, institution } = req.body;

  if (!username || !email || !password) {
    return next(new ApiError('Username, email, and password are required', 400));
  }

  try {
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return next(new ApiError('Email already in use', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, institution, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
      [username, email, hashedPassword, institution]
    );

    res.status(201).json({
      message: '✅ Registration request submitted. Awaiting admin approval.',
      userId: result.rows[0].id,
    });

  } catch (err) {
    console.error('❌ Register error:', err);
    next(new ApiError('Internal server error', 500));
  }
};

// ✅ REFRESH TOKEN
const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ApiError('Missing refresh token', 400));
  }

  try {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE refresh_token = $1',
      [refreshToken]
    );

    if (rows.length === 0) {
      return next(new ApiError('Invalid refresh token', 403));
    }

    const user = rows[0];

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.sub !== user.id) {
      return next(new ApiError('Invalid refresh token', 403));
    }

    // ✅ Nouveau access token
    const newAccessToken = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log('✅ New Access Token:', newAccessToken);

    res.status(200).json({
      message: '✅ Access token refreshed',
      token: newAccessToken
    });

  } catch (err) {
    console.error('❌ Refresh token error:', err);
    next(new ApiError('Failed to refresh token', 500));
  }
};

module.exports = { login, registerUser, refreshToken };
