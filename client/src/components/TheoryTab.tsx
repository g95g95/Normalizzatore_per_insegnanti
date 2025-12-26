import { useEffect, useRef } from 'react';
import katex from 'katex';
import { useLanguage } from '../i18n';

function Latex({ children }: { children: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current && typeof children === 'string') {
      try {
        katex.render(children, ref.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch {
        ref.current.textContent = children;
      }
    }
  }, [children]);

  return <span ref={ref}>{typeof children !== 'string' ? String(children) : ''}</span>;
}

function LatexBlock({ children }: { children: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && typeof children === 'string') {
      try {
        katex.render(children, ref.current, {
          throwOnError: false,
          displayMode: true,
        });
      } catch {
        ref.current.textContent = children;
      }
    }
  }, [children]);

  return <div ref={ref} className="my-4 overflow-x-auto">{typeof children !== 'string' ? String(children) : ''}</div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 className="text-xl font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
        {title}
      </h2>
      <div className="prose prose-invert prose-slate max-w-none">
        {children}
      </div>
    </section>
  );
}

export default function TheoryTab() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Section title={t('meanAndStdDev')}>
        <p className="text-slate-300 mb-4">
          {t('givenClassWithN').replace('{n}', '')} <Latex>n</Latex> <Latex>{`\\{x_1, x_2, \\ldots, x_n\\}`}</Latex>:
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">{t('arithmeticMean')}</h3>
        <LatexBlock>{`\\mu = \\frac{1}{n} \\sum_{i=1}^{n} x_i`}</LatexBlock>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">{t('sampleStdDev')}</h3>
        <p className="text-slate-300 mb-2">
          {t('besselCorrection')}
        </p>
        <LatexBlock>{`\\sigma = \\sqrt{\\frac{1}{n-1} \\sum_{i=1}^{n} (x_i - \\mu)^2}`}</LatexBlock>

        <div className="bg-slate-700/30 rounded-lg p-4 mt-4">
          <p className="text-slate-400 text-sm">
            <strong>{t('edgeCases')}</strong> {t('edgeCasesText')}
          </p>
        </div>
      </Section>

      <Section title={t('zScoreTitle')}>
        <p className="text-slate-300 mb-4">
          {t('zScoreExplain')}
        </p>
        <LatexBlock>{`z = \\frac{x - \\mu}{\\sigma}`}</LatexBlock>
        <p className="text-slate-300">
          {t('zScoreMeaning')}
        </p>
      </Section>

      <Section title={t('percentiles')}>
        <h3 className="text-lg font-medium text-slate-200 mb-2">{t('empiricalPercentile')}</h3>
        <p className="text-slate-300 mb-4">
          {t('ecdfExplain')}
        </p>
        <LatexBlock>{`p = \\frac{\\text{rank}(x) - 0.5}{n}`}</LatexBlock>
        <p className="text-slate-300 mb-4">
          {t('tiesExplain')}
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">{t('gaussianAssumedPercentile')}</h3>
        <p className="text-slate-300 mb-4">
          {t('gaussianAssumedExplain')}
        </p>
        <LatexBlock>{`p = \\Phi(z) = \\Phi\\left(\\frac{x - \\mu}{\\sigma}\\right)`}</LatexBlock>
        <p className="text-slate-300">
          {t('wherePhiIs')}
        </p>
      </Section>

      <Section title={t('normalDistribution')}>
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          {t('standardNormalCDF')}
        </h3>
        <LatexBlock>{`\\Phi(z) = \\frac{1}{\\sqrt{2\\pi}} \\int_{-\\infty}^{z} e^{-t^2/2} \\, dt`}</LatexBlock>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">
          {t('inverseCDF')}
        </h3>
        <p className="text-slate-300 mb-4">
          {t('inverseCDFExplain')}
        </p>
        <LatexBlock>{`z = \\Phi^{-1}(p)`}</LatexBlock>
        <p className="text-slate-300">
          {t('unboundedNote')}
        </p>
      </Section>

      <Section title={t('normalizationMethods')}>
        <p className="text-slate-300 mb-4">
          {t('letABe')} <Latex>{`g = \\max(A, \\min(B, g_{\\text{raw}}))`}</Latex>
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">{t('percentileGaussianMapping')}</h3>
        <p className="text-slate-300 mb-2">
          {t('percentileGaussianExplain')}
        </p>
        <LatexBlock>{`q = \\Phi^{-1}(p)`}</LatexBlock>
        <LatexBlock>{`g_{\\text{raw}} = A + (B-A) \\cdot \\frac{q + 3}{6}`}</LatexBlock>
        <p className="text-slate-300">
          {t('mapsQLinear')}
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">{t('linearZMapping')}</h3>
        <p className="text-slate-300 mb-2">
          {t('linearZExplain')}
        </p>
        <LatexBlock>{`g_{\\text{raw}} = A + (B-A) \\cdot \\frac{z + k}{2k}`}</LatexBlock>
        <p className="text-slate-300">
          {t('withDefaultK')}
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">{t('tanhZMapping')}</h3>
        <p className="text-slate-300 mb-2">
          {t('tanhZExplain')}
        </p>
        <LatexBlock>{`s = \\tanh(\\alpha \\cdot z)`}</LatexBlock>
        <LatexBlock>{`g_{\\text{raw}} = A + (B-A) \\cdot \\frac{s + 1}{2}`}</LatexBlock>
        <p className="text-slate-300">
          {t('tanhOutputs')}
        </p>
      </Section>

      <Section title={t('whenToUseWhat')}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-medium text-primary-400 mb-2">{t('percentileGaussianWhen')}</h4>
            <p className="text-slate-400 text-sm">
              {t('percentileGaussianBest')}
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-medium text-primary-400 mb-2">{t('linearZWhen')}</h4>
            <p className="text-slate-400 text-sm">
              {t('linearZBest')}
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-medium text-primary-400 mb-2">{t('tanhZWhen')}</h4>
            <p className="text-slate-400 text-sm">
              {t('tanhZBest')}
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
