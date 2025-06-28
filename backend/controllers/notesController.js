const db = require('../config/db');
const ApiError = require('../utils/apiError');

const createNote = async (req, res, next) => {
  const user_id = req.user.id;
  const { target_id, target_type, content } = req.body;

  try {
    // Exemple fictif pour le MVP
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
    next(new ApiError('Internal server error', 500));
  }
};

module.exports = { createNote };
