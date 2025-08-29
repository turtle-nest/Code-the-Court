// backend/controllers/archivesController.js

const path = require('path');
const db = require('../config/db');
const ApiError = require('../utils/apiError');

const createArchive = async (req, res, next) => {
  const { title, content, date, jurisdiction, location } = req.body;
  const file = req.file;

  if (!req.user || !req.user.id) {
    return next(new ApiError('User authentication required to create an archive.', 401));
  }

  const user_id = req.user.id;

  const { rows: userRows } = await db.query(
    `SELECT id FROM users WHERE id = $1`,
    [user_id]
  );
  if (userRows.length === 0) {
    return next(new ApiError(`User ID ${user_id} not found in users table.`, 400));
  }

  if (!title || !file) {
    return next(new ApiError('Title and PDF file are required', 400));
  }

  try {
    const pdfPublicUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/${file.path}`;

    // ✅ 1) Crée l'archive
    const archiveResult = await db.query(
      `
    INSERT INTO archives (title, content, date, jurisdiction, location, user_id, file_path)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `,
      [title, content, date, jurisdiction, location, user_id, file.path]
    );

    const archive = archiveResult.rows[0];

    console.log(`✅ New archive created: ${archive.id}`);

    // ✅ 2) Crée la décision associée avec l'archive_id
    const decisionResult = await db.query(
      `
    INSERT INTO decisions (title, content, date, jurisdiction, case_type, source, archive_id)
    VALUES ($1, $2, $3, $4, $5, 'archive', $6)
    RETURNING id;
    `,
      [title, content, date, jurisdiction, caseType || null, archive.id]
    );

    const decision = decisionResult.rows[0];
    console.log(`✅ New decision linked: ${decision.id}`);

    res.status(201).json({
      message: '✅ Archive créée.',
      archive_id: archive.id,
      pdf_link: pdfPublicUrl,
      decision_id: decision.id,
    });

  } catch (error) {
    console.error('❌ Error creating archive & decision:', error);
    next(new ApiError('Internal server error', 500));
  }
};

const getAllArchives = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        a.id, a.title, a.content, a.date, a.jurisdiction, a.location, a.file_path,
        u.email AS user_email
      FROM archives a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching archives:', err);
    next(new ApiError('Failed to fetch archives', 500));
  }
};

module.exports = {
  createArchive,
  getAllArchives
};
