// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const contentType = require('content-type');

const Fragment = require('./model/fragment');
const { author, version } = require('../package.json');
// Store for health check
const _appInfo = { author, version };

const logger = require('./logger');
const pino = require('pino-http')({ logger });

const app = express();

app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

app.use('/v1/fragments', rawBody());

const passport = require('passport');
// Require the auth directory explicitly to ensure we use the selection logic in auth/index.js
const authenticate = require('./auth/index');
if (authenticate.strategy && authenticate.strategy()) {
  passport.use(authenticate.strategy());
}
app.use(passport.initialize());

app.use('/', require('./routes'));

app.use((req, res) => {
  res.status(404).json({ status: 'error', error: { message: 'not found', code: 404 } });
});

app.use((err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';
  if (status > 499) logger.error({ err }, `Error processing request`);
  res.status(status).json({ status: 'error', error: { message, code: status } });
});

module.exports = app;
