import { logger } from '@/shared/utils/logger';

describe('logger', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logger.info calls console.log without throwing', () => {
    expect(() => logger.info('Scanner', 'test message')).not.toThrow();
    expect(console.log).toHaveBeenCalledWith('[Scanner] test message');
  });

  it('logger.warn calls console.warn without throwing', () => {
    expect(() => logger.warn('Prices', 'warn message')).not.toThrow();
    expect(console.warn).toHaveBeenCalledWith('[Prices] warn message');
  });

  it('logger.error calls console.error without throwing', () => {
    expect(() => logger.error('App', 'error message')).not.toThrow();
    expect(console.error).toHaveBeenCalledWith('[App] error message');
  });

  it('does not throw when called with domain prefix argument', () => {
    expect(() => logger.info('Lists', 'list loaded', { count: 5 })).not.toThrow();
    expect(() => logger.warn('Auth', 'session expiring', { userId: '123' })).not.toThrow();
    expect(() => logger.error('Products', 'fetch failed', new Error('Network error'))).not.toThrow();
  });

  it('formats message with domain prefix', () => {
    logger.info('Scanner', 'barcode detected');
    expect(console.log).toHaveBeenCalledWith('[Scanner] barcode detected');
  });
});
