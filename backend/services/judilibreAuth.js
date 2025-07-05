// services/judilibreAuth.js

const axios = require('axios');
require('dotenv').config();

async function getJudilibreAccessToken() {
  try {
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

    const accessToken = response.data.access_token;

    console.log('✅ [DEBUG] Judilibre OAuth token acquired:');
    console.log(accessToken); // ➜ copie ce token pour tes requêtes curl directes
    console.log(`🔑 Valid for ~${response.data.expires_in} seconds`);

    return accessToken;

  } catch (error) {
    console.error('❌ Failed to get Judilibre access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Judilibre API');
  }
}

module.exports = { getJudilibreAccessToken };
