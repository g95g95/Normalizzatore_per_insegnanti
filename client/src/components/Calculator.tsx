import { useState, useEffect, useCallback } from 'react';
import type { FormState, NormalizeResponse, NormalizeBulkResponse } from '../types';
import { parseGrades, debounce } from '../utils';
import { normalizeGrade, normalizeAllGrades } from '../api';
import { useLanguage } from '../i18n';
import BoundariesCard from './BoundariesCard';
import GradesCard from './GradesCard';
import StudentScoreCard from './StudentScoreCard';
import MethodCard from './MethodCard';
import ResultsCard from './ResultsCard';
import GradeChart from './GradeChart';
import BulkResultsCard from './BulkResultsCard';

const initialState: FormState = {
  minGrade: 2,
  maxGrade: 10,
  gradesText: '',
  studentScore: '',
  method: 'z_linear',
  k: 2,
  alpha: 1,
  percentileMode: 'empirical',
  sourceScale: 30,
};

export default function Calculator() {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>(initialState);
  const [result, setResult] = useState<NormalizeResponse | null>(null);
  const [bulkResult, setBulkResult] = useState<NormalizeBulkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedGrades, setParsedGrades] = useState<number[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  // Parse grades when text changes
  useEffect(() => {
    const { grades, errors } = parseGrades(form.gradesText);
    setParsedGrades(grades);
    setParseErrors(errors);
  }, [form.gradesText]);

  // Compute normalization (single + bulk)
  const compute = useCallback(async () => {
    if (parsedGrades.length < 2) {
      setError(parsedGrades.length === 0 ? null : t('needAtLeast2'));
      setResult(null);
      setBulkResult(null);
      return;
    }

    if (form.minGrade >= form.maxGrade) {
      setError(t('minLessThanMax'));
      setResult(null);
      setBulkResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        k: form.k,
        alpha: form.alpha,
        percentileMode: form.percentileMode,
      };

      // Always compute bulk normalization
      const bulkResponse = await normalizeAllGrades(
        parsedGrades,
        form.minGrade,
        form.maxGrade,
        form.method,
        params
      );
      setBulkResult(bulkResponse);

      // Compute single normalization if student score is provided
      const score = parseFloat(form.studentScore);
      if (!isNaN(score)) {
        const response = await normalizeGrade(
          parsedGrades,
          score,
          form.minGrade,
          form.maxGrade,
          form.method,
          params
        );
        setResult(response);
      } else {
        setResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult(null);
      setBulkResult(null);
    } finally {
      setLoading(false);
    }
  }, [parsedGrades, form, t]);

  // Debounced compute
  const debouncedCompute = useCallback(
    debounce(() => {
      compute();
    }, 300),
    [compute]
  );

  // Trigger computation when relevant values change
  useEffect(() => {
    debouncedCompute();
  }, [
    parsedGrades,
    form.studentScore,
    form.minGrade,
    form.maxGrade,
    form.method,
    form.k,
    form.alpha,
    form.percentileMode,
    debouncedCompute,
  ]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Boundaries + Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BoundariesCard
          minGrade={form.minGrade}
          maxGrade={form.maxGrade}
          onMinChange={(v) => updateForm('minGrade', v)}
          onMaxChange={(v) => updateForm('maxGrade', v)}
        />
        <div className="lg:col-span-2">
          <GradesCard
            gradesText={form.gradesText}
            onChange={(v) => updateForm('gradesText', v)}
            parsedCount={parsedGrades.length}
            parseErrors={parseErrors}
            sourceScale={form.sourceScale}
            onSourceScaleChange={(v) => updateForm('sourceScale', v)}
          />
        </div>
      </div>

      {/* Middle Row: Student Score + Method */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StudentScoreCard
          value={form.studentScore}
          onChange={(v) => updateForm('studentScore', v)}
          sourceScale={form.sourceScale}
        />
        <div className="lg:col-span-2">
          <MethodCard
            method={form.method}
            k={form.k}
            alpha={form.alpha}
            percentileMode={form.percentileMode}
            onMethodChange={(v) => updateForm('method', v)}
            onKChange={(v) => updateForm('k', v)}
            onAlphaChange={(v) => updateForm('alpha', v)}
            onPercentileModeChange={(v) => updateForm('percentileMode', v)}
          />
        </div>
      </div>

      {/* Single Result */}
      <ResultsCard
        result={result}
        error={error}
        loading={loading}
        sourceScale={form.sourceScale}
      />

      {/* Bulk Results with Export */}
      {bulkResult && (
        <BulkResultsCard
          bulkResult={bulkResult}
          sourceScale={form.sourceScale}
          targetMin={form.minGrade}
          targetMax={form.maxGrade}
        />
      )}

      {/* Chart with Raw/Normalized tabs */}
      {parsedGrades.length > 0 && (
        <GradeChart
          grades={parsedGrades}
          studentScore={parseFloat(form.studentScore)}
          sourceScale={form.sourceScale}
          bulkResult={bulkResult}
          targetMin={form.minGrade}
          targetMax={form.maxGrade}
        />
      )}
    </div>
  );
}
