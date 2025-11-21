const hash = require('../hash');

// authorize(strategyName) returns middleware that invokes passport but also
// ensures req.user and req.userId (hashed) are set for downstream handlers.
module.exports = function authorize(strategyName) {
  return (req, res, next) => {
    // If a test harness already set req.user, just compute userId and continue
    if (req.user) {
      req.userId = hash.hashEmail(req.user.email || req.user);
      return next();
    }

    // Otherwise delegate to passport (strategyName expected to be e.g. 'bearer' or 'http')
    const passport = require('passport');
    passport.authenticate(strategyName, { session: false }, (err, user) => {
      if (err) return next(err);
      if (!user)
        return res
          .status(401)
          .json({ status: 'error', error: { code: 401, message: 'Unauthorized' } });
      req.user = user;
      req.userId = hash.hashEmail(user.email || user.id || user);
      next();
    })(req, res, next);
  };
};
