// controllers/decisionsController.js
const db = require('../config/db');
const ApiError = require('../utils/apiError');

const getAllDecisions = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM decisions ORDER BY date DESC LIMIT 20');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching decisions:', error);
    next(new ApiError('Internal server error', 500));
  }
};

module.exports = {
  getAllDecisions,
};
