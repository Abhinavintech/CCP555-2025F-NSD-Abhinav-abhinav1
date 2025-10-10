const fs = require('fs');
const path = require('path');
const src = path.resolve(__dirname, '..', 'scripts', 'make_htpasswd.js');
const logger = require('../src/logger');
logger.info('Backup placeholder for make_htpasswd.js moved from', src);
