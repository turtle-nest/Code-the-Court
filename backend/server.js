// server.js (Backend entry point)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('SocioJustice API is running!');
});

app.use('/api/decisions', require('./routes/decisions'));
app.use('/api/archives', require('./routes/archives'));
app.use('/api', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api', require('./routes/test'));

// Error handler (should be last)
app.use(errorHandler);

// Test DB query → UNIQUEMENT en mode script direct
if (require.main === module) {
  db.query('SELECT NOW()')
    .then(res => console.log('📅 DB Time:', res.rows[0].now))
    .catch(err => console.error('❌ DB Error:', err));

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
