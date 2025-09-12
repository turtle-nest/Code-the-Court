// utils/paths.js
// Centralized project paths (Docker-safe)
const path = require('path');

const uploadsRoot = path.resolve(process.cwd(), 'uploads');

module.exports = {
  uploadsRoot,
};
