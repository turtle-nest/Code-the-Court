// services/judilibreService.js
const axios = require('axios');
const { getJudilibreAccessToken } = require('./judilibreAuth');

async function fetchDecisionsFromJudilibre({ q = '', dateDecisionMin, dateDecisionMax, page = 1 }) {
  const accessToken = await getJudilibreAccessToken();

  const requestBody = {
    motsCles: q,
    dateDecisionMin,
    dateDecisionMax,
    page
  };

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

    return response.data;
  } catch (error) {
    console.error('❌ Judilibre API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { fetchDecisionsFromJudilibre };
