import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background-50">
      <Text className="text-xl font-bold text-typography-900">Lista Fácil</Text>
      <Text className="mt-2 text-typography-500">
        Your grocery price comparison app
      </Text>
    </View>
  );
}
