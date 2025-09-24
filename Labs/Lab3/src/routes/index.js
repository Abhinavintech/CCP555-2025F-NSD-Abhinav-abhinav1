const express = require('express');
const { version, author } = require('../../package.json');
const router = express.Router();

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.json({
    status: 'ok',
    author,
    version,
    githubUrl: 'https://github.com/Abhinavintech/CCP555-2025F-NSD-Abhinav-abhinav1.git',
  });
});

module.exports = router;