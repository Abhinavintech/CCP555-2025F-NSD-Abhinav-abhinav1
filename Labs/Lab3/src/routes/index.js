const express = require('express');
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');
const { createSuccessResponse } = require('../response');
const router = express.Router();

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.json(createSuccessResponse({
    author,
    version,
    githubUrl: 'http://localhost:8080',
  }));
});

router.use('/v1', authenticate(), require('./api'));

module.exports = router;