// controllers/decisionsController.js
const db = require('../config/db');

const getAllDecisions = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM decisions ORDER BY date DESC LIMIT 20');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching decisions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllDecisions,
};
