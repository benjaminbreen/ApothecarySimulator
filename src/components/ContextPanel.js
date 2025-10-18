import React from 'react';
import ViewportPanel from './ViewportPanel';
import { entityManager } from '../core/entities/EntityManager';
import { adaptEntity } from '../core/entities/entityAdapter';
import { resolvePortrait } from '../core/services/portraitResolver';
import EntityList from '../EntityList';
import ActionPanel from './ActionPanel';
import EntityCard from './EntityCard';
import { fetchEntitiesWithWikipedia } from '../core/services/wikipediaService';
import HistoricalContextModal from './HistoricalContextModal';
import ReactMarkdown from 'react-markdown';
import { RippleButton } from './RippleButton';

const ContextPanel = ({
  location = 'Mexico City',
  locationDetails = "Botica de la Amargura",
  onActionClick,
  recentNPCs = [], // Direct NPC data from game state
  primaryPortraitFile = null, // PHASE 1: LLM-selected portrait filename
  currentNarrative, // Fallback for narrative parsing
  recentNarrativeTurn = '', // Most recent narrative turn for LLM analysis
  scenario = null, // Scenario config for maps and historical context
  npcs = [], // NPCs to show on map
  playerPosition = null, // Player position for map rendering
  playerFacing = 180, // Player facing direction (0=N, 90=E, 180=S, 270=W)
  currentMapId = null, // Current map ID (e.g., 'botica-interior', 'mexico-city-center')
  onLocationChange = null, // Callback when location changes
  onPortraitClick = null, // Callback when portrait is clicked
  onMapClick = null, // Callback when map is clicked to open modal
  onExitBuilding = null, // Callback when Exit button is clicked on map
  shopSignHung = false, // Whether the shop sign is currently displayed
  setIsLedgerOpen = null, // Callback to open Ledger Modal
  toggleShopSign = null, // Direct shop sign control
  toast = null, // Toast notifications
  onItemDropOnNPC = null, // Callback when item dropped on NPC portrait
  entities = [], // Entities from LLM (with Wikipedia integration)
  discoveredBooks = [], // Books discovered during gameplay
  onBookClick = null // Callback when book is clicked
}) => {
  // Collapse entire panel state - default to collapsed
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  // Animated entry state
  const [isVisible, setIsVisible] = React.useState(false);

  // State for Wikipedia-enriched entities
  const [enrichedEntities, setEnrichedEntities] = React.useState([]);
  const [isLoadingWikipedia, setIsLoadingWikipedia] = React.useState(false);

  // State for inline content display
  const [activeInlineMode, setActiveInlineMode] = React.useState(null); // 'fact-check' | 'context' | 'counternarrative' | null
  const [inlineContent, setInlineContent] = React.useState('');
  const [isLoadingInline, setIsLoadingInline] = React.useState(false);

  // State for panel and button hover (for button outline fade-in effect)
  const [isPanelHovered, setIsPanelHovered] = React.useState(false);
  const [hoveredButton, setHoveredButton] = React.useState(null); // 'fact-check' | 'context' | 'counternarrative' | null

  // State for Historical Context Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState('fact-check'); // 'fact-check' | 'learn-more' | 'counternarrative'

  // Fetch inline content for the selected mode
  const fetchInlineContent = React.useCallback(async (mode) => {
    if (!recentNarrativeTurn) {
      setInlineContent('No narrative content available.');
      return;
    }

    setIsLoadingInline(true);
    setActiveInlineMode(mode);

    try {
      // Import the LLM service
      const { createChatCompletion } = await import('../core/services/llmService');

      // Build scenario context string (matches modal approach)
      const scenarioContext = scenario ? `
Setting: ${scenario.setting?.date || '1680s Mexico City'}
Character: ${scenario.character?.name || 'Maria de Lima'}, ${scenario.character?.occupation || 'apothecary'}
Historical period: ${scenario.setting?.era || 'Colonial New Spain'}
` : '';

      let systemPrompt = '';
      if (mode === 'fact-check') {
        systemPrompt = `You are a historian providing quick fact-checking for a historical game. Be concise and provide 2-3 key points. Keep response under 150 words.

${scenarioContext}

Format as a bulleted list with brief explanations.`;
      } else if (mode === 'context') {
        systemPrompt = `You are a historical educator. Provide brief educational context about the historical setting, people, or events mentioned in this narrative. Keep response under 150 words.

${scenarioContext}

Format as 2-3 brief paragraphs.`;
      } else if (mode === 'counternarrative') {
        systemPrompt = `You are a critical historian examining perspectives often excluded from traditional narratives.

${scenarioContext}

Analyze this narrative from the perspective of marginalized groups (indigenous peoples, enslaved peoples, women, lower classes). Provide 2-3 brief points about whose voices might be missing. Keep response under 150 words.`;
      }

      const response = await createChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Narrative turn:\n\n${recentNarrativeTurn}` }
        ],
        0.7,
        200
      );

      setInlineContent(response.choices[0].message.content);
    } catch (error) {
      console.error('[ContextPanel] Error fetching inline content:', error);
      setInlineContent('Failed to load content. Please try again.');
    } finally {
      setIsLoadingInline(false);
    }
  }, [recentNarrativeTurn, scenario]);

  // Button click handlers - show inline content AND open modal on click
  const handleFactCheck = () => {
    if (activeInlineMode === 'fact-check') {
      // If already showing, open modal
      setModalMode('fact-check');
      setIsModalOpen(true);
    } else {
      // Otherwise, load inline content and expand panel
      setIsCollapsed(false);
      fetchInlineContent('fact-check');
    }
  };

  const handleContext = () => {
    if (activeInlineMode === 'context') {
      setModalMode('learn-more');
      setIsModalOpen(true);
    } else {
      setIsCollapsed(false);
      fetchInlineContent('context');
    }
  };

  const handleCounterNarrative = () => {
    if (activeInlineMode === 'counternarrative') {
      setModalMode('counternarrative');
      setIsModalOpen(true);
    } else {
      setIsCollapsed(false);
      fetchInlineContent('counternarrative');
    }
  };

  // Trigger fade-in animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-expand when Wikipedia data arrives
  React.useEffect(() => {
    if (enrichedEntities.length > 0) {
      setIsCollapsed(false);
    }
  }, [enrichedEntities]);

  // Fetch Wikipedia data for ONE entity with wikipediaQuery per turn
  React.useEffect(() => {
    // Find the first entity with a wikipediaQuery
    const entityWithQuery = entities?.find(e => e.wikipediaQuery);

    if (entityWithQuery) {
      setIsLoadingWikipedia(true);
      console.log('[ContextPanel] Found entity with wikipediaQuery:', entityWithQuery.wikipediaQuery);

      // Fetch Wikipedia for just this one entity
      fetchEntitiesWithWikipedia([entityWithQuery])
        .then((enriched) => {
          // Only show if Wikipedia data exists
          const withWikipedia = enriched.filter(e => e.wikipedia !== null);
          if (withWikipedia.length > 0) {
            setEnrichedEntities(withWikipedia);
            console.log('[ContextPanel] Wikipedia article found:', withWikipedia[0].wikipedia.title);
          } else {
            setEnrichedEntities([]);
            console.log('[ContextPanel] No Wikipedia article found for:', entityWithQuery.wikipediaQuery);
          }
          setIsLoadingWikipedia(false);
        })
        .catch((error) => {
          console.error('[ContextPanel] Error fetching Wikipedia data:', error);
          setEnrichedEntities([]);
          setIsLoadingWikipedia(false);
        });
    } else {
      setEnrichedEntities([]);
      console.log('[ContextPanel] No entity with wikipediaQuery this turn');
    }
  }, [entities]);

  // Get the most recent NPC from game state
  const latestNPC = recentNPCs.length > 0 ? recentNPCs[recentNPCs.length - 1] : null;

  // Get full NPC data from EntityManager (primary) or EntityList (fallback)
  const npcEntity = React.useMemo(() => {
    if (!latestNPC) return null;

    // Try EntityManager first
    const fromManager = entityManager.getByName(latestNPC);
    if (fromManager) {
      console.log('[ContextPanel] Found entity in EntityManager:', fromManager.name);
      return fromManager;
    }

    // Fallback to EntityList for backward compatibility
    const fromList = EntityList.find(npc => npc.name === latestNPC);
    if (fromList) {
      console.log('[ContextPanel] Fallback to EntityList:', fromList.name);
    }
    return fromList;
  }, [latestNPC]);

  // Adapt entity for modal compatibility
  const npcData = React.useMemo(() => {
    if (!npcEntity) return null;

    // Determine modal type
    const entityType = npcEntity.entityType || npcEntity.type;
    const modalType = entityType === 'patient' ? 'patient' : 'npc';

    return adaptEntity(npcEntity, modalType);
  }, [npcEntity]);

  // Get portrait URL (LLM-ONLY, NO FALLBACK)
  // Only show portrait if LLM explicitly provides primaryPortraitFile
  // If null, ViewportPanel will default to map tab
  const getPortraitUrl = React.useMemo(() => {
    if (primaryPortraitFile) {
      console.log('[ContextPanel] ✓ Using LLM portrait:', primaryPortraitFile);

      // Special case: UI images (like boticaentrance.png) are in /ui/, not /portraits/
      if (primaryPortraitFile.startsWith('ui/')) {
        return `/${primaryPortraitFile}`;
      }

      // Normal portraits are in /portraits/
      return `/portraits/${primaryPortraitFile}`;
    }

    console.log('[ContextPanel] ∅ No portrait provided - map will be shown');
    return null;
  }, [primaryPortraitFile]);

  // Show portrait if:
  // 1. There's an NPC with a portrait, OR
  // 2. There's a UI scene image (like boticaentrance.png) even without an NPC
  const isUIImage = getPortraitUrl && getPortraitUrl.startsWith('/ui/');
  const currentNPC = (latestNPC && getPortraitUrl) || isUIImage ? {
    name: latestNPC || 'Scene',
    url: getPortraitUrl
  } : null;

  const hasPortrait = currentNPC !== null;

  // Map ActionPanel action IDs to game commands/actions
  const actionIdToCommand = {
    forage: '#forage',
    hangSign: '#hangSign',
    removeSign: '#removeSign',
    read: 'read',
    observe: 'observe',
    diagnose: 'diagnose patient',
    mix: '#mix',
    experiment: 'experiment with alchemy',
    map: '#map',
    research: 'research texts',
    investigate: 'investigate',
    converse: 'converse with npcs',
    roster: 'view patient roster',
    rest: '#sleep',
    bargain: '#buy',
    accounts: 'review finances'
  };

  const handleActionPanelClick = (actionId) => {
    // Handle special actions that trigger direct state changes (not text commands)
    if (actionId === 'accounts' && setIsLedgerOpen) {
      setIsLedgerOpen(true);
      return;
    }

    // Pass roster and rest/bargain actions directly to parent (they open modals)
    if (['roster', 'rest', 'bargain'].includes(actionId) && onActionClick) {
      onActionClick(actionId);
      return;
    }

    // Handle shop sign actions directly (button UI, not text commands)
    if (actionId === 'hangSign' && toggleShopSign) {
      console.log('[Shop Sign] Hanging sign to attract patients');
      toggleShopSign(true);
      if (toast) {
        toast.success('Shop sign hung! Patients are more likely to seek your services.', { duration: 3000 });
      }
      return;
    }

    if (actionId === 'removeSign' && toggleShopSign) {
      console.log('[Shop Sign] Removing sign');
      toggleShopSign(false);
      if (toast) {
        toast.info('Shop sign removed.', { duration: 2000 });
      }
      return;
    }

    // Handle all other actions as text commands
    const command = actionIdToCommand[actionId];
    if (command && onActionClick) {
      onActionClick(command);
    }
  };

  // Check dark mode dynamically like ActionPanel does
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <aside className="hidden xl:flex flex-col w-96 gap-5 h-full overflow-hidden px-1">

      {/* Viewport Panel - Map/Portrait/Weather */}
      <div className="flex-shrink-0 rounded-2xl overflow-hidden shadow-elevation-2 dark:shadow-dark-elevation-3 transition-shadow duration-300 hover:shadow-elevation-3 dark:hover:shadow-dark-elevation-4">
        <ViewportPanel
          location={location}
          locationDetails={locationDetails}
          npcPresent={hasPortrait}
          npcName={currentNPC?.name || null}
          npcPortrait={currentNPC?.url || null}
          npcData={npcData}
          onPortraitClick={onPortraitClick}
          onItemDropOnNPC={onItemDropOnNPC}
          scenario={scenario}
          npcs={npcs}
          playerPosition={playerPosition}
          playerFacing={playerFacing}
          currentMapId={currentMapId}
          onLocationChange={onLocationChange}
          onMapClick={onMapClick}
          onExitBuilding={onExitBuilding}
          discoveredBooks={discoveredBooks}
          onBookClick={onBookClick}
          narrativeTurn={recentNarrativeTurn}
          primaryPortraitFile={primaryPortraitFile}
        />
      </div>

      {/* Action Panel */}
      <div className="flex-shrink-0 rounded-2xl overflow-hidden shadow-elevation-2 dark:shadow-dark-elevation-3 transition-shadow duration-300 hover:shadow-elevation-3 dark:hover:shadow-dark-elevation-4">
        <ActionPanel
          hasActiveNPC={hasPortrait}
          onActionClick={handleActionPanelClick}
          location={location}
          shopSignHung={shopSignHung}
        />
      </div>

      {/* Historical Context Panel - Scrollable and Bounded */}
      <div
        className={`group rounded-2xl transition-all duration-500 relative overflow-hidden flex flex-col ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        } ${
          isCollapsed ? 'flex-shrink-0' : 'flex-1 min-h-0'
        }`}
        style={{
          background: isDark
            ? 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(249, 245, 235, 0.98) 100%)',
          backdropFilter: 'blur(20px) saturate(130%)',
          WebkitBackdropFilter: 'blur(20px) saturate(130%)',
          border: isDark
            ? '2px solid rgba(251, 191, 36, 0.15)'
            : '2px solid rgba(16, 185, 129, 0.15)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(251, 191, 36, 0.1)'
            : '0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          maxHeight: isCollapsed ? '116px' : '100%',
        }}
      >
        {/* Decorative corner accents - color based on active mode */}
        <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
          <div
            className="absolute top-2 left-2 w-12 h-12 border-l-2 border-t-2 rounded-tl-lg transition-colors duration-500"
            style={{
              borderColor: activeInlineMode === 'fact-check'
                ? (isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)')
                : activeInlineMode === 'context'
                  ? (isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.25)')
                  : activeInlineMode === 'counternarrative'
                    ? (isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.25)')
                    : (isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(16, 185, 129, 0.2)')
            }}
          />
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div
            className="absolute top-2 right-2 w-12 h-12 border-r-2 border-t-2 rounded-tr-lg transition-colors duration-500"
            style={{
              borderColor: activeInlineMode === 'fact-check'
                ? (isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)')
                : activeInlineMode === 'context'
                  ? (isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.25)')
                  : activeInlineMode === 'counternarrative'
                    ? (isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.25)')
                    : (isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(16, 185, 129, 0.2)')
            }}
          />
        </div>

        {/* Subtle hover glow - color based on active mode */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: activeInlineMode === 'fact-check'
              ? (isDark
                  ? 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.12) 0%, transparent 50%)'
                  : 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)')
              : activeInlineMode === 'context'
                ? (isDark
                    ? 'radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.12) 0%, transparent 50%)'
                    : 'radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.08) 0%, transparent 50%)')
                : activeInlineMode === 'counternarrative'
                  ? (isDark
                      ? 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)'
                      : 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)')
                  : (isDark
                      ? 'radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.08) 0%, transparent 50%)'
                      : 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)')
          }}
        />

        {/* Header with Elegant Dividers + Collapse Toggle */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2.5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-parchment-400/60 dark:via-amber-600/30 to-parchment-400/60 dark:to-amber-600/30 transition-colors duration-300"></div>
            <div className="flex items-center gap-2.5">
      
              <span className="font-sans text-xs font-semibold text-gray-600 dark:text-amber-400 uppercase tracking-[0.15em] whitespace-nowrap transition-colors duration-300" style={{ letterSpacing: '0.08em' }}>
                Historical Context
              </span>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-parchment-100/70 dark:hover:bg-slate-700/70 transition-all duration-200 flex-shrink-0 active:scale-95"
              title={isCollapsed ? "Expand panel" : "Collapse panel"}
            >
              <svg
                className={`w-4 h-4 text-parchment-600 dark:text-amber-500/70 transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-parchment-400/60 dark:via-amber-600/30 to-parchment-400/60 dark:to-amber-600/30 transition-colors duration-300"></div>
          </div>
        </div>

        {/* Enhanced Action Buttons - Always Visible */}
        <div
          className="flex-shrink-0 px-3 pb-4 relative z-10"
          onMouseEnter={() => setIsPanelHovered(true)}
          onMouseLeave={() => setIsPanelHovered(false)}
        >
          <div className="flex items-center justify-center gap-2">
            <RippleButton
              onClick={handleFactCheck}
              rippleColor="rgba(16, 185, 129, 0.4)"
              className={`text-xs px-2.5 py-2 rounded-lg font-semibold font-sans border-2 transition-all duration-300 bg-transparent ${
                // Text and background colors (active state shows subtle tint)
                activeInlineMode === 'fact-check'
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'text-parchment-600 dark:text-parchment-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20'
              } ${
                // Border colors (based on hover state only, not active state)
                hoveredButton === 'fact-check'
                  ? 'border-emerald-400 dark:border-emerald-600'
                  : isPanelHovered
                    ? 'border-emerald-400/40 dark:border-emerald-600/40'
                    : 'border-parchment-300 dark:border-slate-600'
              }`}
              style={{
                boxShadow: hoveredButton === 'fact-check'
                  ? '0 0 16px rgba(16, 185, 129, 0.35)'
                  : '0 0 0px rgba(16, 185, 129, 0)'
              }}
              onMouseEnter={(e) => {
                setHoveredButton('fact-check');
              }}
              onMouseLeave={(e) => {
                setHoveredButton(null);
              }}
            >
              Fact check
            </RippleButton>
            <RippleButton
              onClick={handleContext}
              rippleColor="rgba(251, 191, 36, 0.4)"
              className={`text-xs px-2.5 py-2 rounded-lg font-semibold font-sans border-2 transition-all duration-300 bg-transparent ${
                activeInlineMode === 'context'
                  ? 'text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                  : 'text-parchment-600 dark:text-parchment-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/20'
              } ${
                hoveredButton === 'context'
                  ? 'border-amber-400 dark:border-amber-600'
                  : isPanelHovered
                    ? 'border-amber-400/40 dark:border-amber-600/40'
                    : 'border-parchment-300 dark:border-slate-600'
              }`}
              style={{
                boxShadow: hoveredButton === 'context'
                  ? '0 0 16px rgba(251, 191, 36, 0.35)'
                  : '0 0 0px rgba(251, 191, 36, 0)'
              }}
              onMouseEnter={(e) => {
                setHoveredButton('context');
              }}
              onMouseLeave={(e) => {
                setHoveredButton(null);
              }}
            >
              Context
            </RippleButton>
            <RippleButton
              onClick={handleCounterNarrative}
              rippleColor="rgba(168, 85, 247, 0.4)"
              className={`text-xs px-2.5 py-2 rounded-lg font-semibold font-sans border-2 transition-all duration-300 bg-transparent ${
                activeInlineMode === 'counternarrative'
                  ? 'text-purple-700 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-950/20'
                  : 'text-parchment-600 dark:text-parchment-400 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50/30 dark:hover:bg-purple-950/20'
              } ${
                hoveredButton === 'counternarrative'
                  ? 'border-purple-400 dark:border-purple-600'
                  : isPanelHovered
                    ? 'border-purple-400/40 dark:border-purple-600/40'
                    : 'border-parchment-300 dark:border-slate-600'
              }`}
              style={{
                boxShadow: hoveredButton === 'counternarrative'
                  ? '0 0 16px rgba(168, 85, 247, 0.35)'
                  : '0 0 0px rgba(168, 85, 247, 0)'
              }}
              onMouseEnter={(e) => {
                setHoveredButton('counternarrative');
              }}
              onMouseLeave={(e) => {
                setHoveredButton(null);
              }}
            >
              Counternarrative
            </RippleButton>
          </div>
        </div>

        {/* Content Area - Scrollable (Collapsible) - scrollbar color based on active mode */}
        <div
          className={`flex-1 overflow-y-auto px-5 pb-5 relative z-10 transition-all duration-500 custom-scrollbar ${
            isCollapsed ? 'max-h-0 opacity-0 pointer-events-none overflow-hidden' : 'max-h-full opacity-100'
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: activeInlineMode === 'fact-check'
              ? (isDark ? 'rgba(16, 185, 129, 0.4) rgba(30, 41, 59, 0.3)' : 'rgba(16, 185, 129, 0.4) rgba(249, 245, 235, 0.3)')
              : activeInlineMode === 'context'
                ? (isDark ? 'rgba(251, 191, 36, 0.4) rgba(30, 41, 59, 0.3)' : 'rgba(251, 191, 36, 0.4) rgba(249, 245, 235, 0.3)')
                : activeInlineMode === 'counternarrative'
                  ? (isDark ? 'rgba(168, 85, 247, 0.4) rgba(30, 41, 59, 0.3)' : 'rgba(168, 85, 247, 0.4) rgba(249, 245, 235, 0.3)')
                  : (isDark ? 'rgba(251, 191, 36, 0.3) rgba(30, 41, 59, 0.3)' : 'rgba(16, 185, 129, 0.3) rgba(249, 245, 235, 0.3)')
          }}
        >
          <div className="text-sm text-parchment-800 dark:text-parchment-200 font-sans space-y-3 transition-colors duration-300">

            {/* Inline Content from buttons */}
            {activeInlineMode && (
              <div className="animate-fade-in">
                {isLoadingInline ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-parchment-100 dark:bg-slate-700/50">
                      <div
                        className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent"
                        style={{
                          borderColor: activeInlineMode === 'fact-check'
                            ? (isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.4)')
                            : activeInlineMode === 'context'
                              ? (isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.4)')
                              : (isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.4)'),
                          borderTopColor: 'transparent'
                        }}
                      ></div>
                    </div>
                    <p className="text-xs font-medium text-parchment-600 dark:text-parchment-400">
                      Analyzing narrative...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Mode header - compact sans serif with mode-specific colors */}
                    <div className="flex items-center justify-between pb-2 border-b transition-colors duration-300"
                      style={{
                        borderColor: activeInlineMode === 'fact-check'
                          ? (isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)')
                          : activeInlineMode === 'context'
                            ? (isDark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.25)')
                            : (isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.25)')
                      }}
                    >
                      <h3
                        className="font-sans text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
                        style={{
                          color: activeInlineMode === 'fact-check'
                            ? (isDark ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)')
                            : activeInlineMode === 'context'
                              ? (isDark ? 'rgb(251, 191, 36)' : 'rgb(217, 119, 6)')
                              : (isDark ? 'rgb(196, 181, 253)' : 'rgb(126, 34, 206)')
                        }}
                      >
                        {activeInlineMode === 'fact-check' && 'Historical Fact Check'}
                        {activeInlineMode === 'context' && 'Educational Context'}
                        {activeInlineMode === 'counternarrative' && 'Alternative Perspectives'}
                      </h3>
                      <button
                        onClick={() => {
                          setModalMode(activeInlineMode === 'context' ? 'learn-more' : activeInlineMode);
                          setIsModalOpen(true);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md transition-all font-semibold"
                        style={{
                          backgroundColor: activeInlineMode === 'fact-check'
                            ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)')
                            : activeInlineMode === 'context'
                              ? (isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)')
                              : (isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)'),
                          color: activeInlineMode === 'fact-check'
                            ? (isDark ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)')
                            : activeInlineMode === 'context'
                              ? (isDark ? 'rgb(251, 191, 36)' : 'rgb(217, 119, 6)')
                              : (isDark ? 'rgb(196, 181, 253)' : 'rgb(126, 34, 206)')
                        }}
                      >
                        View full →
                      </button>
                    </div>
                    {/* Content with Markdown */}
                    <div className="text-sm leading-relaxed text-parchment-800 dark:text-parchment-200 font-serif prose prose-sm dark:prose-invert max-w-none" style={{ lineHeight: '1.75' }}>
                      <ReactMarkdown>{inlineContent}</ReactMarkdown>
                    </div>
                    {/* Hint */}
                    <p className="text-[10px] text-parchment-500 dark:text-parchment-400 italic text-center pt-2 border-t border-parchment-200 dark:border-slate-700">
                      Click button again to open detailed modal view
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Wikipedia entities - only show when no inline content */}
            {!activeInlineMode && (
              <>
                {/* Loading state */}
                {isLoadingWikipedia && enrichedEntities.length === 0 && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-parchment-100 dark:bg-slate-700/50">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 dark:border-amber-500 border-t-transparent"></div>
                    </div>
                    <p className="text-xs font-medium text-parchment-600 dark:text-parchment-400">
                      Researching historical context...
                    </p>
                  </div>
                )}

                {/* Entity cards */}
                {enrichedEntities.length > 0 && enrichedEntities.map((entity, idx) => (
                  <EntityCard key={`${entity.text}-${idx}`} entity={entity} index={idx} />
                ))}

                {/* Enhanced empty state - only when not collapsed */}
                {!isLoadingWikipedia && enrichedEntities.length === 0 && !isCollapsed && (
                  <div className="text-center py-8 px-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-parchment-100 to-parchment-200 dark:from-slate-700/50 dark:to-slate-600/50 border-2 border-parchment-300/50 dark:border-slate-600/50">
                      <svg className="w-8 h-8 text-parchment-500 dark:text-amber-500/50" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-parchment-700 dark:text-parchment-300 mb-1">
                      No historical references yet
                    </p>
                    <p className="text-xs text-parchment-500 dark:text-parchment-400 leading-relaxed max-w-[200px] mx-auto">
                      Wikipedia articles about people, places, and events will appear here as you play
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Historical Context Modal */}
      <HistoricalContextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        narrativeTurn={recentNarrativeTurn}
        scenario={scenario}
        cachedContent={inlineContent} // Pass cached content from inline panel
        activeMode={activeInlineMode} // Pass active mode for color theming
      />

    </aside>
  );
};

export default ContextPanel;
