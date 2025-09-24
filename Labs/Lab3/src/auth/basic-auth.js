const auth = require('http-auth');
const authPassport = require('http-auth-passport');
const passport = require('passport');

if (!process.env.HTPASSWD_FILE) {
  throw new Error('missing expected env var: HTPASSWD_FILE');
}

module.exports.strategy = () => {
  return authPassport(
    auth.basic({
      file: process.env.HTPASSWD_FILE,
    })
  );
};

module.exports.authenticate = () => passport.authenticate('http', { session: false });