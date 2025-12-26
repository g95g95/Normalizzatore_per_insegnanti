import { useLanguage } from '../i18n';

interface Props {
  value: string;
  onChange: (value: string) => void;
  sourceScale: number;
}

export default function StudentScoreCard({ value, onChange, sourceScale }: Props) {
  const { t } = useLanguage();

  return (
    <div className="card">
      <h2 className="card-title">
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        {t('studentScore')}
      </h2>

      <div className="space-y-3">
        <div>
          <label className="input-label">{t('rawScoreToNormalize')} (/{sourceScale})</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`${t('enterScore')} (0-${sourceScale})`}
              className="input-field text-xl flex-1"
              step="any"
              min="0"
              max={sourceScale}
            />
            <span className="text-slate-400 text-lg">/ {sourceScale}</span>
          </div>
        </div>

        {value && !isNaN(parseFloat(value)) && (
          <div className="text-sm text-slate-400">
            {((parseFloat(value) / sourceScale) * 100).toFixed(1)}% {t('ofMaxScore')}
          </div>
        )}
      </div>
    </div>
  );
}
