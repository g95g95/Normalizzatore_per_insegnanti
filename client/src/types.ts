import type { NormalizationMethod, PercentileMode, NormalizeResponse, StatsResponse, NormalizeBulkResponse, NormalizedGrade } from 'shared';

export type { NormalizationMethod, PercentileMode, NormalizeResponse, StatsResponse, NormalizeBulkResponse, NormalizedGrade };

export interface FormState {
  minGrade: number;
  maxGrade: number;
  gradesText: string;
  studentScore: string;
  method: NormalizationMethod;
  k: number;
  alpha: number;
  percentileMode: PercentileMode;
  sourceScale: number; // The scale of the input grades (e.g., 30 for /30, 100 for /100)
}

export interface ParsedGrades {
  grades: number[];
  errors: string[];
}
