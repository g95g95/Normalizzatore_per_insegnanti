/**
 * LLM Provider abstraction
 * Supports: openai, anthropic, groq, mistral
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMConfig {
  provider: string;
  model: string;
  apiKey: string;
}

export interface LLMResponse {
  content: string;
  error?: string;
}

const SYSTEM_PROMPT = `Sei un assistente esperto di statistica e normalizzazione dei voti scolastici.
Aiuti gli utenti a capire come funzionano i metodi di normalizzazione disponibili in questa app:

1. **Percentile + Gaussiana**: Mappa il percentile dello studente attraverso la distribuzione normale.
2. **Z-Score Lineare**: Mappatura lineare degli z-score nel range dei voti.
3. **Z-Score Tanh**: Mappatura compressa che riduce l'impatto degli outlier.

Rispondi in modo chiaro e conciso. Se ti chiedono di calcoli specifici, spiega i passaggi.
Puoi rispondere sia in italiano che in inglese, a seconda della lingua usata dall'utente.`;

async function callOpenAI(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content };
}

async function callAnthropic(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return { content: data.content[0].text };
}

async function callGroq(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${error}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content };
}

async function callMistral(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();
  return { content: data.choices[0].message.content };
}

export async function chat(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
  const provider = config.provider.toLowerCase();

  switch (provider) {
    case 'openai':
      return callOpenAI(messages, config);
    case 'anthropic':
      return callAnthropic(messages, config);
    case 'groq':
      return callGroq(messages, config);
    case 'mistral':
      return callMistral(messages, config);
    default:
      throw new Error(`Unknown LLM provider: ${provider}. Supported: openai, anthropic, groq, mistral`);
  }
}
