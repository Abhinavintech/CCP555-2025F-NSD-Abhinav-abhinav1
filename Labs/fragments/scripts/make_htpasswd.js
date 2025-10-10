// Simple APR1 (htpasswd) generator using crypto and a small implementation.
// Usage: node scripts/make_htpasswd.js <username> <password>

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function apr1(password, salt) {
  // Very small implementation ported from existing APR1 algorithms; not fully optimized
  salt = salt || crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0,8);
  const magic = '$apr1$';
  let ctx = crypto.createHash('md5').update(password + magic + salt).digest();
  let final = crypto.createHash('md5').update(password + salt + password).digest();

  for (let i = password.length; i > 0; i -= 16) {
    ctx = Buffer.concat([ctx, final.slice(0, Math.min(16, i))]);
  }

  for (let i = password.length; i; i >>= 1) {
    if (i & 1) ctx = Buffer.concat([ctx, Buffer.from([0])]);
    else ctx = Buffer.concat([ctx, Buffer.from([password.charCodeAt(0)])]);
  }

  let result = ctx;
  for (let i = 0; i < 1000; i++) {
    let md5 = crypto.createHash('md5');
    if (i % 2) md5.update(password);
    else md5.update(result);
    if (i % 3) md5.update(salt);
    if (i % 7) md5.update(password);
    if (i % 2) md5.update(result);
    result = md5.digest();
  }

  // convert to base64-like encoding used by APR1
  const itoa64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  function to64(v, n) {
    let str = '';
    while (--n >= 0) {
      str += itoa64[v & 0x3f];
      v = v >> 6;
    }
    return str;
  }

  const v = result;
  const l = (
    to64((v[0] << 16) | (v[6] << 8) | v[12], 4) +
    to64((v[1] << 16) | (v[7] << 8) | v[13], 4) +
    to64((v[2] << 16) | (v[8] << 8) | v[14], 4) +
    to64((v[3] << 16) | (v[9] << 8) | v[15], 4) +
    to64((v[4] << 16) | (v[10] << 8) | v[5], 4) +
    to64(v[11], 2)
  );

  return `${magic}${salt}$${l}`;
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node scripts/make_htpasswd.js <username> <password>');
  process.exit(2);
}
const [username, password] = args;
const hash = apr1(password);
const out = `${username}:${hash}\n`;
const outPath = path.resolve(__dirname, '../../Lab3/tests/.htpasswd');
fs.writeFileSync(outPath, out);
const logger = require('../src/logger');
logger.info('Wrote', outPath);
logger.info(out);
