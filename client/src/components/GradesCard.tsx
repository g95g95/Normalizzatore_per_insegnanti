import { useRef } from 'react';
import { useLanguage } from '../i18n';

interface Props {
  gradesText: string;
  onChange: (value: string) => void;
  parsedCount: number;
  parseErrors: string[];
  sourceScale: number;
  onSourceScaleChange: (value: number) => void;
}

const SOURCE_SCALE_PRESETS = [
  { label: '/10', value: 10 },
  { label: '/30', value: 30 },
  { label: '/100', value: 100 },
  { label: '/20', value: 20 },
];

export default function GradesCard({
  gradesText,
  onChange,
  parsedCount,
  parseErrors,
  sourceScale,
  onSourceScaleChange,
}: Props) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      onChange(text);
    } catch (err) {
      console.error('Error reading file:', err);
    }

    // Reset input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      onChange(text);
    } catch (err) {
      console.error('Error reading file:', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {t('classGrades')}
      </h2>

      <div className="space-y-4">
        {/* Source Scale Selector */}
        <div>
          <label className="input-label">{t('sourceGradeScale')}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {SOURCE_SCALE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onSourceScaleChange(preset.value)}
                className={`btn-secondary text-sm ${
                  sourceScale === preset.value ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">{t('customScale')}</span>
            <input
              type="number"
              value={sourceScale}
              onChange={(e) => onSourceScaleChange(parseFloat(e.target.value) || 10)}
              className="input-field w-24 text-sm"
              min="1"
              step="any"
            />
            <span className="text-slate-400 text-sm">{t('pointsMax')}</span>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="input-label">{t('uploadFromFile')}</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-slate-600 hover:border-primary-500/50 rounded-lg p-4 text-center transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.tsv,.dat,text/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <svg className="w-8 h-8 mx-auto mb-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-slate-400 text-sm">
              {t('dragAndDrop')} <span className="text-primary-400">{t('clickToBrowse')}</span>
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {t('supportsFiles')}
            </p>
          </div>
        </div>

        {/* Manual Input */}
        <div>
          <label className="input-label">{t('orPasteManually')}</label>
          <textarea
            value={gradesText}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., 25, 28, 30, 22, 27..."
            className="input-field h-28 resize-none font-mono text-sm"
          />
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {parsedCount > 0 ? (
              <>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300">
                  {parsedCount} {t('gradesParsed')}
                </span>
                <span className="text-slate-400">
                  ({t('scale')}: /{sourceScale})
                </span>
                {parsedCount < 2 && (
                  <span className="text-amber-400">{t('needAtLeast2')}</span>
                )}
              </>
            ) : (
              <span className="text-slate-400">{t('enterGradesToBegin')}</span>
            )}
          </div>
        </div>

        {parseErrors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm font-medium mb-1">{t('parseErrors')}</p>
            <ul className="text-red-300 text-sm space-y-0.5">
              {parseErrors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
              {parseErrors.length > 5 && (
                <li>...{t('andMore').replace('{count}', String(parseErrors.length - 5))}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
