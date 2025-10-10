const fs = require('fs');
const path = require('path');
const src = path.resolve(__dirname, '..', 'scripts', 'check_htpasswd.js');
const logger = require('../src/logger');
logger.info('Backup placeholder for check_htpasswd.js moved from', src);
