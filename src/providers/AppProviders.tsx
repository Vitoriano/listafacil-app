import React from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { SocketProvider } from './SocketProvider';
import { useCartSessionSync } from '@/features/cart/hooks/useCartSessionSync';

interface AppProvidersProps {
  children: React.ReactNode;
}

/** Retoma/descarta a compra em andamento conforme login e retorno ao foreground. */
function CartSessionSync() {
  useCartSessionSync();
  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <KeyboardProvider>
      <QueryProvider>
        <SocketProvider>
          <CartSessionSync />
          <ThemeProvider>{children}</ThemeProvider>
        </SocketProvider>
      </QueryProvider>
    </KeyboardProvider>
  );
}
