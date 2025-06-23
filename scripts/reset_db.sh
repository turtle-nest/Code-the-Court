#!/bin/bash

# Script to create the PostgreSQL database and initialize it using a SQL schema file
# Requires psql installed and access to a PostgreSQL user

DB_NAME="code_the_court"
SQL_FILE="migrations/001_init_db.sql"
DB_USER="postgres"

echo "🔄 Checking if database '$DB_NAME' exists..."

# Check if the database already exists
if psql -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1; then
  echo "⚠️  Database '$DB_NAME' already exists."
else
  echo "🆕 Creating database '$DB_NAME'..."
  createdb -U "$DB_USER" "$DB_NAME"
fi

echo "📥 Running schema file '$SQL_FILE'..."
# Execute the schema SQL file to initialize tables and structure
psql -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"

echo "✅ Database '$DB_NAME' has been initialized successfully."
