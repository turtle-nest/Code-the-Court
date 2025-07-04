// generateToken.js
require('dotenv').config(); // Charge ton .env automatiquement
const jwt = require('jsonwebtoken');

// Ton UUID fixe aligné sur ton seed SQL
const userId = '11111111-2222-3333-4444-555555555555';

// Récupère ta clé secrète JWT
const JWT_SECRET = process.env.JWT_SECRET || 'changeme_super_secret_key';

// Vérifie que tu utilises bien la même clé que ton backend
console.log('🔑 JWT_SECRET utilisé pour signer:', JWT_SECRET);

// Ton payload minimal
const payload = {
  sub: userId,
  email: 'admin@example.com',
  role: 'admin'
};

// Génère le token
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '7d'
});

console.log('\n✅ Generated JWT:\n');
console.log(token);
