require('dotenv').config();
const logger = require('./logger');

process.on('uncaughtException', (err, origin) => {
  logger.fatal({ err, origin }, 'uncaughtException');
  throw err;
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'unhandledRejection');
  throw reason;
});

require('./server');
// src/index.js

// Read environment variables from an .env file (if present)
require('dotenv').config();

// We want to log any crash cases so we can debug later from logs.
const logger = require('./logger');

process.on('uncaughtException', (err, origin) => {
  logger.fatal({ err, origin }, 'uncaughtException');
  throw err;
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'unhandledRejection');
  throw reason;
});

require('./server');
require('dotenv').config();

const logger = require('./logger');

process.on('uncaughtException', (err, origin) => {
  logger.error('Uncaught Exception', { err, origin });
  throw err;
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  throw reason;
});

require('./server');
