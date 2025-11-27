// Fragment model - single coherent implementation
const storage = require('../storage-factory');
const crypto = require('crypto');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 } = {}) {
    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
    this._data = null;
  }

  // Return fragments (metadata) for a given owner. Storage.listFragments may return ids or metas.
  static async byUser(ownerId) {
    if (!ownerId) return [];
    const list = await storage.listFragments(ownerId);
    if (!list) return [];
    // If list contains strings (ids), fetch metas; if objects, use directly
    const first = list[0];
    const metas = [];
    if (typeof first === 'string') {
      for (const id of list) {
        const meta = await storage.readFragmentMeta(id);
        if (meta) metas.push(new Fragment(meta));
      }
    } else {
      for (const m of list) metas.push(new Fragment(m));
    }
    return metas;
  }

  static async byId(id) {
    if (!id) throw new Error('ID is required');
    const meta = await storage.readFragmentMeta(id);
    return meta ? new Fragment(meta) : null;
  }

  static isSupportedType(type) {
    try {
      const { isAllowed } = require('../content-types');
      return isAllowed(type);
    } catch (_e) {
      return true;
    }
  }

  async getData() {
    if (this._data) return this._data;
    if (storage.readFragmentData) return await storage.readFragmentData(this.id);
    return null;
  }

  // Set data and persist it. If the fragment exists, try update; otherwise create.
  async setData(buffer) {
    if (!Buffer.isBuffer(buffer)) throw new Error('Data must be a Buffer');
    this.size = buffer.length;
    this.updated = new Date().toISOString();

    // If a meta exists, prefer updateFragment when available
    const metaExists = await storage.readFragmentMeta(this.id);
    if (metaExists && storage.updateFragment) {
      const meta = await storage.updateFragment(this.id, buffer, this.type);
      // updateFragment returns metadata
      this.updated = meta.updated;
      this.size = meta.size;
      this._data = buffer;
      return meta;
    }

    // Otherwise create a new fragment (createFragment will generate id)
    if (storage.createFragment) {
      const meta = await storage.createFragment(this.ownerId, this.type, buffer);
      this.id = meta.id;
      this.created = meta.created;
      this.updated = meta.updated;
      this.size = meta.size;
      this._data = buffer;
      return meta;
    }

    throw new Error('No storage backend available');
  }

  // Persist metadata only (used rarely - createFragment handles data too)
  async save() {
    // If storage has createFragment and this._data is set, create; otherwise if meta exists keep as-is
    const metaExists = await storage.readFragmentMeta(this.id);
    if (!metaExists && storage.createFragment) {
      const meta = await storage.createFragment(this.ownerId, this.type, this._data || Buffer.alloc(0));
      this.id = meta.id;
      this.created = meta.created;
      this.updated = meta.updated;
      this.size = meta.size;
      return meta;
    }

    // If meta exists, just update timestamps locally and return a meta-shaped object
    this.updated = new Date().toISOString();
    return {
      id: this.id,
      ownerId: this.ownerId,
      created: this.created,
      updated: this.updated,
      type: this.type,
      size: this.size,
    };
  }

  async delete() {
    if (storage.deleteFragment) return await storage.deleteFragment(this.id);
    return false;
  }
}

module.exports = Fragment;
