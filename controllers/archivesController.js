// controllers/archivesController.js
const db = require('../config/db');

const createArchive = async (req, res) => {
  const { title, content, date, jurisdiction, location, user_id } = req.body;
  const file = req.file;

  if (!title || !user_id || !file) {
    return res.status(400).json({ error: 'title, user_id, and file are required' });
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
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createArchive,
};
