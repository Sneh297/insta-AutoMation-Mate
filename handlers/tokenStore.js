// handlers/tokenStore.js
const fs = require('fs');
const path = require('path');

const TOKEN_FILE = path.resolve(__dirname, '..', 'data', 'tokens.json');

function getToken() {
  try {
    const data = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    return data.access_token;
  } catch {
    return process.env.ACCESS_TOKEN; // bootstrap from .env on first run
  }
}

function saveToken(access_token, expires_in) {
  const dir = path.dirname(TOKEN_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const data = {
    access_token,
    expires_at: Date.now() + expires_in * 1000,
    refreshed_at: new Date().toISOString(),
  };
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(data, null, 2));
  return data;
}
// handlers/tokenStore.js
function getTokenData() {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
  } catch {
    return {
      access_token: process.env.ACCESS_TOKEN,
      expires_at: 0,            // 0 = "unknown, treat as expired so it refreshes ASAP"
    };
  }
}

module.exports = { getToken, getTokenData, saveToken };
