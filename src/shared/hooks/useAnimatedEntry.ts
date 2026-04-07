import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

interface AnimatedEntryOptions {
  delay?: number;
  duration?: number;
  translateY?: number;
}

export function useAnimatedEntry(options: AnimatedEntryOptions = {}) {
  const { delay = 0, duration = 500, translateY = 20 } = options;

  const opacity = useSharedValue(0);
  const translate = useSharedValue(translateY);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
    translate.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 90 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translate.value }],
  }));

  return animatedStyle;
}

export function useStaggeredList(itemCount: number, baseDelay = 100) {
  const values: SharedValue<number>[] = [];

  for (let i = 0; i < itemCount; i++) {
    values.push(useSharedValue(0));
  }

  useEffect(() => {
    values.forEach((val, index) => {
      val.value = withDelay(
        baseDelay * index,
        withSpring(1, { damping: 18, stiffness: 80 }),
      );
    });
  }, [itemCount]);

  return values;
}
