# CLAUDE.md — Grade Normalization Web App (React, Frontend-Only)

## Goal

Build a simple-but-fancy web app that lets a user:

1) Enter a class grade dataset (raw scores).
2) Enter the raw score of a specific student.
3) Choose normalization method:
   - Percentile → mapped through a Gaussian (inverse CDF) OR "pure percentile mapping"
   - Linear z-score mapping
   - Squashed z-score mapping via tanh
4) Choose grade boundaries (e.g., 2–10, 1–9, 0–30, etc.).
5) Instantly get the normalized grade + explanation.
6) Open a "Theory behind" tab with clean math explanations for each method.

Tone/UI: modern, minimal, a bit "fancy" (cards, tabs, charts), but still readable.

---

## Stack & Project Layout

- **Frontend-only architecture** (v2.0)
- Monorepo with two folders:
  - `/client` React (Vite) + TypeScript (UI + math logic)
  - `/shared` Zod schemas and types
- Styling: TailwindCSS
- Charts: Recharts
- Validation: Zod
- Testing: Vitest + React Testing Library

### Why frontend-only?

All math computations run directly in the browser. This provides:
- **Zero latency** - no HTTP round trips
- **Free hosting** - deploy as static site anywhere (Render, Netlify, Vercel, GitHub Pages)
- **No cold starts** - instant response, always available
- **Offline capable** - works without internet after initial load

The math functions are in `client/src/lib/math.ts` and `client/src/lib/normalization.ts`, fully tested.

---

## Core Concepts & Inputs

### Inputs (User)

- Grade boundaries:
  - `minGrade` (float) e.g. 2
  - `maxGrade` (float) e.g. 10
- Class grades dataset:
  - Either: paste list (CSV/space/newline separated)
  - Or: drag & drop file upload (.txt, .csv, .json)
- Student raw score:
  - `x` (float)
- Method choice:
  - `"percentile_gaussian" | "z_linear" | "z_tanh"`
- Extra method parameters:
  - For z-mappings: `k` (scale factor, default 2.0) to control spread
  - For tanh: `alpha` (default 1.0) controls squashing strength
  - For percentile method:
    - `percentileMode`: `"empirical"` (use class ECDF) OR `"gaussian_assumed"` (use mean/sigma normal CDF)

### Outputs (App)

- Normalized grade `g` within [minGrade, maxGrade]
- Intermediate values:
  - `mu`, `sigma`
  - `z` if relevant
  - `p` percentile in [0,1]
  - `g_raw` before clamping (for transparency)
- A short textual explanation in UI

---

## Statistical Computations

### Mean & Std

Given class sample values `{x_i}`:
- `mu = (1/n) * Σ x_i`
- Sample std (unbiased): `sigma = sqrt( (1/(n-1)) * Σ (x_i - mu)^2 )`

Edge cases:
- If `n < 2`, sigma is undefined → handle with error message.
- If `sigma == 0`, all class grades identical:
  - z-score methods: treat z=0 for everyone (or return midpoint grade).
  - percentile methods: everyone is 50th percentile.

---

## Normalization Methods

Let boundaries be:
- `A = minGrade`
- `B = maxGrade`
- `range = (B - A)`

Always clamp final grade:
- `g = clamp(g_raw, A, B)` with clamp defined as `max(A, min(B, value))`.

### 1) Percentile + Gaussian mapping

Two possible percentile sources (UI toggle, default empirical):

#### 1a) Empirical percentile (ECDF)
- Sort class grades.
- Define percentile with mid-rank: `p = (rank(x) - 0.5) / n`
- For ties: use average rank among equals.

#### 1b) Gaussian-assumed percentile
- `z = (x - mu) / sigma`
- `p = Φ(z)` where Φ is standard normal CDF.

Mapping:
- Convert percentile to standard normal quantile: `q = Φ^{-1}(p)`
- Map `q` from [-3, +3] to [A, B] linearly: `g_raw = A + range * ((q + 3) / 6)`

### 2) Linear z-score mapping

- `z = (x - mu) / sigma`
- `g_raw = A + range * ((z + k) / (2*k))`
- Default `k = 2` means: z=-2 → A, z=+2 → B.

### 3) Squashed z-score with tanh

- `s = tanh(alpha * z)`
- `g_raw = A + range * ((s + 1) / 2)`

---

## Implementation Details: Math Functions

Located in `client/src/lib/math.ts`:
- `mean(grades)`
- `sampleStd(grades)`
- `zScore(x, mu, sigma)`
- `normalCDF(z)` - using error function approximation
- `normalInvCDF(p)` - Acklam's approximation
- `percentileECDF(x, gradesSorted)` - with tie-average rank
- `clamp(value, min, max)`
- `safePercentile(p)` - clamps to avoid infinite quantiles

Normalization in `client/src/lib/normalization.ts`:
- `normalize(grades, x, minGrade, maxGrade, method, params)` - single grade
- `normalizeBulk(grades, minGrade, maxGrade, method, params)` - all grades
- `calculateStats(grades)` - dataset statistics

---

## Testing Requirements

Client tests in `client/src/lib/`:
- `math.test.ts` - unit tests for all math functions
- `normalization.test.ts` - integration tests for normalization methods

Test cases include:
- Known dataset: mu=30, sigma=5, x=34 ⇒ z=0.8
- Linear z with A=2,B=10,k=2
- Tanh with alpha=1
- Percentile inverse CDF
- Edge cases (sigma=0, extreme values)

Run tests: `npm run test`

---

## Additional Features Implemented

### File Upload for Grades
- Support for drag & drop file upload
- Accepts .txt, .csv, and .json files
- Automatically parses numbers from uploaded files

### Source Scale Selector
- Dropdown to select the source grading scale (/10, /30, /100, or custom)
- Helps users understand the context of their input grades

### Internationalization (i18n)
- Full support for English and Italian
- Instant language switching via header toggle
- All UI text, labels, and explanations are translated

### Bulk Normalization
- Normalizes all grades in the dataset at once
- Returns array of results with original/normalized/clamped status
- Includes dataset statistics (mu, sigma, n)

### Export Functionality
- Export normalized results to CSV
- Export normalized results to JSON
- Includes all metadata (source scale, target range, stats)

### Chart Tabs
- Toggle between Raw and Normalized distributions
- Visual comparison of grade distributions before/after normalization

---

## Deployment

This is a **static site** - deploy anywhere that serves static files!

### render.yaml Configuration (Static Site)

```yaml
services:
  - type: static
    name: grade-alchemy
    staticPublishPath: client/dist
    buildCommand: npm install && npm run build
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### Deployment Options

#### Render (Recommended)
1. Push repository to GitHub/GitLab
2. On Render: New > Static Site (or use Blueprint)
3. Connect repository
4. Build Command: `npm install && npm run build`
5. Publish Directory: `client/dist`

#### Netlify
1. Connect repository
2. Build Command: `npm install && npm run build`
3. Publish Directory: `client/dist`

#### Vercel
1. Connect repository
2. Framework Preset: Vite
3. Output Directory: `client/dist`

#### GitHub Pages
1. Build locally: `npm run build`
2. Deploy `client/dist` folder

### Benefits of Static Hosting
- **Free tier** - no usage limits on most platforms
- **No cold starts** - always instant
- **Global CDN** - fast worldwide
- **No server maintenance** - zero ops

---

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```
