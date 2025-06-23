// server.js (Backend root file, the entry point)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

const app = express();
dotenv.config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

const testRoutes = require('./routes/test');
app.use('/api', testRoutes);

// Start server only if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
