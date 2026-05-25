const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { reloadRules } = require('../handlers/rulesStore');
const { getToken } = require('../handlers/tokenStore');

const router = express.Router();

const RULES_FILE = path.resolve(__dirname, '..', 'rules.json');
const BASE_URL = process.env.BASE_URL;
const INSTA_ID = process.env.INSTA_ID;

// --- Helpers ---
function readRules() {
  try { return JSON.parse(fs.readFileSync(RULES_FILE, 'utf8')); }
  catch { return []; }
}
function writeRules(rules) {
  fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2));
}

// --- Serve the admin page ---
router.get('/admin', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'admin.html'));
});

// --- API: list user's recent posts ---
router.get('/api/posts', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/${INSTA_ID}/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,thumbnail_url,permalink',
        access_token: getToken(),     // ← fresh every call
        limit: 24,
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error('GET /api/posts failed:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// --- API: list rules ---
router.get('/api/rules', (req, res) => {
  res.json(readRules());
});

// --- API: add a rule ---
router.post('/api/rules', (req, res) => {
  const { id, comment, response } = req.body || {};
  if (!id || !comment || !response?.text || !response?.button_title || !response?.button_url) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const rules = readRules();

  const dup = rules.find(r =>
    r.id === id && r.comment.toLowerCase() === comment.toLowerCase()
  );
  if (dup) {
    return res.status(409).json({ message: 'A rule with this post + keyword already exists' });
  }

  rules.push({ id, comment, response });
  writeRules(rules);
  reloadRules();
  res.json({ ok: true });
});

// --- API: delete a rule (by post id + keyword) ---
router.delete('/api/rules/:id/:comment', (req, res) => {
  const { id, comment } = req.params;
  let rules = readRules();
  const before = rules.length;
  rules = rules.filter(r =>
    !(r.id === id && r.comment.toLowerCase() === comment.toLowerCase())
  );
  if (rules.length === before) {
    return res.status(404).json({ message: 'Rule not found' });
  }
  writeRules(rules);
  reloadRules();
  res.json({ ok: true });
});

module.exports = router;