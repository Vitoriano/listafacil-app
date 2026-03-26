import { Text, View } from 'react-native';

export function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background-50">
      <Text className="text-xl font-bold text-typography-900">Settings</Text>
      <Text className="mt-2 text-typography-500">App settings screen</Text>
    </View>
  );
}
