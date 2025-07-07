// backend/controllers/statsController.js
const db = require('../config/db');

const getUserStats = async (req, res, next) => {
  try {
    const { rows: decisions } = await db.query('SELECT COUNT(*) FROM decisions');
    const { rows: archives } = await db.query('SELECT COUNT(*) FROM archives');

    // Exemple de requête pour dernier import (si tu as une table d'historique)
    const { rows: lastImport } = await db.query(
      'SELECT COUNT(*) as count, MAX(date) as date FROM decisions'
    );

    res.json({
      decisions_count: parseInt(decisions[0].count, 10),
      archives_count: parseInt(archives[0].count, 10),
      lastImportCount: parseInt(lastImport[0].count, 10) || 0,
      lastImportDate: lastImport[0].date || null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserStats };
