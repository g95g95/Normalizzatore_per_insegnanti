export default function AboutTab() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
          About Grade Alchemy
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>
            Grade Alchemy is a statistical grade normalization tool designed to help educators
            fairly transform raw scores into standardized grades across different grading scales.
          </p>
          <p>
            The app provides three normalization methods, each with different characteristics
            for handling grade distributions:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-slate-100">Percentile + Gaussian:</strong> Maps students based
              on their relative ranking, using normal distribution properties
            </li>
            <li>
              <strong className="text-slate-100">Linear Z-Score:</strong> Direct linear transformation
              preserving the distance structure of the original scores
            </li>
            <li>
              <strong className="text-slate-100">Tanh Z-Score:</strong> Smooth squashing that reduces
              the impact of extreme outliers
            </li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
          How to Use
        </h2>
        <div className="space-y-4 text-slate-300">
          <ol className="list-decimal list-inside space-y-3 ml-4">
            <li>
              <strong className="text-slate-100">Set grade boundaries:</strong> Choose your target
              grading scale (e.g., 2-10, 0-100) using presets or custom values
            </li>
            <li>
              <strong className="text-slate-100">Enter class grades:</strong> Paste all the raw scores
              from your class, separated by commas, spaces, or newlines
            </li>
            <li>
              <strong className="text-slate-100">Enter student score:</strong> Input the specific
              score you want to normalize
            </li>
            <li>
              <strong className="text-slate-100">Choose a method:</strong> Select the normalization
              approach that best fits your needs
            </li>
            <li>
              <strong className="text-slate-100">View results:</strong> See the normalized grade
              along with detailed statistics and explanations
            </li>
          </ol>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-slate-100 mb-4 pb-2 border-b border-slate-700">
          Technical Details
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>
            This application uses a client-server architecture for consistent, testable
            mathematical computations:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong className="text-slate-100">Frontend:</strong> React with TypeScript,
              styled with Tailwind CSS
            </li>
            <li>
              <strong className="text-slate-100">Backend:</strong> Node.js with Express,
              handling all statistical calculations
            </li>
            <li>
              <strong className="text-slate-100">Math:</strong> Implements standard statistical
              functions including normal CDF/inverse CDF using Acklam's approximation
            </li>
            <li>
              <strong className="text-slate-100">Validation:</strong> Zod schemas for type-safe
              request/response handling
            </li>
          </ul>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-primary-500/10 to-accent-500/10">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          Notes on Statistical Decisions
        </h2>
        <div className="space-y-4 text-slate-300 text-sm">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              We use <strong>sample standard deviation</strong> (n-1 denominator) for unbiased
              estimation
            </li>
            <li>
              Percentiles are calculated using <strong>mid-rank adjustment</strong> for better
              estimation at the tails
            </li>
            <li>
              For the Gaussian mapping, we use <strong>±3 sigma</strong> as the practical range,
              clamping the ~0.26% of extreme values
            </li>
            <li>
              When all grades are identical (σ=0), we return the <strong>midpoint grade</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
