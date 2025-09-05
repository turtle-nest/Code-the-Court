// backend/controllers/archivesController.js
// All code & comments in English (project rule).
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const ApiError = require('../utils/apiError');

const uploadsRoot = path.resolve(process.cwd(), 'uploads');

/**
 * Build stable URLs for inline preview and forced download.
 */
function buildArchiveUrls(archiveId) {
  const base = `/api/archives/${archiveId}/file`;
  return {
    is_pdf: true,
    file_url: base,                   // for <iframe> inline preview
    download_url: `${base}?download=1`, // for the "Download" button
  };
}

/**
 * POST /api/archives
 * Creates an archive + a mirror decision (source='archive') in a single transaction.
 * Requires: auth, multer upload.single('pdf')
 */
const createArchive = async (req, res, next) => {
  const client = await db.connect();
  try {
    const { title, content, date, jurisdiction, case_type, location } = req.body;
    const file = req.file;

    if (!req.user?.id) return next(new ApiError('User authentication required', 401));
    const user_id = req.user.id;

    if (!title) return next(new ApiError('Title is required', 400));
    if (!file) return next(new ApiError('PDF file is required (field name: "pdf")', 400));

    // Normalize and constrain file path under uploads/
    const absoluteFilePath = path.resolve(file.path);
    if (!absoluteFilePath.startsWith(uploadsRoot)) {
      return next(new ApiError('Invalid upload location', 400));
    }
    const relativePath = path.relative(uploadsRoot, absoluteFilePath); // ex: "archives/2025-09-05_abc.pdf"

    await client.query('BEGIN');

    // 1) Insert archive
    const insArchive = `
      INSERT INTO archives (title, content, date, jurisdiction, case_type, location, user_id, file_path)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, title, content, date, jurisdiction, case_type, location, user_id, created_at, file_path
    `;
    const { rows: aRows } = await client.query(insArchive, [
      title,
      content || null,
      date || null,
      jurisdiction || null,
      case_type || null,
      location || null,
      user_id,
      relativePath,
    ]);
    const archive = aRows[0];

    // 2) Insert mirror decision (so it appears in search/list)
    const insDecision = `
      INSERT INTO decisions (title, content, date, jurisdiction, case_type, source, public, archive_id)
      VALUES ($1,$2,$3,$4,$5,'archive', TRUE, $6)
      RETURNING id, title, content, date, jurisdiction, case_type, source, public, archive_id, imported_at
    `;
    const { rows: dRows } = await client.query(insDecision, [
      archive.title,
      archive.content,
      archive.date,
      archive.jurisdiction,
      archive.case_type,
      archive.id,
    ]);
    const decision = dRows[0];

    await client.query('COMMIT');

    // 3) Enrich decision with PDF URLs for immediate front usage
    const urls = buildArchiveUrls(archive.id);
    res.status(201).json({
      ...decision,
      ...urls, // -> { is_pdf, file_url, download_url }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating archive/decision:', err);
    next(new ApiError('Failed to create archive/decision', 500));
  } finally {
    client.release();
  }
};

/**
 * GET /api/archives
 * Simple listing if needed.
 */
const getAllArchives = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT id, title, date, jurisdiction, case_type, location, created_at, file_path
      FROM archives
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching archives:', err);
    next(new ApiError('Failed to fetch archives', 500));
  }
};

/**
 * GET /api/archives/:id
 * Returns archive metadata + URLs for preview/download.
 */
const getArchiveMeta = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `SELECT id, title, content, date, jurisdiction, case_type, location, user_id, created_at, file_path
       FROM archives
       WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return next(new ApiError('Archive not found', 404));

    const a = rows[0];

    // Check file existence safely under uploads/
    const safeRel = (a.file_path || '').replace(/^[/\\]+/, '');
    const abs = path.resolve(uploadsRoot, safeRel);
    const exists =
      a.file_path &&
      ((abs + path.sep).startsWith(uploadsRoot + path.sep) || abs === uploadsRoot) &&
      fs.existsSync(abs);

    const urls = exists
      ? buildArchiveUrls(a.id)
      : { is_pdf: false, file_url: null, download_url: null };

    res.json({ ...a, source: 'archive', ...urls });
  } catch (e) {
    console.error('❌ Error fetching archive meta:', e);
    next(new ApiError('Failed to fetch archive', 500));
  }
};

/**
 * GET /api/archives/:id/file
 * Streams the PDF inline or forces download with ?download=1
 */
const getArchiveFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows } = await db.query(
      `SELECT file_path, title FROM archives WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) {
      return next(new ApiError('Archive not found', 404));
    }

    const rel = rows[0].file_path;
    const title = rows[0].title || 'archive';

    if (!rel || typeof rel !== 'string' || !rel.trim()) {
      return next(new ApiError('No file associated with this archive', 404));
    }

    const safeRel = rel.replace(/^[/\\]+/, '');
    const abs = path.resolve(uploadsRoot, safeRel);

    // prevent path traversal outside uploadsRoot
    if (!((abs + path.sep).startsWith(uploadsRoot + path.sep) || abs === uploadsRoot)) {
      return next(new ApiError('Invalid file path', 400));
    }

    if (!fs.existsSync(abs)) {
      return next(new ApiError('File not found on disk', 404));
    }

    const forceDownload = String(req.query.download || '') === '1';
    res.setHeader('Content-Type', 'application/pdf');
    if (forceDownload) {
      const safeName = title.replace(/[^\w\-]+/g, '_');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
    } else {
      res.setHeader('Content-Disposition', 'inline');
    }

    const stream = fs.createReadStream(abs);
    stream.on('error', (e) => {
      console.error('Stream error:', e);
      return next(new ApiError('Error while reading file', 500));
    });
    stream.pipe(res);
  } catch (err) {
    console.error('❌ getArchiveFile failed:', err);
    return next(new ApiError('Failed to send file', 500));
  }
};

module.exports = {
  createArchive,
  getAllArchives,
  getArchiveMeta,
  getArchiveFile,
};
