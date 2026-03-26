import { delay } from '@/shared/utils/delay';

describe('delay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a Promise', () => {
    const result = delay(100);
    expect(result).toBeInstanceOf(Promise);
  });

  it('resolves after the specified milliseconds', async () => {
    let resolved = false;
    delay(500).then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    jest.advanceTimersByTime(500);
    await Promise.resolve();

    expect(resolved).toBe(true);
  });

  it('resolves immediately with 0ms delay', async () => {
    let resolved = false;
    delay(0).then(() => {
      resolved = true;
    });

    jest.advanceTimersByTime(0);
    await Promise.resolve();

    expect(resolved).toBe(true);
  });
});
