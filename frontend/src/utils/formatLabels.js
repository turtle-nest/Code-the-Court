// src/utils/formatLabels.js
/**
 * Format raw jurisdiction to a user-friendly label.
 * E.g. 'cc' → 'Cour de cassation'
 */
export function readableJurisdiction(jurisdiction) {
  if (!jurisdiction) return '—';
  const clean = jurisdiction.trim().toLowerCase();
  switch (clean) {
    case 'cc':
      return 'Cour de cassation';
    default:
      return jurisdiction;
  }
}

/**
 * Format raw case type to a user-friendly label.
 * E.g. 'other' → 'Autre'
 */
export function readableCaseType(caseType) {
  if (!caseType) return '—';
  const clean = caseType.trim().toLowerCase();
  switch (clean) {
    case 'other':
      return 'Autre';
    default:
      return caseType;
  }
}

/**
 * Format decision title for display.
 * If your DB `title` is too long, recompose a short version here.
 */
export function formatDecisionTitle(decision) {
  if (!decision) return 'Sans titre';

  const parts = [];

  // Priorité : Pourvoi n°
  if (decision.number) parts.push(`Pourvoi n° ${decision.number}`);

  // Solution (ex: rejet, cassation)
  if (decision.solution) parts.push(`Solution : ${decision.solution}`);

  // ECLI pour référence
  if (decision.ecli) parts.push(`ECLI: ${decision.ecli}`);

  // Fallback si tout est vide
  if (parts.length === 0 && decision.title) {
    return decision.title.trim();
  }

  return parts.join(' - ').trim() || 'Sans titre';
}
