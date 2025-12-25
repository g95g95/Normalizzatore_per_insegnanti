import { describe, it, expect } from 'vitest';
import { normalize } from './normalization.js';

describe('normalize', () => {
  // Test data: mu=30, sigma~5, x=34 => z=0.8
  const baseGrades = [25, 28, 30, 32, 35]; // mu=30

  describe('z_linear method', () => {
    it('calculates correctly with default k=2', () => {
      // Create dataset where we can control mu and sigma
      // grades: [26, 28, 30, 32, 34] -> mu=30, variance=10, sigma=sqrt(10/4)=sqrt(2.5)≈1.58
      // For easier testing, use [20, 25, 30, 35, 40] -> mu=30, sigma=7.906
      const grades = [20, 25, 30, 35, 40];
      const result = normalize(grades, 34, 2, 10, 'z_linear', {
        k: 2,
        alpha: 1,
        percentileMode: 'empirical',
      });

      // z = (34 - 30) / 7.906 ≈ 0.506
      // g_raw = 2 + 8 * ((0.506 + 2) / 4) = 2 + 8 * 0.6265 = 7.012
      expect(result.details.mu).toBeCloseTo(30, 5);
      expect(result.normalized).toBeGreaterThan(6);
      expect(result.normalized).toBeLessThan(8);
    });

    it('maps z=0 to midpoint', () => {
      const grades = [20, 25, 30, 35, 40]; // mu=30
      const result = normalize(grades, 30, 2, 10, 'z_linear', {
        k: 2,
        alpha: 1,
        percentileMode: 'empirical',
      });

      // z = 0, so g_raw = 2 + 8 * ((0 + 2) / 4) = 2 + 4 = 6 (midpoint)
      expect(result.details.z).toBeCloseTo(0, 5);
      expect(result.normalized).toBeCloseTo(6, 5);
    });

    it('clamps values outside range', () => {
      const grades = [20, 25, 30, 35, 40]; // mu=30, sigma≈7.906
      // x=50 gives z=(50-30)/7.906≈2.53, which exceeds k=2
      const result = normalize(grades, 50, 2, 10, 'z_linear', {
        k: 2,
        alpha: 1,
        percentileMode: 'empirical',
      });

      expect(result.clamped).toBe(true);
      expect(result.normalized).toBe(10);
    });
  });

  describe('z_tanh method', () => {
    it('calculates correctly with alpha=1', () => {
      const grades = [20, 25, 30, 35, 40]; // mu=30, sigma≈7.906
      const result = normalize(grades, 34, 2, 10, 'z_tanh', {
        k: 2,
        alpha: 1,
        percentileMode: 'empirical',
      });

      // z ≈ 0.506
      // s = tanh(1 * 0.506) ≈ 0.467
      // g_raw = 2 + 8 * ((0.467 + 1) / 2) = 2 + 8 * 0.7335 = 7.868
      expect(result.details.s).toBeDefined();
      expect(result.normalized).toBeGreaterThan(6);
      expect(result.normalized).toBeLessThan(9);
    });

    it('maps z=0 to midpoint', () => {
      const grades = [20, 25, 30, 35, 40]; // mu=30
      const result = normalize(grades, 30, 2, 10, 'z_tanh', {
        k: 2,
        alpha: 1,
        percentileMode: 'empirical',
      });

      // z = 0, s = tanh(0) = 0
      // g_raw = 2 + 8 * ((0 + 1) / 2) = 2 + 4 = 6
      expect(result.details.z).toBeCloseTo(0, 5);
      expect(result.details.s).toBeCloseTo(0, 5);
      expect(result.normalized).toBeCloseTo(6, 5);
    });

    it('squashes extreme values', () => {
      const grades = [20, 25, 30, 35, 40];
      const result = normalize(grades, 100, 2, 10, 'z_tanh', {
        k: 2,
        alpha: 1,
        percentileMode: 'empirical',
      });

      // Extreme z-score gets squashed by tanh
      expect(result.details.s).toBeDefined();
      expect(result.details.s!).toBeGreaterThan(0.99);
      expect(result.normalized).toBeCloseTo(10, 1);
      expect(result.clamped).toBe(false); // tanh keeps it in bounds
    });
  });

  describe('percentile_gaussian method', () => {
    it('maps p=0.5 to midpoint', () => {
      // For empirical ECDF, the median value should give p≈0.5
      const grades = [1, 2, 3, 4, 5]; // median is 3
      const result = normalize(grades, 3, 0, 10, 'percentile_gaussian', {
        k: 2,
        alpha: 1,
        percentileMode: 'empirical',
      });

      // p=0.5 => q=0 => g_raw = 0 + 10 * ((0 + 3) / 6) = 5
      expect(result.details.p).toBeCloseTo(0.5, 2);
      expect(result.details.q).toBeCloseTo(0, 1);
      expect(result.normalized).toBeCloseTo(5, 1);
    });

    it('works with gaussian_assumed mode', () => {
      const grades = [20, 25, 30, 35, 40]; // mu=30
      const result = normalize(grades, 30, 2, 10, 'percentile_gaussian', {
        k: 2,
        alpha: 1,
        percentileMode: 'gaussian_assumed',
      });

      // x=mu => z=0 => p=0.5 => q=0 => g_raw = 2 + 8 * 0.5 = 6
      expect(result.details.z).toBeCloseTo(0, 5);
      expect(result.details.p).toBeCloseTo(0.5, 5);
      expect(result.details.q).toBeCloseTo(0, 3);
      expect(result.normalized).toBeCloseTo(6, 1);
    });
  });

  describe('sigma = 0 edge case', () => {
    it('returns midpoint when all grades are identical', () => {
      const grades = [50, 50, 50, 50, 50];
      const result = normalize(grades, 50, 2, 10, 'z_linear', {
        k: 2,
        alpha: 1,
        percentileMode: 'empirical',
      });

      expect(result.details.sigma).toBe(0);
      expect(result.normalized).toBe(6); // midpoint of [2, 10]
      expect(result.explanation).toContain('identical');
    });
  });
});
