// Vercel Serverless Function for secure LLM calls
// This runs server-side, keeping API keys secure

const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini with server-side API key (new unified SDK)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

module.exports = async function handler(req, res) {
  // CORS headers
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3002',
    'https://apothecary-simulator.vercel.app',
    'https://apothecary-simulator-git-main-benjaminbreens-projects.vercel.app',
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[API] Request received:', {
      method: req.method,
      origin: req.headers.origin,
      hasBody: !!req.body
    });

    const { messages, temperature = 1.0, maxTokens = 1000, responseFormat } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      console.error('[API] Invalid messages format');
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    console.log('[API] Processing request with', messages.length, 'messages');

    // Build prompt (same format as existing code)
    const prompt = messages.map(msg => {
      if (msg.role === 'system') return `System: ${msg.content}`;
      if (msg.role === 'user') return `User: ${msg.content}`;
      if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
      return msg.content;
    }).join('\n\n');

    // Build config for new @google/genai SDK
    const config = {
      model: 'gemini-flash-lite-latest',
      contents: prompt,
      config: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    };

    // Add JSON mode if requested
    if (responseFormat?.type === 'json_object') {
      config.config.responseMimeType = 'application/json';
    }

    // Call Gemini using new unified SDK
    console.log('[API] Calling Gemini with model:', config.model);
    const response = await ai.models.generateContent(config);
    console.log('[API] Gemini response received:', {
      hasText: !!response.text,
      textType: typeof response.text,
      textLength: response.text?.length
    });

    // Return in OpenAI-compatible format
    res.status(200).json({
      choices: [{
        message: {
          content: response.text,
          role: 'assistant'
        }
      }]
    });

  } catch (error) {
    console.error('[API] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Always return JSON, never plain text
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
