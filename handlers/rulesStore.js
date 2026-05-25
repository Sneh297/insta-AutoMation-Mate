const fs = require('fs');
const path = require('path');

const RULES_FILE = path.resolve(__dirname, '..', 'rules.json');
let cache = null;

function loadFromDisk() {
  try {
    cache = JSON.parse(fs.readFileSync(RULES_FILE, 'utf8'));
  } catch {
    cache = [];
  }
  return cache;
}

function getRules() {
  if (cache === null) loadFromDisk();
  return cache;
}

function reloadRules() {
  return loadFromDisk();
}

module.exports = { getRules, reloadRules };