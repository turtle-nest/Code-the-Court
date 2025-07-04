// backend/controllers/archivesController.js

const db = require('../config/db');
const ApiError = require('../utils/apiError');

const createArchive = async (req, res, next) => {
  const { title, content, date, jurisdiction, location } = req.body;
  const file = req.file;

  // ✅ 1️⃣ Vérifie que req.user existe
  if (!req.user || !req.user.id) {
    return next(new ApiError('User authentication required to create an archive.', 401));
  }

  const user_id = req.user.id;

  // ✅ 2️⃣ Vérifie que l'utilisateur existe vraiment
  const { rows: userRows } = await db.query(
    `SELECT id FROM users WHERE id = $1`,
    [user_id]
  );
  if (userRows.length === 0) {
    return next(new ApiError(`User ID ${user_id} not found in users table.`, 400));
  }

  // ✅ 3️⃣ Vérifie les champs requis
  if (!title || !file) {
    return next(new ApiError('title and file are required', 400));
  }

  try {
    // 📂 Insert dans ARCHIVES
    const archiveResult = await db.query(
      `
      INSERT INTO archives (title, content, date, jurisdiction, location, user_id, file_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [title, content, date, jurisdiction, location, user_id, file.path]
    );

    const archive = archiveResult.rows[0];

    // 📄 Insert aussi dans DECISIONS (source = 'archive')
    await db.query(
      `
      INSERT INTO decisions (title, content, date, jurisdiction, source)
      VALUES ($1, $2, $3, $4, 'archive');
      `,
      [archive.title, archive.content, archive.date, archive.jurisdiction]
    );

    res.status(201).json({
      message: '✅ Archive créée et ajoutée aux décisions.',
      archive_id: archive.id
    });

  } catch (error) {
    console.error('❌ Error creating archive:', error);
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
  getAllArchives,
};
