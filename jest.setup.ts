import { notifyManager } from '@tanstack/react-query';

// Make TanStack Query's internal batch scheduler synchronous in the test environment.
// By default, notifyManager uses setTimeout(fn, 0) to batch state updates, which leaves
// an open handle after tests complete and causes "A worker process has failed to exit
// gracefully" warnings. Switching to a synchronous scheduler eliminates these timers.
notifyManager.setScheduler((fn) => fn());
