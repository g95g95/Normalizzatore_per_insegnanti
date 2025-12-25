import { z } from 'zod';

// Normalization method types
export const NormalizationMethod = z.enum(['percentile_gaussian', 'z_linear', 'z_tanh']);
export type NormalizationMethod = z.infer<typeof NormalizationMethod>;

// Percentile mode for percentile_gaussian method
export const PercentileMode = z.enum(['empirical', 'gaussian_assumed']);
export type PercentileMode = z.infer<typeof PercentileMode>;

// Method parameters
export const MethodParams = z.object({
  k: z.number().min(0.5).max(5).default(2.0),
  alpha: z.number().min(0.2).max(3).default(1.0),
  percentileMode: PercentileMode.default('empirical'),
});
export type MethodParams = z.infer<typeof MethodParams>;

// Request schema for /api/normalize
export const NormalizeRequest = z.object({
  grades: z.array(z.number().finite()).min(2).max(10000),
  x: z.number().finite(),
  minGrade: z.number().finite(),
  maxGrade: z.number().finite(),
  method: NormalizationMethod,
  params: MethodParams.optional(),
}).refine((data) => data.minGrade < data.maxGrade, {
  message: 'minGrade must be less than maxGrade',
  path: ['minGrade'],
});
export type NormalizeRequest = z.infer<typeof NormalizeRequest>;

// Response details
export const NormalizeDetails = z.object({
  mu: z.number(),
  sigma: z.number(),
  n: z.number(),
  z: z.number().optional(),
  p: z.number().optional(),
  q: z.number().optional(),
  s: z.number().optional(),
  g_raw: z.number(),
});
export type NormalizeDetails = z.infer<typeof NormalizeDetails>;

// Response schema for /api/normalize
export const NormalizeResponse = z.object({
  normalized: z.number(),
  clamped: z.boolean(),
  details: NormalizeDetails,
  explanation: z.string(),
});
export type NormalizeResponse = z.infer<typeof NormalizeResponse>;

// Request schema for /api/stats
export const StatsRequest = z.object({
  grades: z.array(z.number().finite()).min(1).max(10000),
});
export type StatsRequest = z.infer<typeof StatsRequest>;

// Response schema for /api/stats
export const StatsResponse = z.object({
  mu: z.number(),
  sigma: z.number().nullable(),
  n: z.number(),
  sorted: z.array(z.number()),
  min: z.number(),
  max: z.number(),
});
export type StatsResponse = z.infer<typeof StatsResponse>;

// Error response
export const ErrorResponse = z.object({
  error: z.string(),
  details: z.any().optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;

// Grade boundary presets
export const GRADE_PRESETS = [
  { label: '2-10', minGrade: 2, maxGrade: 10 },
  { label: '1-9', minGrade: 1, maxGrade: 9 },
  { label: '0-100', minGrade: 0, maxGrade: 100 },
  { label: '0-30', minGrade: 0, maxGrade: 30 },
] as const;

// Request schema for /api/normalize-bulk (normalize all grades at once)
export const NormalizeBulkRequest = z.object({
  grades: z.array(z.number().finite()).min(2).max(10000),
  minGrade: z.number().finite(),
  maxGrade: z.number().finite(),
  method: NormalizationMethod,
  params: MethodParams.optional(),
}).refine((data) => data.minGrade < data.maxGrade, {
  message: 'minGrade must be less than maxGrade',
  path: ['minGrade'],
});
export type NormalizeBulkRequest = z.infer<typeof NormalizeBulkRequest>;

// Single normalized grade result
export const NormalizedGrade = z.object({
  original: z.number(),
  normalized: z.number(),
  clamped: z.boolean(),
});
export type NormalizedGrade = z.infer<typeof NormalizedGrade>;

// Response schema for /api/normalize-bulk
export const NormalizeBulkResponse = z.object({
  results: z.array(NormalizedGrade),
  stats: z.object({
    mu: z.number(),
    sigma: z.number(),
    n: z.number(),
  }),
});
export type NormalizeBulkResponse = z.infer<typeof NormalizeBulkResponse>;
