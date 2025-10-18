import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  scenario = null,
  cachedContent = null, // Pre-generated content from inline panel
  activeMode = null // Active mode for color theming
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const isDark = document.documentElement.classList.contains('dark');

  // Color scheme based on mode
  const getColorScheme = () => {
    const colorMode = activeMode || mode;
    if (colorMode === 'fact-check') {
      return {
        primary: isDark ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)',
        primaryRgba: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
        border: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
        glow: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'
      };
    } else if (colorMode === 'context' || colorMode === 'learn-more') {
      return {
        primary: isDark ? 'rgb(251, 191, 36)' : 'rgb(217, 119, 6)',
        primaryRgba: isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)',
        border: isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.25)',
        glow: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)'
      };
    } else {
      return {
        primary: isDark ? 'rgb(196, 181, 253)' : 'rgb(126, 34, 206)',
        primaryRgba: isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)',
        border: isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.25)',
        glow: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)'
      };
    }
  };

  const colors = getColorScheme();

  // Generate content based on mode when modal opens
  useEffect(() => {
    console.log('[HistoricalContextModal] useEffect triggered:', { isOpen, mode, hasCachedContent: !!cachedContent, narrativeTurnLength: narrativeTurn?.length });

    if (isOpen && cachedContent) {
      // Use cached content from inline panel (no LLM call needed)
      console.log('[HistoricalContextModal] Using cached content, length:', cachedContent.length);
      setContent(cachedContent);
      setIsLoading(false);
      setError(null);
    } else if (isOpen && narrativeTurn) {
      // Generate fresh content
      console.log('[HistoricalContextModal] Starting content generation, mode:', mode);
      setIsLoading(true);
      setError(null);
      setContent(''); // Clear previous content

      generateContent(mode, narrativeTurn, scenario)
        .then(finalContent => {
          console.log('[HistoricalContextModal] Generation complete, content length:', finalContent?.length);
          setContent(finalContent);
        })
        .catch(err => {
          console.error('[HistoricalContextModal] Error generating content:', err);
          setError('Failed to generate historical context. Please try again.');
        })
        .finally(() => {
          console.log('[HistoricalContextModal] Finally block executed');
          setIsLoading(false);
        });
    } else if (isOpen && !narrativeTurn) {
      console.warn('[HistoricalContextModal] Modal opened but no narrativeTurn provided');
    }
  }, [isOpen, mode, narrativeTurn, scenario, cachedContent]);

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
        {/* Header with mode-specific colors */}
        <div
          className="px-8 py-6 border-b transition-all duration-300"
          style={{
            borderColor: colors.border,
            background: isDark
              ? `linear-gradient(to right, ${colors.glow}, rgba(30, 41, 59, 0.4))`
              : `linear-gradient(to right, ${colors.primaryRgba}, rgba(255, 255, 255, 0.4))`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{config.icon}</span>
              <div>
                <h2
                  className="font-['Crimson_Text'] text-2xl font-bold transition-colors duration-300"
                  style={{ color: colors.primary }}
                >
                  {config.title}
                </h2>
                <p className="font-sans text-xs text-gray-600 dark:text-gray-400 mt-1 tracking-wide uppercase font-semibold">
                  {config.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: colors.primaryRgba,
                color: colors.primary
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content with mode-specific colors */}
        <div className="overflow-y-auto max-h-[calc(85vh-180px)] px-8 py-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div
                className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-t-transparent"
                style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}
              ></div>
              <p className="text-sm mt-6 text-gray-600 dark:text-gray-400 font-sans font-medium tracking-wide">
                {mode === 'counternarrative' ? 'Analyzing narrative from critical perspective...' :
                 mode === 'learn-more' || mode === 'context' ? 'Researching academic sources...' :
                 'Verifying historical accuracy...'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 dark:text-red-400 text-base font-sans font-medium">{error}</p>
            </div>
          ) : content ? (
            <div className="animate-fade-in">
              <ContentRenderer content={content} mode={mode} isDark={isDark} colors={colors} />
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 italic text-base font-sans">
                No narrative turn available to analyze
              </p>
            </div>
          )}
        </div>

        {/* Footer with mode-specific colors */}
        <div
          className="px-8 py-4 border-t flex items-center justify-between transition-all duration-300"
          style={{
            borderColor: colors.border,
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
            className="px-5 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: colors.primaryRgba,
              color: colors.primary
            }}
          >
            Close
          </button>
        </div>

        {/* Custom scrollbar with mode-specific colors and animations */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(249, 245, 235, 0.3)'};
            border-radius: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${colors.primaryRgba};
            border-radius: 5px;
            transition: background 0.2s ease;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${colors.border};
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-fade-in {
            animation: fadeIn 500ms ease-in-out;
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
const ContentRenderer = ({ content, mode, isDark, colors }) => {
  if (mode === 'fact-check') {
    return (
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <div
          className="font-serif leading-relaxed text-gray-800 dark:text-gray-200"
          style={{
            lineHeight: '1.85',
            fontSize: '1.125rem',
            letterSpacing: '0.015em'
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  } else if (mode === 'learn-more' || mode === 'context') {
    // Parse content to separate main text from citations
    const parts = content.split(/(?=\n\n(?:Sources|References|Citations))/i);
    const mainText = parts[0];
    const citations = parts[1] || '';

    return (
      <div className="space-y-6">
        <div
          className="font-serif leading-relaxed text-gray-800 dark:text-gray-200"
          style={{
            lineHeight: '1.85',
            fontSize: '1.125rem',
            letterSpacing: '0.015em'
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {mainText}
          </ReactMarkdown>
        </div>

        {citations && (
          <div
            className="pt-6 mt-6 border-t transition-colors duration-300"
            style={{
              borderColor: colors?.border || (isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(209, 213, 219, 0.3)')
            }}
          >
            <h3
              className="font-sans text-sm font-bold mb-3 uppercase tracking-wider"
              style={{
                color: colors?.primary || (isDark ? 'rgb(251, 191, 36)' : 'rgb(217, 119, 6)')
              }}
            >
              Academic Sources
            </h3>
            <div
              className="font-sans text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
              style={{
                lineHeight: '1.75',
                fontSize: '0.9375rem'
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {citations.replace(/^(Sources|References|Citations):?\s*/i, '')}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    );
  } else if (mode === 'counternarrative') {
    return (
      <div
        className="font-serif leading-relaxed text-gray-800 dark:text-gray-200"
        style={{
          lineHeight: '1.85',
          fontSize: '1.125rem',
          letterSpacing: '0.015em'
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }
  return null;
};

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
    const messages = [
      {
        role: 'system',
        content: `You are a historian with a PhD specializing in 1680s Mexico and Colonial New Spain. You are extremely well-versed in the historical literature and primary sources from this period. Your role is to provide hyper-accurate, stringently realistic fact-checking.

Your responses must be:
- VERY pithy and succinct (1-4 sentences maximum)
- Focused on what is historically inaccurate or anachronistic
- Based on actual scholarship and primary sources
- Professional but direct

${scenarioContext}

If the narrative is historically accurate, briefly confirm this. If there are issues, point them out concisely.`
      },
      {
        role: 'user',
        content: `Fact-check this narrative passage for historical accuracy:\n\n${narrativeTurn}`
      }
    ];

    const response = await createChatCompletion(messages, 0.3, 500, null, { agent: 'FactCheck' });
    return response.choices[0].message.content;

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
