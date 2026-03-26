import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { ManualEntryModal } from '@/features/scanner/components/ManualEntryModal';

function renderModal(props: {
  visible: boolean;
  onClose?: () => void;
  onSubmit?: (barcode: string) => void;
}) {
  const onClose = props.onClose ?? jest.fn();
  const onSubmit = props.onSubmit ?? jest.fn();
  return render(
    <AppProviders>
      <ManualEntryModal visible={props.visible} onClose={onClose} onSubmit={onSubmit} />
    </AppProviders>,
  );
}

describe('ManualEntryModal', () => {
  it('renders an input field and submit button when visible', () => {
    const { getByLabelText, getByText } = renderModal({ visible: true });
    expect(getByLabelText('Campo de codigo de barras')).toBeTruthy();
    expect(getByText('Buscar Produto')).toBeTruthy();
  });

  it('does not render content when not visible', () => {
    const { queryByLabelText } = renderModal({ visible: false });
    expect(queryByLabelText('Campo de codigo de barras')).toBeNull();
  });

  it('calls onSubmit with the entered barcode on form submission', () => {
    const onSubmit = jest.fn();
    const { getByLabelText, getByText } = render(
      <AppProviders>
        <ManualEntryModal visible onClose={jest.fn()} onSubmit={onSubmit} />
      </AppProviders>,
    );

    const input = getByLabelText('Campo de codigo de barras');
    fireEvent.changeText(input, '7891093010014');
    fireEvent.press(getByText('Buscar Produto'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('7891093010014');
  });

  it('does not call onSubmit when input is empty', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <AppProviders>
        <ManualEntryModal visible onClose={jest.fn()} onSubmit={onSubmit} />
      </AppProviders>,
    );

    fireEvent.press(getByText('Buscar Produto'));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit when input contains only whitespace', () => {
    const onSubmit = jest.fn();
    const { getByLabelText, getByText } = render(
      <AppProviders>
        <ManualEntryModal visible onClose={jest.fn()} onSubmit={onSubmit} />
      </AppProviders>,
    );

    const input = getByLabelText('Campo de codigo de barras');
    fireEvent.changeText(input, '   ');
    fireEvent.press(getByText('Buscar Produto'));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <AppProviders>
        <ManualEntryModal visible onClose={onClose} onSubmit={jest.fn()} />
      </AppProviders>,
    );

    fireEvent.press(getByLabelText('Fechar'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('trims whitespace from the barcode before calling onSubmit', () => {
    const onSubmit = jest.fn();
    const { getByLabelText, getByText } = render(
      <AppProviders>
        <ManualEntryModal visible onClose={jest.fn()} onSubmit={onSubmit} />
      </AppProviders>,
    );

    const input = getByLabelText('Campo de codigo de barras');
    fireEvent.changeText(input, '  7891093010014  ');
    fireEvent.press(getByText('Buscar Produto'));

    expect(onSubmit).toHaveBeenCalledWith('7891093010014');
  });
});
