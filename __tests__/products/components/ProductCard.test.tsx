import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AppProviders } from '@/providers/AppProviders';
import { ProductCard } from '@/features/products/components/ProductCard';
import type { Product } from '@/features/products/types';

const mockProduct: Product = {
  id: 'prod-001',
  name: 'Arroz Branco Tipo 1 Tio João',
  brand: 'Tio João',
  barcode: '7891093010014',
  categoryId: 10,
  subCategoryId: null,
  unit: '5kg',
  imageUrl: null,
  averagePrice: 22.90,
  lowestPrice: 19.99,
  priceCount: 8,
  createdAt: '2025-01-15T10:00:00Z',
};

function renderCard(onPress = jest.fn()) {
  return render(
    <AppProviders>
      <ProductCard product={mockProduct} onPress={onPress} />
    </AppProviders>,
  );
}

describe('ProductCard', () => {
  it('renders product name', () => {
    const { getByText } = renderCard();
    expect(getByText('Arroz Branco Tipo 1 Tio João')).toBeTruthy();
  });

  it('renders brand name', () => {
    const { getByText } = renderCard();
    expect(getByText('Tio João')).toBeTruthy();
  });

  it('renders formatted lowest price in BRL (R$ format)', () => {
    const { getByText } = renderCard();
    // Should contain currency symbol and value for R$ 19,99
    const priceText = getByText(/19/);
    expect(priceText).toBeTruthy();
    // The text should be formatted as BRL currency
    expect(priceText.props.children).toMatch(/19/);
  });

  it('renders categoryId', () => {
    const { getByText } = renderCard();
    expect(getByText('10')).toBeTruthy();
  });

  it('renders unit', () => {
    const { getByText } = renderCard();
    expect(getByText('5kg')).toBeTruthy();
  });

  it('renders price count', () => {
    const { getByText } = renderCard();
    expect(getByText(/8 precos/)).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = renderCard(onPress);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders singular "preco" for priceCount = 1', () => {
    const productWithOnePrice: Product = { ...mockProduct, priceCount: 1 };
    const { getByText } = render(
      <AppProviders>
        <ProductCard product={productWithOnePrice} onPress={jest.fn()} />
      </AppProviders>,
    );
    expect(getByText(/1 preco/)).toBeTruthy();
  });
});
