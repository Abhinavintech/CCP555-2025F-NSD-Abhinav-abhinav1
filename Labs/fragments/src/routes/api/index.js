const express = require('express');
const router = express.Router();

// collection endpoints
router.get('/fragments', require('./get'));
router.post('/fragments', require('./post'));

// delegate all methods on the item routes to the id handler so it can
// implement method-specific logic and return 405 for unsupported methods.
router.all('/fragments/:id/info', require('./id'));
router.all('/fragments/:id', require('./id'));

module.exports = router;
