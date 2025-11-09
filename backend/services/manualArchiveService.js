// backend/services/manualArchiveService.js
// Service: insert manually scanned archives (PDFs + metadata) into the database

const db = require('../config/db');
const ApiError = require('../utils/apiError');

const isDev = process.env.NODE_ENV === 'development';

/**
 * Insert a new scanned archive into the archives table.
 * @param {Object} archiveData - Archive data with file_path and metadata.
 * @param {string} archiveData.title - Title of the archive.
 * @param {string} [archiveData.content] - Content or summary.
 * @param {string} [archiveData.date] - Date of the document (ISO format).
 * @param {string} [archiveData.jurisdiction] - Jurisdiction info.
 * @param {string} [archiveData.location] - Physical location or storage.
 * @param {string} archiveData.file_path - Path to the uploaded PDF.
 * @param {string} archiveData.user_id - ID of the user uploading the archive.
 * @returns {Promise<Object>} The inserted archive record.
 * @throws {ApiError} if insertion fails or required fields are missing.
 */
async function createManualArchive(archiveData) {
  try {
    const {
      title,
      content,
      date,
      jurisdiction,
      location,
      file_path,
      user_id,
    } = archiveData;

    if (!title || !file_path || !user_id) {
      throw new ApiError('Missing required fields (title, file_path, user_id)', 400);
    }

    const insertQuery = `
      INSERT INTO archives 
        (title, content, date, jurisdiction, location, file_path, user_id)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      title,
      content || null,
      date || null,
      jurisdiction || null,
      location || null,
      file_path,
      user_id,
    ];

    const { rows } = await db.query(insertQuery, values);
    const archive = rows[0];

    if (isDev) console.debug('[manualArchive] ✅ New archive inserted:', archive.id);

    return archive;
  } catch (err) {
    if (isDev) console.error('[manualArchive] ❌ Insert failed:', err.message || err);
    throw new ApiError('Failed to create manual archive', 500);
  }
}

module.exports = { createManualArchive };
