import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Component that throws during render for testing
function ThrowingComponent(): React.ReactElement {
  throw new Error('Test render error');
}

describe('ErrorBoundary', () => {
  // Suppress console.error from React error boundary during tests
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <AppProviders>
        <ErrorBoundary>
          <Text>Normal child content</Text>
        </ErrorBoundary>
      </AppProviders>,
    );
    expect(getByText('Normal child content')).toBeTruthy();
  });

  it('renders fallback UI when a child throws during render', () => {
    const { getByText } = render(
      <AppProviders>
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      </AppProviders>,
    );
    expect(getByText('Algo deu errado')).toBeTruthy();
  });

  it('displays the error message in fallback UI', () => {
    const { getByText } = render(
      <AppProviders>
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      </AppProviders>,
    );
    expect(getByText('Test render error')).toBeTruthy();
  });

  it('renders custom fallback when provided and child throws', () => {
    const { getByText } = render(
      <AppProviders>
        <ErrorBoundary fallback={<Text>Custom Error UI</Text>}>
          <ThrowingComponent />
        </ErrorBoundary>
      </AppProviders>,
    );
    expect(getByText('Custom Error UI')).toBeTruthy();
  });
});
