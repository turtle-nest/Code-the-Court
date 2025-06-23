# Database Migrations

This folder contains SQL scripts used to initialize and populate the PostgreSQL database for the Code the Court project.

## 🗂 Files

### `001_init_db.sql`
- Initializes the full database schema.
- Creates tables: `users`, `decisions`, `archives`, `notes`, `tags`, `decision_tags`, and `registration_requests`.
- Adds required indexes and foreign key constraints.
- Includes extension for UUID generation (`pgcrypto`).
- **Run with:**  
  ```bash
  npm run db:init
  ```

### `002_seed_db.sql`
- Seeds the database with initial test data.
- Inserts:
  - A test user (`test@example.com`) with hashed password.
  - Example decisions (sample title and jurisdiction).
- **Run with:**  
  ```bash
  npm run db:seed
  ```

## 🔄 Reset Script

To fully reset and seed your database:

```bash
npm run db:reset
```

This will:
1. Drop the existing database (if any),
2. Recreate it,
3. Run `001_init_db.sql`,
4. Run `002_seed_db.sql`.

---

**Requirements:**  
Ensure `psql` is installed and the PostgreSQL user is configured in `scripts/reset_db.sh`.
