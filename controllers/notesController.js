// controllers/notesController.js
const db = require('../config/db');

const createNote = async (req, res, next) => {
  const user_id = req.user.id;
  const { target_id, target_type, content } = req.body;

  try {
    // Quand tu es prêt : décommente pour insérer en vrai
    // const result = await db.query(
    //   'INSERT INTO notes (user_id, target_id, target_type, content) VALUES ($1, $2, $3, $4) RETURNING *',
    //   [user_id, target_id, target_type, content]
    // );

    // Pour le MVP tu renvoies juste un fake :
    res.status(201).json({
      message: 'Note created',
      note: {
        user_id,
        target_id,
        target_type,
        content
      }
    });
  } catch (error) {
    console.error('❌ Error creating note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createNote };
