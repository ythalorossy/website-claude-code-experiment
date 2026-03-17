import { describe, it, expect } from 'vitest';
import { slugify, formatDate, truncate, cn } from '@/lib/utils';

describe('slugify', () => {
  it('converts text to URL-friendly slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Test 123')).toBe('test-123');
  });

  it('removes special characters', () => {
    expect(slugify('Hello @World!')).toBe('hello-world');
    expect(slugify('Test #1')).toBe('test-1');
  });

  it('handles multiple spaces and underscores', () => {
    expect(slugify('Hello   World')).toBe('hello-world');
    expect(slugify('Hello_World')).toBe('hello-world');
  });

  it('removes leading and trailing dashes', () => {
    expect(slugify('-hello-')).toBe('hello');
    expect(slugify('--world--')).toBe('world');
  });
});

describe('formatDate', () => {
  it('formats date correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('January');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('');
  });

  it('handles Date objects', () => {
    const result = formatDate(new Date('2024-01-15'));
    expect(result).toContain('January');
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('returns original string if shorter than length', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar')).toBe('foo');
    expect(cn('foo', true && 'bar')).toBe('foo bar');
  });
});