\# CLAUDE.md — Grade Normalization Web App (React + Node.js)



\## Goal

Build a simple-but-fancy web app that lets a user:

1\) Enter a class grade dataset (raw scores).

2\) Enter the raw score of a specific student.

3\) Choose normalization method:

&nbsp;  - Percentile → mapped through a Gaussian (inverse CDF) OR “pure percentile mapping” (see options below)

&nbsp;  - Linear z-score mapping

&nbsp;  - Squashed z-score mapping via tanh

4\) Choose grade boundaries (e.g., 2–10, 1–9, 0–30, etc.).

5\) Instantly get the normalized grade + explanation.

6\) Open a “Theory behind” tab with clean math explanations for each method.



Tone/UI: modern, minimal, a bit “fancy” (cards, tabs, charts), but still readable.



---



\## Stack \& Project Layout

\- Monorepo with two folders:

&nbsp; - `/server` Node.js + Express (API + math engine)

&nbsp; - `/client` React (Vite) + TypeScript (UI)

\- Styling: TailwindCSS

\- Charts: Recharts (client)

\- Validation: Zod (shared schemas)

\- Testing:

&nbsp; - server: Vitest (unit tests for normalization functions)

&nbsp; - client: Vitest + React Testing Library (basic rendering + form behavior)



\### Why server at all?

Math must be consistent and testable. Client calls server with the inputs; server returns computed normalized grade plus intermediate values (mean, sigma, z, percentile, etc.) so UI can display “how we got it”.



---



\## Core Concepts \& Inputs



\### Inputs (User)

\- Grade boundaries:

&nbsp; - `minGrade` (float) e.g. 2

&nbsp; - `maxGrade` (float) e.g. 10

\- Class grades dataset:

&nbsp; - Either: paste list (CSV/space/newline separated)

&nbsp; - Or: manual entry table (optional)

\- Student raw score:

&nbsp; - `x` (float)

\- Method choice:

&nbsp; - `"percentile\_gaussian" | "z\_linear" | "z\_tanh"`

\- Extra method parameters:

&nbsp; - For z-mappings: `k` (scale factor, default 2.0) to control spread

&nbsp; - For tanh: `alpha` (default 1.0) controls squashing strength

&nbsp; - For percentile method:

&nbsp;   - `percentileMode`: `"empirical"` (use class ECDF) OR `"gaussian\_assumed"` (use mean/sigma normal CDF)



\### Outputs (App)

\- Normalized grade `g` within \[minGrade, maxGrade]

\- Intermediate values:

&nbsp; - `mu`, `sigma`

&nbsp; - `z` if relevant

&nbsp; - `p` percentile in \[0,1]

&nbsp; - `g\_raw` before clamping (for transparency)

\- A short textual explanation in UI:

&nbsp; - “Your score is X, class mean is μ, std is σ, therefore z = …”

&nbsp; - “Mapped into grade range \[A,B] using …”



---



\## Statistical Computations



\### Mean \& Std

Given class sample values `{x\_i}`:

\- `mu = (1/n) \* Σ x\_i`

\- Sample std (unbiased): `sigma = sqrt( (1/(n-1)) \* Σ (x\_i - mu)^2 )`

Edge cases:

\- If `n < 2`, sigma is undefined → handle with error message.

\- If `sigma == 0`, all class grades identical:

&nbsp; - z-score methods: treat z=0 for everyone (or return midpoint grade).

&nbsp; - percentile methods: everyone is 50th percentile.



---



\## Normalization Methods (Implement EXACTLY)



Let boundaries be:

\- `A = minGrade`

\- `B = maxGrade`

\- `range = (B - A)`



Always clamp final grade:

\- `g = clamp(g\_raw, A, B)`

with clamp defined as `max(A, min(B, value))`.



\### 1) Percentile + Gaussian mapping



We need a percentile `p in \[0,1]`, then map to grade.



Two possible percentile sources (UI toggle, default empirical):

\#### 1a) Empirical percentile (ECDF)

\- Sort class grades.

\- Define percentile with mid-rank:

&nbsp; - `p = (rank(x) - 0.5) / n`

Where `rank(x)` is 1-based rank position of x in the sorted list.

For ties: use average rank among equals.



\#### 1b) Gaussian-assumed percentile

Assume class distribution is Normal(mu, sigma):

\- `z = (x - mu) / sigma`

\- `p = Φ(z)` where Φ is standard normal CDF.



Now the “pure gaussian distribution mapping”:

\- Convert percentile into a standard normal quantile:

&nbsp; - `q = Φ^{-1}(p)`  (inverse CDF)

Then map `q` into grade range via a smooth saturating map.

We must choose a practical mapping (quantiles are unbounded).



\*\*Required mapping\*\* (robust \& explainable):

\- Use ±3σ as “almost all” range in standard normal:

&nbsp; - Map `q` from \[-3, +3] to \[A, B] linearly, then clamp:

&nbsp; - `g\_raw = A + range \* ((q + 3) / 6)`



This is intuitive: the 0.13% tails get clamped.



Also show user:

\- `p`, `q`, and the fact that we clamp outside ±3.



\### 2) Linear z-score mapping

Compute:

\- `z = (x - mu) / sigma`



Map z into grade range using a configurable scale factor `k`:

\- Interpret `k` as “how many sigmas cover the full grade span”.

\- Default `k = 2` means: z=-2 → A, z=+2 → B.



Formula:

\- `g\_raw = A + range \* ((z + k) / (2\*k))`



Then clamp.



\### 3) Squashed z-score with tanh

Compute z as above, then squash:

\- `s = tanh(alpha \* z)`

where alpha controls steepness (default 1.0).



Map from s∈(-1,1) to \[A,B]:

\- `g\_raw = A + range \* ((s + 1) / 2)`



Then clamp (though tanh already keeps it in).



---



\## API Design (Server)



\### Endpoints

1\) `POST /api/normalize`

Request JSON:

```json

{

&nbsp; "grades": \[30, 28, 35, 40],

&nbsp; "x": 34,

&nbsp; "minGrade": 2,

&nbsp; "maxGrade": 10,

&nbsp; "method": "z\_linear",

&nbsp; "params": { "k": 2.0, "alpha": 1.0, "percentileMode": "empirical" }

}

Response JSON:



json

Copia codice

{

&nbsp; "normalized": 6.4,

&nbsp; "clamped": true,

&nbsp; "details": {

&nbsp;   "mu": 30.0,

&nbsp;   "sigma": 5.0,

&nbsp;   "z": 0.8,

&nbsp;   "p": 0.79,

&nbsp;   "q": 0.81,

&nbsp;   "g\_raw": 6.4

&nbsp; },

&nbsp; "explanation": "..."

}

POST /api/stats

Returns mu/sigma/n for dataset + sorted values (for chart).



Validation

Use Zod. Reject invalid:



Empty grades



n<2



minGrade >= maxGrade



non-finite numbers



grades array too big (set max 10k)



Security \& DX

CORS for dev



Rate limit optional



Meaningful error messages



Client UI Requirements

Layout

Single-page app with tabs:



Tab 1: Calculator



Tab 2: Theory behind



Tab 3: About / Notes (optional)



Use a header with app name:

“Grade Alchemy” (or similar mildly dramatic title).



Calculator Tab

Components (cards):



Boundaries Card



Inputs: minGrade, maxGrade



Quick presets dropdown: (2–10), (1–9), (0–100), (0–30)



Class Grades Card



Large textarea paste input



Helper text: “Paste numbers separated by commas/spaces/newlines.”



Show parsed count n and basic stats preview.



Student Score Card



Input x



Method Card



Radio buttons:



Percentile + Gaussian



Linear z-score



Tanh z-score



Parameter controls:



If z\_linear: slider/input for k (0.5 to 5, default 2)



If z\_tanh: slider/input for alpha (0.2 to 3, default 1)



If percentile: toggle percentileMode:



empirical (ECDF)



gaussian\_assumed (CDF)



Results Card



Big number output with 1–2 decimals



Show “clamped” badge if clamping happened



Show intermediate values in a neat grid:

mu, sigma, z, p, q, etc. only if applicable



Show a short explanation (from server)



Visualization

Include one simple chart:



Histogram of class grades + a vertical line at x

OR



Sorted grades curve with percentile marker

Use Recharts. Keep it clean.



UX/Validation

On invalid parsing: show which tokens failed.



If sigma=0: show message “All class grades identical; normalization collapses to midpoint.”



Compute on button click AND on debounced input change.



Theory Behind Tab (Content Spec)

Provide a well-formatted explanation section with formulas (rendered as LaTeX using KaTeX or MathJax).

Include:



Mean \& standard deviation with sample std.



Percentiles



ECDF definition and tie handling



Gaussian CDF definition if assumed



Normal CDF and inverse CDF



Explain Φ and Φ^{-1}



Mention why quantiles are unbounded → we clamp at ±3



Linear z mapping



Interpret k as “sigma span”



Provide intuition: z=0 maps to midpoint



Tanh squash



Why it reduces extreme outliers influence



Show tanh shape and that it asymptotically approaches limits



Also add a short “When to use what” section:



Percentile: best for ranking fairness



Linear z: preserves distance structure



Tanh: robust against outliers



Edge Cases \& Decisions (Must Implement)

If student x is outside observed grade range, that’s allowed; mapping handles it.



If percentiles produce p=0 or p=1 exactly, adjust slightly to avoid infinite quantile:



p = clamp(p, 1e-6, 1 - 1e-6) before Φ^{-1}



For ECDF ties, use average rank.



Always clamp final grade.



Allow decimals everywhere.



Implementation Details: Math Functions

Server must include:



mean(grades)



sampleStd(grades)



zScore(x, mu, sigma)



normalCDF(z) and normalInvCDF(p)



Implement via a stable approximation (e.g., Acklam approximation) with tests.



percentileECDF(x, gradesSorted) with tie-average rank.



Testing Requirements

Server unit tests:



Known dataset: mu=30, sigma=5, x=34 ⇒ z=0.8



Linear z with A=2,B=10,k=2:



g\_raw = 2 + 8\*((0.8+2)/4)=2+8\*(0.7)=7.6



Tanh with alpha=1:



s=tanh(0.8)≈0.664, g≈2+8\*(0.832)=8.656 (approx check)



Percentile inverse CDF:



p=0.5 ⇒ q≈0 ⇒ g≈midpoint

Client tests:



Parsing works for comma/newline.



Boundaries validation blocks inverted bounds.



Method toggles show correct parameters.



Deliverables

Full working app:



npm install \&\& npm run dev runs both client/server



npm run test runs tests



Clean README with usage and math notes.



Deployed-ready build scripts.



Extra Polish (If time)

"Shareable link" encodes inputs in URL query params.



Export result as JSON or CSV. ✅ IMPLEMENTED



Dark mode toggle.



Non-goals

Authentication



Persistent database



Overcomplicated styling framework beyond Tailwind



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
- New endpoint: POST /api/normalize-bulk
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



## Deployment on Render

This application is configured for deployment on [Render](https://render.com).

### Architecture

In production mode (`NODE_ENV=production`):
1. The Express server serves the React client as static files from `client/dist`
2. API endpoints remain available at `/api/*`
3. All non-API routes serve `index.html` for SPA routing
4. Health check available at `/api/health`

### render.yaml Configuration

The project includes a `render.yaml` Blueprint file with:
- **Service Type:** Web Service
- **Environment:** Node.js
- **Region:** Frankfurt (EU)
- **Plan:** Free tier
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Health Check:** `/api/health`

### Deployment Steps

#### Option 1: Blueprint (Recommended)
1. Push repository to GitHub/GitLab
2. On Render: New > Blueprint
3. Connect repository
4. Render auto-detects render.yaml
5. Click Apply

#### Option 2: Manual
1. Create Web Service on Render
2. Connect repository
3. Set Build Command: `npm install && npm run build`
4. Set Start Command: `npm run start`
5. Add ENV: `NODE_ENV=production`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | production/development | development |
| PORT | Server port (Render sets automatically) | 3001 |

### Post-Deployment

- App URL: `https://your-app-name.onrender.com`
- Health: `/api/health`
- Note: Free tier spins down after inactivity

