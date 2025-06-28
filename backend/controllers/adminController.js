const db = require('../config/db');
const ApiError = require('../utils/apiError');

const approveUser = async (req, res, next) => {
  const { userId, role } = req.body;

  if (!userId || !['user', 'admin'].includes(role)) {
    return next(new ApiError('ID utilisateur ou rôle non valide', 400));
  }

  try {
    const result = await db.query(
      'UPDATE users SET role = $1, status = $2 WHERE id = $3 RETURNING id, email, role, status',
      [role, 'approved', userId]
    );

    if (result.rows.length === 0) {
      return next(new ApiError('Utilisateur non trouvé', 404));
    }

    res.status(200).json({ message: 'Utilisateur approuvé', user: result.rows[0] });
  } catch (err) {
    next(new ApiError('Erreur de base de données', 500));
  }
};

module.exports = { approveUser };
