// backend/utils/signedLinks.js
// Utility: create and verify short-lived signed JWT links for secure file access

const jwt = require('jsonwebtoken');

const isDev = process.env.NODE_ENV === 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_secret_change_me';

/**
 * Create a short-lived signed link token for archive access.
 * @param {string|number} archiveId - The archive ID to include in the token.
 * @param {'file'|'download'} mode - The access mode.
 * @returns {string} Signed JWT token (valid for 5 minutes by default).
 */
function signArchiveLink(archiveId, mode = 'file') {
  if (!archiveId) throw new Error('Missing archiveId for signed link');

  const payload = { aid: String(archiveId), mode, purpose: 'archive-link' };
  const options = { expiresIn: '5m' };

  const token = jwt.sign(payload, JWT_SECRET, options);

  if (isDev) {
    console.debug(`[signedLinks] Created ${mode} link for archive ${archiveId} (expires in 5m)`);
  }

  return token;
}

/**
 * Verify a signed archive token.
 * @param {string} token - JWT token to verify.
 * @returns {object|null} Decoded payload if valid, null if invalid or expired.
 */
function verifyArchiveLink(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    if (isDev) console.warn('[signedLinks] Invalid or expired token:', err.message);
    return null;
  }
}

module.exports = { signArchiveLink, verifyArchiveLink };
