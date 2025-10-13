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

const ContextPanel = ({
  location = 'Mexico City',
  locationDetails = "Botica de la Amargura",
  onActionClick,
  recentNPCs = [], // Direct NPC data from game state
  currentNarrative, // Fallback for narrative parsing
  recentNarrativeTurn = '', // Most recent narrative turn for LLM analysis
  scenario = null, // Scenario config for maps and historical context
  npcs = [], // NPCs to show on map
  playerPosition = null, // Player position for map rendering
  onLocationChange = null, // Callback when location changes
  onPortraitClick = null, // Callback when portrait is clicked
  onMapClick = null, // Callback when map is clicked to open modal
  shopSignHung = false, // Whether the shop sign is currently displayed
  setIsLedgerOpen = null, // Callback to open Ledger Modal
  toggleShopSign = null, // Direct shop sign control
  toast = null, // Toast notifications
  onItemDropOnNPC = null, // Callback when item dropped on NPC portrait
  entities = [], // Entities from LLM (with Wikipedia integration)
  discoveredBooks = [], // Books discovered during gameplay
  onBookClick = null // Callback when book is clicked
}) => {
  // Compact mode toggle state
  const [isCompact, setIsCompact] = React.useState(false);

  // Animated entry state
  const [isVisible, setIsVisible] = React.useState(false);

  // State for Wikipedia-enriched entities
  const [enrichedEntities, setEnrichedEntities] = React.useState([]);
  const [isLoadingWikipedia, setIsLoadingWikipedia] = React.useState(false);

  // State for Historical Context Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState('fact-check'); // 'fact-check' | 'learn-more' | 'counternarrative'

  // Button click handlers
  const handleFactCheck = () => {
    setModalMode('fact-check');
    setIsModalOpen(true);
  };

  const handleLearnMore = () => {
    setModalMode('learn-more');
    setIsModalOpen(true);
  };

  const handleCounterNarrative = () => {
    setModalMode('counternarrative');
    setIsModalOpen(true);
  };

  // Trigger fade-in animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Wikipedia data when entities change
  React.useEffect(() => {
    if (entities && entities.length > 0) {
      setIsLoadingWikipedia(true);
      console.log('[ContextPanel] Fetching Wikipedia data for entities:', entities);

      fetchEntitiesWithWikipedia(entities)
        .then((enriched) => {
          setEnrichedEntities(enriched);
          setIsLoadingWikipedia(false);
          console.log('[ContextPanel] Wikipedia data fetched:', enriched);
        })
        .catch((error) => {
          console.error('[ContextPanel] Error fetching Wikipedia data:', error);
          setEnrichedEntities(entities); // Fallback to original entities
          setIsLoadingWikipedia(false);
        });
    } else {
      setEnrichedEntities([]);
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

  // Get portrait URL using new portrait resolver
  const getPortraitUrl = React.useMemo(() => {
    if (!npcEntity) return null;

    // Use the new portrait resolver system
    return resolvePortrait(npcEntity);
  }, [npcEntity]);

  const currentNPC = latestNPC && getPortraitUrl ? {
    name: latestNPC,
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
    <aside className="hidden xl:flex flex-col w-80 gap-4 h-full overflow-hidden">

      {/* Viewport Panel - Map/Portrait/Weather */}
      <div className="flex-shrink-0">
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
          onLocationChange={onLocationChange}
          onMapClick={onMapClick}
          discoveredBooks={discoveredBooks}
          onBookClick={onBookClick}
        />
      </div>

      {/* Action Panel */}
      <ActionPanel
        hasActiveNPC={hasPortrait}
        onActionClick={handleActionPanelClick}
        location={location}
        shopSignHung={shopSignHung}
        className="flex-shrink-0"
      />

      {/* Historical Context Panel - Scrollable and Bounded */}
      <div
        className={`group rounded-2xl transition-all duration-500 relative overflow-hidden flex flex-col flex-1 min-h-0 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(30, 41, 59, 0.92) 50%, rgba(15, 23, 42, 0.90) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(249, 245, 235, 0.92) 50%, rgba(252, 250, 247, 0.90) 100%)',
          backdropFilter: 'blur(16px) saturate(120%)',
          WebkitBackdropFilter: 'blur(16px) saturate(120%)',
          border: isDark ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(209, 213, 219, 0.3)',
          boxShadow: isDark
            ? '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            : '0 4px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Subtle hover effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 80%, rgba(240, 253, 244, 0.15) 0%, rgba(255, 255, 255, 0.4) 30%, rgba(252, 250, 247, 0.2) 60%, transparent 100%)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          }}
        />

        {/* Header with Elegant Dividers + Compact Toggle */}
        <div className="flex-shrink-0 px-3 pt-2 pb-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4c5a9] to-[#d4c5a9]"></div>
            <span className="font-['Crimson_Text'] text-[11px] font-semibold text-gray-600 dark:text-parchment-300 uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-300">
              Historical Context
            </span>
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="w-4 h-4 flex items-center justify-center rounded-md hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors flex-shrink-0"
              title={isCompact ? "Expand" : "Collapse"}
            >
              <svg
                className={`w-3 h-3 text-gray-500 dark:text-slate-400 transition-all duration-300 ${isCompact ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-parchment-400 dark:via-slate-600 to-parchment-400 dark:to-slate-600 transition-colors duration-300"></div>
          </div>
        </div>

        {/* Pill-style Action Buttons */}
        <div className="flex-shrink-0 px-3 pb-2 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={handleFactCheck}
              className="text-[11px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md font-semibold font-sans border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors duration-300"
            >
              Fact check
            </button>
            <button
              onClick={handleLearnMore}
              className="text-[11px] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md font-semibold font-sans border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors duration-300"
            >
              Learn more
            </button>
            <button
              onClick={handleCounterNarrative}
              className="text-[11px] px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-md font-semibold font-sans border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors duration-300"
            >
              Counternarrative
            </button>
          </div>
        </div>

        {/* Content Area - Scrollable (Collapsible) */}
        <div
          className={`flex-1 overflow-y-auto px-3 pb-3 relative z-10 transition-all duration-500 ${
            isCompact ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-full opacity-100'
          }`}
        >
          <div className="text-sm text-gray-600 dark:text-parchment-300 font-sans space-y-1.5 transition-colors duration-300">
            {/* Loading state */}
            {isLoadingWikipedia && enrichedEntities.length === 0 && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 dark:border-amber-500"></div>
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-400">Loading context...</p>
              </div>
            )}

            {/* Entity cards */}
            {enrichedEntities.length > 0 && enrichedEntities.map((entity, idx) => (
              <EntityCard key={`${entity.text}-${idx}`} entity={entity} index={idx} />
            ))}

            {/* Empty state */}
            {!isLoadingWikipedia && enrichedEntities.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Historical context will appear here as you interact with the world
                </p>
              </div>
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
      />

    </aside>
  );
};

export default ContextPanel;
