import { describe, it, expect } from 'vitest';
import { parseGrades, formatNumber, createHistogramBins } from './utils';

describe('parseGrades', () => {
  it('parses comma-separated values', () => {
    const result = parseGrades('85, 90, 78, 92');
    expect(result.grades).toEqual([85, 90, 78, 92]);
    expect(result.errors).toHaveLength(0);
  });

  it('parses space-separated values', () => {
    const result = parseGrades('85 90 78 92');
    expect(result.grades).toEqual([85, 90, 78, 92]);
    expect(result.errors).toHaveLength(0);
  });

  it('parses newline-separated values', () => {
    const result = parseGrades('85\n90\n78\n92');
    expect(result.grades).toEqual([85, 90, 78, 92]);
    expect(result.errors).toHaveLength(0);
  });

  it('parses mixed separators', () => {
    const result = parseGrades('85, 90\n78 92');
    expect(result.grades).toEqual([85, 90, 78, 92]);
    expect(result.errors).toHaveLength(0);
  });

  it('handles decimal values', () => {
    const result = parseGrades('85.5, 90.25, 78.75');
    expect(result.grades).toEqual([85.5, 90.25, 78.75]);
    expect(result.errors).toHaveLength(0);
  });

  it('reports errors for invalid tokens', () => {
    const result = parseGrades('85, abc, 90, xyz');
    expect(result.grades).toEqual([85, 90]);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0]).toContain('abc');
    expect(result.errors[1]).toContain('xyz');
  });

  it('handles empty input', () => {
    const result = parseGrades('');
    expect(result.grades).toEqual([]);
    expect(result.errors).toHaveLength(0);
  });

  it('handles whitespace-only input', () => {
    const result = parseGrades('   \n   ');
    expect(result.grades).toEqual([]);
    expect(result.errors).toHaveLength(0);
  });
});

describe('formatNumber', () => {
  it('formats with default decimals', () => {
    expect(formatNumber(3.14159)).toBe('3.14');
  });

  it('formats with custom decimals', () => {
    expect(formatNumber(3.14159, 3)).toBe('3.142');
  });

  it('formats integers', () => {
    expect(formatNumber(42)).toBe('42.00');
  });
});

describe('createHistogramBins', () => {
  it('creates bins for data', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const bins = createHistogramBins(data, 5);
    expect(bins).toHaveLength(5);
    expect(bins.every((b) => b.count >= 0)).toBe(true);
  });

  it('handles empty data', () => {
    const bins = createHistogramBins([]);
    expect(bins).toEqual([]);
  });

  it('handles single value', () => {
    const bins = createHistogramBins([5]);
    expect(bins).toHaveLength(1);
    expect(bins[0].count).toBe(1);
  });

  it('handles identical values', () => {
    const bins = createHistogramBins([5, 5, 5, 5, 5]);
    expect(bins).toHaveLength(1);
    expect(bins[0].count).toBe(5);
  });
});
