const axios = require('axios');
const { getToken } = require('./tokenStore');

const BASE_URL = process.env.BASE_URL;

async function isFollower(userId) {
  if (!userId) {
    console.error('isFollower called with no userId');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/${userId}`, {
      params: {
        fields: 'is_user_follow_business',
        access_token: getToken(),   // ← called fresh on every request
      },
    });
    return response.data?.is_user_follow_business === true;
  } catch (err) {
    console.error('isFollower failed:', err.response?.data || err.message);
    return false;
  }
}

module.exports = isFollower;