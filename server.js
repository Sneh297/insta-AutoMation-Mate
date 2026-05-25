require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const basicAuth = require('express-basic-auth');

const staticRoutes = require('./static/static');
const adminRoutes = require('./routes/admin');
const handleComment = require('./handlers/handleComment');
const handleMessage = require('./handlers/handleMessage');
const refreshToken = require('./handlers/refreshToken');

const PORT = process.env.PORT || 3001;

// ENV VALIDATION — fail fast with a clear message
const requiredEnvVars = [
  'ACCESS_TOKEN',
  'INSTA_ID',
  'VERIFY_TOKEN',
  'ADMIN_PASSWORD',
  'BASE_URL',
];

const missing = requiredEnvVars.filter(name => !process.env[name]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(name => console.error(`   - ${name}`));
  console.error('\nCopy .env.example to .env and fill in the values.');
  process.exit(1);
}

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const app = express();
app.use(express.json());

// AUTH (before protected routes)
app.use(['/admin', '/api'], basicAuth({
  users: {
    [process.env.ADMIN_USERNAME || 'admin']: process.env.ADMIN_PASSWORD,
  },
  challenge: true,
  realm: 'Admin',
}));

// ROUTES
app.use('/', adminRoutes);

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK_VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  res.status(200).send('EVENT_RECEIVED');

  const entry     = req.body?.entry?.[0];
  const change    = entry?.changes?.[0];
  const messaging = entry?.messaging?.[0];

  if (change?.field === 'comments') {
    handleComment(req.body).catch(err => console.error('handleComment error:', err));
  } else if (messaging?.message) {
    handleMessage(req.body).catch(err => console.error('handleMessage error:', err));
  }
});

app.use('/', staticRoutes);

// TOKEN REFRESH SCHEDULER
async function scheduleRefresh() {
  try {
    await refreshToken();
  } catch (err) {
    console.error('Token refresh failed:', err.message);
  }
}

scheduleRefresh();
setInterval(scheduleRefresh, 7 * 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});