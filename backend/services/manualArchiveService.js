// services/manualArchiveService.js

const db = require('../config/db'); // adjust path if needed

/**
 * Insert a new scanned archive into the archives table.
 * @param {Object} archiveData - Archive data with file_path and metadata.
 * @param {string} archiveData.title - Title of the archive.
 * @param {string} archiveData.content - Content or summary.
 * @param {string} archiveData.date - Date of the document.
 * @param {string} archiveData.jurisdiction - Jurisdiction info.
 * @param {string} archiveData.location - Physical location or storage.
 * @param {string} archiveData.file_path - Path to the uploaded PDF.
 * @param {string} archiveData.user_id - ID of the user uploading the archive.
 * @returns {Promise<Object>} Inserted archive row.
 */
async function createManualArchive(archiveData) {
  const {
    title,
    content,
    date,
    jurisdiction,
    location,
    file_path,
    user_id,
  } = archiveData;

  const insertQuery = `
    INSERT INTO archives 
      (title, content, date, jurisdiction, location, file_path, user_id)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    title,
    content,
    date,
    jurisdiction,
    location,
    file_path,
    user_id,
  ];

  const { rows } = await db.query(insertQuery, values);

  console.log('[✅] New manual archive inserted:', rows[0]);
  return rows[0];
}

module.exports = {
  createManualArchive,
};
