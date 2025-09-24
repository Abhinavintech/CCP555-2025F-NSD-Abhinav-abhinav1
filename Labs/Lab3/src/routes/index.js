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
    githubUrl: 'https://github.com/Abhinavintech/CCP555-2025F-NSD-Abhinav-abhinav1.git',
  }));
});

router.use('/v1', authenticate(), require('./api'));

module.exports = router;