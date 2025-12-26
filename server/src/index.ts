import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { chat, type ChatMessage } from './llm.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// LLM configuration from environment
const llmConfig = {
  provider: process.env.LLM_PROVIDER || 'openai',
  model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
  apiKey: process.env.LLM_API_KEY || '',
};

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    chatEnabled: !!llmConfig.apiKey,
    provider: llmConfig.provider,
    model: llmConfig.model,
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    if (!llmConfig.apiKey) {
      return res.status(503).json({
        error: 'Chat is not configured. Please set LLM_API_KEY environment variable.'
      });
    }

    const { messages } = req.body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await chat(messages, llmConfig);
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An error occurred'
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`LLM Provider: ${llmConfig.provider}`);
  console.log(`LLM Model: ${llmConfig.model}`);
  console.log(`Chat enabled: ${!!llmConfig.apiKey}`);
});
