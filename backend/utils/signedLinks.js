// backend/utils/signedLinks.js

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_change_me';

// Create a short-lived signed link token
function signArchiveLink(archiveId, mode) {
  // mode: 'file' | 'download'
  return jwt.sign(
    { aid: String(archiveId), mode, purpose: 'archive-link' },
    JWT_SECRET,
    { expiresIn: '5m' } // adjust if needed
  );
}

// Verify token and return payload or null
function verifyArchiveLink(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { signArchiveLink, verifyArchiveLink };
