import type { NormalizeBulkResponse } from '../types';
import { formatNumber } from '../utils';
import { useLanguage } from '../i18n';

interface Props {
  bulkResult: NormalizeBulkResponse;
  sourceScale: number;
  targetMin: number;
  targetMax: number;
}

export default function BulkResultsCard({ bulkResult, sourceScale, targetMin, targetMax }: Props) {
  const { language } = useLanguage();

  const exportCSV = () => {
    const headers = language === 'it'
      ? ['Voto Originale', 'Voto Normalizzato', 'Limitato']
      : ['Original Grade', 'Normalized Grade', 'Clamped'];

    const rows = bulkResult.results.map((r) => [
      r.original.toString(),
      formatNumber(r.normalized, 2),
      r.clamped ? (language === 'it' ? 'Si' : 'Yes') : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    downloadFile(csv, 'normalized_grades.csv', 'text/csv');
  };

  const exportJSON = () => {
    const data = {
      sourceScale,
      targetRange: { min: targetMin, max: targetMax },
      stats: bulkResult.stats,
      results: bulkResult.results,
    };
    downloadFile(JSON.stringify(data, null, 2), 'normalized_grades.json', 'application/json');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sortedResults = [...bulkResult.results].sort((a, b) => b.original - a.original);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-title mb-0">
          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {language === 'it' ? 'Tutti i Voti Normalizzati' : 'All Normalized Grades'}
        </h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </button>
          <button onClick={exportJSON} className="btn-secondary text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            JSON
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="stat-box">
          <div className="stat-label">{language === 'it' ? 'Media Originale' : 'Original Mean'}</div>
          <div className="stat-value">{formatNumber(bulkResult.stats.mu)} /{sourceScale}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">{language === 'it' ? 'Dev. Std' : 'Std Dev'}</div>
          <div className="stat-value">{formatNumber(bulkResult.stats.sigma)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">{language === 'it' ? 'Totale Voti' : 'Total Grades'}</div>
          <div className="stat-value">{bulkResult.stats.n}</div>
        </div>
      </div>

      {/* Results table */}
      <div className="overflow-x-auto max-h-64 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800">
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-3 text-slate-400 font-medium">
                {language === 'it' ? 'Originale' : 'Original'} (/{sourceScale})
              </th>
              <th className="text-left py-2 px-3 text-slate-400 font-medium">
                {language === 'it' ? 'Normalizzato' : 'Normalized'} ({targetMin}-{targetMax})
              </th>
              <th className="text-center py-2 px-3 text-slate-400 font-medium">
                {language === 'it' ? 'Stato' : 'Status'}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((r, i) => (
              <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-2 px-3 font-mono">{formatNumber(r.original, 1)}</td>
                <td className="py-2 px-3 font-mono font-semibold text-primary-300">
                  {formatNumber(r.normalized, 2)}
                </td>
                <td className="py-2 px-3 text-center">
                  {r.clamped ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs">
                      {language === 'it' ? 'Limitato' : 'Clamped'}
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
