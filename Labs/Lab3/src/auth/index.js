if (process.env.HTPASSWD_FILE) {
  module.exports = require('./basic-auth');
} else if (process.env.AWS_COGNITO_POOL_ID && process.env.AWS_COGNITO_CLIENT_ID) {
  module.exports = require('./cognito');
} else {
  throw new Error('missing expected env vars: no authorization configuration found');
}