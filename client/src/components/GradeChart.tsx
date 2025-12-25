import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { createHistogramBins } from '../utils';
import type { NormalizeBulkResponse } from '../types';
import { useLanguage } from '../i18n';

interface Props {
  grades: number[];
  studentScore: number;
  sourceScale: number;
  bulkResult: NormalizeBulkResponse | null;
  targetMin: number;
  targetMax: number;
}

type ChartTab = 'raw' | 'normalized';

export default function GradeChart({
  grades,
  studentScore,
  sourceScale,
  bulkResult,
  targetMin,
  targetMax,
}: Props) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<ChartTab>('raw');

  const rawBins = createHistogramBins(grades, 8);

  // Get normalized grades for histogram
  const normalizedGrades = bulkResult?.results.map((r) => r.normalized) || [];
  const normalizedBins = normalizedGrades.length > 0
    ? createHistogramBins(normalizedGrades, 8)
    : [];

  // Find normalized student score
  const normalizedStudentScore = bulkResult?.results.find(
    (r) => r.original === studentScore
  )?.normalized;

  const currentBins = activeTab === 'raw' ? rawBins : normalizedBins;
  const currentStudentScore = activeTab === 'raw' ? studentScore : normalizedStudentScore;
  const scaleLabel = activeTab === 'raw' ? `/${sourceScale}` : `${targetMin}-${targetMax}`;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-title mb-0">
          <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {language === 'it' ? 'Distribuzione dei Voti' : 'Grade Distribution'} ({scaleLabel})
        </h2>

        {/* Tabs */}
        {bulkResult && (
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'raw'
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'it' ? 'Originali' : 'Raw'}
            </button>
            <button
              onClick={() => setActiveTab('normalized')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'normalized'
                  ? 'bg-accent-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {language === 'it' ? 'Normalizzati' : 'Normalized'}
            </button>
          </div>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentBins} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="bin"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickLine={{ stroke: '#475569' }}
              axisLine={{ stroke: '#475569' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f1f5f9',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Bar
              dataKey="count"
              fill={activeTab === 'raw' ? 'url(#barGradientRaw)' : 'url(#barGradientNorm)'}
              radius={[4, 4, 0, 0]}
            />
            {currentStudentScore !== undefined && !isNaN(currentStudentScore) && (
              <ReferenceLine
                x={currentBins.find((b) => currentStudentScore >= b.min && currentStudentScore <= b.max)?.bin}
                stroke="#f472b6"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: `${language === 'it' ? 'Voto' : 'Score'}: ${currentStudentScore.toFixed(1)}`,
                  position: 'top',
                  fill: '#f472b6',
                  fontSize: 12,
                }}
              />
            )}
            <defs>
              <linearGradient id="barGradientRaw" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="barGradientNorm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d946ef" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded ${activeTab === 'raw' ? 'bg-gradient-to-b from-primary-500 to-indigo-500' : 'bg-gradient-to-b from-accent-500 to-purple-500'}`}></div>
          <span>
            {activeTab === 'raw'
              ? (language === 'it' ? 'Distribuzione originale' : 'Original distribution')
              : (language === 'it' ? 'Distribuzione normalizzata' : 'Normalized distribution')
            }
          </span>
        </div>
        {currentStudentScore !== undefined && !isNaN(currentStudentScore) && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-pink-400"></div>
            <span>{language === 'it' ? 'Punteggio studente' : 'Student score'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
