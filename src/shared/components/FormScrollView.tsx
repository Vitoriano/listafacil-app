import React, { forwardRef } from 'react';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';

/**
 * Espaço mínimo (em px) mantido entre o teclado e a borda inferior do campo focado.
 * Deixa o campo visível com folga em vez de encostar no teclado.
 */
const DEFAULT_BOTTOM_OFFSET = 24;

export type FormScrollViewProps = KeyboardAwareScrollViewProps;

/**
 * ScrollView para telas de formulário.
 *
 * Substitui a dupla `KeyboardAvoidingView` + `ScrollView`: ao abrir o teclado, ou ao
 * trocar o foco entre campos com o teclado já aberto, rola automaticamente para que o
 * campo focado fique na área visível acima do teclado (Android e iOS).
 *
 * Requer `KeyboardProvider` na raiz do app (ver `AppProviders`).
 */
export const FormScrollView = forwardRef<KeyboardAwareScrollViewRef, FormScrollViewProps>(
  function FormScrollView(
    { bottomOffset = DEFAULT_BOTTOM_OFFSET, keyboardShouldPersistTaps = 'handled', ...props },
    ref,
  ) {
    return (
      <KeyboardAwareScrollView
        ref={ref}
        bottomOffset={bottomOffset}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...props}
      />
    );
  },
);
