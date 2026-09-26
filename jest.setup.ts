import type React from 'react';
import { notifyManager, timeoutManager } from '@tanstack/react-query';

// Reanimated 4: install the Jest timers/mocks so Animated components render synchronously.
require('react-native-reanimated').setUpTests();

// Make TanStack Query's internal batch scheduler synchronous in the test environment.
// By default, notifyManager uses setTimeout(fn, 0) to batch state updates, which leaves
// an open handle after tests complete and causes "A worker process has failed to exit
// gracefully" warnings. Switching to a synchronous scheduler eliminates these timers.
notifyManager.setScheduler((fn) => fn());

// Tests create their own QueryClient instances; every unmounted query schedules a gcTime
// timer (5 min by default) that keeps the Jest process alive after the run. Provide timers
// that are `unref()`ed so they never block Node from exiting.
type TimerId = ReturnType<typeof setTimeout>;
const unref = (timer: TimerId): TimerId => {
  (timer as unknown as { unref?: () => void }).unref?.();
  return timer;
};
timeoutManager.setTimeoutProvider<TimerId>({
  setTimeout: (callback, delay) => unref(setTimeout(callback, delay)),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (callback, delay) => unref(setInterval(callback, delay)),
  clearInterval: (id) => clearInterval(id),
});

// react-native-keyboard-controller has native code; use the mock shipped with the package
// so KeyboardProvider / KeyboardAwareScrollView render as plain views under Jest.
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);

// Telas com barra de ações fixa usam useSafeAreaInsets; fora do NavigationContainer não há provider,
// então usamos o mock oficial do pacote (insets zerados).
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  const zero = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    ...actual,
    useSafeAreaInsets: () => zero,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children,
  };
});
