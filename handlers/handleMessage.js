
const { getRules } = require('./rulesStore');
const sendMessage = require('./handleSendMessage');
const isFollower = require('./handleisFollower');

const INSTA_ID = process.env.INSTA_ID;

async function handleMessage(body) {
  const event   = body?.entry?.[0]?.messaging?.[0];
  const userId  = event?.sender?.id;
  const payload = event?.message?.quick_reply?.payload;

  if (!userId || userId === INSTA_ID) {
    return { ok: false, message: "Invalid or self message" };
  }

  if (!payload?.startsWith('CHECK_FOLLOW:')) {
    return { ok: false, message: "Not a follow-check button" };
  }

  const mediaId = payload.split(':')[1];

  const rules = getRules();
  const rule = rules.find(r => r.id === mediaId);
  if (!rule) {
    return { ok: false, message: "No rule for this media" };
  }

  const follower = await isFollower(userId);

  if (follower) {
    await sendMessage({ userId, response: rule.response });
    return { ok: true, follower: true };
  }

  await sendMessage({
    userId,
    followPrompt: { mediaId, retry: true },
  });
  return { ok: true, follower: false };
}

module.exports = handleMessage;