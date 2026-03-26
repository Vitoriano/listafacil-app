import React from 'react';
import { ActivityIndicator } from 'react-native';
import { render } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing inside AppProviders', () => {
    expect(() =>
      render(
        <AppProviders>
          <LoadingSpinner />
        </AppProviders>,
      ),
    ).not.toThrow();
  });

  it('renders an ActivityIndicator (Gluestack Spinner) with default size', () => {
    const { UNSAFE_getByType } = render(
      <AppProviders>
        <LoadingSpinner />
      </AppProviders>,
    );
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders an ActivityIndicator with size small when specified', () => {
    const { UNSAFE_getByType } = render(
      <AppProviders>
        <LoadingSpinner size="small" />
      </AppProviders>,
    );
    const indicator = UNSAFE_getByType(ActivityIndicator);
    expect(indicator.props.size).toBe('small');
  });
});
