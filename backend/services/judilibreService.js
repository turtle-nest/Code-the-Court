// services/judilibreService.js
const axios = require('axios');
const { getJudilibreAccessToken } = require('./judilibreAuth');

async function fetchDecisionsFromJudilibre({
  dateDecisionMin,
  dateDecisionMax,
  jurisdiction,
  caseType,
  page = 1
}) {
  const accessToken = await getJudilibreAccessToken();

  const requestBody = {
    dateDecisionMin,
    dateDecisionMax,
    page
  };

  if (jurisdiction) requestBody.jurisdiction = jurisdiction;
  if (caseType) requestBody.caseType = caseType;

  try {
    const response = await axios.post(
      `${process.env.JUDILIBRE_API_URL}/decision/recherche`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[DEBUG] Judilibre API response:', response.data);

    // ✅ Blindage : Vérifie qu’on reçoit bien un objet avec `results`
    if (Array.isArray(response.data)) {
      return response.data; // cas très rare : API renvoie direct un tableau
    }

    if (typeof response.data === 'object' && response.data.results) {
      return response.data; // structure attendue { total, results: [] }
    }

    console.warn('[⚠️] Judilibre API returned unexpected structure:', response.data);
    return { results: [], total: 0 };
  } catch (error) {
    console.error('❌ Judilibre API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { fetchDecisionsFromJudilibre };
