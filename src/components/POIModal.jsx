/**
 * POIModal - Place or Person of Interest Modal
 * Redesigned: clean layout with LLM-generated vivid description
 */

import React, { useState, useEffect, useRef } from 'react';
import { useDrop } from 'react-dnd';
import { entityManager } from '../core/entities/EntityManager';
import { resolvePortrait } from '../core/services/portraitResolver';
import { createChatCompletion } from '../core/services/llmService';
import { getDetailImagePathSync } from '../utils/detailImageResolver';
import { hasStorage, getStorageConfig, canStoreItemType, getOpenImagePath } from '../core/config/furnitureStorage.config';

export function POIModal({ entity, isOpen, onClose, onAction, inventory, onInventoryUpdate }) {
  const [vividDescription, setVividDescription] = useState('');
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Storage view state
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'storage'
  const [showFalseBottom, setShowFalseBottom] = useState(false); // Toggle for false bottom visibility

  // Storage map - keeps separate storage for each furniture piece
  // Structure: { 'Drug Cabinet': { visible: [...], hidden: [...] }, 'Clothing Chest': { visible: [...], hidden: [...] } }
  const storageMapRef = useRef({});

  // Get current furniture's storage
  const furnitureName = entity?.name || '';
  const currentStorage = storageMapRef.current[furnitureName] || { visible: [], hidden: [] };
  const storedItems = currentStorage.visible;
  const hiddenItems = currentStorage.hidden;

  // Fallback emoji state
  const [fallbackEmoji, setFallbackEmoji] = useState(null);
  const [isLoadingEmoji, setIsLoadingEmoji] = useState(false);
  const [imageLoadAttempts, setImageLoadAttempts] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // Cache for vivid descriptions (persists across modal open/close)
  const descriptionCacheRef = useRef({});
  // Cache for fallback emojis
  const emojiCacheRef = useRef({});

  // Store inventory in ref to avoid triggering useDrop re-creation
  const inventoryRef = useRef(inventory);
  useEffect(() => {
    inventoryRef.current = inventory;
    console.log('[POIModal] Inventory updated, count:', inventory?.length || 0);
  }, [inventory]);

  // Handle smooth close with exit animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200); // Match animation duration
  };

  // Reset closing state and view mode when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setViewMode('overview'); // Reset to overview when opening
      setShowFalseBottom(false); // Hide false bottom by default
      setImageLoadFailed(false); // Reset image load state
      setCurrentImageIndex(0);
      setFallbackEmoji(null);

      // Initialize storage for this furniture if it doesn't exist
      if (entity?.name && !storageMapRef.current[entity.name]) {
        storageMapRef.current[entity.name] = { visible: [], hidden: [] };
        console.log('[POIModal] Initialized storage for:', entity.name);
      }
    } else {
      setViewMode('overview'); // Reset when closing too
    }
  }, [isOpen, entity?.name]);

  // Generate list of potential portrait image paths to try
  useEffect(() => {
    if (!isOpen || !entity) {
      setImageLoadAttempts([]);
      return;
    }

    const potentialPaths = [];
    const name = entity.name?.toLowerCase() || '';
    const normalizedName = name.replace(/[^a-z0-9]/g, '_');

    // Try detail images first
    const detailPath = getDetailImagePathSync(entity.name);
    if (detailPath) {
      potentialPaths.push(detailPath);
    }

    // Try exact entity.image if present
    if (entity.image) {
      if (entity.image.includes('/')) {
        potentialPaths.push(entity.image);
      } else {
        potentialPaths.push(`/portraits/${entity.image}`);
      }
    }

    // Try portraits with partial name matches
    // Split name into words and try each as a potential filename
    const words = name.split(/\s+/).filter(w => w.length > 2); // Ignore small words like "a", "of"
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 0) {
        potentialPaths.push(`/portraits/${cleanWord}.jpg`);
        potentialPaths.push(`/portraits/${cleanWord}.png`);
      }
    });

    // Try normalized full name
    potentialPaths.push(`/portraits/${normalizedName}.jpg`);
    potentialPaths.push(`/portraits/${normalizedName}.png`);

    setImageLoadAttempts(potentialPaths);
  }, [isOpen, entity]);

  // Generate vivid description when modal opens
  useEffect(() => {
    if (!isOpen || !entity) {
      setVividDescription('');
      return;
    }

    // Create cache key from entity name + type
    const cacheKey = `${entity.name}-${entity.entityType || entity.type}`;

    // Check if we already have a cached description
    if (descriptionCacheRef.current[cacheKey]) {
      setVividDescription(descriptionCacheRef.current[cacheKey]);
      return;
    }

    // FURNITURE OPTIMIZATION: Use pre-written description directly, skip LLM call
    const isFurniture = entity.type === 'furniture' || entity.category === 'Furniture';
    if (isFurniture && entity.description) {
      const prewrittenDesc = entity.description;
      setVividDescription(prewrittenDesc);
      descriptionCacheRef.current[cacheKey] = prewrittenDesc;
      return; // Skip LLM call entirely
    }

    setIsLoadingDescription(true);

    // Contextual prompt based on entity type
    const isDirectObservation = entityType === 'item' ||
                                (entityType === 'location' && entity.locationType === 'Interior');

    const systemPrompt = isDirectObservation
      ? `You are a vivid scene describer for a historical RPG set in 1680s Mexico City.
Given an entity description, write a SHORT (1-2 sentences max) vivid description in second person ("You see..." or "You examine...").
Be immersive, sensory, and historically accurate. Use evocative language but keep it concise.`
      : `You are a vivid scene describer for a historical RPG set in 1680s Mexico City.
Given an entity description, write a SHORT (1-2 sentences max) evocative description.
For locations, describe what you know or recall about the place. For people, describe who they are.
Avoid "you see" unless it's something immediately visible. Be immersive and historically accurate.`;

    const userPrompt = isDirectObservation
      ? `Entity: ${entity.name}
Type: ${entity.entityType || entity.type || 'unknown'}
Description: ${entity.description || 'A person/place of interest'}

Write a vivid second-person description (1-2 sentences) of what you see/examine.`
      : `Entity: ${entity.name}
Type: ${entity.entityType || entity.type || 'unknown'}
Description: ${entity.description || 'A person/place of interest'}

Write an evocative description (1-2 sentences). Use "You recall..." or "You know of..." for distant places. Describe people neutrally or as "You think about..."`;

    // Correct function signature: createChatCompletion(messages, temperature, maxTokens, responseFormat, metadata)
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    createChatCompletion(messages, 0.7, 100, null, { agent: 'POIDescriber' })
      .then(response => {
        const text = response.choices[0].message.content.trim();
        setVividDescription(text);
        // Cache the description
        descriptionCacheRef.current[cacheKey] = text;
      })
      .catch(error => {
        console.error('[POIModal] Error generating vivid description:', error);
        const fallbackText = `You see ${entity.name}. ${entity.description || ''}`;
        setVividDescription(fallbackText);
        // Cache the fallback too
        descriptionCacheRef.current[cacheKey] = fallbackText;
      })
      .finally(() => {
        setIsLoadingDescription(false);
      });
  }, [isOpen, entity]);

  // Generate fallback emoji when all images fail to load
  useEffect(() => {
    if (!isOpen || !entity || !imageLoadFailed || !vividDescription) return;

    // Check emoji cache first
    const cacheKey = `${entity.name}-${entity.entityType || entity.type}`;
    if (emojiCacheRef.current[cacheKey]) {
      setFallbackEmoji(emojiCacheRef.current[cacheKey]);
      return;
    }

    setIsLoadingEmoji(true);

    const systemPrompt = `You are an emoji selector for a historical RPG. Given a vivid description of an entity, select the SINGLE MOST APPROPRIATE emoji to represent it visually.
Rules:
- Return ONLY the emoji character itself, nothing else
- No text, no explanations, just the emoji
- Choose historically appropriate emojis when possible
- For animals, use the animal emoji
- For people, use person/face emojis
- For objects, use the closest matching object emoji
- For places, use building/location emojis`;

    const userPrompt = `Entity name: ${entity.name}
Description: ${vividDescription}

Return ONLY the single best emoji to represent this:`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    createChatCompletion(messages, 0.3, 10, null, { agent: 'EmojiSelector', model: 'gemini-2.0-flash-exp' })
      .then(response => {
        const emoji = response.choices[0].message.content.trim();
        setFallbackEmoji(emoji);
        emojiCacheRef.current[cacheKey] = emoji;
        console.log('[POIModal] Generated fallback emoji:', emoji, 'for', entity.name);
      })
      .catch(error => {
        console.error('[POIModal] Error generating emoji:', error);
        setFallbackEmoji('📦'); // Ultimate fallback
        emojiCacheRef.current[cacheKey] = '📦';
      })
      .finally(() => {
        setIsLoadingEmoji(false);
      });
  }, [isOpen, entity, imageLoadFailed, vividDescription]);

  // Drag and drop handler for storage using react-dnd
  const handleItemDrop = (item, isHiddenCompartment = false) => {
    const itemName = item.name;

    // Find item in inventory using ref to avoid re-render issues
    const currentInventory = inventoryRef.current;
    const inventoryItem = currentInventory?.find(invItem => invItem.name === itemName);
    if (!inventoryItem) {
      console.warn('[POIModal] Item not found in inventory:', itemName);
      return;
    }

    // Validate item type can be stored
    const itemType = inventoryItem.category || inventoryItem.type || 'item';
    if (!canStoreItemType(entity.name, itemType, isHiddenCompartment)) {
      console.warn('[POIModal] Item type not allowed in this furniture:', itemType);
      alert(`Cannot store ${itemType} items in ${entity.name}${isHiddenCompartment ? ' (false bottom)' : ''}`);
      return;
    }

    // Check capacity
    const storageConfig = getStorageConfig(entity.name);
    const currentItems = isHiddenCompartment ? hiddenItems : storedItems;
    const capacity = isHiddenCompartment ? storageConfig.hiddenCapacity : storageConfig.capacity;

    if (currentItems.length >= capacity) {
      alert(`${entity.name} is full (${capacity} items max)`);
      return;
    }

    // Get icon path
    const iconName = itemName
      .toLowerCase()
      .replace(/[']/g, '')
      .replace(/\s+/g, '_');
    const iconPath = `${iconName}_icon.png`;

    // Add item to storage
    const newItem = {
      name: inventoryItem.name,
      icon: iconPath,
      category: inventoryItem.category,
      quantity: 1 // For now, store 1 at a time
    };

    // Store item in storage map for this furniture
    // IMPORTANT: Read current state from ref, not from stale render variables
    const currentStorage = storageMapRef.current[entity.name] || { visible: [], hidden: [] };

    if (isHiddenCompartment) {
      storageMapRef.current[entity.name] = {
        ...currentStorage,
        hidden: [...currentStorage.hidden, newItem]
      };
      console.log('[POIModal] Storage now has', currentStorage.hidden.length + 1, 'hidden items');
    } else {
      storageMapRef.current[entity.name] = {
        ...currentStorage,
        visible: [...currentStorage.visible, newItem]
      };
      console.log('[POIModal] Storage now has', currentStorage.visible.length + 1, 'visible items');
    }

    // Force re-render
    setViewMode(vm => vm === 'storage' ? 'storage-refresh' : 'storage');

    // Remove from inventory (callback to parent)
    if (onInventoryUpdate) {
      console.log('[POIModal] Removing item from inventory:', itemName, '-1', 'for', entity.name);
      onInventoryUpdate(itemName, -1); // Decrease by 1
    } else {
      console.warn('[POIModal] onInventoryUpdate callback not provided!');
    }

    console.log('[POIModal] Item stored:', itemName, 'Hidden:', isHiddenCompartment, 'in', entity.name);
  };

  // Drop zone for visible storage (using react-dnd)
  // Note: Removed 'inventory' and storage arrays from dependencies to prevent re-render loop
  // Storage is managed via ref, not state
  const [{ isOverVisible }, dropVisibleRef] = useDrop(() => ({
    accept: 'INVENTORY_ITEM',
    drop: (item) => handleItemDrop(item, false),
    collect: (monitor) => ({
      isOverVisible: monitor.isOver(),
    }),
  }), [entity]);

  // Drop zone for hidden storage (using react-dnd)
  // Note: Removed 'inventory' and storage arrays from dependencies to prevent re-render loop
  // Storage is managed via ref, not state
  const [{ isOverHidden }, dropHiddenRef] = useDrop(() => ({
    accept: 'INVENTORY_ITEM',
    drop: (item) => handleItemDrop(item, true),
    collect: (monitor) => ({
      isOverHidden: monitor.isOver(),
    }),
  }), [entity]);

  const handleRemoveFromStorage = (itemName, isHiddenCompartment = false) => {
    // Remove from storage map for this furniture
    // IMPORTANT: Read current state from ref, not from stale render variables
    const currentStorage = storageMapRef.current[entity.name] || { visible: [], hidden: [] };

    if (isHiddenCompartment) {
      storageMapRef.current[entity.name] = {
        ...currentStorage,
        hidden: currentStorage.hidden.filter(item => item.name !== itemName)
      };
    } else {
      storageMapRef.current[entity.name] = {
        ...currentStorage,
        visible: currentStorage.visible.filter(item => item.name !== itemName)
      };
    }

    // Force re-render
    setViewMode(vm => vm === 'storage' ? 'storage-refresh' : 'storage');

    // Add back to inventory
    if (onInventoryUpdate) {
      console.log('[POIModal] Returning item to inventory:', itemName, '+1', 'from', entity.name);
      onInventoryUpdate(itemName, 1); // Increase by 1
    } else {
      console.warn('[POIModal] onInventoryUpdate callback not provided!');
    }

    console.log('[POIModal] Item removed from storage:', itemName, 'from', entity.name);
  };

  if (!isOpen || !entity) return null;

  const entityType = entity.entityType || entity.type || 'unknown';
  const isLocation = entityType === 'location';
  const isPatient = entityType === 'patient';
  const isNPC = entityType === 'npc';
  const isItem = entityType === 'item';

  // Check if this furniture has storage
  const isFurniture = entity.type === 'furniture' || entity.category === 'Furniture';
  const furnitureHasStorage = isFurniture && hasStorage(entity.name);
  const storageConfig = furnitureHasStorage ? getStorageConfig(entity.name) : null;

  // Handle image load error - try next image in attempts list
  const handleImageError = () => {
    console.log('[POIModal] Image failed to load, trying next...', currentImageIndex, 'of', imageLoadAttempts.length);

    if (currentImageIndex < imageLoadAttempts.length - 1) {
      // Try next image
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // All images failed, use emoji fallback
      console.log('[POIModal] All images failed, using emoji fallback');
      setImageLoadFailed(true);
    }
  };

  // Get current image to display
  const headerImage = (() => {
    // STORAGE MODE: Use open-state image if viewing storage
    if (viewMode.startsWith('storage')) {
      const openImagePath = getOpenImagePath(entity.name);
      if (openImagePath) {
        return openImagePath;
      }
    }

    // If we have image load attempts, use the current one
    if (imageLoadAttempts.length > 0 && currentImageIndex < imageLoadAttempts.length) {
      return imageLoadAttempts[currentImageIndex];
    }

    // NPCs/Patients fallback to portrait resolver
    if (isNPC || isPatient) {
      return resolvePortrait(entity);
    }

    // Default fallback images by type
    if (isLocation) {
      if (entity.locationType === 'Interior' || entity.name?.toLowerCase().includes('botica')) {
        return '/locations/boticaentrance.png';
      }
      return '/assets/parchment.jpg';
    }
    if (isItem) return '/assets/parchment.jpg';
    return '/assets/parchment.jpg';
  })();

  // Get icon based on entity type
  const getIcon = () => {
    if (isLocation) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (isPatient) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (isItem) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    );
  };

  // Get subtitle based on entity type
  const getSubtitle = () => {
    if (isLocation && entity.locationType) {
      return `${entity.locationType}${entity.travelTime ? ` • ${entity.travelTime}` : ''}`;
    }
    if (isPatient) {
      return `Patient${entity.urgency ? ` • ${entity.urgency} Urgency` : ''}`;
    }
    if (isNPC) {
      return `${entity.occupation || 'Character'}${entity.class ? ` • ${entity.class}` : ''}`;
    }
    if (isItem) {
      return `${entity.category || 'Item'}${entity.price ? ` • ${entity.price} reales` : ''}`;
    }
    return entityType;
  };

  // Render storage view (when viewing furniture storage)
  const renderStorageView = () => {
    if (!furnitureHasStorage || !storageConfig) return null;

    const hasHiddenStorage = storageConfig.hasFalseBottom;

    return (
      <div className="space-y-6">
        {/* Storage Instructions */}
        <InfoCard title="Storage" color="amber">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Drag items from your inventory onto the image above to store them. {storageConfig.description}
          </p>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Capacity: {storedItems.length}/{storageConfig.capacity}
            {hasHiddenStorage && ` • Hidden: ${hiddenItems.length}/${storageConfig.hiddenCapacity}`}
          </div>
        </InfoCard>

        {/* Stored Items Display - Compact */}
        {storedItems.length > 0 && (
          <InfoCard title="Stored Items (Click to remove)" color="green">
            <div className="flex flex-wrap gap-1.5">
              {storedItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="relative flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-amber-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
                  onClick={() => handleRemoveFromStorage(item.name, false)}
                  title={`Click to remove ${item.name} and return to inventory`}
                >
                  {item.icon ? (
                    <img src={`/icons/${item.icon}`} alt={item.name} className="w-5 h-5 object-contain" />
                  ) : (
                    <div className="w-5 h-5 flex items-center justify-center text-sm">
                      📦
                    </div>
                  )}
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">×</span>
                </button>
              ))}
            </div>
          </InfoCard>
        )}

        {/* False Bottom (Hidden Storage) */}
        {hasHiddenStorage && (
          <div className="space-y-3">
            <button
              onClick={() => setShowFalseBottom(!showFalseBottom)}
              className="w-full px-4 py-2.5 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>{showFalseBottom ? '🔒 Hide' : '🔓 Reveal'} False Bottom</span>
            </button>

            {showFalseBottom && (
              <InfoCard title="Hidden Compartment (False Bottom)" color="red">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Secret compartment for concealing dangerous or prohibited items. Drag items here to hide them from casual inspection.
                </p>
                <div
                  ref={dropHiddenRef}
                  className={`min-h-[100px] border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg p-3 bg-red-50/30 dark:bg-red-950/30 ${isOverHidden ? 'ring-2 ring-red-400 bg-red-100/50 dark:bg-red-900/50' : ''}`}
                >
                  {hiddenItems.length === 0 ? (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                      Drop items here to hide them
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {hiddenItems.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="relative flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-800 rounded border border-red-200 dark:border-red-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                          onClick={() => handleRemoveFromStorage(item.name, true)}
                          title={`Click to remove ${item.name} and return to inventory`}
                        >
                          {item.icon ? (
                            <img src={`/icons/${item.icon}`} alt={item.name} className="w-5 h-5 object-contain" />
                          ) : (
                            <div className="w-5 h-5 flex items-center justify-center text-sm">
                              📦
                            </div>
                          )}
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">×</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </InfoCard>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render left column (primary info)
  const renderLeftColumn = () => {
    if (isLocation) {
      return (
        <>
          {entity.travelTime && (
            <InfoCard icon="📍" title="Travel Time" color="amber">
              <p className="text-sm text-gray-700 dark:text-gray-300">{entity.travelTime}</p>
            </InfoCard>
          )}
          {entity.coordinates && (
            <InfoCard title="Coordinates" color="blue">
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">{entity.coordinates}</p>
            </InfoCard>
          )}
          {entity.specimens && entity.specimens.length > 0 && (
            <InfoCard title="Specimens" color="purple">
              <div className="flex flex-wrap gap-2">
                {entity.specimens.map((specimen, idx) => (
                  <span key={idx} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded-md">
                    {specimen}
                  </span>
                ))}
              </div>
            </InfoCard>
          )}
        </>
      );
    }

    if (isPatient || isNPC) {
      return (
        <>
          {(entity.age || entity.occupation || entity.birthplace || entity.casta) && (
            <InfoCard title="Personal Information" color="amber">
              <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                {entity.age && <div><span className="font-medium">Age:</span> {entity.age}</div>}
                {entity.occupation && <div><span className="font-medium">Occupation:</span> {entity.occupation}</div>}
                {entity.birthplace && <div><span className="font-medium">Birthplace:</span> {entity.birthplace}</div>}
                {entity.casta && <div><span className="font-medium">Casta:</span> {entity.casta}</div>}
              </div>
            </InfoCard>
          )}
          {isPatient && (entity.diagnosis || entity.urgency) && (
            <InfoCard title="Medical Information" color="red">
              <div className="space-y-2">
                {entity.diagnosis && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Diagnosis:</span> {entity.diagnosis}
                  </div>
                )}
                {entity.urgency && (
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      entity.urgency === 'High' || entity.urgency === 'Critical' ? 'bg-red-600 text-white' :
                      entity.urgency === 'Medium' || entity.urgency === 'Moderate' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {entity.urgency}
                    </span>
                  </div>
                )}
              </div>
            </InfoCard>
          )}
          {entity.socialContext && (
            <InfoCard title="Social Context" color="blue">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{entity.socialContext}</p>
            </InfoCard>
          )}
          {entity.relationships && Object.keys(entity.relationships).length > 0 && (
            <InfoCard title="Relationships" color="purple">
              <div className="space-y-2">
                {Object.entries(entity.relationships).map(([name, relationship]) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      relationship.affinity > 50 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      relationship.affinity < 30 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {relationship.type}
                    </span>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}
        </>
      );
    }

    if (isItem) {
      const isFurniture = entity.type === 'furniture' || entity.category === 'Furniture';

      // FURNITURE: Only show category and historical context
      if (isFurniture) {
        return (
          <>
          
            {entity.historicalContext && (
              <InfoCard title="Historical Context" color="blue">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{entity.historicalContext}</p>
              </InfoCard>
            )}
          </>
        );
      }

      // MATERIA MEDICA: Show full properties including medical properties
      return (
        <>
          <InfoCard title="Properties" color="amber">
            <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              {entity.category && <div><span className="font-medium">Category:</span> {entity.category}</div>}
              {entity.price && <div><span className="font-medium">Price:</span> {entity.price} reales</div>}
              {entity.origin && <div><span className="font-medium">Origin:</span> {entity.origin}</div>}
              {entity.rarity && <div><span className="font-medium">Rarity:</span> {entity.rarity}</div>}
            </div>
          </InfoCard>
          {entity.properties && entity.properties.length > 0 && (
            <InfoCard title="Medical Properties" color="green">
              <ul className="space-y-1">
                {entity.properties.map((prop, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">• {prop}</li>
                ))}
              </ul>
            </InfoCard>
          )}
          {entity.historicalContext && (
            <InfoCard title="Historical Context" color="blue">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{entity.historicalContext}</p>
            </InfoCard>
          )}
        </>
      );
    }

    return null;
  };

  // Render right column (secondary info) - now only for locations
  const renderRightColumn = () => {
    if (isLocation) {
      return (
        <>
          {entity.locationType && (
            <InfoCard title="Terrain" color="green">
              <p className="text-sm text-gray-700 dark:text-gray-300">{entity.locationType}</p>
              {entity.fatigueImpact !== undefined && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Fatigue Impact</span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{entity.fatigueImpact || 'Low'}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${
                      entity.fatigueImpact === 'Low' ? 'bg-green-500 w-1/3' :
                      entity.fatigueImpact === 'Medium' ? 'bg-yellow-500 w-2/3' :
                      'bg-red-500 w-full'
                    }`} />
                  </div>
                </div>
              )}
            </InfoCard>
          )}
          {entity.features && entity.features.length > 0 && (
            <InfoCard title="Features" color="blue">
              <ul className="space-y-1">
                {entity.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">• {feature}</li>
                ))}
              </ul>
            </InfoCard>
          )}
        </>
      );
    }

    return null;
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 bg-parchment-900/50 backdrop-blur-md ${isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}>
      <div className="absolute inset-0" onClick={handleClose} aria-label="Close modal" />

      <div className={`relative w-full max-w-[95vw] h-[76vh] overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-emerald-500/30 dark:border-amber-500/30 flex flex-col ${isClosing ? 'animate-modal-scale-out' : 'animate-modal-scale-in'}`}>

        {/* Top Section: Image + Title */}
        <div
          ref={viewMode.startsWith('storage') && furnitureHasStorage ? dropVisibleRef : null}
          className={`relative flex-shrink-0 overflow-hidden ${viewMode.startsWith('storage') && isOverVisible ? 'ring-4 ring-amber-400 ring-opacity-50' : ''}`}
          style={{ height: '50%' }}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            {imageLoadFailed && fallbackEmoji ? (
              // Emoji fallback when all images fail
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-parchment-100 to-parchment-200 dark:from-slate-800 dark:to-slate-900">
                <div className="text-9xl select-none">{fallbackEmoji}</div>
              </div>
            ) : isLoadingEmoji ? (
              // Loading state while generating emoji
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-parchment-100 to-parchment-200 dark:from-slate-800 dark:to-slate-900">
                <div className="flex flex-col items-center gap-3">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-3 border-emerald-600 dark:border-amber-400"></div>
                  <span className="text-sm text-ink-500 dark:text-parchment-300 font-sans">Generating fallback...</span>
                </div>
              </div>
            ) : (
              // Normal image display with sequential fallback
              <img
                src={headerImage}
                alt={entity.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 25%' }}
                onError={handleImageError}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-black/0" />
          </div>

          {/* Stored Item Icons Overlaid on Image (Storage Mode Only) */}
          {viewMode.startsWith('storage') && storedItems.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl p-6">
                {storedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 bg-black/50 backdrop-blur-md rounded-xl border-2 border-white/40 flex items-center justify-center shadow-2xl"
                    title={item.name}
                  >
                    {item.icon ? (
                      <img src={`/icons/${item.icon}`} alt={item.name} className="w-14 h-14 object-contain drop-shadow-lg" />
                    ) : (
                      <div className="text-4xl drop-shadow-lg">📦</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 z-10 border border-white/20 hover:border-white/40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {/* Icon Badge */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-amber-600 dark:to-amber-700 flex items-center justify-center text-white shadow-xl mb-3 border-2 border-white/30">
              {getIcon()}
            </div>

            {/* Title & Subtitle */}
            <h2 className="text-3xl font-bold text-white drop-shadow-2xl font-serif leading-tight mb-1">
              {entity.name}
            </h2>
            <p className="text-emerald-200 uppercase tracking-wider dark:text-amber-200 text-sm font-medium drop-shadow-lg">
              {getSubtitle()}
            </p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">

            {/* STORAGE VIEW: Show storage interface when in storage mode */}
            {viewMode.startsWith('storage') ? (
              renderStorageView()
            ) : (
              <>
                {/* OVERVIEW MODE: Show normal entity information */}

                {/* Vivid LLM-Generated Description */}
                <div className="relative">
                  {isLoadingDescription ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 dark:border-amber-400 mr-3"></div>
                      <span className="text-sm text-ink-500 dark:text-parchment-300 font-sans">Observing...</span>
                    </div>
                  ) : vividDescription ? (
                    <div className="relative p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-amber-950/40 dark:to-amber-900/20 border-2 border-emerald-300/50 dark:border-amber-600/30">
                      <div className="absolute top-4 left-4 text-3xl opacity-10">👁️</div>
                      <p className="text-xl font-serif text-ink-900 dark:text-parchment-100 leading-relaxed italic pl-14">
                        {vividDescription}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Information Sections */}
                <div className="space-y-4">
                  {/* Primary Information */}
                  {renderLeftColumn() && (
                    <div className="space-y-3">
                      {renderLeftColumn()}
                    </div>
                  )}

                  {/* Secondary Information */}
                  {renderRightColumn() && (
                    <div className="space-y-3">
                      {renderRightColumn()}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="flex-shrink-0 border-t-2 border-parchment-200 dark:border-slate-700 bg-parchment-50/50 dark:bg-slate-800/50 p-4">
          <div className="flex gap-3">
            {/* STORAGE MODE: Show "Back to Overview" button */}
            {viewMode.startsWith('storage') ? (
              <>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 bg-parchment-100 hover:bg-parchment-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-ink-900 dark:text-parchment-100 font-medium rounded-xl transition-all duration-200 border border-parchment-300 dark:border-slate-600"
                >
                  Close
                </button>
                <button
                  onClick={() => setViewMode('overview')}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  ← Back to Overview
                </button>
              </>
            ) : (
              <>
                {/* OVERVIEW MODE: Show normal actions + "Open" for furniture with storage */}
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 bg-parchment-100 hover:bg-parchment-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-ink-900 dark:text-parchment-100 font-medium rounded-xl transition-all duration-200 border border-parchment-300 dark:border-slate-600"
                >
                  Close
                </button>

                {/* "Open" button for furniture with storage */}
                {furnitureHasStorage && (
                  <button
                    onClick={() => setViewMode('storage')}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>🔓</span>
                    <span>Open {entity.name}</span>
                  </button>
                )}

                {/* Normal action button (Examine, Speak, etc.) */}
                {onAction && !furnitureHasStorage && (
                  <button
                    onClick={() => onAction(entity)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-amber-600 dark:to-amber-700 hover:from-emerald-500 hover:to-emerald-600 dark:hover:from-amber-500 dark:hover:to-amber-600 text-white dark:text-slate-900 font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isLocation ? 'Travel Here' : isPatient ? 'Examine' : isNPC ? 'Speak' : 'View Details'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// InfoCard component for consistent styling
function InfoCard({ title, children, color = 'gray', icon }) {
  const colorStyles = {
    amber: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30',
    red: 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30',
    green: 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30',
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30',
    purple: 'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30',
    gray: 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30',
  };

  return (
    <div className={`border rounded-lg p-3 ${colorStyles[color] || colorStyles.gray}`}>
      <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
}

export default POIModal;
