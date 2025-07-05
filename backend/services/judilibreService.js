// services/judilibreService.js
const axios = require('axios');
const { getJudilibreAccessToken } = require('./judilibreAuth');

async function fetchDecisionsFromJudilibre({
  dateDecisionMin,
  dateDecisionMax,
  jurisdiction,
  caseType,
  query = '',
  page = 1
}) {
  const accessToken = await getJudilibreAccessToken();

  let queryString = query || '*'; // pour tout si vide
  if (dateDecisionMin && dateDecisionMax) {
    queryString += ` AND decision_date:[${dateDecisionMin} TO ${dateDecisionMax}]`;
  }

  const params = {
    query: queryString.trim(),
    page,
    page_size: 50,
  };

  if (jurisdiction) params.jurisdiction = jurisdiction;
  if (caseType) params.type = caseType;

  console.log('[DEBUG] Params sent to Judilibre:', params);

  try {
    const response = await axios.get(
      `${process.env.JUDILIBRE_API_URL}/search`,
      {
        params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    console.log('[DEBUG] Judilibre raw response:', response.data);

    if (typeof response.data === 'object' && response.data.results) {
      return {
        results: response.data.results,
        total: response.data.total || response.data.results.length,
        timestamp: new Date().toISOString(),
      };
    }

    console.warn('[⚠️] Unexpected Judilibre API structure:', response.data);
    return { results: [], total: 0, timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('❌ Judilibre API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { fetchDecisionsFromJudilibre };
