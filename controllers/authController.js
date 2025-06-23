// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = userRes.rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);

    if (!validPass)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
};
