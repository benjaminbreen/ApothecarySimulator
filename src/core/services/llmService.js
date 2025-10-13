// Configuration - you can change this to switch providers
let AI_PROVIDER = 'gemini'; // Options: 'gemini', 'openai', 'anthropic'

// Detect if we're in development mode
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// LLM Call Tracking for Transparency View
const llmCallHistory = [];
const MAX_STORED_CALLS = 10; // Keep last 10 calls in memory

function recordLLMCall(callData) {
  llmCallHistory.push({
    id: Date.now() + Math.random(), // Unique ID
    timestamp: new Date().toISOString(),
    ...callData
  });

  // Keep only last MAX_STORED_CALLS
  if (llmCallHistory.length > MAX_STORED_CALLS) {
    llmCallHistory.shift();
  }
}

export function getLLMCallHistory() {
  return llmCallHistory;
}

export function clearLLMCallHistory() {
  llmCallHistory.length = 0;
}

// Gemini implementation - routes through API in production, direct call in dev
async function geminiChatCompletion(messages, temperature = 1.0, maxTokens = 1000, responseFormat = null) {
  try {
    // In production, use secure serverless API
    if (!isDevelopment) {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          temperature,
          maxTokens,
          responseFormat
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      return await response.json();
    }

    // In development, call Gemini API directly
    console.log('[Dev Mode] Calling Gemini API directly');

    // Convert messages to Gemini format
    const prompt = messages.map(msg => {
      if (msg.role === 'system') return `System: ${msg.content}`;
      if (msg.role === 'user') return `User: ${msg.content}`;
      if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
      return msg.content;
    }).join('\n\n');

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    };

    // Add JSON response format if requested
    if (responseFormat?.type === 'json_object') {
      requestBody.generationConfig.responseMimeType = 'application/json';
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not set in .env.local');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    // Convert Gemini response format to OpenAI-compatible format
    const text = data.candidates[0].content.parts[0].text;

    return {
      choices: [{
        message: {
          content: text,
          role: 'assistant'
        }
      }]
    };

  } catch (error) {
    console.error('Error with Gemini chat completion:', error);
    throw error;
  }
}

// OpenAI implementation (fallback/alternative)
async function openaiChatCompletion(messages, temperature = 1.0, maxTokens = 1000, responseFormat = null) {
  try {
    const body = {
      model: 'gpt-4o-mini',
      temperature: temperature,
      max_tokens: maxTokens,
      messages: messages,
    };

    if (responseFormat && responseFormat.type === 'json_object') {
      body.response_format = responseFormat;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error with OpenAI chat completion:', error);
    throw error;
  }
}

// Unified API - this is what all components should call
export async function createChatCompletion(messages, temperature = 1.0, maxTokens = 1000, responseFormat = null, metadata = {}) {
  // Extract system and user prompts for logging
  const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
  const userPrompt = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');

  // Estimate token counts (rough estimate: ~4 chars per token)
  const estimatedTokens = {
    system: Math.ceil(systemPrompt.length / 4),
    user: Math.ceil(userPrompt.length / 4),
    total: Math.ceil((systemPrompt.length + userPrompt.length) / 4)
  };

  // You can add logic here to choose provider based on config, user preference, etc.
  const provider = AI_PROVIDER;

  let response;
  switch (provider) {
    case 'gemini':
      response = await geminiChatCompletion(messages, temperature, maxTokens, responseFormat);
      break;
    case 'openai':
      response = await openaiChatCompletion(messages, temperature, maxTokens, responseFormat);
      break;
    default:
      // Default to Gemini
      response = await geminiChatCompletion(messages, temperature, maxTokens, responseFormat);
  }

  // Record the call for transparency view
  recordLLMCall({
    agent: metadata.agent || 'Unknown',
    turnNumber: metadata.turnNumber || 0,
    input: {
      system: systemPrompt,
      user: userPrompt
    },
    output: response.choices[0].message.content,
    temperature,
    maxTokens,
    estimatedTokens,
    provider
  });

  return response;
}

// Image generation service
export async function generateImage(description) {
  const provider = AI_PROVIDER;

  switch (provider) {
    case 'gemini':
      return await geminiGenerateImage(description);
    case 'openai':
      return await openaiGenerateImage(description);
    default:
      return await geminiGenerateImage(description);
  }
}

async function geminiGenerateImage(description) {
  // TODO: Route image generation through serverless API like chat completion
  // For now, image generation is disabled until we create /api/generate-image endpoint
  console.warn('Image generation is currently disabled - needs API route implementation');
  return null;
}

async function openaiGenerateImage(description) {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `A highly detailed, Albrecht Durer-like pen and ink illustration of ${description} from a Renaissance apothecary's manual, drawn with sepia toned pen and occasional watercolor`,
        n: 1,
        size: "512x512",
      }),
    });

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating image with OpenAI:', error);
    return null;
  }
}

// Helper function to set provider at runtime
export function setAIProvider(provider) {
  if (['gemini', 'openai'].includes(provider)) {
    AI_PROVIDER = provider;
  } else {
    console.warn(`Unknown AI provider: ${provider}`);
  }
}

// Helper function to get current provider
export function getAIProvider() {
  return AI_PROVIDER;
}

export default {
  createChatCompletion,
  generateImage,
  setAIProvider,
  getAIProvider,
  getLLMCallHistory,
  clearLLMCallHistory,
};
