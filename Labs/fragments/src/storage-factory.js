// Simple storage factory: pick S3 or local filesystem storage
// Always export a Promise-based async API so callers can `await` storage methods
const backend = process.env.STORAGE_BACKEND || 'local';
if (backend === 's3') {
  // s3 implementation already exposes async functions
  module.exports = require('./storage-s3');
} else {
  // local storage exports sync functions and also a `promises` wrapper
  const local = require('./model/data');
  module.exports = local.promises || local;
}
