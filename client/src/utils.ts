import type { ParsedGrades } from './types';

/**
 * Parse grades from text input (comma, space, or newline separated)
 */
export function parseGrades(text: string): ParsedGrades {
  const grades: number[] = [];
  const errors: string[] = [];

  // Split by comma, space, newline, or any combination
  const tokens = text.split(/[\s,]+/).filter((t) => t.trim() !== '');

  for (const token of tokens) {
    const num = parseFloat(token.trim());
    if (isNaN(num) || !isFinite(num)) {
      errors.push(`Invalid number: "${token}"`);
    } else {
      grades.push(num);
    }
  }

  return { grades, errors };
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format a number for display
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

/**
 * Create histogram bins from data
 */
export function createHistogramBins(
  data: number[],
  binCount: number = 10
): { bin: string; count: number; min: number; max: number }[] {
  if (data.length === 0) return [];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  // Handle case where all values are the same
  if (range === 0) {
    return [{ bin: formatNumber(min), count: data.length, min, max }];
  }

  const binWidth = range / binCount;
  const bins: { bin: string; count: number; min: number; max: number }[] = [];

  for (let i = 0; i < binCount; i++) {
    const binMin = min + i * binWidth;
    const binMax = min + (i + 1) * binWidth;
    const count = data.filter((v) => {
      if (i === binCount - 1) {
        return v >= binMin && v <= binMax;
      }
      return v >= binMin && v < binMax;
    }).length;

    bins.push({
      bin: `${formatNumber(binMin, 1)}-${formatNumber(binMax, 1)}`,
      count,
      min: binMin,
      max: binMax,
    });
  }

  return bins;
}
