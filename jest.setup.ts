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
