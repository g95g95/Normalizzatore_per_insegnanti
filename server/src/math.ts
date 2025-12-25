/**
 * Mathematical functions for grade normalization
 */

/**
 * Calculate the arithmetic mean of an array of numbers
 */
export function mean(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot calculate mean of empty array');
  }
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate the sample standard deviation (with Bessel's correction, n-1 denominator)
 */
export function sampleStd(values: number[]): number {
  if (values.length < 2) {
    throw new Error('Need at least 2 values to calculate sample standard deviation');
  }
  const mu = mean(values);
  const squaredDiffs = values.map((val) => (val - mu) ** 2);
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculate z-score
 */
export function zScore(x: number, mu: number, sigma: number): number {
  if (sigma === 0) {
    return 0;
  }
  return (x - mu) / sigma;
}

/**
 * Standard normal CDF using the error function approximation
 * Φ(z) = 0.5 * (1 + erf(z / sqrt(2)))
 */
export function normalCDF(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Error function approximation (Abramowitz and Stegun)
 */
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * Inverse standard normal CDF (Acklam's approximation)
 * Returns z such that Φ(z) = p
 */
export function normalInvCDF(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error('p must be in (0, 1)');
  }

  // Coefficients for Acklam's algorithm
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.383577518672690e2,
    -3.066479806614716e1,
    2.506628277459239e0,
  ];

  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];

  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838e0,
    -2.549732539343734e0,
    4.374664141464968e0,
    2.938163982698783e0,
  ];

  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    // Rational approximation for lower region
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    // Rational approximation for central region
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

/**
 * Calculate empirical percentile (ECDF) with mid-rank for ties
 * Returns percentile in [0, 1]
 */
export function percentileECDF(x: number, sortedGrades: number[]): number {
  const n = sortedGrades.length;
  if (n === 0) {
    throw new Error('Cannot calculate percentile of empty array');
  }

  // Find all positions where value equals x or is less than x
  let countLess = 0;
  let countEqual = 0;

  for (const grade of sortedGrades) {
    if (grade < x) {
      countLess++;
    } else if (grade === x) {
      countEqual++;
    }
  }

  // Mid-rank: average of (lowest rank, highest rank) for ties
  // rank is 1-based
  // For a value, its rank range is [countLess + 1, countLess + countEqual]
  // Average rank = countLess + (countEqual + 1) / 2
  // Percentile = (avgRank - 0.5) / n

  if (countEqual === 0) {
    // x is not in the dataset
    // If x is less than all values, percentile approaches 0
    // If x is greater than all values, percentile approaches 1
    // Use interpolation based on position
    if (countLess === 0) {
      return 0.5 / n; // Below all values
    } else if (countLess === n) {
      return (n - 0.5) / n; // Above all values
    } else {
      // Between values, interpolate
      return (countLess + 0.5) / n;
    }
  }

  const avgRank = countLess + (countEqual + 1) / 2;
  return (avgRank - 0.5) / n;
}

/**
 * Clamp a value to a range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Safe percentile clamping to avoid infinite quantiles
 */
export function safePercentile(p: number): number {
  return clamp(p, 1e-6, 1 - 1e-6);
}
