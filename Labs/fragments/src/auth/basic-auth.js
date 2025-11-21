const auth = require('http-auth');
const authPassport = require('http-auth-passport');
const logger = require('../logger');
const fs = require('fs');
const path = require('path');
const authorize = require('./auth-middleware');

// We expect HTPASSWD_FILE to be defined.
if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

// Resolve htpasswd path if necessary (fall back to Lab3 tests location)
let htPath = process.env.HTPASSWD_FILE;
if (!path.isAbsolute(htPath) && !fs.existsSync(htPath)) {
  const alt = path.resolve(__dirname, '../../Lab3', htPath);
  if (fs.existsSync(alt)) htPath = alt;
}

logger.info('Using HTTP Basic Auth for auth');

module.exports.strategy = () =>
  authPassport(
    auth.basic({
      file: htPath,
    })
  );

// Delegate to authorize middleware (wraps passport and sets req.userId)
module.exports.authenticate = () => authorize('http');
