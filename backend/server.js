require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// ✅ Serve statically the uploads folder for PDF links
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Body parser for URL-encoded forms (e.g., classic HTML forms)
app.use(express.urlencoded({ extended: true }));

// ⚠️ IMPORTANT : Pour les requêtes JSON => .json() après Multer
// On monte les routes qui utilisent FormData avant express.json()
app.use('/api/archives', require('./routes/archives'));

// ✅ JSON Body parser pour les autres routes
app.use(express.json());

// ✅ Autres routes API
app.use('/api/decisions', require('./routes/decisions'));
app.use('/api', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/metadata', require('./routes/metadata'));

// ✅ Route test
app.get('/', (req, res) => {
  res.send('SocioJustice API is running!');
});

// ✅ Error handler (toujours à la fin)
app.use(errorHandler);

// ✅ Test connexion DB et démarrage du serveur
if (require.main === module) {
  db.query('SELECT NOW()')
    .then(res => console.log('📅 DB Time:', res.rows[0].now))
    .catch(err => console.error('❌ DB Error:', err));

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
