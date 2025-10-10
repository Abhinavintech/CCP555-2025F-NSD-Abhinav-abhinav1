// Lightweight Passport mock helper for tests
// Provides install(user) to override passport.authenticate so tests can bypass JWT verification.
let _origAuthenticate = null;
let currentUser = null;

module.exports.install = function (user) {
  const passport = require('passport');
  if (!_origAuthenticate) _origAuthenticate = passport.authenticate;
  currentUser = user || { email: 'test@example.com' };
  passport.authenticate = function () {
    return function (req, res, next) {
      // read the currentUser dynamically so tests can swap identities
      req.user = currentUser;
      next();
    };
  };
};

module.exports.setUser = function (user) {
  currentUser = user || { email: 'test@example.com' };
};

module.exports.restore = function () {
  const passport = require('passport');
  if (_origAuthenticate) {
    passport.authenticate = _origAuthenticate;
    _origAuthenticate = null;
  }
};

