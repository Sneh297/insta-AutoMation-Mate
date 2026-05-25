const axios = require('axios');
const buildMessage = require('./messageTemplates');
const { getToken } = require('./tokenStore');

const BASE_URL = process.env.BASE_URL;
const INSTA_ID = process.env.INSTA_ID;

const FOLLOW_PROMPT_TEXT = "Please follow us first to get the link! 🙌";
const STILL_NOT_FOLLOWING_TEXT = "Hmm, I don't see you following yet. Please follow and tap again!";

async function sendMessage({ commentId, userId, response, followPrompt }) {
  let message;

  if (response) {
    message = buildMessage(response);
  } else if (followPrompt) {
    message = {
      text: followPrompt.retry ? STILL_NOT_FOLLOWING_TEXT : FOLLOW_PROMPT_TEXT,
      quick_replies: [{
        content_type: 'text',
        title: "I'm following ✅",
        payload: `CHECK_FOLLOW:${followPrompt.mediaId}`,
      }],
    };
  } else {
    throw new Error('sendMessage needs either response or followPrompt');
  }

  const recipient = commentId ? { comment_id: commentId } : { id: userId };
  const payload = { recipient, message };

  try {
    const res = await axios.post(
      `${BASE_URL}/${INSTA_ID}/messages`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,   // ← fresh every call
        },
      }
    );
    return { ok: true, data: res.data };
  } catch (err) {
    console.error('sendMessage failed:', err.response?.data || err.message);
    return { ok: false, error: err.response?.data || err.message };
  }
}

module.exports = sendMessage;