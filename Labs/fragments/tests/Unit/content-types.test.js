const { isAllowed, normalizeType } = require('../../src/content-types');

describe('Content Types', () => {
  test('isAllowed returns true for supported types', () => {
    expect(isAllowed('text/plain')).toBe(true);
    expect(isAllowed('text/markdown')).toBe(true);
    expect(isAllowed('application/json')).toBe(true);
    expect(isAllowed('image/png')).toBe(true);
  });

  test('isAllowed returns false for unsupported types', () => {
    expect(isAllowed('video/mp4')).toBe(false);
    expect(isAllowed('application/pdf')).toBe(false);
    expect(isAllowed('')).toBe(false);
    expect(isAllowed(null)).toBe(false);
  });

  test('normalizeType removes charset and parameters', () => {
    expect(normalizeType('text/plain; charset=utf-8')).toBe('text/plain');
    expect(normalizeType('application/json; charset=utf-8')).toBe('application/json');
    expect(normalizeType('text/html')).toBe('text/html');
  });

  test('normalizeType handles empty input', () => {
    expect(normalizeType('')).toBe('');
    expect(normalizeType(null)).toBe('');
    expect(normalizeType(undefined)).toBe('');
  });
});