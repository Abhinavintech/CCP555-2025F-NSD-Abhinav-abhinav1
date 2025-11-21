// auth/index.js - deterministic selection of auth strategy
// Priority:
// 1) If HTPASSWD_FILE is present (non-production allowed) -> use basic auth
// 2) Else if AWS_COGNITO_* configured -> use Cognito
// 3) Else if running tests or LOG_LEVEL=silent -> use test stub
// 4) Otherwise throw (require configuration)

// Prevent configuring both methods at once
if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID && process.env.HTPASSWD_FILE) {
  throw new Error('env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.');
}

if (process.env.HTPASSWD_FILE && process.env.NODE_ENV !== 'production') {
  // Use basic auth when an HTPASSWD file is provided (test or local dev)
  module.exports = require('./basic-auth');
} else if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  // Production: use Cognito when configured
  module.exports = require('./cognito');
} else if (process.env.NODE_ENV === 'test' || process.env.LOG_LEVEL === 'silent' || process.env.JEST_WORKER_ID) {
  // Test-mode stub
  module.exports.authenticate = () => (req, res, next) => {
    req.user = 'test-user-' + Date.now();
    next();
  };
  module.exports.strategy = () => null;
} else {
  throw new Error('missing env vars: no authorization configuration found');
}
