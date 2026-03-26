import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ManualEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (barcode: string) => void;
}

export function ManualEntryModal({ visible, onClose, onSubmit }: ManualEntryModalProps) {
  const [inputValue, setInputValue] = useState('');

  function handleSubmit() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setInputValue('');
  }

  function handleClose() {
    setInputValue('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />
        <View className="rounded-t-3xl bg-background-0 px-6 pb-10 pt-4">
          <View className="mb-4 self-center h-1 w-10 rounded-full bg-outline-200" />

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-typography-900">Digitar Codigo de Barras</Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              className="h-8 w-8 items-center justify-center rounded-full bg-background-50"
            >
              <Ionicons name="close" size={18} color="#7D7D7D" />
            </TouchableOpacity>
          </View>

          <Text className="mb-4 text-sm text-typography-500">
            Digite o numero do codigo de barras para buscar o produto.
          </Text>

          <TextInput
            className="mb-4 rounded-xl border border-outline-200 bg-background-50 px-4 py-3.5 text-base text-typography-900"
            placeholder="Ex: 7891093010014"
            placeholderTextColor="#A8A8A8"
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="numeric"
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
            autoFocus
            accessibilityLabel="Campo de codigo de barras"
          />

          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-full bg-primary-500 py-3.5"
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel="Buscar produto"
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={18} color="#FFFFFF" />
            <Text className="text-sm font-bold text-white">Buscar Produto</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
