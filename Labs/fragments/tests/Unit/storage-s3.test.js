// This test uses aws-sdk-client-mock to verify that S3Storage performs expected S3 calls.
// It is optional and will be skipped if aws-sdk-client-mock is not installed.
let mockS3;
try {
  const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
  const { mockClient } = require('aws-sdk-client-mock');
  mockS3 = mockClient(S3Client);
} catch (e) {
  // aws-sdk-client-mock not installed; skip test
}

const storageS3 = require('../../src/storage-s3');

describe('S3 storage adapter (mocked)', () => {
  beforeEach(() => {
    if (mockS3) mockS3.reset();
  });

  test('createFragment writes meta and blob to S3', async () => {
    if (!mockS3) return; // skip
    mockS3.onAny().resolves({});
    const meta = await storageS3.createFragment('test@example.com', 'text/plain', Buffer.from('hello'));
    expect(meta).toHaveProperty('id');
    // ensure PutObject was called at least twice (meta + blob)
    const calls = mockS3.callCount();
    expect(calls).toBeGreaterThanOrEqual(2);
  });
});
