// backend/middlewares/validateInput.js
// Input validation middlewares (express-validator). Code & comments in English.

const { body, query, param, validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const isDev = process.env.NODE_ENV === 'development';

/**
 * Centralized express-validator error handling
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Keep first error for a concise API (consistent with ApiError usage elsewhere)
    const first = errors.array()[0];
    if (isDev) {
      console.warn('[validateInput] validation failed:', first, 'all:', errors.array());
    }
    return next(new ApiError(first.msg, 400));
  }
  return next();
}

/**
 * Factory: validate a route param is a UUID (e.g., :id, :decisionId)
 */
const validateUUIDParam = (name = 'id') => [
  param(name).isUUID().withMessage(`Invalid ${name} format`),
  (req, res, next) => handleValidation(req, res, next),
];

/**
 * Registration validation
 */
const validateRegistration = [
  body('email').isEmail().withMessage('Invalid email address').bail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 chars long'),
  body('username').optional().isString().trim().escape(),
  body('institution').optional().isString().trim().escape(),
  (req, res, next) => handleValidation(req, res, next),
];

/**
 * Approve user validation
 */
const validateApproveUser = [
  body('userId').isUUID().withMessage('Invalid user ID'),
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Invalid role'),
  (req, res, next) => handleValidation(req, res, next),
];

/**
 * Create archive validation
 */
const validateCreateArchive = [
  body('title').isLength({ min: 1 }).withMessage('Title is required').trim().escape(),
  body('content').optional().isString().trim(),
  body('date').optional().isISO8601().withMessage('Date must be in ISO format'),
  body('jurisdiction').optional().isString().trim().escape(),
  body('case_type').optional().isString().trim().escape(),
  body('location').optional().isString().trim().escape(),
  (req, res, next) => handleValidation(req, res, next),
];

/**
 * Create note validation
 */
const validateCreateNote = [
  body('target_id').isUUID().withMessage('Invalid target ID'),
  body('target_type')
    .isIn(['decision', 'archive'])
    .withMessage('Invalid target_type (expected "decision" or "archive")'),
  body('content')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content required'),
  (req, res, next) => handleValidation(req, res, next),
];

/**
 * GET /api/decisions query validation (filters + pagination + sort)
 * Accept aliases used by the frontend: juridiction/jurisdiction, type_affaire/case_type, keyword/keywords, start_date/startDate, end_date/endDate.
 */
const validateDecisionsQuery = [
  // Date filters
  query('date').optional().isISO8601().withMessage('Date must be in ISO format'),
  query('start_date').optional().isISO8601().withMessage('start_date must be ISO date'),
  query('startDate').optional().isISO8601().withMessage('startDate must be ISO date'),
  query('end_date').optional().isISO8601().withMessage('end_date must be ISO date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be ISO date'),

  // Text filters (with aliases)
  query('jurisdiction').optional().isString().trim().escape(),
  query('juridiction').optional().isString().trim().escape(), // alias
  query('case_type').optional().isString().trim().escape(),
  query('type_affaire').optional().isString().trim().escape(), // alias
  query('keyword').optional().isString().trim().escape(),
  query('keywords').optional().isString().trim(), // comma-separated allowed
  query('source').optional().isString().trim(),   // comma-separated allowed

  // Pagination
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer (max 100)'),

  // Sorting
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

module.exports = {
  handleValidation,
  validateUUIDParam,
  validateRegistration,
  validateApproveUser,
  validateCreateArchive,
  validateCreateNote,
  validateDecisionsQuery,
};
