const { hash } = require('../../src/hash');

describe('Hash function', () => {
  test('hash function exists and returns a string', () => {
    const result = hash('test@example.com');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  test('hash function returns consistent results', () => {
    const email = 'user@example.com';
    const hash1 = hash(email);
    const hash2 = hash(email);
    expect(hash1).toBe(hash2);
  });

  test('hash function returns different results for different inputs', () => {
    const hash1 = hash('user1@example.com');
    const hash2 = hash('user2@example.com');
    expect(hash1).not.toBe(hash2);
  });
});