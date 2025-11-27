const logger = require('../../src/logger');

describe('Logger', () => {
  test('logger exists and has required methods', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('logger can log messages without throwing', () => {
    expect(() => logger.info('test message')).not.toThrow();
    expect(() => logger.error('test error')).not.toThrow();
  });
});