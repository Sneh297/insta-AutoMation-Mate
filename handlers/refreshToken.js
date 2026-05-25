const axios = require('axios');
const { getTokenData, saveToken } = require('./tokenStore');

const BASE_URL = process.env.BASE_URL;
const REFRESH_THRESHOLD_DAYS = 7;
const REFRESH_THRESHOLD_MS = REFRESH_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

async function refreshToken() {
  const tokenData = getTokenData();
  const timeLeftMs = (tokenData.expires_at || 0) - Date.now();
  const daysLeft = Math.round(timeLeftMs / (24 * 60 * 60 * 1000));

  if (timeLeftMs > REFRESH_THRESHOLD_MS) {
    console.log(`Token still valid for ${daysLeft} days — skipping refresh`);
    return { ok: true, skipped: true, daysLeft };
  }

  try {
    console.log(`Token expires in ${daysLeft} days — refreshing...`);
    const response = await axios.get(`${BASE_URL}/refresh_access_token`, {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: tokenData.access_token,
      },
    });

    const { access_token, expires_in } = response.data;
    saveToken(access_token, expires_in);

    console.log(`Token refreshed. New expiry: ${Math.round(expires_in / 86400)} days.`);
    return { ok: true, access_token, expires_in };
  } catch (err) {
    console.error('refreshToken failed:', err.response?.data || err.message);
    return { ok: false, error: err.response?.data || err.message };
  }
}

module.exports = refreshToken;