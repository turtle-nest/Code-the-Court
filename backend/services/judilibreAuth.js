// services/judilibreAuth.js
const axios = require('axios');
require('dotenv').config();

async function getJudilibreAccessToken() {
  const response = await axios.post(
    process.env.JUDILIBRE_OAUTH_URL,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.JUDILIBRE_CLIENT_ID,
      client_secret: process.env.JUDILIBRE_CLIENT_SECRET,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data.access_token;
}

module.exports = { getJudilibreAccessToken };
