const { createHash, createHmac } = require('crypto');

const HMAC_ALGO = 'sha256';
const HMAC_SECRET = process.env.HASH_SECRET || 'default-secret';

function hash(email) {
  // HMAC-style hash (used in some parts of the app)
  return createHmac(HMAC_ALGO, HMAC_SECRET).update(String(email || '')).digest('hex');
}

function hashEmail(email) {
  if (!email) return null;
  return createHash('sha256').update(String(email)).digest('hex');
}

module.exports = {
  hash,
  hashEmail,
};
