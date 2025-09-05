// backend/controllers/notesController.js
const db = require('../config/db');
const ApiError = require('../utils/apiError');

/**
 * Normalize and validate target type & id based on a decision:
 * - if decision.source === 'archive' and decision.archive_id is present, we can store notes on the ARCHIVE
 * - otherwise we store on the DECISION
 * 
 * If caller provides target_type/target_id directly, we accept them if valid/owned.
 */
async function deriveTargetFromDecisionId(decisionId) {
  const { rows } = await db.query(
    `SELECT id, source, archive_id FROM decisions WHERE id = $1`,
    [decisionId]
  );
  if (rows.length === 0) {
    throw new ApiError(`Decision ${decisionId} not found`, 404);
  }
  const d = rows[0];
  if (d.source === 'archive' && d.archive_id) {
    return { target_type: 'archive', target_id: d.archive_id };
  }
  return { target_type: 'decision', target_id: d.id };
}

/**
 * GET /api/notes?target_type=decision|archive&target_id=UUID
 * GET /api/decisions/:decisionId/notes
 */
const listNotes = async (req, res, next) => {
  try {
    if (!req.user?.id) return next(new ApiError('Unauthorized', 401));
    const userId = req.user.id;

    let targetType = req.query.target_type;
    let targetId = req.query.target_id;

    // Nested route support: /api/decisions/:decisionId/notes
    if (req.params.decisionId) {
      const inferred = await deriveTargetFromDecisionId(req.params.decisionId);
      targetType = inferred.target_type;
      targetId = inferred.target_id;
    }

    if (!targetType || !targetId) {
      return next(new ApiError('Missing target_type or target_id', 400));
    }

    const { rows } = await db.query(
      `SELECT id, user_id, target_id, target_type, content, created_at
       FROM notes
       WHERE user_id = $1 AND target_type = $2 AND target_id = $3
       ORDER BY created_at DESC`,
      [userId, targetType, targetId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notes        { target_type, target_id, content }
 * POST /api/decisions/:decisionId/notes   { content }
 */
const createNote = async (req, res, next) => {
  try {
    if (!req.user?.id) return next(new ApiError('Unauthorized', 401));
    const userId = req.user.id;

    let { target_type, target_id, content } = req.body;

    if (req.params.decisionId) {
      const inferred = await deriveTargetFromDecisionId(req.params.decisionId);
      target_type = inferred.target_type;
      target_id = inferred.target_id;
    }

    if (!content || !content.trim()) {
      return next(new ApiError('Content is required', 400));
    }
    if (!target_type || !target_id) {
      return next(new ApiError('target_type and target_id are required', 400));
    }

    const { rows } = await db.query(
      `INSERT INTO notes (user_id, target_id, target_type, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, target_id, target_type, content, created_at`,
      [userId, target_id, target_type, content.trim()]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notes/:id   { content }
 */
const updateNote = async (req, res, next) => {
  try {
    if (!req.user?.id) return next(new ApiError('Unauthorized', 401));
    const userId = req.user.id;
    const noteId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return next(new ApiError('Content is required', 400));
    }

    const { rows } = await db.query(
      `UPDATE notes
       SET content = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, user_id, target_id, target_type, content, created_at`,
      [content.trim(), noteId, userId]
    );
    if (rows.length === 0) {
      return next(new ApiError('Note not found or not owned by user', 404));
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notes/:id
 */
const deleteNote = async (req, res, next) => {
  try {
    if (!req.user?.id) return next(new ApiError('Unauthorized', 401));
    const userId = req.user.id;
    const noteId = req.params.id;

    const { rowCount } = await db.query(
      `DELETE FROM notes WHERE id = $1 AND user_id = $2`,
      [noteId, userId]
    );
    if (rowCount === 0) {
      return next(new ApiError('Note not found or not owned by user', 404));
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listNotes,
  createNote,
  updateNote,
  deleteNote
};
