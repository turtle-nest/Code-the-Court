#!/bin/bash

DB_NAME="code_the_court"
DB_USER="nicolas"
MIGRATIONS_DIR="../migrations"

echo "🔄 Checking if database '$DB_NAME' exists..."

if psql -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  echo "⚠️  Database '$DB_NAME' already exists. Dropping it..."
  dropdb -U "$DB_USER" "$DB_NAME"
fi

echo "🆕 Creating database '$DB_NAME'..."
createdb -U "$DB_USER" "$DB_NAME"

echo "📥 Running migrations in order..."

psql -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/001_init_db.sql"
psql -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/002_add_enum_user_status.sql"
psql -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/003_seed_data.sql"
psql -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/004_add_imported_at_to_decisions.sql"
psql -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATIONS_DIR/005_mock_decisions.sql"

echo "✅ Database '$DB_NAME' has been initialized successfully."
