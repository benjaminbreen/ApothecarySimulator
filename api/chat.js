// Vercel Serverless Function for secure LLM calls
// This runs server-side, keeping API keys secure

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with server-side API key
const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
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
    const { messages, temperature = 1.0, maxTokens = 1000, responseFormat } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Build prompt (same format as existing code)
    const prompt = messages.map(msg => {
      if (msg.role === 'system') return `System: ${msg.content}`;
      if (msg.role === 'user') return `User: ${msg.content}`;
      if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
      return msg.content;
    }).join('\n\n');

    // Get the model
    const model = genai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: responseFormat?.type === 'json_object' ? 'application/json' : 'text/plain',
      }
    });

    // Call Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Return in OpenAI-compatible format
    res.status(200).json({
      choices: [{
        message: {
          content: text,
          role: 'assistant'
        }
      }]
    });

  } catch (error) {
    console.error('[API] Error:', error);

    // Don't expose internal error details in production
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to generate response'
    });
  }
}
