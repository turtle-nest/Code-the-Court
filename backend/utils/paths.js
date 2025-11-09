// backend/utils/paths.js
// Utility: centralized project paths (Docker-safe)

const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

// Absolute path to the uploads directory
const uploadsRoot = path.resolve(process.cwd(), 'uploads');

// Ensure the uploads directory exists (important in Docker or clean installs)
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
  if (isDev) console.debug('[paths] 📂 Created uploads/ directory at', uploadsRoot);
}

module.exports = { uploadsRoot };
