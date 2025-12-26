import type { NormalizeResponse } from '../types';
import { formatNumber } from '../utils';
import { useLanguage } from '../i18n';

interface Props {
  result: NormalizeResponse | null;
  error: string | null;
  loading: boolean;
  sourceScale: number;
}

export default function ResultsCard({ result, error, loading, sourceScale }: Props) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-500/30">
        <div className="flex items-center gap-3 text-red-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card">
        <div className="text-center py-12 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p>{t('enterGradesAndScore')}</p>
        </div>
      </div>
    );
  }

  const { normalized, clamped, details, explanation } = result;

  return (
    <div className="card">
      <h2 className="card-title">
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t('result')}
      </h2>

      <div className="space-y-6">
        {/* Main Result */}
        <div className="text-center py-4">
          <div className="result-value">{formatNumber(normalized, 2)}</div>
          {clamped && (
            <span className="inline-block mt-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-sm rounded-full">
              {t('clamped')}
            </span>
          )}
        </div>

        {/* Intermediate Values */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="stat-box">
            <div className="stat-label">{t('mean')} (/{sourceScale})</div>
            <div className="stat-value">{formatNumber(details.mu)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">{t('stdDev')}</div>
            <div className="stat-value">{formatNumber(details.sigma)}</div>
          </div>
          {details.z !== undefined && (
            <div className="stat-box">
              <div className="stat-label">{t('zScore')}</div>
              <div className="stat-value">{formatNumber(details.z, 3)}</div>
            </div>
          )}
          {details.p !== undefined && (
            <div className="stat-box">
              <div className="stat-label">{t('percentile')}</div>
              <div className="stat-value">{formatNumber(details.p * 100, 1)}%</div>
            </div>
          )}
          {details.q !== undefined && (
            <div className="stat-box">
              <div className="stat-label">{t('quantile')}</div>
              <div className="stat-value">{formatNumber(details.q, 3)}</div>
            </div>
          )}
          {details.s !== undefined && (
            <div className="stat-box">
              <div className="stat-label">{t('tanh')}</div>
              <div className="stat-value">{formatNumber(details.s, 3)}</div>
            </div>
          )}
          <div className="stat-box">
            <div className="stat-label">{t('rawGrade')}</div>
            <div className="stat-value">{formatNumber(details.g_raw)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">{t('sampleSize')}</div>
            <div className="stat-value">{details.n}</div>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-2">{t('howWeGotHere')}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{explanation}</p>
        </div>
      </div>
    </div>
  );
}
