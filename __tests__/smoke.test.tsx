import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { QueryProvider } from '@/providers/QueryProvider';
import { useQueryClient } from '@tanstack/react-query';

describe('AppProviders', () => {
  it('renders without crashing', () => {
    const { getByText } = render(
      <AppProviders>
        <Text>Hello</Text>
      </AppProviders>,
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <AppProviders>
        <Text>Test Child</Text>
      </AppProviders>,
    );
    expect(getByText('Test Child')).toBeTruthy();
  });
});

describe('QueryProvider', () => {
  it('provides TanStack Query context to children', () => {
    function QueryClientConsumer() {
      const client = useQueryClient();
      return <Text>{client ? 'has-client' : 'no-client'}</Text>;
    }

    const { getByText } = render(
      <QueryProvider>
        <QueryClientConsumer />
      </QueryProvider>,
    );

    expect(getByText('has-client')).toBeTruthy();
  });
});
