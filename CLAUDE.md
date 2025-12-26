# CLAUDE.md — Grade Normalization Web App (React + Node.js)

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
7) Consult an AI chatbot for questions about grade normalization.

Tone/UI: modern, minimal, a bit "fancy" (cards, tabs, charts), but still readable.

---

## Stack & Project Layout

- **Hybrid architecture** (v2.1)
- Monorepo with three folders:
  - `/client` React (Vite) + TypeScript (UI + math logic)
  - `/server` Node.js + Express (AI chatbot API only)
  - `/shared` Zod schemas and types
- Styling: TailwindCSS
- Charts: Recharts
- Validation: Zod
- Testing: Vitest + React Testing Library

### Architecture Philosophy

- **Math computations run in the browser** - zero latency, instant response
- **Backend exists only for the AI chatbot** - secure API key handling
- In production, the Express server serves the static frontend and provides the `/api/chat` endpoint
- The chatbot is optional - if environment variables are not configured, the app works without it

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

### AI Chatbot
- Floating chat button in bottom-right corner
- Answers questions about grade normalization methods
- Supports multiple LLM providers (OpenAI, Anthropic, Groq, Mistral)
- Bilingual (English/Italian based on app language)
- Gracefully disabled if environment variables not configured

---

## AI Chatbot Configuration

The chatbot requires environment variables to function:

| Variable | Description | Examples |
|----------|-------------|----------|
| `LLM_PROVIDER` | The LLM provider | `openai`, `anthropic`, `groq`, `mistral` |
| `LLM_MODEL` | Model name | `gpt-3.5-turbo`, `claude-3-haiku-20240307`, `llama-3.1-70b-versatile` |
| `LLM_API_KEY` | API key for the provider | `sk-...`, `sk-ant-...`, `gsk_...` |

See `.env.example` for configuration templates.

### Server Implementation

Located in `/server/src/`:
- `index.ts` - Express server with `/api/chat` endpoint and static file serving
- `llm.ts` - LLM provider abstraction supporting OpenAI, Anthropic, Groq, Mistral

The server includes a system prompt that instructs the AI to be a grade normalization expert.

---

## Deployment

This is a **web service** (Node.js) that also serves static files.

### render.yaml Configuration

```yaml
services:
  - type: web
    name: grade-alchemy
    env: node
    region: frankfurt
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: LLM_PROVIDER
        sync: false
      - key: LLM_MODEL
        sync: false
      - key: LLM_API_KEY
        sync: false
    healthCheckPath: /api/health
```

### Deployment on Render

1. Push repository to GitHub/GitLab
2. On Render: New > Blueprint (or Web Service)
3. Connect repository
4. Configure environment variables for chatbot (optional)
5. Deploy

### Environment Variables on Render

After deployment, set these in Render Dashboard > Environment:
- `LLM_PROVIDER` - e.g., `openai`
- `LLM_MODEL` - e.g., `gpt-3.5-turbo`
- `LLM_API_KEY` - your API key

The chatbot will work once these are configured. Without them, the app functions normally but chat is disabled.

---

## Development

```bash
# Install dependencies
npm install

# Run development servers (client + server concurrently)
npm run dev

# Run only client
npm run dev:client

# Run only server
npm run dev:server

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm run start
```

For local chatbot testing, create a `.env` file in the root directory based on `.env.example`.
