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
import ReadableTextModal from './ReadableTextModal';
import ReactMarkdown from 'react-markdown';
import { RippleButton } from './RippleButton';

/**
 * Helper component to render source lists with Google Scholar buttons (inline version)
 */
const InlineSourceListRenderer = ({ content, mode, isDark }) => {
  // Parse content to separate sections (Primary Sources, Secondary Sources)
  const lines = content.split('\n').filter(line => line.trim());

  const renderSourceLine = (line, index) => {
    // Match bullet points or numbered lists
    const sourceMatch = line.match(/^[\-\*\d]+\.?\s+(.+)$/);
    if (!sourceMatch) return null;

    const sourceText = sourceMatch[1].trim();

    // Extract the main citation text (remove markdown formatting and parenthetical glosses for search)
    const cleanText = sourceText
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '')   // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
      .replace(/\s*\([^)]*\)/g, ''); // Remove parenthetical glosses like "(Mexico)" or "(Various 17th-century decrees...)"

    // Build Google Scholar URL
    const scholarUrl = `https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=${encodeURIComponent(cleanText)}&btnG=`;

    // Mode-specific colors
    const getColors = () => {
      if (mode === 'fact-check') {
        return {
          bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
          text: isDark ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)'
        };
      } else if (mode === 'context') {
        return {
          bg: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
          text: isDark ? 'rgb(251, 191, 36)' : 'rgb(217, 119, 6)'
        };
      } else {
        return {
          bg: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
          text: isDark ? 'rgb(196, 181, 253)' : 'rgb(126, 34, 206)'
        };
      }
    };

    const colors = getColors();

    // Render markdown in source text (for italics, bold, etc.)
    const renderMarkdown = (text) => {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.+?)\*/g, '<em>$1</em>'); // Italic
    };

    return (
      <div key={index} className="flex items-start gap-2 mb-1.5 group text-xs">
        <span className="flex-shrink-0 text-parchment-500 dark:text-parchment-400">•</span>
        <span
          className="flex-1 text-parchment-700 dark:text-parchment-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(sourceText) }}
        />
        <a
          href={scholarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-semibold rounded transition-all opacity-0 group-hover:opacity-100"
          style={{
            backgroundColor: colors.bg,
            color: colors.text
          }}
          title="Search on Google Scholar"
        >
          🔍 Scholar
        </a>
      </div>
    );
  };

  let currentSection = null;
  const sections = [];
  let currentSectionContent = [];

  lines.forEach((line) => {
    // Check if this is a section header
    if (line.match(/^\*\*Primary Sources?:\*\*/i)) {
      if (currentSection) {
        sections.push({ title: currentSection, content: currentSectionContent });
      }
      currentSection = 'Primary Sources';
      currentSectionContent = [];
    } else if (line.match(/^\*\*Secondary Sources?:\*\*/i)) {
      if (currentSection) {
        sections.push({ title: currentSection, content: currentSectionContent });
      }
      currentSection = 'Secondary Sources';
      currentSectionContent = [];
    } else if (currentSection && line.trim()) {
      currentSectionContent.push(line);
    }
  });

  // Add last section
  if (currentSection && currentSectionContent.length > 0) {
    sections.push({ title: currentSection, content: currentSectionContent });
  }

  return (
    <div className="space-y-3 mt-3">
      {sections.map((section, idx) => (
        <div key={idx}>
          <h5 className="font-sans text-[10px] font-bold mb-1.5 uppercase tracking-wider text-parchment-600 dark:text-parchment-400">
            {section.title}
          </h5>
          <div className="space-y-0.5">
            {section.content.map((line, lineIdx) => renderSourceLine(line, lineIdx))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ContextPanel = ({
  location = 'Mexico City',
  locationDetails = "Botica de la Amargura",
  onActionClick,
  recentNPCs = [], // Direct NPC data from game state
  primaryPortraitFile = null, // PHASE 1: LLM-selected portrait filename
  primaryNpcName = null, // Primary NPC name (conversation partner)
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
  onEnterBuilding = null, // Callback when building entry click on map
  onExitBuilding = null, // Callback when Exit button is clicked on map
  onRoomCommand = null, // Callback for room movement commands
  shopSignHung = false, // Whether the shop sign is currently displayed
  setIsLedgerOpen = null, // Callback to open Ledger Modal
  toggleShopSign = null, // Direct shop sign control
  toast = null, // Toast notifications
  onItemDropOnNPC = null, // Callback when item dropped on NPC portrait
  entities = [], // Entities from LLM (with Wikipedia integration)
  onBookClick = null, // Callback when book is clicked
  documents = [], // Document library (letters, codices, etc.)
  onDocumentClick = null, // Callback when document is clicked
  onSaveToJournal = null, // Callback to save content to journal
  onFurnitureClick = null, // Callback when furniture is clicked on map
  onPlayerTeleport = null, // Callback for Ctrl+Click teleport
  onAnimationComplete = null, // Callback when map animation completes (for journey narration)
  defaultCollapsed = true, // Default collapsed state (set to false for mobile)
  pendingHouseCall = null, // Phase 3B: House call data (triggers map view)
  travelPath = null, // Phase 4: Travel animation path
  isTraveling = false, // Phase 4: Whether currently traveling
  activeTab = 'chronicle', // FIX #4: Current active tab for tab-aware portrait display
  activePatient = null, // FIX #4: Active patient entity for Patient View tab
  reputationChange = null, // { delta: number, timestamp: number } - reputation change indicator
  focusedItem = null, // VIEWPORT: Item player is examining/using
  gameTime = null, // VIEWPORT: Current game time for time-based scenes
  recentLocationChange = false // VIEWPORT: Whether location just changed
}) => {
  // Collapse entire panel state
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

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

  // State for pulsing buttons when new content arrives
  const [pulseButtons, setPulseButtons] = React.useState(false);

  // State for Historical Context Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState('fact-check'); // 'fact-check' | 'learn-more' | 'counternarrative'

  // State for Study Tab readable items (shared with Read button)
  const [readableItemsCache, setReadableItemsCache] = React.useState([]);
  const [readableTextCache, setReadableTextCache] = React.useState({});
  const [isReadableModalOpen, setIsReadableModalOpen] = React.useState(false);
  const [selectedReadableItem, setSelectedReadableItem] = React.useState(null);
  const [isGeneratingReadables, setIsGeneratingReadables] = React.useState(false);
  const cachedLocation = React.useRef(null); // Track location changes for cache invalidation
  const shouldOpenRandomAfterGeneration = React.useRef(false); // Flag to auto-open random item

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
        systemPrompt = `You are a historian with a PhD specializing in 1680s Mexico and Colonial New Spain. You are extremely well-versed in the historical literature and primary sources from this period. Your role is to provide hyper-accurate, stringently realistic fact-checking.

Your responses must be:
- VERY well-informed, skeptical, and succinct, and perhaps a bit barbed 
- Focused on what is historically inaccurate or anachronistic
- Based on actual scholarship and primary sources
- Professional but direct

Include secondary sources as needed:
        **Secondary Sources:**
- [2-3 relevant academic books or journal articles that illuminate this specific event/topic]
- Format: Author, *Title* (Publisher, Year) or Author, "Article Title," *Journal Name* vol. X (Year): pages

${scenarioContext}

If the narrative is historically accurate, briefly confirm this. If there are issues, point them out concisely. Format as a bulleted list with brief explanations.`;
      } else if (mode === 'context') {
        systemPrompt = `You are a historian providing accessible historical context for a game set in 1680s Mexico. Provide 3-4 sentences of clear historical context that helps players understand the period, followed by curated lists of primary and secondary sources.

${scenarioContext}

**CRITICAL REQUIREMENTS:**

1. **PRIMARY SOURCES = documents from 1680s or earlier** (archival docs, contemporary chronicles, letters)
   - Ideally documents that would be available online like public domain books, letters, etc 
  - Ok for them to be in Spanish, English, or any other language

2. **SECONDARY SOURCES = modern academic books/articles ONLY**
   - Must be REAL publications you can verify exist
   - NO archives, NO colonial-era sources
   - If uncertain, cite broader works on colonial Mexico

3. **DO NOT hallucinate** - only cite sources you're confident exist

Format as:
- 3-4 sentences of context

**Primary Sources:**
- Archive/Author, *Title* (Date) - [1-3 sources]

**Secondary Sources:**
- Author, *Title* (Year) - [2-3 REAL academic sources only]

Keep total under 250 words.`;
      } else if (mode === 'counternarrative') {
        systemPrompt = `You are a professional historian specializing in early modern history and history of medicine, deeply alert to agnotology (the study of culturally-induced ignorance). However you are not given to stating the obvious and you avoid cliched or pat assertions about what is missing ("this discussion effaces the role of indigenous healers" is for instance cliched and a boring/not precise enough thought). You are more astute and distinctive than that. 

Your role is to critique the narrative from a historical perspective, asking:
- What assumptions are being made here that might not be true?
- How can we know what is true about this setting? What sources are available and what might they exclude?
- What do we NOT know because of destruction of records?

${scenarioContext}

Write 2-3 thoughtful paragraphs that identify gaps in the historical record and interesting "paths not taken". Be scholarly but accessible.`;
      }

      const response = await createChatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Narrative turn:\n\n${recentNarrativeTurn}` }
        ],
        0.6,
        mode === 'context' ? 1050 : 1000 // Increased tokens for context mode to accommodate sources
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

  // Generate readable items (shared by Study tab and Read button)
  const generateReadableItems = React.useCallback(async () => {
    if (!recentNarrativeTurn) {
      console.log('[ContextPanel] No narrative turn, cannot generate readable items');
      return;
    }

    setIsGeneratingReadables(true);

    try {
      const { createChatCompletion } = await import('../core/services/llmService');

      const messages = [
        {
          role: 'system',
          content: `You are analyzing a scene from a historical game set in 1680s Mexico City. Based on the narrative, list all readable items visible to the player character.

Your response must be a JSON array of objects. Each object should have:
- "name": The title/description of the readable item
- "type": One of "book", "sign", "label", "inscription", "document", or "ambient"
- "description": A brief description (1 sentence)

Priority order:
1. If books/texts are mentioned or plausible (library, study, bookshelf), list 3-5 specific historical books
2. If in a shop/street with signs, list 2-4 visible signs or labels
3. If no text is visible, create ONE "ambient" entry with a spare sensory description

Be historically accurate for 1680s Mexico. Book titles should be real or plausibly real. Keep it brief.

Example format:
[
  {"name": "De Historia Plantarum", "type": "book", "description": "Leather-bound botanical treatise"},
  {"name": "Botica Sign", "type": "sign", "description": "Painted wooden sign above the door"}
]`
        },
        {
          role: 'user',
          content: `Location: ${locationDetails}\n\nNarrative:\n${recentNarrativeTurn}`
        }
      ];

      const response = await createChatCompletion(messages, 0.4, 600, null, { agent: 'ReadableItems' });
      const content = response.choices[0].message.content;

      // Try to parse JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      let items = [];
      if (jsonMatch) {
        items = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create ambient description
        items = [{
          name: 'Ambient Scene',
          type: 'ambient',
          description: content.substring(0, 150)
        }];
      }

      console.log('[ContextPanel] Generated', items.length, 'readable items');
      setReadableItemsCache(items);
      cachedLocation.current = locationDetails;

      // If Read button triggered this, open random item
      if (shouldOpenRandomAfterGeneration.current && items.length > 0) {
        shouldOpenRandomAfterGeneration.current = false;
        const randomIndex = Math.floor(Math.random() * items.length);
        const randomItem = items[randomIndex];
        console.log('[ContextPanel] Auto-opening random readable item:', randomItem.name);
        setSelectedReadableItem(randomItem);
        setIsReadableModalOpen(true);
      }
    } catch (error) {
      console.error('[ContextPanel] Error generating readable items:', error);
      setReadableItemsCache([]);
    } finally {
      setIsGeneratingReadables(false);
    }
  }, [recentNarrativeTurn, locationDetails]);

  // Handle Read action button - opens random readable item from Study tab cache
  const handleReadAction = React.useCallback(() => {
    // Check if cache is valid (same location and has items)
    if (readableItemsCache.length > 0 && cachedLocation.current === locationDetails) {
      // Cache is valid - pick random item and open immediately
      const randomIndex = Math.floor(Math.random() * readableItemsCache.length);
      const randomItem = readableItemsCache[randomIndex];
      console.log('[ContextPanel] Opening random readable item from cache:', randomItem.name);
      setSelectedReadableItem(randomItem);
      setIsReadableModalOpen(true);
    } else {
      // No cache or stale - trigger generation and auto-open random item
      console.log('[ContextPanel] Cache empty/stale, generating readable items...');
      shouldOpenRandomAfterGeneration.current = true;
      generateReadableItems();
    }
  }, [readableItemsCache, locationDetails, generateReadableItems]);

  // Callback when Study tab generates readable items
  const handleItemsGenerated = React.useCallback((items) => {
    console.log('[ContextPanel] Study tab generated', items.length, 'readable items');
    setReadableItemsCache(items);
    cachedLocation.current = locationDetails;
  }, [locationDetails]);

  // Callback when readable item is clicked in Study tab
  const handleReadableItemClick = React.useCallback((item) => {
    console.log('[ContextPanel] Opening readable item from Study tab:', item.name);
    setSelectedReadableItem(item);
    setIsReadableModalOpen(true);
  }, []);

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

  // Pulse buttons when new content arrives (Wikipedia or inline content)
  React.useEffect(() => {
    if (enrichedEntities.length > 0 || (inlineContent && !isLoadingInline)) {
      setPulseButtons(true);
      const timeout = setTimeout(() => setPulseButtons(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [enrichedEntities, inlineContent, isLoadingInline]);

  // Get the most recent NPC from game state
  // DEPRECATED: latestNPC from recentNPCs array (includes location NPCs)
  const latestNPC = recentNPCs.length > 0 ? recentNPCs[recentNPCs.length - 1] : null;

  // Get full NPC data from EntityManager (primary) or EntityList (fallback)
  // Use primaryNpcName (conversation partner only) instead of latestNPC (includes ambient NPCs)
  const npcEntity = React.useMemo(() => {
    const lookupName = primaryNpcName || latestNPC;
    if (!lookupName) return null;

    // Try EntityManager first
    const fromManager = entityManager.getByName(lookupName);
    if (fromManager) {
      console.log('[ContextPanel] Found entity in EntityManager:', fromManager.name);
      return fromManager;
    }

    // Fallback to EntityList for backward compatibility
    const fromList = EntityList.find(npc => npc.name === lookupName);
    if (fromList) {
      console.log('[ContextPanel] Fallback to EntityList:', fromList.name);
    }
    return fromList;
  }, [primaryNpcName, latestNPC]);

  // FIX #4: Choose display entity based on active tab OR active patient portrait match
  // When Patient View tab is active, OR when portrait matches patient, show patient's data
  const displayEntity = React.useMemo(() => {
    // If patient tab is active, always show patient
    if (activeTab === 'patient' && activePatient) {
      console.log('[ContextPanel] Patient View active - displaying patient:', activePatient.name);
      return activePatient;
    }

    // If activePatient exists and primaryPortraitFile matches patient's portrait, show patient
    // This handles the case where contract is accepted but tab hasn't switched yet
    if (activePatient && primaryPortraitFile) {
      const patientPortraitFile = activePatient.image || activePatient.visual?.image;
      if (patientPortraitFile === primaryPortraitFile) {
        console.log('[ContextPanel] Portrait matches patient, displaying patient:', activePatient.name);
        return activePatient;
      }
    }

    // Otherwise, show conversation NPC
    return npcEntity;
  }, [activeTab, activePatient, npcEntity, primaryPortraitFile]);

  // Adapt entity for modal compatibility
  const npcData = React.useMemo(() => {
    if (!displayEntity) return null;

    // Determine modal type
    const entityType = displayEntity.entityType || displayEntity.type;
    const modalType = entityType === 'patient' ? 'patient' : 'npc';

    return adaptEntity(displayEntity, modalType);
  }, [displayEntity]);

  // FIX #4: Get portrait URL with tab-aware logic
  // Prioritize patient portrait when on Patient View tab, otherwise use LLM portrait
  const getPortraitUrl = React.useMemo(() => {
    // If on Patient View tab with active patient, resolve from patient entity
    if (activeTab === 'patient' && activePatient) {
      const patientPortrait = resolvePortrait(activePatient);
      if (patientPortrait) {
        console.log('[ContextPanel] ✓ Using patient portrait from entity:', patientPortrait);
        return patientPortrait;
      }
      console.log('[ContextPanel] ⚠ Patient has no portrait, falling back to primaryPortraitFile');
    }

    // FIX: Check if this is the primary/active NPC - if so, use LLM-selected portrait
    // (matches NPC Modal logic for consistency)
    // Use primaryNpcName (from LLM) instead of latestNPC (from location NPCs - includes ambient characters)
    if (displayEntity && primaryNpcName && displayEntity.name === primaryNpcName && primaryPortraitFile) {
      console.log('[ContextPanel] ✓ Using LLM-selected portrait for primary NPC:', primaryNpcName, '→', primaryPortraitFile);

      // Special case: UI images (like boticaentrance.png) are in /ui/, not /portraits/
      if (primaryPortraitFile.startsWith('ui/')) {
        return `/${primaryPortraitFile}`;
      }

      // Normal portraits are in /portraits/
      return `/portraits/${primaryPortraitFile}`;
    }

    // Check if entity has a named portrait (for non-primary NPCs)
    if (displayEntity) {
      // First check if entity already has a stored portrait (from house calls, etc.)
      const storedPortrait = displayEntity.image || displayEntity.visual?.image;
      if (storedPortrait) {
        const portraitPath = storedPortrait.startsWith('/') ? storedPortrait : `/portraits/${storedPortrait}`;
        console.log('[ContextPanel] ✓ Using stored entity portrait:', portraitPath);
        return portraitPath;
      }

      // Otherwise, resolve portrait from demographics
      const entityPortrait = resolvePortrait(displayEntity);
      if (entityPortrait && !entityPortrait.includes('generic_')) {
        console.log('[ContextPanel] ✓ Using entity demographic portrait for background NPC:', entityPortrait);
        return entityPortrait;
      }
    }

    // Fallback: Use LLM-provided portrait
    if (primaryPortraitFile) {
      console.log('[ContextPanel] ✓ Using LLM portrait (fallback):', primaryPortraitFile);

      // Special case: UI images (like boticaentrance.png) are in /ui/, not /portraits/
      if (primaryPortraitFile.startsWith('ui/')) {
        return `/${primaryPortraitFile}`;
      }

      // Normal portraits are in /portraits/
      return `/portraits/${primaryPortraitFile}`;
    }

    console.log('[ContextPanel] ∅ No portrait provided - map will be shown');
    return null;
  }, [primaryPortraitFile, activeTab, activePatient, displayEntity, primaryNpcName]);

  // Show portrait if:
  // 1. There's a portrait URL (from LLM or entity), OR
  // 2. There's a UI scene image (like boticaentrance.png)
  const isUIImage = getPortraitUrl && getPortraitUrl.startsWith('/ui/');
  const currentNPC = getPortraitUrl ? {
    name: displayEntity?.name || primaryNpcName || 'Scene',
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
    // Handle Read action - opens random readable item from Study tab cache
    if (actionId === 'read') {
      handleReadAction();
      return;
    }

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
      // Trigger a narrative turn with special flag to spawn patient
      if (onRoomCommand) {
        onRoomCommand(null, 'You hang your shop sign outside, displaying it prominently to passersby. Within moments, someone should notice.', { signJustHung: true });
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
    <aside className="hidden xl:flex flex-col w-99 gap-3 h-full overflow-hidden px-1">

      {/* Viewport Panel - Map/Portrait/Weather */}
      <div className="flex-shrink-0 rounded-2xl overflow-hidden shadow-elevation-2 dark:shadow-dark-elevation-3 transition-shadow duration-300 hover:shadow-elevation-3 dark:hover:shadow-dark-elevation-4">
        <ViewportPanel
          location={location}
          locationDetails={locationDetails}
          npcPresent={hasPortrait}
          npcName={currentNPC?.name || null}
          npcPortrait={currentNPC?.url || null}
          focusedItem={focusedItem}
          gameTime={gameTime}
          recentLocationChange={recentLocationChange}
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
          onEnterBuilding={onEnterBuilding}
          onExitBuilding={onExitBuilding}
          onRoomCommand={onRoomCommand}
          onBookClick={onBookClick}
          documents={documents}
          onDocumentClick={onDocumentClick}
          narrativeTurn={recentNarrativeTurn}
          primaryPortraitFile={primaryPortraitFile}
          onFurnitureClick={onFurnitureClick}
          onPlayerTeleport={onPlayerTeleport}
          onAnimationComplete={onAnimationComplete}
          pendingHouseCall={pendingHouseCall}
          travelPath={travelPath}
          isTraveling={isTraveling}
          reputationChange={reputationChange}
          readableItems={readableItemsCache}
          onItemsGenerated={handleItemsGenerated}
          textCache={readableTextCache}
          onReadableItemClick={handleReadableItemClick}
        />
      </div>

      {/* Action Panel */}
      <div className="flex-shrink-0 rounded-2xl overflow-hidden shadow-elevation-1 dark:shadow-dark-elevation-2 transition-shadow duration-300 hover:shadow-elevation-2 dark:hover:shadow-dark-elevation-3">
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
        <div className="flex-shrink-0 px-4 pt-2 pb-1 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-parchment-400/60 dark:via-amber-600/30 to-parchment-400/60 dark:to-amber-600/30 transition-colors duration-300"></div>
            <div className="flex items-center gap-2">
      
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
          className="flex-shrink-0 px-3 pb-1 relative z-10"
          onMouseEnter={() => setIsPanelHovered(true)}
          onMouseLeave={() => setIsPanelHovered(false)}
        >
          <div className="flex items-center justify-center gap-2">
            <RippleButton
              onClick={handleFactCheck}
              rippleColor="rgba(16, 185, 129, 0.4)"
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold font-sans border-2 transition-all duration-300 bg-transparent ${
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
              } ${pulseButtons ? 'animate-pulse-glow ring-2 ring-emerald-400 dark:ring-emerald-500' : ''}`}
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
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold font-sans border-2 transition-all duration-300 bg-transparent ${
                activeInlineMode === 'context'
                  ? 'text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20'
                  : 'text-parchment-600 dark:text-parchment-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/20'
              } ${
                hoveredButton === 'context'
                  ? 'border-amber-400 dark:border-amber-600'
                  : isPanelHovered
                    ? 'border-amber-400/40 dark:border-amber-600/40'
                    : 'border-parchment-300 dark:border-slate-600'
              } ${pulseButtons ? 'animate-pulse-glow ring-2 ring-amber-400 dark:ring-amber-500' : ''}`}
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
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold font-sans border-2 transition-all duration-300 bg-transparent ${
                activeInlineMode === 'counternarrative'
                  ? 'text-purple-700 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-950/20'
                  : 'text-parchment-600 dark:text-parchment-400 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50/30 dark:hover:bg-purple-950/20'
              } ${
                hoveredButton === 'counternarrative'
                  ? 'border-purple-400 dark:border-purple-600'
                  : isPanelHovered
                    ? 'border-purple-400/40 dark:border-purple-600/40'
                    : 'border-parchment-300 dark:border-slate-600'
              } ${pulseButtons ? 'animate-pulse-glow ring-2 ring-purple-400 dark:ring-purple-500' : ''}`}
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
          className={`flex-1 overflow-y-auto px-5 pb-3 relative z-10 transition-all duration-500 custom-scrollbar ${
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onSaveToJournal && inlineContent) {
                              const sourceLabel = activeInlineMode === 'fact-check' ? 'Fact Check' :
                                                activeInlineMode === 'context' ? 'Historical Context' :
                                                'Counter-Narrative';
                              onSaveToJournal(inlineContent, activeInlineMode, sourceLabel);
                            }
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
                          💾 Save
                        </button>
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
                    </div>
                    {/* Content with Markdown */}
                    <div className="text-sm leading-relaxed text-parchment-800 dark:text-parchment-200 font-serif prose prose-sm dark:prose-invert max-w-none" style={{ lineHeight: '1.75' }}>
                      {(() => {
                        // Split content into main text and sources
                        const parts = inlineContent.split(/(?=\*\*(?:Primary|Secondary) Sources?:\*\*)/i);
                        const mainText = parts[0];
                        const sourcesText = parts.slice(1).join('');

                        return (
                          <>
                            <ReactMarkdown>{mainText}</ReactMarkdown>
                            {sourcesText && (
                              <InlineSourceListRenderer
                                content={sourcesText}
                                mode={activeInlineMode}
                                isDark={isDark}
                              />
                            )}
                          </>
                        );
                      })()}
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

      {/* Readable Text Modal - Shared by Study Tab and Read button */}
      <ReadableTextModal
        isOpen={isReadableModalOpen}
        onClose={() => setIsReadableModalOpen(false)}
        item={selectedReadableItem}
        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        textCache={readableTextCache}
        narrativeContext={recentNarrativeTurn}
      />

    </aside>
  );
};

// Memoize to prevent unnecessary re-renders (ALL BROWSERS performance optimization)
export default React.memo(ContextPanel);
