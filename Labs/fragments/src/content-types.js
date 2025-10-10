const allowed = new Set([
  'text/plain',
  'text/markdown',
  'text/html',
  'text/csv',
  'application/json',
  'application/yaml',
  'application/x-yaml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
]);

function normalizeType(type) {
  if (!type) return '';
  return type.split(';')[0].trim();
}

function isAllowed(type) {
  return allowed.has(normalizeType(type));
}

module.exports = { isAllowed, normalizeType };
