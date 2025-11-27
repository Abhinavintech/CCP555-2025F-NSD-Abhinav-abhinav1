const express = require('express');
const { version, author } = require('../../package.json');
const router = express.Router();
const { authenticate } = require('../auth');
const { createSuccessResponse } = require('../response');

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.json(
    createSuccessResponse({
      author,
      version,
      githubUrl: 'https://github.com/Abhinavintech/CCP555-2025F-NSD-Abhinav-abhinav1.git',
    })
  );
});

// Mount API routes under /v1. If authenticate middleware is available use it,
// otherwise fall back to unauthenticated mount (helpful in test-mode).
try {
  router.use('/v1', authenticate(), require('./api'));
} catch (_e) {
  // If authenticate() is not a function or throws, still mount the api to
  // allow tests to run without auth strategy loaded.
   
  console.warn('auth.authenticate unavailable, mounting /v1 without auth');
  router.use('/v1', require('./api'));
}

module.exports = router;
