// backend/controllers/adminController.js
// Controller handling admin operations such as user approval

const db = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Approve a user and assign a specific role
 * @route POST /api/admin/approve
 * @param {string} userId - The user ID to update
 * @param {string} role - The new role ("user" or "admin")
 */
const approveUser = async (req, res, next) => {
  const { userId, role } = req.body;

  // Basic validation
  if (!userId || !['user', 'admin'].includes(role)) {
    return next(new ApiError('Invalid user ID or role', 400));
  }

  try {
    const query = `
      UPDATE users
      SET role = $1, status = $2
      WHERE id = $3
      RETURNING id, email, role, status
    `;
    const result = await db.query(query, [role, 'approved', userId]);

    if (result.rows.length === 0) {
      return next(new ApiError('User not found', 404));
    }

    res.status(200).json({
      message: 'User approved successfully',
      user: result.rows[0],
    });
  } catch (err) {
    next(new ApiError('Database error', 500));
  }
};

module.exports = { approveUser };
