// helpers.test.js - Unit tests for client utility functions

import {
  capitalize,
  formatDate,
  truncate,
  generateId,
  debounce,
} from '../../utils/helpers';

describe('capitalize', () => {
  it('should capitalize the first letter of a string', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('HELLO')).toBe('Hello');
    expect(capitalize('hELLO')).toBe('Hello');
  });

  it('should return empty string for falsy values', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize(null)).toBe('');
    expect(capitalize(undefined)).toBe('');
  });

  it('should handle single character strings', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('A')).toBe('A');
  });
});

describe('formatDate', () => {
  it('should format a date object to readable string', () => {
    const date = new Date('2023-01-15');
    const formatted = formatDate(date);
    expect(formatted).toBe('January 15, 2023');
  });

  it('should format a date string to readable string', () => {
    const formatted = formatDate('2023-01-15');
    expect(formatted).toBe('January 15, 2023');
  });

  it('should return empty string for falsy values', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});

describe('truncate', () => {
  it('should return the string if it is shorter than maxLength', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('should truncate the string and add ellipsis if longer than maxLength', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('should use default maxLength of 100', () => {
    const longString = 'a'.repeat(150);
    const truncated = truncate(longString);
    expect(truncated.length).toBe(103); // 100 + '...'
    expect(truncated.endsWith('...')).toBe(true);
  });

  it('should return the string unchanged for falsy values', () => {
    expect(truncate('')).toBe('');
    expect(truncate(null)).toBe(null);
    expect(truncate(undefined)).toBe(undefined);
  });
});

describe('generateId', () => {
  it('should generate an ID of specified length', () => {
    expect(generateId(5)).toHaveLength(5);
    expect(generateId(10)).toHaveLength(10);
  });

  it('should generate an ID of default length 8', () => {
    const id = generateId();
    expect(id).toHaveLength(8);
  });

  it('should generate different IDs on multiple calls', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should only contain alphanumeric characters', () => {
    const id = generateId(100);
    expect(id).toMatch(/^[A-Za-z0-9]+$/);
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  it('should delay function execution', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should reset delay on subsequent calls', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    jest.advanceTimersByTime(50);
    debouncedFn();
    jest.advanceTimersByTime(50);
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the original function', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2');
    jest.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});