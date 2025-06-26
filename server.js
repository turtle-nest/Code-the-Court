// server.js (Backend root file, the entry point)
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
app.use(express.json()); // allows reading JSON in POST/PUT requests

// Test DB query
db.query('SELECT NOW()')
  .then(res => console.log('📅 DB Time:', res.rows[0].now))
  .catch(err => console.error('❌ DB Error:', err));

// Test route
app.get('/', (req, res) => {
  res.send('Code the Court API is running!');
});

// Routes
const decisionsRoutes = require('./routes/decisions');
app.use('/api/decisions', decisionsRoutes);

const archivesRoutes = require('./routes/archives');
app.use('/api/archives', archivesRoutes);

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const notesRoutes = require('./routes/notes');
app.use('/api/notes', notesRoutes);

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

const juridictionsRoutes = require('./routes/juridictions');
app.use('/api/juridictions', juridictionsRoutes);

const typesRoutes = require('./routes/types');
app.use('/api/types', typesRoutes);

const testRoutes = require('./routes/test');
app.use('/api', testRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

// Start server only if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
