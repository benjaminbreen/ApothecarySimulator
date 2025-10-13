import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createChatCompletion } from '../core/services/llmService';

/**
 * Modal for displaying LLM-generated historical context
 * Supports three modes: fact-check, learn-more, counternarrative
 */
const HistoricalContextModal = ({
  isOpen,
  onClose,
  mode, // 'fact-check' | 'learn-more' | 'counternarrative'
  narrativeTurn = '', // Most recent narrative turn
  scenario = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [fullText, setFullText] = useState(''); // Store complete text for animation
  const isDark = document.documentElement.classList.contains('dark');

  // Animate text reveal for streaming effect
  useEffect(() => {
    if (!fullText || mode !== 'fact-check') return;

    console.log('[HistoricalContextModal] Starting text animation, length:', fullText.length);
    setContent('');
    setIsStreaming(true);

    let currentIndex = 0;
    const totalDuration = 2500; // 2.5 seconds total animation
    const charsPerFrame = Math.max(1, Math.ceil(fullText.length / (totalDuration / 16))); // ~60fps

    const animateText = () => {
      if (currentIndex < fullText.length) {
        currentIndex = Math.min(currentIndex + charsPerFrame, fullText.length);
        setContent(fullText.substring(0, currentIndex));
        requestAnimationFrame(animateText);
      } else {
        setIsStreaming(false); // Hide cursor when animation complete
        console.log('[HistoricalContextModal] Text animation complete');
      }
    };

    requestAnimationFrame(animateText);
  }, [fullText, mode]);

  // Generate content based on mode when modal opens
  useEffect(() => {
    console.log('[HistoricalContextModal] useEffect triggered:', { isOpen, mode, narrativeTurnLength: narrativeTurn?.length });

    if (isOpen && narrativeTurn) {
      console.log('[HistoricalContextModal] Starting content generation, mode:', mode);
      setIsLoading(true);
      setError(null);
      setContent(''); // Clear previous content
      setFullText(''); // Clear full text
      setIsStreaming(false);

      generateContent(mode, narrativeTurn, scenario)
        .then(finalContent => {
          console.log('[HistoricalContextModal] Generation complete, content length:', finalContent?.length);

          if (mode === 'fact-check') {
            // For fact-check, trigger animation by setting fullText
            setFullText(finalContent);
          } else {
            // For other modes, show immediately
            setContent(finalContent);
          }
        })
        .catch(err => {
          console.error('[HistoricalContextModal] Error generating content:', err);
          setError('Failed to generate historical context. Please try again.');
          setIsStreaming(false);
        })
        .finally(() => {
          console.log('[HistoricalContextModal] Finally block executed');
          setIsLoading(false);
        });
    } else if (isOpen && !narrativeTurn) {
      console.warn('[HistoricalContextModal] Modal opened but no narrativeTurn provided');
    }
  }, [isOpen, mode, narrativeTurn, scenario]);

  if (!isOpen) return null;

  const modalConfig = {
    'fact-check': {
      title: 'Historical Fact Check',
      icon: '✓',
      color: 'emerald',
      description: 'Stringent historical accuracy assessment'
    },
    'learn-more': {
      title: 'Historical Context',
      icon: '📚',
      color: 'amber',
      description: 'Academic sources and deeper context'
    },
    'counternarrative': {
      title: 'Critical Counter-Narrative',
      icon: '⚖️',
      color: 'purple',
      description: 'Alternative perspectives and archival erasures'
    }
  };

  const config = modalConfig[mode] || modalConfig['learn-more'];

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center px-4"
      style={{
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 245, 235, 0.98) 100%)',
          border: isDark ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(209, 213, 219, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-8 py-6 border-b"
          style={{
            borderColor: isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(209, 213, 219, 0.5)',
            background: isDark
              ? 'linear-gradient(to right, rgba(20, 30, 50, 0.6), rgba(30, 41, 59, 0.4))'
              : 'linear-gradient(to right, rgba(249, 245, 235, 0.6), rgba(255, 255, 255, 0.4))'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{config.icon}</span>
              <div>
                <h2 className="font-['Crimson_Text'] text-3xl font-bold text-gray-900 dark:text-amber-400 transition-colors duration-300">
                  {config.title}
                </h2>
                <p className="font-sans text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {config.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-180px)] px-8 py-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-3 border-emerald-600 dark:border-amber-500"></div>
              <p className="text-base mt-6 text-gray-600 dark:text-gray-400 font-sans">
                {mode === 'counternarrative' ? 'Analyzing narrative from critical perspective...' :
                 mode === 'learn-more' ? 'Researching academic sources...' :
                 'Verifying historical accuracy...'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 dark:text-red-400 text-lg font-sans">{error}</p>
            </div>
          ) : content ? (
            <ContentRenderer content={content} mode={mode} isDark={isDark} isStreaming={isStreaming} />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 italic text-lg font-sans">
                No narrative turn available to analyze
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-8 py-4 border-t flex items-center justify-between"
          style={{
            borderColor: isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(209, 213, 219, 0.5)',
            background: isDark
              ? 'rgba(15, 23, 42, 0.6)'
              : 'rgba(249, 245, 235, 0.6)'
          }}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 font-sans italic">
            Generated by AI • {scenario?.character?.name || 'Historical analysis'}
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(209, 213, 219, 0.4)',
              color: isDark ? '#e2e8f0' : '#1f2937'
            }}
          >
            Close
          </button>
        </div>

        {/* Custom scrollbar */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(209, 213, 219, 0.2)'};
            border-radius: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(156, 163, 175, 0.5)'};
            border-radius: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? 'rgba(71, 85, 105, 0.7)' : 'rgba(107, 114, 128, 0.7)'};
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

/**
 * Renders content with beautiful typography based on mode
 */
const ContentRenderer = ({ content, mode, isDark, isStreaming = false }) => {
  if (mode === 'fact-check') {
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div
          className="font-serif text-xl leading-relaxed text-gray-800 dark:text-gray-200"
          style={{
            lineHeight: '1.8',
            fontSize: '1.35rem',
            letterSpacing: '0.01em'
          }}
        >
          {content}
          {isStreaming && (
            <span
              className="inline-block ml-1 w-2 h-6 bg-emerald-600 dark:bg-amber-500 animate-pulse"
              style={{ animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            />
          )}
        </div>
      </div>
    );
  } else if (mode === 'learn-more') {
    // Parse content to separate main text from citations
    const parts = content.split(/(?=\n\n(?:Sources|References|Citations))/i);
    const mainText = parts[0];
    const citations = parts[1] || '';

    return (
      <div className="space-y-6">
        <div
          className="font-serif text-xl leading-relaxed text-gray-800 dark:text-gray-200"
          style={{
            lineHeight: '1.85',
            fontSize: '1.35rem',
            letterSpacing: '0.01em'
          }}
        >
          {mainText}
        </div>

        {citations && (
          <div
            className="pt-6 mt-6 border-t"
            style={{
              borderColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)'
            }}
          >
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-amber-400 mb-3">
              Academic Sources
            </h3>
            <div
              className="font-sans text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
              style={{
                lineHeight: '1.7',
                fontSize: '1.05rem'
              }}
            >
              {citations.replace(/^(Sources|References|Citations):?\s*/i, '')}
            </div>
          </div>
        )}
      </div>
    );
  } else if (mode === 'counternarrative') {
    return (
      <div
        className="font-serif text-xl leading-relaxed text-gray-800 dark:text-gray-200"
        style={{
          lineHeight: '1.85',
          fontSize: '1.35rem',
          letterSpacing: '0.01em'
        }}
      >
        <div className="whitespace-pre-line">{content}</div>
      </div>
    );
  }
  return null;
};

/**
 * Stream content from Gemini API with real-time updates
 */
async function streamGeminiContent(prompt, onChunk, temperature = 0.7, maxTokens = 1000) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set in .env.local');
  }

  console.log('[Streaming] Starting stream with gemini-flash-lite-latest');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.error('[Streaming] API error:', response.status, errorData);
    throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
  }

  console.log('[Streaming] Response received, starting to read stream');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let chunkCount = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log(`[Streaming] Stream done, processing final buffer`);
        break;
      }

      const decodedChunk = decoder.decode(value, { stream: true });
      console.log('[Streaming] Raw chunk received, length:', decodedChunk.length);
      buffer += decodedChunk;

      // Process complete SSE messages (they end with \n\n)
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // Keep incomplete message in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.slice(6); // Remove 'data: ' prefix
            const data = JSON.parse(jsonStr);

            // Extract text from response
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              chunkCount++;
              console.log(`[Streaming] Chunk ${chunkCount}:`, text);
              onChunk(text);
            }
          } catch (e) {
            console.warn('[Streaming] Failed to parse chunk:', e);
          }
        }
      }
    }

    // Process any remaining data in buffer after stream ends
    console.log('[Streaming] Processing final buffer, length:', buffer.length);
    if (buffer) {
      // SSE messages are separated by single newlines, not double
      const finalLines = buffer.split('\n');
      console.log('[Streaming] Final buffer has', finalLines.length, 'lines');
      for (const line of finalLines) {
        if (line.trim().startsWith('data: ')) {
          try {
            const jsonStr = line.trim().slice(6);
            const data = JSON.parse(jsonStr);
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              chunkCount++;
              console.log(`[Streaming] Final chunk ${chunkCount}:`, text);
              onChunk(text);
            }
          } catch (e) {
            console.warn('[Streaming] Failed to parse final chunk:', line.substring(0, 100), e.message);
          }
        }
      }
    }

    console.log(`[Streaming] Complete! Received ${chunkCount} text chunks total`);
  } catch (e) {
    console.error('[Streaming] Error reading stream:', e);
    throw e;
  }
}

/**
 * Generate content using LLM based on mode
 */
async function generateContent(mode, narrativeTurn, scenario) {
  const scenarioContext = scenario ? `
Setting: ${scenario.setting?.date || '1680s Mexico City'}
Character: ${scenario.character?.name || 'Maria de Lima'}, ${scenario.character?.occupation || 'apothecary'}
Historical period: ${scenario.setting?.era || 'Colonial New Spain'}
` : '';

  if (mode === 'fact-check') {
    console.log('[generateContent] Starting fact-check mode');

    const systemPrompt = `You are a historian with a PhD specializing in 1680s Mexico and Colonial New Spain. You are extremely well-versed in the historical literature and primary sources from this period. Your role is to provide hyper-accurate, stringently realistic fact-checking.

Your responses must be:
- VERY pithy and succinct (1-4 sentences maximum)
- Focused on what is historically inaccurate or anachronistic
- Based on actual scholarship and primary sources
- Professional but direct

${scenarioContext}

If the narrative is historically accurate, briefly confirm this. If there are issues, point them out concisely.`;

    const userPrompt = `Fact-check this narrative passage for historical accuracy:\n\n${narrativeTurn}`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`;

    console.log('[generateContent] Prompt length:', fullPrompt.length);

    // Collect all text from stream
    let fullText = '';
    try {
      await streamGeminiContent(
        fullPrompt,
        (chunk) => {
          fullText += chunk;
        },
        0.3,
        500
      );

      console.log('[generateContent] Streaming complete, full text length:', fullText.length);
      return fullText;
    } catch (error) {
      console.error('[generateContent] Streaming failed:', error);
      throw error;
    }

  } else if (mode === 'learn-more') {
    const messages = [
      {
        role: 'system',
        content: `You are a historian providing accessible historical context for a game set in 1680s Mexico. Provide 3-4 sentences of clear historical context that helps players understand the period, followed by 3 relevant academic historical secondary sources.

${scenarioContext}

Format your response as:
[3-4 sentences of context]

Sources:
1. Author, "Title" (Year)
2. Author, "Title" (Year)
3. Author, "Title" (Year)

Use real, actual academic sources from historians who have written about this period.`
      },
      {
        role: 'user',
        content: `Provide historical context for this narrative passage:\n\n${narrativeTurn}`
      }
    ];

    const response = await createChatCompletion(messages, 0.4, 800, null, { agent: 'LearnMore' });
    return response.choices[0].message.content;

  } else if (mode === 'counternarrative') {
    const messages = [
      {
        role: 'system',
        content: `You are a skeptical professional historian specializing in 1680s Mexico, deeply alert to counter-narratives, archival erasures, and agnotology (the study of culturally-induced ignorance).

Your role is to critique the narrative from a critical historical perspective, asking:
- Whose voices are missing from this account?
- What power dynamics are being naturalized?
- What has been erased from colonial archives?
- What counter-narratives exist?
- What do we NOT know because of systematic destruction of records?

${scenarioContext}

Write 2-3 thoughtful paragraphs that challenge the narrative, surface marginalized perspectives, and identify gaps in the historical record. Be scholarly but accessible. Focus on what the narrative obscures or takes for granted.`
      },
      {
        role: 'user',
        content: `Provide a critical counter-narrative analysis of this passage:\n\n${narrativeTurn}`
      }
    ];

    // Use Gemini Flash Lite for counter-narrative (as specified by user)
    const response = await createChatCompletion(messages, 0.7, 1200, null, { agent: 'CounterNarrative' });
    return response.choices[0].message.content;
  }

  return '';
}

export default HistoricalContextModal;
