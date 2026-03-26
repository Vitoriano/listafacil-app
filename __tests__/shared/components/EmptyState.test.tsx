import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { EmptyState } from '@/shared/components/EmptyState';

describe('EmptyState', () => {
  it('renders with only the message prop', () => {
    const { getByText } = render(
      <AppProviders>
        <EmptyState message="No products found" />
      </AppProviders>,
    );
    expect(getByText('No products found')).toBeTruthy();
  });

  it('renders title when provided', () => {
    const { getByText } = render(
      <AppProviders>
        <EmptyState message="No items" title="Empty List" />
      </AppProviders>,
    );
    expect(getByText('Empty List')).toBeTruthy();
    expect(getByText('No items')).toBeTruthy();
  });

  it('does not render title when not provided', () => {
    const { queryByText } = render(
      <AppProviders>
        <EmptyState message="No items" />
      </AppProviders>,
    );
    expect(queryByText('Empty List')).toBeNull();
  });

  it('renders the action button when action prop is provided', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AppProviders>
        <EmptyState message="No items" action={{ label: 'Retry', onPress: onPressMock }} />
      </AppProviders>,
    );
    expect(getByText('Retry')).toBeTruthy();
  });

  it('fires the callback when action button is pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <AppProviders>
        <EmptyState message="No items" action={{ label: 'Retry', onPress: onPressMock }} />
      </AppProviders>,
    );
    fireEvent.press(getByText('Retry'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when action prop is not provided', () => {
    const { queryByRole } = render(
      <AppProviders>
        <EmptyState message="No items" />
      </AppProviders>,
    );
    expect(queryByRole('button')).toBeNull();
  });
});
