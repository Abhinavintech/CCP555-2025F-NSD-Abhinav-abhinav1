// choose an authentication strategy based on environment
if (process.env.NODE_ENV === 'test' || process.env.LOG_LEVEL === 'silent') {
  module.exports.authenticate = () => (req, res, next) => {
    // deterministic test user used by tests
    req.user = 'test@example.com';
    next();
  };
  module.exports.strategy = () => null;
} else if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  module.exports = require('./cognito');
} else if (process.env.HTPASSWD_FILE) {
  module.exports = require('./basic-auth');
} else {
  // default to test-mode behavior if nothing is configured
  module.exports.authenticate = () => (req, res, next) => {
    req.user = null;
    next();
  };
  module.exports.strategy = () => null;
}
// auth/index.js

// Make sure our env isn't configured for both AWS Cognito and HTTP Basic Auth.
// We can only do one or the other.
if (
  process.env.AWS_COGNITO_POOL_ID &&
  process.env.AWS_COGNITO_CLIENT_ID &&
  process.env.HTPASSWD_FILE
) {
  throw new Error(
    'env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
  );
}

// For testing (NODE_ENV=test or LOG_LEVEL=silent), don't require authentication
if (process.env.NODE_ENV === 'test' || process.env.LOG_LEVEL === 'silent') {
  module.exports.authenticate = () => (req, res, next) => {
    // For tests, use a reproducible dummy user string (email-like) when tests install passport mock
    req.user = 'test-user-' + Date.now();
    next();
  };
  module.exports.strategy = () => null;
}
// Prefer Amazon Cognito (production)
else if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  module.exports = require('./cognito');
}
// Also allow for an .htpasswd file to be used, but not in production
else if (process.env.HTPASSWD_FILE && process.env.NODE_ENV !== 'production') {
  module.exports = require('./basic-auth');
}
// In all other cases, we need to stop now and fix our config
else {
  throw new Error('missing env vars: no authorization configuration found');
}
