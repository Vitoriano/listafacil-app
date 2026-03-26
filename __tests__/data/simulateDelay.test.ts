import { simulateDelay } from '@/data/helpers/delay';

// Use a mutable config object so we can change enableDelays between tests
const mockConfigValue = {
  enableDelays: true,
  minDelay: 200,
  maxDelay: 200,
};

jest.mock('@/config/mock', () => ({
  get mockConfig() {
    return mockConfigValue;
  },
}));

describe('simulateDelay()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockConfigValue.enableDelays = true;
    mockConfigValue.minDelay = 200;
    mockConfigValue.maxDelay = 200;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves after the configured delay when enableDelays is true', async () => {
    let resolved = false;
    const promise = simulateDelay().then(() => {
      resolved = true;
    });

    expect(resolved).toBe(false);

    jest.advanceTimersByTime(200);
    await promise;

    expect(resolved).toBe(true);
  });

  it('resolves immediately when enableDelays is false', async () => {
    mockConfigValue.enableDelays = false;

    let resolved = false;
    const promise = simulateDelay().then(() => {
      resolved = true;
    });

    await promise;
    expect(resolved).toBe(true);
  });
});
