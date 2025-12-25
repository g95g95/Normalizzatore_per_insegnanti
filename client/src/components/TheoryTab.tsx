import { useEffect, useRef } from 'react';
import katex from 'katex';

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
  return (
    <div className="space-y-6">
      <Section title="Mean & Standard Deviation">
        <p className="text-slate-300 mb-4">
          Given a class with <Latex>n</Latex> grades <Latex>{`\\{x_1, x_2, \\ldots, x_n\\}`}</Latex>:
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">Arithmetic Mean</h3>
        <LatexBlock>{`\\mu = \\frac{1}{n} \\sum_{i=1}^{n} x_i`}</LatexBlock>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">Sample Standard Deviation</h3>
        <p className="text-slate-300 mb-2">
          We use Bessel's correction (dividing by <Latex>n-1</Latex>) for an unbiased estimate:
        </p>
        <LatexBlock>{`\\sigma = \\sqrt{\\frac{1}{n-1} \\sum_{i=1}^{n} (x_i - \\mu)^2}`}</LatexBlock>

        <div className="bg-slate-700/30 rounded-lg p-4 mt-4">
          <p className="text-slate-400 text-sm">
            <strong>Edge cases:</strong> If <Latex>n &lt; 2</Latex>, standard deviation is undefined.
            If <Latex>{`\\sigma = 0`}</Latex> (all grades identical), normalization returns the midpoint grade.
          </p>
        </div>
      </Section>

      <Section title="Z-Score">
        <p className="text-slate-300 mb-4">
          The z-score measures how many standard deviations a value is from the mean:
        </p>
        <LatexBlock>{`z = \\frac{x - \\mu}{\\sigma}`}</LatexBlock>
        <p className="text-slate-300">
          A z-score of 0 means the value equals the mean. Positive z-scores are above average,
          negative are below.
        </p>
      </Section>

      <Section title="Percentiles">
        <h3 className="text-lg font-medium text-slate-200 mb-2">Empirical Percentile (ECDF)</h3>
        <p className="text-slate-300 mb-4">
          The empirical cumulative distribution function uses the actual data to compute percentiles.
          With mid-rank adjustment for better estimation:
        </p>
        <LatexBlock>{`p = \\frac{\\text{rank}(x) - 0.5}{n}`}</LatexBlock>
        <p className="text-slate-300 mb-4">
          For ties, we use the average rank among equal values.
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">Gaussian-Assumed Percentile</h3>
        <p className="text-slate-300 mb-4">
          If we assume the class grades follow a normal distribution, the percentile is:
        </p>
        <LatexBlock>{`p = \\Phi(z) = \\Phi\\left(\\frac{x - \\mu}{\\sigma}\\right)`}</LatexBlock>
        <p className="text-slate-300">
          where <Latex>{`\\Phi`}</Latex> is the standard normal CDF.
        </p>
      </Section>

      <Section title="Normal Distribution">
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          Standard Normal CDF (<Latex>{`\\Phi`}</Latex>)
        </h3>
        <LatexBlock>{`\\Phi(z) = \\frac{1}{\\sqrt{2\\pi}} \\int_{-\\infty}^{z} e^{-t^2/2} \\, dt`}</LatexBlock>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">
          Inverse CDF (<Latex>{`\\Phi^{-1}`}</Latex>)
        </h3>
        <p className="text-slate-300 mb-4">
          The inverse CDF (quantile function) returns the z-value for a given probability:
        </p>
        <LatexBlock>{`z = \\Phi^{-1}(p)`}</LatexBlock>
        <p className="text-slate-300">
          Note: <Latex>{`\\Phi^{-1}(p)`}</Latex> is unbounded as <Latex>p</Latex> approaches 0 or 1.
          We clamp <Latex>p</Latex> to <Latex>{`[10^{-6}, 1-10^{-6}]`}</Latex> to avoid numerical issues.
        </p>
      </Section>

      <Section title="Normalization Methods">
        <p className="text-slate-300 mb-4">
          Let <Latex>A</Latex> be the minimum grade and <Latex>B</Latex> be the maximum grade.
          All methods clamp the final grade: <Latex>{`g = \\max(A, \\min(B, g_{\\text{raw}}))`}</Latex>
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">1. Percentile + Gaussian Mapping</h3>
        <p className="text-slate-300 mb-2">
          Convert the percentile to a standard normal quantile, then map to the grade range:
        </p>
        <LatexBlock>{`q = \\Phi^{-1}(p)`}</LatexBlock>
        <LatexBlock>{`g_{\\text{raw}} = A + (B-A) \\cdot \\frac{q + 3}{6}`}</LatexBlock>
        <p className="text-slate-300">
          This maps <Latex>q \in [-3, +3]</Latex> linearly to <Latex>[A, B]</Latex>.
          The 0.13% tails outside this range get clamped.
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">2. Linear Z-Score Mapping</h3>
        <p className="text-slate-300 mb-2">
          Map z-scores directly to grades using a scale factor <Latex>k</Latex>:
        </p>
        <LatexBlock>{`g_{\\text{raw}} = A + (B-A) \\cdot \\frac{z + k}{2k}`}</LatexBlock>
        <p className="text-slate-300">
          With default <Latex>k = 2</Latex>: z = -2 maps to <Latex>A</Latex>, z = +2 maps to <Latex>B</Latex>.
          The midpoint grade corresponds to z = 0 (the mean).
        </p>

        <h3 className="text-lg font-medium text-slate-200 mt-6 mb-2">3. Tanh Z-Score Mapping</h3>
        <p className="text-slate-300 mb-2">
          Squash z-scores using the hyperbolic tangent function:
        </p>
        <LatexBlock>{`s = \\tanh(\\alpha \\cdot z)`}</LatexBlock>
        <LatexBlock>{`g_{\\text{raw}} = A + (B-A) \\cdot \\frac{s + 1}{2}`}</LatexBlock>
        <p className="text-slate-300">
          The tanh function outputs values in <Latex>(-1, +1)</Latex>, naturally bounding
          the result. Parameter <Latex>{`\\alpha`}</Latex> controls steepness (default 1.0).
        </p>
      </Section>

      <Section title="When to Use What?">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-medium text-primary-400 mb-2">Percentile + Gaussian</h4>
            <p className="text-slate-400 text-sm">
              Best for <strong>ranking fairness</strong>. Preserves relative positions in the class.
              Good when you care about "what fraction of students did worse/better."
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-medium text-primary-400 mb-2">Linear Z-Score</h4>
            <p className="text-slate-400 text-sm">
              Preserves <strong>distance structure</strong>. A student 2 points above average
              gets the same grade bump regardless of where they are in the distribution.
            </p>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="font-medium text-primary-400 mb-2">Tanh Z-Score</h4>
            <p className="text-slate-400 text-sm">
              <strong>Robust against outliers</strong>. Extreme scores don't get extreme grades.
              The smooth saturation prevents any single student from getting too high or too low.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
