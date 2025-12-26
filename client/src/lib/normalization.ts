/**
 * Normalization methods implementation
 */

import {
  mean,
  sampleStd,
  zScore,
  normalCDF,
  normalInvCDF,
  percentileECDF,
  clamp,
  safePercentile,
} from './math';
import type { NormalizationMethod, PercentileMode, NormalizeResponse, NormalizeBulkResponse, StatsResponse } from '../types';

interface NormalizationParams {
  k: number;
  alpha: number;
  percentileMode: PercentileMode;
}

/**
 * Perform grade normalization using the specified method
 */
export function normalize(
  grades: number[],
  x: number,
  minGrade: number,
  maxGrade: number,
  method: NormalizationMethod,
  params: NormalizationParams
): NormalizeResponse {
  const n = grades.length;
  const mu = mean(grades);
  const sigma = n >= 2 ? sampleStd(grades) : 0;
  const range = maxGrade - minGrade;

  // Handle sigma = 0 case
  if (sigma === 0) {
    const midpoint = minGrade + range / 2;
    return {
      normalized: midpoint,
      clamped: false,
      details: {
        mu,
        sigma: 0,
        n,
        z: 0,
        p: 0.5,
        g_raw: midpoint,
      },
      explanation: `All class grades are identical (${mu}). Normalization collapses to the midpoint grade (${midpoint.toFixed(2)}).`,
    };
  }

  switch (method) {
    case 'percentile_gaussian':
      return normalizePercentileGaussian(grades, x, minGrade, maxGrade, mu, sigma, params.percentileMode);
    case 'z_linear':
      return normalizeZLinear(grades, x, minGrade, maxGrade, mu, sigma, params.k);
    case 'z_tanh':
      return normalizeZTanh(grades, x, minGrade, maxGrade, mu, sigma, params.alpha);
    default:
      throw new Error(`Unknown normalization method: ${method}`);
  }
}

/**
 * Percentile + Gaussian mapping
 */
function normalizePercentileGaussian(
  grades: number[],
  x: number,
  minGrade: number,
  maxGrade: number,
  mu: number,
  sigma: number,
  percentileMode: PercentileMode
): NormalizeResponse {
  const n = grades.length;
  const range = maxGrade - minGrade;
  const sortedGrades = [...grades].sort((a, b) => a - b);

  let p: number;
  let z: number | undefined;

  if (percentileMode === 'empirical') {
    // ECDF-based percentile
    p = percentileECDF(x, sortedGrades);
  } else {
    // Gaussian-assumed percentile
    z = zScore(x, mu, sigma);
    p = normalCDF(z);
  }

  // Clamp percentile to avoid infinite quantile
  const pSafe = safePercentile(p);

  // Convert percentile to standard normal quantile
  const q = normalInvCDF(pSafe);

  // Map q from [-3, +3] to [minGrade, maxGrade]
  const g_raw = minGrade + range * ((q + 3) / 6);

  // Clamp final grade
  const normalized = clamp(g_raw, minGrade, maxGrade);
  const clamped = normalized !== g_raw;

  const modeLabel = percentileMode === 'empirical' ? 'empirical (ECDF)' : 'Gaussian-assumed';

  let explanation = `Your score is ${x}. `;
  explanation += `Class mean: μ = ${mu.toFixed(2)}, std: σ = ${sigma.toFixed(2)}. `;
  explanation += `Using ${modeLabel} percentile: p = ${(p * 100).toFixed(1)}%. `;
  explanation += `Standard normal quantile: q = ${q.toFixed(3)}. `;
  explanation += `Mapped q ∈ [-3, +3] to grade range [${minGrade}, ${maxGrade}]. `;
  if (clamped) {
    explanation += `Grade was clamped from ${g_raw.toFixed(2)} to ${normalized.toFixed(2)}.`;
  } else {
    explanation += `Final grade: ${normalized.toFixed(2)}.`;
  }

  return {
    normalized,
    clamped,
    details: {
      mu,
      sigma,
      n,
      z: percentileMode === 'gaussian_assumed' ? z : undefined,
      p,
      q,
      g_raw,
    },
    explanation,
  };
}

/**
 * Linear z-score mapping
 */
function normalizeZLinear(
  grades: number[],
  x: number,
  minGrade: number,
  maxGrade: number,
  mu: number,
  sigma: number,
  k: number
): NormalizeResponse {
  const n = grades.length;
  const range = maxGrade - minGrade;

  const z = zScore(x, mu, sigma);

  // Map z to grade: z=-k → minGrade, z=+k → maxGrade
  const g_raw = minGrade + range * ((z + k) / (2 * k));

  // Clamp final grade
  const normalized = clamp(g_raw, minGrade, maxGrade);
  const clamped = normalized !== g_raw;

  let explanation = `Your score is ${x}. `;
  explanation += `Class mean: μ = ${mu.toFixed(2)}, std: σ = ${sigma.toFixed(2)}. `;
  explanation += `Z-score: z = (${x} - ${mu.toFixed(2)}) / ${sigma.toFixed(2)} = ${z.toFixed(3)}. `;
  explanation += `Linear mapping with k = ${k}: z ∈ [-${k}, +${k}] → grade ∈ [${minGrade}, ${maxGrade}]. `;
  if (clamped) {
    explanation += `Grade was clamped from ${g_raw.toFixed(2)} to ${normalized.toFixed(2)}.`;
  } else {
    explanation += `Final grade: ${normalized.toFixed(2)}.`;
  }

  return {
    normalized,
    clamped,
    details: {
      mu,
      sigma,
      n,
      z,
      g_raw,
    },
    explanation,
  };
}

/**
 * Squashed z-score with tanh
 */
function normalizeZTanh(
  grades: number[],
  x: number,
  minGrade: number,
  maxGrade: number,
  mu: number,
  sigma: number,
  alpha: number
): NormalizeResponse {
  const n = grades.length;
  const range = maxGrade - minGrade;

  const z = zScore(x, mu, sigma);

  // Squash with tanh
  const s = Math.tanh(alpha * z);

  // Map s from (-1, 1) to [minGrade, maxGrade]
  const g_raw = minGrade + range * ((s + 1) / 2);

  // Clamp final grade (should rarely be needed with tanh)
  const normalized = clamp(g_raw, minGrade, maxGrade);
  const clamped = normalized !== g_raw;

  let explanation = `Your score is ${x}. `;
  explanation += `Class mean: μ = ${mu.toFixed(2)}, std: σ = ${sigma.toFixed(2)}. `;
  explanation += `Z-score: z = ${z.toFixed(3)}. `;
  explanation += `Tanh squash with α = ${alpha}: s = tanh(${alpha} × ${z.toFixed(3)}) = ${s.toFixed(3)}. `;
  explanation += `Mapped s ∈ (-1, +1) to grade ∈ [${minGrade}, ${maxGrade}]. `;
  explanation += `Final grade: ${normalized.toFixed(2)}.`;

  return {
    normalized,
    clamped,
    details: {
      mu,
      sigma,
      n,
      z,
      s,
      g_raw,
    },
    explanation,
  };
}

/**
 * Normalize all grades in a dataset (bulk normalization)
 */
export function normalizeBulk(
  grades: number[],
  minGrade: number,
  maxGrade: number,
  method: NormalizationMethod,
  params: NormalizationParams
): NormalizeBulkResponse {
  const n = grades.length;
  const mu = mean(grades);
  const sigma = n >= 2 ? sampleStd(grades) : 0;

  const results = grades.map((original) => {
    const result = normalize(grades, original, minGrade, maxGrade, method, params);
    return {
      original,
      normalized: result.normalized,
      clamped: result.clamped,
    };
  });

  return {
    results,
    stats: {
      mu,
      sigma,
      n,
    },
  };
}

/**
 * Calculate statistics for a dataset
 */
export function calculateStats(grades: number[]): StatsResponse {
  const n = grades.length;
  if (n === 0) {
    throw new Error('Cannot calculate stats of empty array');
  }

  const mu = mean(grades);
  const sigma = n >= 2 ? sampleStd(grades) : null;
  const sorted = [...grades].sort((a, b) => a - b);

  return {
    mu,
    sigma,
    n,
    sorted,
    min: sorted[0],
    max: sorted[n - 1],
  };
}
