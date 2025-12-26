import { GRADE_PRESETS } from 'shared';
import { useLanguage } from '../i18n';

interface Props {
  minGrade: number;
  maxGrade: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export default function BoundariesCard({ minGrade, maxGrade, onMinChange, onMaxChange }: Props) {
  const { t } = useLanguage();

  const handlePreset = (preset: (typeof GRADE_PRESETS)[number]) => {
    onMinChange(preset.minGrade);
    onMaxChange(preset.maxGrade);
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {t('gradeBoundaries')}
      </h2>

      <div className="space-y-4">
        {/* Presets */}
        <div>
          <label className="input-label">{t('quickPresets')}</label>
          <div className="flex flex-wrap gap-2">
            {GRADE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset)}
                className={`btn-secondary text-sm ${
                  minGrade === preset.minGrade && maxGrade === preset.maxGrade
                    ? 'ring-2 ring-primary-500'
                    : ''
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="input-label">{t('minGrade')}</label>
            <input
              type="number"
              value={minGrade}
              onChange={(e) => onMinChange(parseFloat(e.target.value) || 0)}
              className="input-field"
              step="any"
            />
          </div>
          <div>
            <label className="input-label">{t('maxGrade')}</label>
            <input
              type="number"
              value={maxGrade}
              onChange={(e) => onMaxChange(parseFloat(e.target.value) || 0)}
              className="input-field"
              step="any"
            />
          </div>
        </div>

        {minGrade >= maxGrade && (
          <p className="text-red-400 text-sm">{t('minLessThanMax')}</p>
        )}
      </div>
    </div>
  );
}
