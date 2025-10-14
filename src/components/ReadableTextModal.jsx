import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createChatCompletion } from '../core/services/llmService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ReadableTextModal = ({ isOpen, onClose, item, theme = 'light' }) => {
  const [fullText, setFullText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const isDark = theme === 'dark';
  const isAmbient = item?.type === 'ambient';
  const isSign = item?.type === 'sign' || item?.type === 'label';

  // Generate full text when modal opens
  useEffect(() => {
    if (!isOpen || !item) {
      // Reset state when modal closes
      setShowOriginal(false);
      setOriginalText('');
      return;
    }

    setIsLoading(true);
    setFullText('');
    setShowOriginal(false);
    setOriginalText('');

    // For ambient descriptions, just use the description directly
    if (item.type === 'ambient') {
      setFullText(item.description);
      setIsLoading(false);
      return;
    }

    // For books, signs, etc., generate detailed text with markdown formatting
    const messages = [
      {
        role: 'system',
        content: `You are generating readable text content for a historical game set in 1680s Mexico City.

Given a ${item.type} titled "${item.name}", write the full text that the player would read.

Guidelines:
- For books: Write 2-3 paragraphs of excerpt from the actual historical text (if real) or plausible period-appropriate content
- For signs: Write the full sign text with hierarchical headings (business name, tagline, details, prices, hours). Use # for main heading, ## for sections, ### for subsections. Include 1-2 relevant emoji symbols (like 🍞 for bakery, ⚖️ for scales, 🔨 for blacksmith, etc.)
- For labels: Write complete label text with contents, provenance, instructions
- For inscriptions: Full inscription text with any dating or attribution
- For documents: Full document content (letters, notices, proclamations, etc.)

Be historically accurate for 1680s Mexico. Use period-appropriate language and style.
Keep it concise (150-300 words).

IMPORTANT: Format your response with markdown:
- For SIGNS/LABELS: Use # for main business name, ## for section headings (like "PRECIOS FIJOS"), ### for subsections. Add emoji symbols relevant to the business (🍞🥖🌾 for food, ⚖️💰 for commerce, 🔨⚒️ for trades, 📜✒️ for writing, 🍷🍺 for taverns, etc.)
- For BOOKS/DOCUMENTS: DO NOT use headers (# ## ###) - just body text
- Use **bold** for emphasis or decorated text
- Use *italics* for Latin phrases or foreign words
- Use line breaks between paragraphs

${item.type === 'sign' || item.type === 'label' ? 'This is a sign, so use markdown headers to create visual hierarchy like a painted wooden sign. Include emoji as decorative elements!' : 'Your response will be displayed as a 17th century document with initial capitals and flourishes.'}`
      },
      {
        role: 'user',
        content: `Generate the full readable text for:\n\nType: ${item.type}\nName: ${item.name}\nBrief description: ${item.description}`
      }
    ];

    createChatCompletion(messages, 0.5, 1000, null, { agent: 'ReadableText' })
      .then(response => {
        const content = response.choices[0].message.content;
        setFullText(content);
      })
      .catch(error => {
        console.error('[ReadableTextModal] Error generating text:', error);
        setFullText('The text is too faded to read clearly...');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, item]);

  // Handle listen button for ambient entries
  const handleListen = () => {
    alert('AI-generated soundscape will be implemented later.');
  };

  // Generate original language version
  const handleOriginalLanguage = () => {
    if (originalText) {
      setShowOriginal(!showOriginal);
      return;
    }

    setIsTranslating(true);

    const messages = [
      {
        role: 'system',
        content: `You are a bidirectional translator for a historical game set in 1680s Mexico City.

Your task:
1. First, detect if the input text is in English or another language
2. If the text is in English: Translate it to the most likely original historical language based on context:
   - Spanish for most books, signs, documents (most common in 1680s Mexico)
   - Latin for religious or scholarly texts
   - Nahuatl for indigenous texts or inscriptions
   - Portuguese for texts related to Portuguese merchants
   - French for French texts
3. If the text is already in Spanish/Latin/Nahuatl/etc: Translate it to English

Use period-appropriate spelling, vocabulary, and style for 1680s when translating TO historical languages.
Maintain the same markdown formatting (headers, bold, italics) as the input.

Return ONLY the translated text, no explanations or language labels.`
      },
      {
        role: 'user',
        content: `Translate this text (detect language and translate in the appropriate direction):\n\nType: ${item.type}\nName: ${item.name}\n\nText:\n${fullText}`
      }
    ];

    createChatCompletion(messages, 0.4, 1000, null, { agent: 'OriginalLanguage' })
      .then(response => {
        const content = response.choices[0].message.content;
        setOriginalText(content);
        setShowOriginal(true);
      })
      .catch(error => {
        console.error('[ReadableTextModal] Error translating to original language:', error);
        setOriginalText('Translation unavailable...');
      })
      .finally(() => {
        setIsTranslating(false);
      });
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      {/* Modal Container - 17th Century Document or Sign */}
      <div
        className={`relative ${isSign ? 'max-w-4xl' : 'max-w-2xl'} w-full max-h-[85vh] overflow-hidden animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isSign
            ? (isDark
              ? 'linear-gradient(135deg, rgba(30, 27, 22, 0.98) 0%, rgba(40, 35, 28, 0.99) 50%, rgba(30, 27, 22, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(254, 249, 235, 0.99) 0%, rgba(252, 245, 225, 1) 50%, rgba(250, 243, 220, 0.99) 100%)')
            : (isDark
              ? 'linear-gradient(135deg, rgba(42, 37, 33, 0.98) 0%, rgba(51, 44, 38, 0.99) 50%, rgba(42, 37, 33, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 252, 245, 0.99) 0%, rgba(254, 250, 240, 1) 50%, rgba(253, 248, 235, 0.99) 100%)'),
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isSign
            ? (isDark ? '3px solid rgba(101, 67, 33, 0.6)' : '3px solid rgba(101, 67, 33, 0.4)')
            : (isDark ? '2px solid rgba(139, 116, 94, 0.4)' : '2px solid rgba(139, 116, 94, 0.3)'),
          boxShadow: isSign
            ? (isDark
              ? '0 25px 80px rgba(0, 0, 0, 0.8), inset 0 3px 0 rgba(160, 120, 70, 0.15), inset 0 -3px 4px rgba(0, 0, 0, 0.4)'
              : '0 25px 80px rgba(0, 0, 0, 0.25), inset 0 3px 0 rgba(255, 255, 255, 0.7), inset 0 -3px 4px rgba(101, 67, 33, 0.2)')
            : (isDark
              ? '0 25px 80px rgba(0, 0, 0, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.05), inset 0 -2px 4px rgba(0, 0, 0, 0.3)'
              : '0 25px 80px rgba(0, 0, 0, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(139, 116, 94, 0.15)'),
          borderRadius: isSign ? '8px' : '4px',
        }}
      >
        {/* Decorative Corner Flourishes */}
        <div className="absolute top-2 left-2 w-12 h-12 pointer-events-none opacity-40" style={{
          borderLeft: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(139, 116, 94, 0.5)'}`,
          borderTop: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(139, 116, 94, 0.5)'}`,
        }}></div>
        <div className="absolute top-2 right-2 w-12 h-12 pointer-events-none opacity-40" style={{
          borderRight: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(139, 116, 94, 0.5)'}`,
          borderTop: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(139, 116, 94, 0.5)'}`,
        }}></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 pointer-events-none opacity-40" style={{
          borderLeft: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(139, 116, 94, 0.5)'}`,
          borderBottom: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(139, 116, 94, 0.5)'}`,
        }}></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 pointer-events-none opacity-40" style={{
          borderRight: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(139, 116, 94, 0.5)'}`,
          borderBottom: `2px solid ${isDark ? 'rgba(212, 175, 55, 0.5)' : 'rgba(139, 116, 94, 0.5)'}`,
        }}></div>

        {/* Listen Button (ambient) or Original Language Button (other types) */}
        {isAmbient ? (
          <button
            onClick={handleListen}
            disabled={isLoading}
            className="absolute top-4 left-4 px-3 py-1.5 flex items-center gap-2 rounded text-xs font-sans uppercase tracking-widest transition-all duration-300 z-10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(167, 139, 250, 0.2)',
              border: `1px solid ${isDark ? 'rgba(167, 139, 250, 0.4)' : 'rgba(139, 92, 246, 0.35)'}`,
              color: isDark ? '#c4b5fd' : '#6d28d9',
              letterSpacing: '0.1em',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = isDark ? 'rgba(139, 92, 246, 0.35)' : 'rgba(167, 139, 250, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(167, 139, 250, 0.2)';
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            <span>Listen</span>
          </button>
        ) : (
          <button
            onClick={handleOriginalLanguage}
            disabled={isTranslating || isLoading}
            className="absolute top-4 left-4 px-3 py-1.5 flex items-center gap-2 rounded text-xs font-serif uppercase tracking-widest transition-all duration-300 z-10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: showOriginal
                ? (isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(139, 116, 94, 0.25)')
                : (isDark ? 'rgba(139, 116, 94, 0.3)' : 'rgba(139, 116, 94, 0.15)'),
              border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(139, 116, 94, 0.4)'}`,
              color: isDark ? '#d4af37' : '#5a4a3a',
              letterSpacing: '0.1em',
            }}
            onMouseEnter={(e) => {
              if (!isTranslating && !isLoading) {
                e.currentTarget.style.background = isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(139, 116, 94, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = showOriginal
                ? (isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(139, 116, 94, 0.25)')
                : (isDark ? 'rgba(139, 116, 94, 0.3)' : 'rgba(139, 116, 94, 0.15)');
            }}
          >
            {isTranslating ? (
              <>
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Translating...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span>{showOriginal ? 'English' : 'Original'}</span>
              </>
            )}
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded transition-all duration-300 z-10 hover:scale-110"
          style={{
            background: isDark ? 'rgba(139, 116, 94, 0.3)' : 'rgba(139, 116, 94, 0.15)',
            border: `1px solid ${isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(139, 116, 94, 0.3)'}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(139, 116, 94, 0.5)' : 'rgba(139, 116, 94, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(139, 116, 94, 0.3)' : 'rgba(139, 116, 94, 0.15)';
          }}
        >
          <svg className="w-5 h-5" style={{ color: isDark ? '#d4af37' : '#8b745e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content - 17th Century Letter Layout */}
        <div className="px-12 py-10 overflow-y-auto max-h-[85vh] custom-scrollbar">
          {/* Decorative Header with Title */}
          <div className="text-center mb-8 pb-6 relative">
            {/* Top flourish */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex-1 h-px" style={{
                background: isAmbient
                  ? (isDark
                    ? 'linear-gradient(to right, transparent, rgba(167, 139, 250, 0.5), transparent)'
                    : 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.4), transparent)')
                  : isSign
                    ? (isDark
                      ? 'linear-gradient(to right, transparent, rgba(160, 120, 74, 0.6), transparent)'
                      : 'linear-gradient(to right, transparent, rgba(101, 67, 33, 0.5), transparent)')
                    : (isDark
                      ? 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5), transparent)'
                      : 'linear-gradient(to right, transparent, rgba(139, 116, 94, 0.4), transparent)')
              }}></div>
              <div
                className="mx-3 text-3xl"
                style={{
                  color: isAmbient
                    ? (isDark ? '#c4b5fd' : '#6d28d9')
                    : isSign
                      ? (isDark ? '#a0784a' : '#654321')
                      : (isDark ? '#d4af37' : '#8b745e'),
                  ...(isSign && {
                    filter: isDark
                      ? 'grayscale(100%) sepia(50%) hue-rotate(10deg) saturate(200%) brightness(0.8)'
                      : 'grayscale(100%) sepia(60%) hue-rotate(10deg) saturate(250%) brightness(0.7)',
                  })
                }}
              >
                {isAmbient ? '〰' : isSign ? '🏛️' : '❦'}
              </div>
              <div className="flex-1 h-px" style={{
                background: isAmbient
                  ? (isDark
                    ? 'linear-gradient(to right, transparent, rgba(167, 139, 250, 0.5), transparent)'
                    : 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.4), transparent)')
                  : isSign
                    ? (isDark
                      ? 'linear-gradient(to right, transparent, rgba(160, 120, 74, 0.6), transparent)'
                      : 'linear-gradient(to right, transparent, rgba(101, 67, 33, 0.5), transparent)')
                    : (isDark
                      ? 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5), transparent)'
                      : 'linear-gradient(to right, transparent, rgba(139, 116, 94, 0.4), transparent)')
              }}></div>
            </div>

            {/* Title - hide for signs since they'll use h1 */}
            {!isSign && (
              <h2
                className={`${isAmbient ? 'font-sans' : 'font-serif'} font-bold mb-3 transition-colors duration-300`}
                style={{
                  fontSize: '1.75rem',
                  lineHeight: '1.3',
                  color: isAmbient
                    ? (isDark ? '#c4b5fd' : '#6d28d9')
                    : (isDark ? '#d4af37' : '#5a4a3a'),
                  letterSpacing: '0.02em',
                  textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 1px rgba(0,0,0,0.05)',
                }}
              >
                {item?.name}
              </h2>
            )}

            {/* Type Badge */}
            {item?.type && (
              <span
                className={`inline-block text-xs ${isAmbient || isSign ? 'font-sans' : 'font-serif'} uppercase tracking-widest px-3 py-1 rounded-sm transition-colors duration-300`}
                style={{
                  background: isAmbient
                    ? (isDark
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.4) 100%)'
                      : 'linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(167, 139, 250, 0.3) 100%)')
                    : isSign
                      ? (isDark
                        ? 'linear-gradient(135deg, rgba(101, 67, 33, 0.4) 0%, rgba(101, 67, 33, 0.5) 100%)'
                        : 'linear-gradient(135deg, rgba(139, 90, 43, 0.2) 0%, rgba(139, 90, 43, 0.3) 100%)')
                      : (isDark
                        ? 'linear-gradient(135deg, rgba(139, 116, 94, 0.3) 0%, rgba(139, 116, 94, 0.4) 100%)'
                        : 'linear-gradient(135deg, rgba(139, 116, 94, 0.12) 0%, rgba(139, 116, 94, 0.18) 100%)'),
                  color: isAmbient
                    ? (isDark ? '#c4b5fd' : '#6d28d9')
                    : isSign
                      ? (isDark ? '#d4a574' : '#654321')
                      : (isDark ? '#d4af37' : '#5a4a3a'),
                  border: `1px solid ${
                    isAmbient
                      ? (isDark ? 'rgba(167, 139, 250, 0.4)' : 'rgba(139, 92, 246, 0.35)')
                      : isSign
                        ? (isDark ? 'rgba(160, 120, 74, 0.5)' : 'rgba(101, 67, 33, 0.4)')
                        : (isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(139, 116, 94, 0.3)')
                  }`,
                  letterSpacing: '0.15em',
                }}
              >
                {item.type.replace('_', ' ')}
              </span>
            )}

            {/* Bottom flourish */}
            <div className="flex items-center justify-center mt-4">
              <div className="flex-1 h-px" style={{
                background: isAmbient
                  ? (isDark
                    ? 'linear-gradient(to right, transparent, rgba(167, 139, 250, 0.5), transparent)'
                    : 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.4), transparent)')
                  : isSign
                    ? (isDark
                      ? 'linear-gradient(to right, transparent, rgba(160, 120, 74, 0.6), transparent)'
                      : 'linear-gradient(to right, transparent, rgba(101, 67, 33, 0.5), transparent)')
                    : (isDark
                      ? 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5), transparent)'
                      : 'linear-gradient(to right, transparent, rgba(139, 116, 94, 0.4), transparent)')
              }}></div>
            </div>
          </div>

          {/* Body - Full Text with Drop Cap */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{
                borderColor: isDark ? '#d4af37' : '#8b745e'
              }}></div>
              <p className="text-sm font-serif italic" style={{ color: isDark ? '#c9b896' : '#8b745e' }}>
                Unfurling the parchment...
              </p>
            </div>
          ) : (
            <div className={isAmbient ? "ambient-content" : isSign ? "sign-content" : "document-content"}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, children, ...props}) => (
                    <h1
                      className="font-sans font-black mb-6 transition-colors duration-300 text-center"
                      style={{
                        fontSize: '3rem',
                        lineHeight: '1.1',
                        color: isDark ? '#d4a574' : '#654321',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        textShadow: isDark ? '0 2px 4px rgba(0,0,0,0.5)' : '0 2px 3px rgba(0,0,0,0.15)',
                      }}
                      {...props}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({node, children, ...props}) => (
                    <h2
                      className="font-sans font-bold mb-4 mt-8 transition-colors duration-300 text-center"
                      style={{
                        fontSize: '1.75rem',
                        lineHeight: '1.3',
                        color: isDark ? '#c9a467' : '#8b5a2b',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        textShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({node, children, ...props}) => (
                    <h3
                      className="font-sans font-semibold mb-3 mt-6 transition-colors duration-300 text-center"
                      style={{
                        fontSize: '1.25rem',
                        lineHeight: '1.4',
                        color: isDark ? '#b89968' : '#a0704a',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 1px rgba(0,0,0,0.08)',
                      }}
                      {...props}
                    >
                      {children}
                    </h3>
                  ),
                  p: ({node, children, ...props}) => (
                    <p
                      className={`${isAmbient || isSign ? 'font-sans' : 'font-serif'} mb-6 transition-colors duration-300`}
                      style={{
                        fontSize: isAmbient ? '1.125rem' : isSign ? '1.125rem' : '1.25rem',
                        lineHeight: isAmbient ? '1.8' : isSign ? '1.7' : '2',
                        color: isAmbient
                          ? (isDark ? '#d8b4fe' : '#581c87')
                          : isSign
                            ? (isDark ? '#e8d4ba' : '#3a2f23')
                            : (isDark ? '#e8dcc4' : '#3a2f23'),
                        letterSpacing: '0.015em',
                        textAlign: isSign ? 'center' : 'left',
                      }}
                      {...props}
                    >
                      {children}
                    </p>
                  ),
                  strong: ({node, children, ...props}) => (
                    <strong
                      style={{
                        fontWeight: 700,
                        color: isAmbient
                          ? (isDark ? '#c4b5fd' : '#6d28d9')
                          : isSign
                            ? (isDark ? '#d4a574' : '#654321')
                            : (isDark ? '#d4af37' : '#5a4a3a'),
                      }}
                      {...props}
                    >
                      {children}
                    </strong>
                  ),
                  em: ({node, children, ...props}) => (
                    <em
                      style={{
                        fontStyle: 'italic',
                        color: isAmbient
                          ? (isDark ? '#ddd6fe' : '#7c3aed')
                          : isSign
                            ? (isDark ? '#c9a467' : '#8b5a2b')
                            : (isDark ? '#c9b896' : '#6b5a4a'),
                      }}
                      {...props}
                    >
                      {children}
                    </em>
                  ),
                }}
              >
                {showOriginal ? originalText : fullText}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Custom scrollbar styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: ${isDark ? 'rgba(42, 37, 33, 0.3)' : 'rgba(139, 116, 94, 0.1)'};
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: ${isDark ? 'rgba(212, 175, 55, 0.4)' : 'rgba(139, 116, 94, 0.4)'};
            border-radius: 4px;
            border: 2px solid ${isDark ? 'rgba(42, 37, 33, 0.3)' : 'rgba(255, 252, 245, 0.5)'};
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: ${isDark ? 'rgba(212, 175, 55, 0.6)' : 'rgba(139, 116, 94, 0.6)'};
          }

          /* Drop cap for first paragraph (only for non-ambient content) */
          .document-content p:first-of-type::first-letter {
            font-size: 4em;
            line-height: 0.9;
            float: left;
            margin: 0.1em 0.15em 0 0;
            font-weight: 700;
            color: ${isDark ? '#d4af37' : '#5a4a3a'};
            text-shadow: ${isDark ? '0 2px 4px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)'};
          }

          /* No drop cap for ambient content */
          .ambient-content p:first-of-type::first-letter {
            font-size: inherit;
            line-height: inherit;
            float: none;
            margin: 0;
            font-weight: inherit;
            color: inherit;
            text-shadow: none;
          }

          /* No drop cap for sign content */
          .sign-content p:first-of-type::first-letter {
            font-size: inherit;
            line-height: inherit;
            float: none;
            margin: 0;
            font-weight: inherit;
            color: inherit;
            text-shadow: none;
          }


          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.96) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .animate-fade-in {
            animation: fadeIn 250ms ease-out;
          }

          .animate-scale-in {
            animation: scaleIn 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        `}</style>
      </div>
    </div>,
    document.body
  );
};

export default ReadableTextModal;
