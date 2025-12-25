# Grade Alchemy

A statistical grade normalization web application that transforms raw scores into standardized grades using various statistical methods.

## Features

- **Multiple Normalization Methods:**
  - Percentile + Gaussian mapping (empirical or assumed distribution)
  - Linear Z-score mapping with configurable sigma span
  - Tanh Z-score mapping for outlier-robust normalization

- **Flexible Grade Boundaries:** Support for any grading scale (2-10, 0-100, etc.)

- **Grade Input Options:**
  - Paste grades directly (comma/space/newline separated)
  - Upload from file (.txt, .csv, .json)
  - Drag & drop file support
  - Source scale selector (/10, /30, /100, etc.)

- **Bulk Normalization:**
  - Normalize all grades at once
  - Export results to CSV or JSON
  - View raw vs normalized distributions

- **Interactive UI:**
  - Real-time computation with debounced input
  - Visual histogram of grade distribution (raw/normalized tabs)
  - Detailed step-by-step explanations
  - LaTeX-rendered mathematical theory

- **Multilingual Support:**
  - English and Italian
  - Instant language switching

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers (both client and server)
npm run dev

# Run tests
npm test
```

The client runs on http://localhost:5173 and the server on http://localhost:3001.

## Project Structure

```
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── i18n/         # Internationalization
│   │   ├── api.ts        # API client
│   │   ├── utils.ts      # Helper functions
│   │   └── types.ts      # TypeScript types
│   └── ...
├── server/          # Node.js + Express backend
│   ├── src/
│   │   ├── math.ts           # Statistical functions
│   │   ├── normalization.ts  # Normalization methods
│   │   └── index.ts          # Express server
│   └── ...
├── shared/          # Shared Zod schemas and types
├── render.yaml      # Render deployment configuration
└── package.json     # Root package with workspace scripts
```

## API Endpoints

### POST /api/normalize

Normalizes a student score based on class distribution.

**Request:**
```json
{
  "grades": [30, 28, 35, 40],
  "x": 34,
  "minGrade": 2,
  "maxGrade": 10,
  "method": "z_linear",
  "params": { "k": 2.0, "alpha": 1.0, "percentileMode": "empirical" }
}
```

**Response:**
```json
{
  "normalized": 6.4,
  "clamped": false,
  "details": {
    "mu": 33.25,
    "sigma": 5.12,
    "z": 0.15,
    "g_raw": 6.3
  },
  "explanation": "Your score is 34..."
}
```

### POST /api/normalize-bulk

Normalizes all grades in the dataset at once.

**Request:**
```json
{
  "grades": [30, 28, 35, 40],
  "minGrade": 2,
  "maxGrade": 10,
  "method": "z_linear",
  "params": { "k": 2.0 }
}
```

**Response:**
```json
{
  "results": [
    { "original": 30, "normalized": 5.8, "clamped": false },
    { "original": 28, "normalized": 5.2, "clamped": false }
  ],
  "stats": { "mu": 33.25, "sigma": 5.12, "n": 4 }
}
```

### POST /api/stats

Returns statistics for a grade dataset.

### GET /api/health

Health check endpoint for monitoring.

## Normalization Methods

### 1. Percentile + Gaussian
Maps the student's percentile through the inverse normal CDF, then linearly to the grade range. Best for ranking fairness.

### 2. Linear Z-Score
Direct linear mapping of z-scores to grades. Parameter `k` controls how many standard deviations span the full grade range.

### 3. Tanh Z-Score
Squashes z-scores using tanh function. Parameter `alpha` controls squashing strength. Robust against outliers.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, TailwindCSS, Recharts, KaTeX
- **Backend:** Node.js, Express, TypeScript
- **Validation:** Zod
- **Testing:** Vitest, React Testing Library

## Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm test` - Run all tests
- `npm run test:server` - Run server tests only
- `npm run test:client` - Run client tests only
- `npm start` - Start the production server

---

## Deployment on Render

This application is configured for easy deployment on [Render](https://render.com).

### Option 1: Deploy with render.yaml (Recommended)

1. Fork or push this repository to GitHub/GitLab
2. Create a new account on [Render](https://render.com) if you don't have one
3. Click **New** > **Blueprint** in your Render dashboard
4. Connect your repository
5. Render will automatically detect the `render.yaml` file and configure the service
6. Click **Apply** to deploy

The `render.yaml` file configures:
- **Service Type:** Web Service
- **Environment:** Node.js
- **Region:** Frankfurt (EU)
- **Plan:** Free tier
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start`
- **Health Check:** `/api/health`

### Option 2: Manual Configuration

1. Create a new **Web Service** on Render
2. Connect your repository
3. Configure the following settings:

| Setting | Value |
|---------|-------|
| **Environment** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Environment Variables** | `NODE_ENV=production` |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Set to `production` for production builds | `development` |
| `PORT` | Server port (Render sets this automatically) | `3001` |

### How It Works

In production mode:
1. The build process compiles both server and client
2. The Express server serves the React client as static files from `client/dist`
3. API endpoints remain available at `/api/*`
4. All other routes serve `index.html` for SPA routing

### Post-Deployment

After deployment:
- Your app will be available at `https://your-app-name.onrender.com`
- The health check endpoint is at `/api/health`
- Free tier services spin down after inactivity; first request may be slow

---

## Distribuzione su Render (Italian)

Questa applicazione è configurata per una distribuzione semplice su [Render](https://render.com).

### Opzione 1: Deploy con render.yaml (Consigliato)

1. Fai un fork o carica questo repository su GitHub/GitLab
2. Crea un account su [Render](https://render.com) se non ne hai uno
3. Clicca **New** > **Blueprint** nella dashboard di Render
4. Connetti il tuo repository
5. Render rileverà automaticamente il file `render.yaml` e configurerà il servizio
6. Clicca **Apply** per distribuire

### Opzione 2: Configurazione Manuale

1. Crea un nuovo **Web Service** su Render
2. Connetti il tuo repository
3. Configura le seguenti impostazioni:

| Impostazione | Valore |
|--------------|--------|
| **Environment** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Environment Variables** | `NODE_ENV=production` |

### Come Funziona

In modalità produzione:
1. Il processo di build compila sia server che client
2. Il server Express serve il client React come file statici da `client/dist`
3. Gli endpoint API rimangono disponibili su `/api/*`
4. Tutte le altre route servono `index.html` per il routing SPA

### Dopo la Distribuzione

Dopo la distribuzione:
- L'app sarà disponibile su `https://nome-tua-app.onrender.com`
- L'endpoint di health check è `/api/health`
- I servizi del piano gratuito si spengono dopo inattività; la prima richiesta potrebbe essere lenta
