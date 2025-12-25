import { describe, it, expect } from 'vitest';
import {
  mean,
  sampleStd,
  zScore,
  normalCDF,
  normalInvCDF,
  percentileECDF,
  clamp,
  safePercentile,
} from './math.js';

describe('mean', () => {
  it('calculates mean correctly', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(mean([10, 20, 30])).toBe(20);
    expect(mean([5])).toBe(5);
  });

  it('throws on empty array', () => {
    expect(() => mean([])).toThrow();
  });
});

describe('sampleStd', () => {
  it('calculates sample standard deviation correctly', () => {
    // Known dataset: [25, 30, 35, 40, 45] has mean=35, sample std=7.906
    const values = [25, 30, 35, 40, 45];
    const std = sampleStd(values);
    expect(std).toBeCloseTo(7.906, 2);
  });

  it('handles dataset with mu=30, sigma=5', () => {
    // Dataset designed to have mu=30, sigma≈5
    const values = [25, 28, 30, 32, 35];
    const mu = mean(values);
    expect(mu).toBe(30);
    const sigma = sampleStd(values);
    expect(sigma).toBeCloseTo(3.808, 2);
  });

  it('throws on arrays with fewer than 2 elements', () => {
    expect(() => sampleStd([5])).toThrow();
    expect(() => sampleStd([])).toThrow();
  });
});

describe('zScore', () => {
  it('calculates z-score correctly', () => {
    expect(zScore(34, 30, 5)).toBeCloseTo(0.8, 10);
    expect(zScore(30, 30, 5)).toBe(0);
    expect(zScore(25, 30, 5)).toBe(-1);
  });

  it('returns 0 when sigma is 0', () => {
    expect(zScore(100, 50, 0)).toBe(0);
  });
});

describe('normalCDF', () => {
  it('returns 0.5 for z=0', () => {
    expect(normalCDF(0)).toBeCloseTo(0.5, 5);
  });

  it('returns correct values for known z-scores', () => {
    expect(normalCDF(1)).toBeCloseTo(0.8413, 3);
    expect(normalCDF(-1)).toBeCloseTo(0.1587, 3);
    expect(normalCDF(2)).toBeCloseTo(0.9772, 3);
    expect(normalCDF(-2)).toBeCloseTo(0.0228, 3);
    expect(normalCDF(3)).toBeCloseTo(0.9987, 3);
  });
});

describe('normalInvCDF', () => {
  it('returns 0 for p=0.5', () => {
    expect(normalInvCDF(0.5)).toBeCloseTo(0, 5);
  });

  it('returns correct values for known percentiles', () => {
    expect(normalInvCDF(0.8413)).toBeCloseTo(1, 2);
    expect(normalInvCDF(0.1587)).toBeCloseTo(-1, 2);
    expect(normalInvCDF(0.9772)).toBeCloseTo(2, 2);
    expect(normalInvCDF(0.0228)).toBeCloseTo(-2, 2);
  });

  it('is inverse of normalCDF', () => {
    for (const z of [-2, -1, 0, 1, 2]) {
      const p = normalCDF(z);
      const zRecovered = normalInvCDF(p);
      expect(zRecovered).toBeCloseTo(z, 3);
    }
  });

  it('throws for p outside (0, 1)', () => {
    expect(() => normalInvCDF(0)).toThrow();
    expect(() => normalInvCDF(1)).toThrow();
    expect(() => normalInvCDF(-0.1)).toThrow();
    expect(() => normalInvCDF(1.1)).toThrow();
  });
});

describe('percentileECDF', () => {
  it('calculates percentile with mid-rank for simple case', () => {
    const sorted = [1, 2, 3, 4, 5];
    // For x=3, rank range is [3, 3], avgRank=3, p=(3-0.5)/5=0.5
    expect(percentileECDF(3, sorted)).toBeCloseTo(0.5, 5);
  });

  it('handles ties correctly', () => {
    const sorted = [1, 2, 2, 2, 5];
    // For x=2, countLess=1, countEqual=3
    // avgRank = 1 + (3+1)/2 = 3
    // p = (3 - 0.5) / 5 = 0.5
    expect(percentileECDF(2, sorted)).toBeCloseTo(0.5, 5);
  });

  it('handles value below all grades', () => {
    const sorted = [10, 20, 30, 40, 50];
    // x=5 is below all, countLess=0, countEqual=0
    // p = 0.5 / 5 = 0.1
    expect(percentileECDF(5, sorted)).toBeCloseTo(0.1, 5);
  });

  it('handles value above all grades', () => {
    const sorted = [10, 20, 30, 40, 50];
    // x=60 is above all, countLess=5, countEqual=0
    // p = (5 - 0.5) / 5 = 0.9
    expect(percentileECDF(60, sorted)).toBeCloseTo(0.9, 5);
  });
});

describe('clamp', () => {
  it('clamps values correctly', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe('safePercentile', () => {
  it('clamps extreme percentiles', () => {
    expect(safePercentile(0)).toBeCloseTo(1e-6, 10);
    expect(safePercentile(1)).toBeCloseTo(1 - 1e-6, 10);
    expect(safePercentile(0.5)).toBe(0.5);
  });
});
