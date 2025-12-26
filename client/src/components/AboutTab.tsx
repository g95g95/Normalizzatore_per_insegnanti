import { useLanguage } from '../i18n';

export default function AboutTab() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
          {t('aboutGradeAlchemy')}
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>{t('aboutDescription')}</p>
          <p>{t('aboutMethods')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-slate-100">{t('percentileGaussian')}:</strong>{' '}
              {t('percentileGaussianDesc')}
            </li>
            <li>
              <strong className="text-slate-100">{t('linearZScore')}:</strong>{' '}
              {t('linearZScoreDesc')}
            </li>
            <li>
              <strong className="text-slate-100">{t('tanhZScore')}:</strong>{' '}
              {t('tanhZScoreDesc')}
            </li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
          {t('howToUse')}
        </h2>
        <div className="space-y-4 text-slate-300">
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li>
              <strong className="text-slate-100">{t('gradeBoundaries')}:</strong>{' '}
              {t('step1')}
            </li>
            <li>
              <strong className="text-slate-100">{t('classGrades')}:</strong>{' '}
              {t('step2')}
            </li>
            <li>
              <strong className="text-slate-100">{t('studentScore')}:</strong>{' '}
              {t('step3')}
            </li>
            <li>
              <strong className="text-slate-100">{t('normalizationMethod')}:</strong>{' '}
              {t('step4')}
            </li>
            <li>
              <strong className="text-slate-100">{t('result')}:</strong>{' '}
              {t('step5')}
            </li>
          </ol>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
          {t('technicalDetails')}
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>{t('techDescription')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-slate-100">{t('frontend')}:</strong> React with TypeScript, styled with Tailwind CSS
            </li>
            <li>
              <strong className="text-slate-100">{t('math')}:</strong> Acklam's approximation for normal CDF/inverse CDF
            </li>
            <li>
              <strong className="text-slate-100">{t('validation')}:</strong> Zod schemas
            </li>
          </ul>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-primary-500/10 to-accent-500/10">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          {t('statisticalNotes')}
        </h2>
        <div className="space-y-4 text-slate-300 text-sm">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('sampleStdNote')}</li>
            <li>{t('midRankNote')}</li>
            <li>{t('gaussianRangeNote')}</li>
            <li>{t('sigmaZeroNote')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
