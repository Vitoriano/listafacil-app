import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { AppHeader } from '@/shared/components/AppHeader';

describe('AppHeader', () => {
  it('renders with no props (all optional)', () => {
    expect(() =>
      render(
        <AppProviders>
          <AppHeader />
        </AppProviders>,
      ),
    ).not.toThrow();
  });

  it('renders title text when provided', () => {
    const { getByText } = render(
      <AppProviders>
        <AppHeader title="Product Detail" />
      </AppProviders>,
    );
    expect(getByText('Product Detail')).toBeTruthy();
  });

  it('renders subtitle when provided', () => {
    const { getByText } = render(
      <AppProviders>
        <AppHeader title="Main Title" subtitle="Sub Info" />
      </AppProviders>,
    );
    expect(getByText('Sub Info')).toBeTruthy();
  });

  it('does not render back button when onBack is not provided', () => {
    const { queryByLabelText } = render(
      <AppProviders>
        <AppHeader title="Title" />
      </AppProviders>,
    );
    expect(queryByLabelText('Voltar')).toBeNull();
  });

  it('calls onBack when back button is pressed', () => {
    const onBackMock = jest.fn();
    const { getByLabelText } = render(
      <AppProviders>
        <AppHeader title="Title" onBack={onBackMock} />
      </AppProviders>,
    );
    fireEvent.press(getByLabelText('Voltar'));
    expect(onBackMock).toHaveBeenCalledTimes(1);
  });
});
