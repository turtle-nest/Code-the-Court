// controllers/archivesController.js
const db = require('../config/db');
const ApiError = require('../utils/apiError');

const createArchive = async (req, res, next) => {
  const { title, content, date, jurisdiction, location } = req.body;
  const user_id = req.user.id;
  const file = req.file;

  if (!title || !user_id || !file) {
    return next(new ApiError('title, user_id, and file are required', 400));
  }

  try {
    const result = await db.query(
      `INSERT INTO archives (title, content, date, jurisdiction, location, user_id, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [title, content, date, jurisdiction, location, user_id, file.path]
    );

    res.status(201).json({ archive_id: result.rows[0].id });
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
