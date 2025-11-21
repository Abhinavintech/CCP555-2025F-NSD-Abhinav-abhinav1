// Redirect top-level require('./auth') to the auth directory selector
// This avoids accidental loading of a single-file cognito implementation.
module.exports = require('./auth/index');
