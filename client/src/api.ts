/**
 * API module - now uses local functions instead of HTTP calls
 * This provides the same interface but runs entirely in the browser
 */

import type { NormalizationMethod, PercentileMode, NormalizeResponse, StatsResponse, NormalizeBulkResponse } from './types';
import { normalize, normalizeBulk, calculateStats } from './lib/normalization';

export function normalizeGrade(
  grades: number[],
  x: number,
  minGrade: number,
  maxGrade: number,
  method: NormalizationMethod,
  params: { k: number; alpha: number; percentileMode: PercentileMode }
): NormalizeResponse {
  // Validation
  if (grades.length < 2) {
    throw new Error('Need at least 2 grades');
  }
  if (minGrade >= maxGrade) {
    throw new Error('minGrade must be less than maxGrade');
  }

  return normalize(grades, x, minGrade, maxGrade, method, params);
}

export function normalizeAllGrades(
  grades: number[],
  minGrade: number,
  maxGrade: number,
  method: NormalizationMethod,
  params: { k: number; alpha: number; percentileMode: PercentileMode }
): NormalizeBulkResponse {
  // Validation
  if (grades.length < 2) {
    throw new Error('Need at least 2 grades');
  }
  if (minGrade >= maxGrade) {
    throw new Error('minGrade must be less than maxGrade');
  }

  return normalizeBulk(grades, minGrade, maxGrade, method, params);
}

export function getStats(grades: number[]): StatsResponse {
  // Validation
  if (grades.length === 0) {
    throw new Error('Need at least 1 grade');
  }

  return calculateStats(grades);
}
