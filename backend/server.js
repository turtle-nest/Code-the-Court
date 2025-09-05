// backend/server.js
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // ✅ NEW
const db = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const uploadsRoot = path.join(process.cwd(), 'uploads');

// Routers
const notesRouter = require('./routes/notes');
const archivesRouter = require('./routes/archives');
const decisionsRouter = require('./routes/decisions');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const statsRouter = require('./routes/stats');
const profileRouter = require('./routes/profile');
const metadataRouter = require('./routes/metadata');

// Auth middleware
const auth = require('./middlewares/authMiddleware'); // ✅ NEW

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ---------- Core middlewares ----------
app.use(express.urlencoded({ extended: true })); // pour formulaires simples
app.use(express.json());                         // JSON parser
app.use(cookieParser());                         // ✅ nécessaire pour lire req.cookies.token

// CORS (cookies cross-origin)
app.use(
  cors({
    origin: FRONTEND_URL,        // EXACTEMENT l’origin du front
    credentials: true,           // ✅ indispensable pour envoyer/recevoir les cookies
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ---------- Static ----------
app.use('/uploads', express.static(uploadsRoot, {
  fallthrough: true,
  dotfiles: 'ignore',
  index: false,
}));

// ---------- Debug (temporaire) ----------
app.get('/api/debug/echo', (req, res) => {
  res.json({
    origin: req.headers.origin,
    cookiesHeader: req.headers.cookie || null,
    parsedCookies: req.cookies || null,
    hasAuthHeader: !!req.headers.authorization,
  });
});
app.get('/api/debug/whoami', auth, (req, res) => {
  res.json({ user: req.user || null });
});

// ---------- API routes ----------
app.use('/api/archives', archivesRouter);  // si besoin d’auth, ajoute `auth` ici aussi
app.use('/api/decisions', decisionsRouter);
app.use('/api', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/stats', statsRouter);
app.use('/api/notes', auth, notesRouter);  // ✅ protégé + cookie prêt (cookie-parser)
app.use('/api/profile', profileRouter);
app.use('/api/metadata', metadataRouter);

// Root ping
app.get('/', (req, res) => {
  res.send('SocioJustice API is running!');
});

// Errors
app.use(errorHandler);

// ---------- Boot ----------
if (require.main === module) {
  db.query('SELECT NOW()')
    .then(r => console.log('📅 DB Time:', r.rows[0].now))
    .catch(err => console.error('❌ DB Error:', err));

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`🌐 CORS origin: ${FRONTEND_URL}`);
  });
}

module.exports = app;
