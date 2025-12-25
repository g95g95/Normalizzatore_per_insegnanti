import type { NormalizationMethod, PercentileMode, NormalizeResponse, StatsResponse, NormalizeBulkResponse } from './types';

const API_BASE = '/api';

export async function normalizeGrade(
  grades: number[],
  x: number,
  minGrade: number,
  maxGrade: number,
  method: NormalizationMethod,
  params: { k: number; alpha: number; percentileMode: PercentileMode }
): Promise<NormalizeResponse> {
  const response = await fetch(`${API_BASE}/normalize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grades,
      x,
      minGrade,
      maxGrade,
      method,
      params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to normalize grade');
  }

  return response.json();
}

export async function normalizeAllGrades(
  grades: number[],
  minGrade: number,
  maxGrade: number,
  method: NormalizationMethod,
  params: { k: number; alpha: number; percentileMode: PercentileMode }
): Promise<NormalizeBulkResponse> {
  const response = await fetch(`${API_BASE}/normalize-bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grades,
      minGrade,
      maxGrade,
      method,
      params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to normalize grades');
  }

  return response.json();
}

export async function getStats(grades: number[]): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE}/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grades }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get stats');
  }

  return response.json();
}
