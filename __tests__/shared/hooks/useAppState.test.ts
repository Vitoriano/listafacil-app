import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useAppState } from '@/shared/hooks/useAppState';

describe('useAppState', () => {
  it('renders without throwing', () => {
    expect(() => renderHook(() => useAppState())).not.toThrow();
  });

  it('subscribes to AppState change events on mount', () => {
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');
    renderHook(() => useAppState());
    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it('unsubscribes from AppState change events on unmount', () => {
    const removeMock = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockReturnValue({ remove: removeMock });
    const { unmount } = renderHook(() => useAppState());
    unmount();
    expect(removeMock).toHaveBeenCalledTimes(1);
    jest.restoreAllMocks();
  });

  it('updates state when AppState emits a change event', () => {
    let changeCallback: ((state: string) => void) | null = null;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event, callback) => {
      if (event === 'change') {
        changeCallback = callback as (state: string) => void;
      }
      return { remove: jest.fn() };
    });

    const { result } = renderHook(() => useAppState());

    act(() => {
      changeCallback?.('background');
    });

    expect(result.current).toBe('background');
    jest.restoreAllMocks();
  });
});
