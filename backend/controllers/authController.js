// backend/controllers/authController.js
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
      return res.status(403).json({ message: 'Your account is pending approval.' });
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

// ✅ Nouveau contrôleur pour l'inscription
const registerUser = async (req, res, next) => {
  const { username, email, password, institution } = req.body;

  if (!username || !email || !password) {
    return next(new ApiError('Username, email, and password are required', 400));
  }

  try {
    // Vérifier doublon email
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return next(new ApiError('Email already in use', 409));
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur en BDD
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash, institution, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id`,
      [username, email, hashedPassword, institution]
    );

    res.status(201).json({
      message: 'Registration request submitted successfully. Awaiting admin approval.',
      userId: result.rows[0].id,
    });
  } catch (err) {
    console.error('Register error:', err);
    next(new ApiError('Internal server error', 500));
  }
};

module.exports = { login, registerUser };
