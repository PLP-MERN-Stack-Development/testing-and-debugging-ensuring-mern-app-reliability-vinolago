// useLocalStorage.test.js - Unit tests for useLocalStorage hook

import { renderHook, act } from '@testing-library/react';
import useLocalStorage from '../../hooks/useLocalStorage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should return initial value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toBe('initial');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('testKey');
  });

  it('should return stored value from localStorage', () => {
    const storedValue = { data: 'stored' };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedValue));

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    expect(result.current[0]).toEqual(storedValue);
  });

  it('should handle JSON parse errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('testKey', 'fallback'));

    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should update localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('new value'));
  });

  it('should handle localStorage setItem errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value'); // State should still update
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should update state when storage event occurs for same key', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      // Simulate storage event from another tab
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'testKey',
        newValue: JSON.stringify('updated from other tab'),
      }));
    });

    expect(result.current[0]).toBe('updated from other tab');
  });

  it('should not update state for different keys', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'otherKey',
        newValue: JSON.stringify('should not update'),
      }));
    });

    expect(result.current[0]).toBe('initial');
  });

  it('should handle storage event with null newValue', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'testKey',
        newValue: null,
      }));
    });

    expect(result.current[0]).toBe('initial'); // Should not update for null values
  });
});