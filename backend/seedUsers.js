// backend/scripts/seedUsers.js
// Utility script: seed initial users (admin + test accounts) into PostgreSQL

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

(async function seedUsers() {
  console.log('🌱 Starting user seeding...');

  if (!db?.query) {
    console.error('❌ Database connection not initialized. Check config/db.js.');
    process.exit(1);
  }

  const users = [
    { email: 'admin@example.com', password: 'AdminPass123', role: 'admin' },
    { email: 'test@example.com', password: 'TestPass123', role: 'guest' },
  ];

  try {
    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);

      // Clean up old entry
      await db.query('DELETE FROM users WHERE email = $1', [user.email]);

      // Insert new user
      await db.query(
        `INSERT INTO users (email, password_hash, role, status)
         VALUES ($1, $2, $3, $4)`,
        [user.email, hash, user.role, 'approved']
      );

      console.log(`✅ Seeded user: ${user.email} (${user.role})`);
    }

    console.log('🌿 All users seeded successfully.\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error during user seeding:', err.message || err);
    process.exit(1);
  }
})();
