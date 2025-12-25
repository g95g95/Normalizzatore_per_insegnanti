import type { NormalizationMethod, PercentileMode } from '../types';

interface Props {
  method: NormalizationMethod;
  k: number;
  alpha: number;
  percentileMode: PercentileMode;
  onMethodChange: (value: NormalizationMethod) => void;
  onKChange: (value: number) => void;
  onAlphaChange: (value: number) => void;
  onPercentileModeChange: (value: PercentileMode) => void;
}

const methods: { value: NormalizationMethod; label: string; description: string }[] = [
  {
    value: 'percentile_gaussian',
    label: 'Percentile + Gaussian',
    description: 'Maps percentile through normal distribution',
  },
  {
    value: 'z_linear',
    label: 'Linear Z-Score',
    description: 'Linear mapping of z-scores to grade range',
  },
  {
    value: 'z_tanh',
    label: 'Tanh Z-Score',
    description: 'Squashed mapping, robust against outliers',
  },
];

export default function MethodCard({
  method,
  k,
  alpha,
  percentileMode,
  onMethodChange,
  onKChange,
  onAlphaChange,
  onPercentileModeChange,
}: Props) {
  return (
    <div className="card">
      <h2 className="card-title">
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Normalization Method
      </h2>

      <div className="space-y-4">
        {/* Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {methods.map((m) => (
            <button
              key={m.value}
              onClick={() => onMethodChange(m.value)}
              className={`radio-option text-left ${
                method === m.value ? 'radio-option-selected' : ''
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  method === m.value ? 'border-primary-500' : 'border-slate-500'
                }`}
              >
                {method === m.value && (
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                )}
              </div>
              <div>
                <div className="font-medium text-slate-100">{m.label}</div>
                <div className="text-xs text-slate-400">{m.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Method-specific Parameters */}
        <div className="pt-4 border-t border-slate-700">
          {method === 'z_linear' && (
            <div>
              <label className="input-label">
                k (sigma span): {k}
              </label>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={k}
                onChange={(e) => onKChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                z = -{k} maps to min grade, z = +{k} maps to max grade
              </p>
            </div>
          )}

          {method === 'z_tanh' && (
            <div>
              <label className="input-label">
                Alpha (squash strength): {alpha}
              </label>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={alpha}
                onChange={(e) => onAlphaChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Higher alpha = more aggressive squashing of extremes
              </p>
            </div>
          )}

          {method === 'percentile_gaussian' && (
            <div>
              <label className="input-label">Percentile Mode</label>
              <div className="flex gap-3">
                <button
                  onClick={() => onPercentileModeChange('empirical')}
                  className={`radio-option flex-1 ${
                    percentileMode === 'empirical' ? 'radio-option-selected' : ''
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      percentileMode === 'empirical' ? 'border-primary-500' : 'border-slate-500'
                    }`}
                  >
                    {percentileMode === 'empirical' && (
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-100">Empirical (ECDF)</div>
                    <div className="text-xs text-slate-400">Use actual class distribution</div>
                  </div>
                </button>
                <button
                  onClick={() => onPercentileModeChange('gaussian_assumed')}
                  className={`radio-option flex-1 ${
                    percentileMode === 'gaussian_assumed' ? 'radio-option-selected' : ''
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      percentileMode === 'gaussian_assumed' ? 'border-primary-500' : 'border-slate-500'
                    }`}
                  >
                    {percentileMode === 'gaussian_assumed' && (
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-100">Gaussian Assumed</div>
                    <div className="text-xs text-slate-400">Assume normal distribution</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
