// utils/formatTitle.js
export const formatDecisionTitle = (decision) => {
  return decision.label || decision.title || 'Titre non disponible';
};
