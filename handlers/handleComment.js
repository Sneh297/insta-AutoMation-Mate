
const { getRules } = require('./rulesStore');
const sendMessage = require('./handleSendMessage');
const isFollower = require('./handleisFollower');


const INSTA_ID = process.env.INSTA_ID;

async function handleComment(body) {
  const value     = body?.entry?.[0]?.changes?.[0]?.value;
  const comment   = value?.text;
  const commentId = value?.id;
  const mediaId   = value?.media?.id;
  const userId    = value?.from?.id;

  if (!comment || !commentId || !mediaId || !userId) {
    return { ok: false, message: "Details Missing" };
  }

  if (userId === INSTA_ID) {
    return { ok: false, message: "Ignoring self-comment" };
  }

  const rules = getRules();

  const rule = rules.find(r =>
    r.id === mediaId && r.comment.toLowerCase() === comment.toLowerCase()
  );
  if (!rule) return { ok: true, matched: null };

  const follower = await isFollower(userId);

  if (follower) {
    await sendMessage({ commentId, response: rule.response });
    return { ok: true, matched: rule, follower: true };
  }

  await sendMessage({
    commentId,
    followPrompt: { mediaId, retry: false },
  });
  return { ok: true, matched: rule, follower: false };
}

module.exports = handleComment;