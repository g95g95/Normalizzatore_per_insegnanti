import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { NormalizeRequest, StatsRequest, NormalizeBulkRequest } from 'shared';
import { normalize } from './normalization.js';
import { mean, sampleStd } from './math.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /api/normalize
app.post('/api/normalize', (req, res) => {
  try {
    const parseResult = NormalizeRequest.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors,
      });
      return;
    }

    const { grades, x, minGrade, maxGrade, method, params } = parseResult.data;

    const result = normalize(grades, x, minGrade, maxGrade, method, {
      k: params?.k ?? 2.0,
      alpha: params?.alpha ?? 1.0,
      percentileMode: params?.percentileMode ?? 'empirical',
    });

    res.json(result);
  } catch (error) {
    console.error('Normalization error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// POST /api/normalize-bulk - Normalize all grades at once
app.post('/api/normalize-bulk', (req, res) => {
  try {
    const parseResult = NormalizeBulkRequest.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors,
      });
      return;
    }

    const { grades, minGrade, maxGrade, method, params } = parseResult.data;

    const normalizedParams = {
      k: params?.k ?? 2.0,
      alpha: params?.alpha ?? 1.0,
      percentileMode: params?.percentileMode ?? 'empirical',
    };

    // Normalize each grade
    const results = grades.map((grade) => {
      const result = normalize(grades, grade, minGrade, maxGrade, method, normalizedParams);
      return {
        original: grade,
        normalized: result.normalized,
        clamped: result.clamped,
      };
    });

    // Get stats
    const mu = mean(grades);
    const sigma = sampleStd(grades);

    res.json({
      results,
      stats: {
        mu,
        sigma,
        n: grades.length,
      },
    });
  } catch (error) {
    console.error('Bulk normalization error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// POST /api/stats
app.post('/api/stats', (req, res) => {
  try {
    const parseResult = StatsRequest.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.errors,
      });
      return;
    }

    const { grades } = parseResult.data;
    const sorted = [...grades].sort((a, b) => a - b);
    const n = grades.length;
    const mu = mean(grades);
    const sigma = n >= 2 ? sampleStd(grades) : null;

    res.json({
      mu,
      sigma,
      n,
      sorted,
      min: sorted[0],
      max: sorted[n - 1],
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Serve static files in production
if (isProduction) {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🧪 Grade Alchemy server running on http://localhost:${PORT}`);
  if (isProduction) {
    console.log('📦 Serving static files from client/dist');
  }
});
