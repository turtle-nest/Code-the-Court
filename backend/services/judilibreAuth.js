// backend/services/judilibreAuth.js
// Service: obtain OAuth2 access token from Judilibre API (client_credentials flow)

const axios = require('axios');
require('dotenv').config();

const isDev = process.env.NODE_ENV === 'development';

/**
 * Request a new access token from Judilibre (OAuth2 client_credentials).
 * Returns the access_token string if successful.
 */
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
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10_000,
      }
    );

    const accessToken = response.data?.access_token;
    const expiresIn = response.data?.expires_in;

    if (isDev) {
      console.debug('✅ [judilibreAuth] OAuth token acquired');
      console.debug(`🔑 Valid for ~${expiresIn} seconds`);
      // ⚠️ Token displayed only in dev mode for debugging
      console.debug(accessToken);
    }

    return accessToken;
  } catch (error) {
    const status = error.response?.status || 'no-status';
    const data = error.response?.data || error.message;

    if (isDev) {
      console.error(`❌ [judilibreAuth] Failed (status: ${status}):`, data);
    }

    throw new Error('Failed to authenticate with Judilibre API');
  }
}

module.exports = { getJudilibreAccessToken };
