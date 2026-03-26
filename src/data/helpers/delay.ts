import { mockConfig } from '@/config/mock';

export async function simulateDelay(): Promise<void> {
  if (!mockConfig.enableDelays) return;
  const ms =
    mockConfig.minDelay +
    Math.random() * (mockConfig.maxDelay - mockConfig.minDelay);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
