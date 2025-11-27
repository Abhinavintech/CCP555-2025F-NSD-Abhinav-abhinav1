const tryRequire = (name) => {
  try {
    return require(name);
  } catch (_e) {
    return null;
  }
};

const s3mod = tryRequire('@aws-sdk/client-s3');
const { randomUUID, createHash } = require('crypto');

if (!s3mod) {
  // AWS SDK not installed; export stubs so tests or app don't crash on require.
  module.exports = {
    isAvailable: false,
    createFragment: async () => {
      throw new Error('@aws-sdk/client-s3 is not installed');
    },
    readFragmentMeta: async () => null,
    readFragmentData: async () => null,
    updateFragment: async () => {
      throw new Error('@aws-sdk/client-s3 is not installed');
    },
    deleteFragment: async () => false,
    listFragments: async () => [],
  };
} else {
  const {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
  } = s3mod;
  const BUCKET = process.env.FRAGMENTS_S3_BUCKET || 'fragments-dev-bucket';

  function hashOwner(owner) {
    if (!owner) return null;
    return createHash('sha256').update(owner).digest('hex');
  }

  function toBuffer(readable) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readable.on('data', (c) => chunks.push(c));
      readable.on('end', () => resolve(Buffer.concat(chunks)));
      readable.on('error', reject);
    });
  }

  class S3Storage {
    constructor() {
      this.client = new S3Client({});
      this.bucket = BUCKET;
    }

    async createFragment(ownerId, type, buffer) {
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
      // store meta as object key meta/<id>.json and blob as blobs/<id>
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `meta/${id}.json`,
          Body: JSON.stringify(meta),
        })
      );
      await this.client.send(
        new PutObjectCommand({ Bucket: this.bucket, Key: `blobs/${id}`, Body: buffer })
      );
      return meta;
    }

    async readFragmentMeta(id) {
      try {
        const obj = await this.client.send(
          new GetObjectCommand({ Bucket: this.bucket, Key: `meta/${id}.json` })
        );
        const body = await toBuffer(obj.Body);
        return JSON.parse(body.toString('utf8'));
      } catch (_e) {
        return null;
      }
    }

    async readFragmentData(id) {
      try {
        const obj = await this.client.send(
          new GetObjectCommand({ Bucket: this.bucket, Key: `blobs/${id}` })
        );
        const body = await toBuffer(obj.Body);
        return body;
      } catch (_e) {
        return null;
      }
    }

    async updateFragment(id, buffer, contentType) {
      const meta = await this.readFragmentMeta(id);
      if (!meta) return null;
      if (contentType && contentType !== meta.type) {
        throw new Error('content-type-mismatch');
      }
      meta.updated = new Date().toISOString();
      meta.size = buffer.length;
      await this.client.send(
        new PutObjectCommand({ Bucket: this.bucket, Key: `blobs/${id}`, Body: buffer })
      );
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `meta/${id}.json`,
          Body: JSON.stringify(meta),
        })
      );
      return meta;
    }

    async deleteFragment(id) {
      const meta = await this.readFragmentMeta(id);
      if (!meta) return false;
      try {
        await this.client.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: `meta/${id}.json` })
        );
        await this.client.send(
          new DeleteObjectCommand({ Bucket: this.bucket, Key: `blobs/${id}` })
        );
        return true;
      } catch (_e) {
        return false;
      }
    }

    async listFragments(ownerId) {
      // list meta/ objects and filter by ownerId if provided
      const out = await this.client.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: 'meta/' })
      );
      const keys = (out.Contents || []).map((c) => c.Key).filter((k) => k.endsWith('.json'));
      const metas = [];
      for (const key of keys) {
        const id = key
          .split('/')
          .pop()
          .replace(/\.json$/, '');
        const m = await this.readFragmentMeta(id);
        if (m) metas.push(m);
      }
      if (!ownerId) return metas;
      const ownerHash = hashOwner(ownerId);
      return metas.filter((m) => m.ownerId === ownerHash);
    }
  }

  module.exports = new S3Storage();
}
