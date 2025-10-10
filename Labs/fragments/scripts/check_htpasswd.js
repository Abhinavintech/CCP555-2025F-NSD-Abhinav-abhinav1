const auth = require('http-auth');
const path = require('path');
const ht = path.resolve(__dirname, '../../Lab3/tests/.htpasswd');
const logger = require('../src/logger');
console.log('Using htpasswd', ht);
const basic = auth.basic({ file: ht });
const username = process.argv[2] || 'user1@email.com';
const password = process.argv[3] || 'password1';
let ok = false;
basic.check((req, res) => {}); // no-op to ensure loaded
basic.authenticate = basic.check; // not necessary
basic.check((req, res) => {});
// http-auth exposes .check method expecting req/res; instead use .getUser?
// We'll create an authenticator and use the underlying htpasswd parser
const htpasswd = require('http-auth').utils;
try {
  const users = htpasswd.parse(ht);
  logger.info('Parsed users:', Object.keys(users));
  const hash = users[username];
  logger.info('Hash for user:', hash);
  // Can't verify easily with utils; fallback: use child process `htpasswd -vb` if available
} catch (e) {
  logger.error('Error parsing htpasswd', e);
}
logger.info('Done');
