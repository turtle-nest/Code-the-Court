// backend/middlewares/validateInput.js

const { body, query, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * ✅ Registration validation
 */
const validateRegistration = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 chars long'),
  (req, res, next) => handleValidation(req, res, next),
];

/**
 * ✅ Approve user validation
 */
const validateApproveUser = [
  body('userId').isUUID().withMessage('Invalid user ID'),
  body('role').isIn(['user', 'admin']).withMessage('Invalid role'),
  (req, res, next) => handleValidation(req, res, next),
];

/**
 * ✅ Create archive validation
 */
const validateCreateArchive = [
  body('title')
    .isLength({ min: 1 })
    .withMessage('Title is required'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO format'),
  body('jurisdiction')
    .optional()
    .isString()
    .trim()
    .escape(),
  body('location')
    .optional()
    .isString()
    .trim()
    .escape(),
  (req, res, next) => handleValidation(req, res, next),
];

/**
 * ✅ Create note validation
 */
const validateCreateNote = [
  body('target_id').isUUID().withMessage('Invalid target ID'),
  body('target_type').isString().isLength({ min: 1 }),
  body('content')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Content required'),
  (req, res, next) => handleValidation(req, res, next),
];

/**
 * ✅ GET /api/decisions query params validation (pagination + tri)
 */
const validateDecisionsQuery = [
  // Filtres existants
  query('date').optional().isISO8601().withMessage('Date must be in ISO format'),
  query('juridiction').optional().isString().trim().escape(),
  query('type_affaire').optional().isString().trim().escape(),
  query('keyword').optional().isString().trim().escape(),
  query('source').optional(),

  // Pagination
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer (max 100)'),

  // Tri
  query('sortBy')
    .optional()
    .isIn(['date', 'jurisdiction', 'case_type'])
    .withMessage('Invalid sortBy field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc', 'ASC', 'DESC'])
    .withMessage('Order must be "asc" or "desc"'),

  (req, res, next) => handleValidation(req, res, next),
];

/**
 * ✅ Gestion centralisée des erreurs express-validator
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(errors.array()[0].msg, 400));
  }
  next();
}

module.exports = {
  validateRegistration,
  validateApproveUser,
  validateCreateArchive,
  validateCreateNote,
  validateDecisionsQuery,
};
