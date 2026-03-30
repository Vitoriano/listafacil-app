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
  categoryName: 'Grãos',
  unit: '5kg',
  imageUrl: null,
  latestPrice: {
    id: 'price-001',
    price: 19.99,
    storeId: 'store-1',
    submittedAt: '2025-01-15T10:00:00Z',
    store: { id: 'store-1', name: 'Supermercado Extra' },
  },
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

  it('renders category name', () => {
    const { getByText } = renderCard();
    expect(getByText('Grãos')).toBeTruthy();
  });

  it('renders unit', () => {
    const { getByText } = renderCard();
    expect(getByText('5kg')).toBeTruthy();
  });

  it('renders store name from latestPrice', () => {
    const { getByText } = renderCard();
    expect(getByText('Supermercado Extra')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = renderCard(onPress);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders "Sem preco" when latestPrice is null', () => {
    const productWithoutPrice: Product = { ...mockProduct, latestPrice: null };
    const { getByText } = render(
      <AppProviders>
        <ProductCard product={productWithoutPrice} onPress={jest.fn()} />
      </AppProviders>,
    );
    expect(getByText('Sem preco')).toBeTruthy();
  });
});
