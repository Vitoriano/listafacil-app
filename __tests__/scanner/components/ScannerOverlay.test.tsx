import React from 'react';
import { render } from '@testing-library/react-native';
import { ScannerOverlay } from '@/features/scanner/components/ScannerOverlay';

describe('ScannerOverlay', () => {
  it('renders the scan area without crashing', () => {
    const { getByLabelText } = render(<ScannerOverlay />);
    expect(getByLabelText('Scan area')).toBeTruthy();
  });

  it('includes an accessibility hint describing the viewfinder', () => {
    const { getByA11yHint } = render(<ScannerOverlay />);
    expect(getByA11yHint('Center the barcode within this frame to scan')).toBeTruthy();
  });
});
