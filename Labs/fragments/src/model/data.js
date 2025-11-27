const fs = require('fs');
const path = require('path');
const { randomUUID, createHash } = require('crypto');

// file is under src/model, so the shared data folder is two levels up: /src/../data
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const META_DIR = path.join(DATA_DIR, 'meta');
const BLOB_DIR = path.join(DATA_DIR, 'blobs');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  if (!fs.existsSync(META_DIR)) fs.mkdirSync(META_DIR);
  if (!fs.existsSync(BLOB_DIR)) fs.mkdirSync(BLOB_DIR);
}

ensureDirs();

function metaPath(id) {
  return path.join(META_DIR, `${id}.json`);
}

function blobPath(id) {
  return path.join(BLOB_DIR, id);
}

function hashOwner(owner) {
  if (!owner) return null;
  // Handle both string and object (e.g., {email: '...'})
  const email = typeof owner === 'string' ? owner : owner.email || owner;
  return createHash('sha256').update(String(email)).digest('hex');
}

function createFragment(ownerId, type, buffer) {
  const ownerHash = hashOwner(ownerId);
  const id = randomUUID();
  const now = new Date().toISOString();
  const meta = {
    id,
    ownerId: ownerHash,
    created: now,
    updated: now,
    type,
    size: buffer.length,
  };
  fs.writeFileSync(metaPath(id), JSON.stringify(meta));
  fs.writeFileSync(blobPath(id), buffer);
  return meta;
}

function readFragmentMeta(id) {
  const p = metaPath(id);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function readFragmentData(id) {
  const p = blobPath(id);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p);
}

function updateFragment(id, buffer, contentType) {
  const meta = readFragmentMeta(id);
  if (!meta) return null;
  if (contentType && contentType !== meta.type) {
    throw new Error('content-type-mismatch');
  }
  const now = new Date().toISOString();
  meta.updated = now;
  meta.size = buffer.length;
  fs.writeFileSync(blobPath(id), buffer);
  fs.writeFileSync(metaPath(id), JSON.stringify(meta));
  return meta;
}

function deleteFragment(id) {
  const meta = readFragmentMeta(id);
  if (!meta) return false;
  try {
    fs.unlinkSync(metaPath(id));
    fs.unlinkSync(blobPath(id));
    return true;
  } catch (_e) {
    return false;
  }
}

function listFragments(ownerId) {
  const files = fs.readdirSync(META_DIR).filter((f) => f.endsWith('.json'));
  const metas = files.map((f) => JSON.parse(fs.readFileSync(path.join(META_DIR, f), 'utf8')));
  if (!ownerId) return metas;
  const ownerHash = hashOwner(ownerId);
  return metas.filter((m) => m.ownerId === ownerHash);
}

module.exports = {
  createFragment,
  readFragmentMeta,
  readFragmentData,
  updateFragment,
  deleteFragment,
  listFragments,
};

// Also expose a Promise-based API for parity with async backends (e.g. S3).
module.exports.promises = {
  createFragment: async (...args) => createFragment(...args),
  readFragmentMeta: async (...args) => readFragmentMeta(...args),
  readFragmentData: async (...args) => readFragmentData(...args),
  updateFragment: async (...args) => updateFragment(...args),
  deleteFragment: async (...args) => deleteFragment(...args),
  listFragments: async (...args) => listFragments(...args),
};
