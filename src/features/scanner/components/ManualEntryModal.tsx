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
        <View className="rounded-t-2xl bg-background-50 px-6 pb-10 pt-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-typography-900">Enter Barcode</Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text className="text-base text-typography-500">Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text className="mb-3 text-sm text-typography-500">
            Type the barcode number manually to search for a product.
          </Text>

          <TextInput
            className="mb-4 rounded-lg border border-outline-300 bg-background-0 px-4 py-3 text-base text-typography-900"
            placeholder="e.g. 7891093010014"
            placeholderTextColor="#9ca3af"
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="numeric"
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
            autoFocus
            accessibilityLabel="Barcode input"
          />

          <TouchableOpacity
            className="items-center rounded-lg bg-primary-500 py-3"
            onPress={handleSubmit}
            accessibilityRole="button"
            accessibilityLabel="Search product"
          >
            <Text className="text-base font-semibold text-white">Search Product</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
