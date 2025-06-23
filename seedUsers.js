const bcrypt = require('bcrypt');
const db = require('./config/db');

async function seedUsers() {
  try {
    const users = [
      { email: 'admin@example.com', password: 'AdminPass123', role: 'admin' },
      { email: 'test@example.com', password: 'TestPass123', role: 'guest' }
    ];

    for (const user of users) {
      const hash = await bcrypt.hash(user.password, 10);
      // Deletes user if it already exists
      await db.query('DELETE FROM users WHERE email = $1', [user.email]);
      // Insert users
      await db.query(
        'INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, $3, $4)',
        [user.email, hash, user.role, 'approved']
      );
      console.log(`User seeded: ${user.email}`);
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  } finally {
    process.exit();
  }
}

seedUsers();
