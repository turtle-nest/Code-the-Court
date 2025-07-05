// ✅ src/services/decisions.js

import { apiFetch } from '../utils/apiFetch';

export async function getAllDecisions(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/decisions${query ? `?${query}` : ''}`);
}

export async function getDecisionStats() {
  return apiFetch('/api/decisions/stats');
}

export const importFromJudilibre = async (payload) => {
  return await apiFetch('/api/decisions/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
};

export async function updateDecisionKeywords(id, keywords) {
  return apiFetch(`/api/decisions/${id}/keywords`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ keywords }),
  });
};
