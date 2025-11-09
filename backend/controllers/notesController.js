// backend/controllers/notesController.js
// Controller: user notes on decisions/archives (all code & comments in English)

const db = require('../config/db');
const ApiError = require('../utils/apiError');

const isDev = process.env.NODE_ENV === 'development';
const UUID_RE = /^[0-9a-fA-F-]{36}$/;

/**
 * Given a decision UUID, decide whether notes attach to the decision or its archive.
 * - If source === 'archive' and archive_id exists => attach to ARCHIVE
 * - Otherwise => attach to DECISION
 */
async function deriveTargetFromDecisionId(decisionId) {
  const { rows } = await db.query(
    `SELECT id, source, archive_id FROM decisions WHERE id = $1::uuid`,
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

    // Nested route: /api/decisions/:decisionId/notes
    if (req.params.decisionId) {
      const decisionId = req.params.decisionId;
      if (!UUID_RE.test(decisionId)) {
        return next(new ApiError('Invalid decisionId format', 400));
      }
      const inferred = await deriveTargetFromDecisionId(decisionId);
      targetType = inferred.target_type;
      targetId = inferred.target_id;
    }

    if (!targetType || !targetId) {
      return next(new ApiError('Missing target_type or target_id', 400));
    }
    if (!['decision', 'archive'].includes(String(targetType))) {
      return next(new ApiError('Invalid target_type (expected "decision" or "archive")', 400));
    }
    if (!UUID_RE.test(String(targetId))) {
      return next(new ApiError('Invalid target_id format', 400));
    }

    const { rows } = await db.query(
      `SELECT id, user_id, target_id, target_type, content, created_at
       FROM notes
       WHERE user_id = $1 AND target_type = $2 AND target_id = $3::uuid
       ORDER BY created_at DESC`,
      [userId, targetType, targetId]
    );

    return res.status(200).json(rows);
  } catch (err) {
    if (isDev) console.error('[notes] listNotes error:', err);
    return next(new ApiError('Failed to list notes', 500));
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

    let { target_type, target_id, content } = req.body || {};

    // Nested route infers target from decision
    if (req.params.decisionId) {
      const decisionId = req.params.decisionId;
      if (!UUID_RE.test(decisionId)) {
        return next(new ApiError('Invalid decisionId format', 400));
      }
      const inferred = await deriveTargetFromDecisionId(decisionId);
      target_type = inferred.target_type;
      target_id = inferred.target_id;
    }

    if (!content || !String(content).trim()) {
      return next(new ApiError('Content is required', 400));
    }
    if (!target_type || !target_id) {
      return next(new ApiError('target_type and target_id are required', 400));
    }
    if (!['decision', 'archive'].includes(String(target_type))) {
      return next(new ApiError('Invalid target_type (expected "decision" or "archive")', 400));
    }
    if (!UUID_RE.test(String(target_id))) {
      return next(new ApiError('Invalid target_id format', 400));
    }

    const { rows } = await db.query(
      `INSERT INTO notes (user_id, target_id, target_type, content)
       VALUES ($1, $2::uuid, $3, $4)
       RETURNING id, user_id, target_id, target_type, content, created_at`,
      [userId, target_id, target_type, String(content).trim()]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    if (isDev) console.error('[notes] createNote error:', err);
    return next(new ApiError('Failed to create note', 500));
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
    const { content } = req.body || {};

    if (!UUID_RE.test(String(noteId))) {
      return next(new ApiError('Invalid note id format', 400));
    }
    if (!content || !String(content).trim()) {
      return next(new ApiError('Content is required', 400));
    }

    const { rows } = await db.query(
      `UPDATE notes
       SET content = $1
       WHERE id = $2::uuid AND user_id = $3
       RETURNING id, user_id, target_id, target_type, content, created_at`,
      [String(content).trim(), noteId, userId]
    );

    if (rows.length === 0) {
      return next(new ApiError('Note not found or not owned by user', 404));
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    if (isDev) console.error('[notes] updateNote error:', err);
    return next(new ApiError('Failed to update note', 500));
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

    if (!UUID_RE.test(String(noteId))) {
      return next(new ApiError('Invalid note id format', 400));
    }

    const { rowCount } = await db.query(
      `DELETE FROM notes WHERE id = $1::uuid AND user_id = $2`,
      [noteId, userId]
    );

    if (rowCount === 0) {
      return next(new ApiError('Note not found or not owned by user', 404));
    }

    return res.status(204).send();
  } catch (err) {
    if (isDev) console.error('[notes] deleteNote error:', err);
    return next(new ApiError('Failed to delete note', 500));
  }
};

module.exports = {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
};
