// backend/server.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const uploadsRoot = path.join(process.cwd(), 'uploads');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middleware CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// ✅ Sert les fichiers PDF
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  fallthrough: true,
  dotfiles: 'ignore',
  index: false,
  // (optionnel) setHeaders: (res) => { res.set('Cache-Control', 'private, max-age=31536000'); }
}));

// ✅ Body parser pour formulaires HTML classiques
app.use(express.urlencoded({ extended: true }));

// ⚠️ IMPORTANT : routes qui utilisent FormData avant express.json()
app.use('/api/archives', require('./routes/archives'));

// ✅ Body parser JSON pour le reste
app.use(express.json());

// ✅ Toutes tes routes API
app.use('/api/decisions', require('./routes/decisions'));
app.use('/api', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/metadata', require('./routes/metadata'));
app.use('/uploads', express.static(uploadsRoot));

// ✅ Route test
app.get('/', (req, res) => {
  res.send('SocioJustice API is running!');
});

// ✅ Gestion des erreurs
app.use(errorHandler);

// ✅ Test DB et démarrage
if (require.main === module) {
  db.query('SELECT NOW()')
    .then(res => console.log('📅 DB Time:', res.rows[0].now))
    .catch(err => console.error('❌ DB Error:', err));

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
