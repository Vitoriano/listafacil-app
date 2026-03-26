type LogDomain =
  | 'Scanner'
  | 'Products'
  | 'Prices'
  | 'Lists'
  | 'Profile'
  | 'Auth'
  | 'App'
  | 'ErrorBoundary'
  | string;

function formatMessage(domain: LogDomain, message: string): string {
  return `[${domain}] ${message}`;
}

export const logger = {
  info(domain: LogDomain, message: string, ...args: unknown[]): void {
    console.log(formatMessage(domain, message), ...args);
  },

  warn(domain: LogDomain, message: string, ...args: unknown[]): void {
    console.warn(formatMessage(domain, message), ...args);
  },

  error(domain: LogDomain, message: string, ...args: unknown[]): void {
    console.error(formatMessage(domain, message), ...args);
  },
};
