// src/services/decisions.js
import { apiFetch } from '../utils/apiFetch';

export async function getAllDecisions(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/decisions${query ? `?${query}` : ''}`);
}

export async function getDecisionStats() {
  return apiFetch('/api/decisions/stats');
}

export async function importFromJudilibre() {
  return apiFetch('/api/decisions/import');
}
