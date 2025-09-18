const express = require('express');
const { version, author } = require('../../package.json');
const router = express.Router();
const { authenticate } = require('../auth');

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    author,
    version,
    githubUrl: 'https://github.com/Abhinavintech/CCP555-2025F-NSD-Abhinav-abhinav1.git',
  });
});

router.use(`/v1`, authenticate(), require('./api'));

module.exports = router;