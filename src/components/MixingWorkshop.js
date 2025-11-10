import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MethodDropZone from './MethodDropZone';
import DraggableIngredient from './DraggableIngredient';
import CompoundResultCard from './CompoundResultCard';
import ActiveBonusIndicator from './ActiveBonusIndicator';
import { createChatCompletion } from '../core/services/llmService';
import resourceManager from '../systems/ResourceManager';
import { useGesture } from '../hooks/useGesture';
import {
  getMixingTimeMultiplier,
  getIngredientRetentionChance,
  getDoubleBatchChance,
  canPreventSludge
} from '../core/systems/professionAbilities';
import MedicineTypeBadge from './MedicineTypeBadge';
import { getAllMedicineTypes, inferMedicineType, getMedicineType } from '../core/config/medicineCategories';

// Method images
import distillImage from '../assets/distill.jpg';
import distillActiveImage from '../assets/distill-active.jpg';
import sublimateImage from '../assets/sublimate.jpg';
import sublimateActiveImage from '../assets/sublimate-active.jpg';
import decoctImage from '../assets/decoct.jpg';
import decoctActiveImage from '../assets/decoct-active.jpg';
import calcinateImage from '../assets/calcinate.jpg';
import calcinateActiveImage from '../assets/calcinate-active.jpg';
import confectionImage from '../assets/confection.jpg';
import confectionActiveImage from '../assets/confection-active.jpg';

const MixingWorkshop = ({
  isOpen,
  onClose,
  simples,
  addCompoundToInventory,
  updateInventory,
  addJournalEntry,
  unlockedMethods = ['Decoct', 'Confection', 'Distill', 'Calcinate', 'Sublimate'],
  advanceTime,
  awardXP,
  awardSkillXP,
  gameState = {} // Add gameState prop for profession abilities
}) => {
  const [selectedSimples, setSelectedSimples] = useState({});
  const [isMixButtonEnabled, setIsMixButtonEnabled] = useState(false);
  const [compoundResult, setCompoundResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredSimple, setHoveredSimple] = useState(null);
  const [inventoryPage, setInventoryPage] = useState(0);
  const [medicineTypeFilter, setMedicineTypeFilter] = useState('all');
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [isClosing, setIsClosing] = useState(false);

  // Handle smooth close with exit animation
  const handleClose = () => {
    if (isLoading) return; // Don't close while loading
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  // Reset closing state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Watch for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  // Swipe-to-close gesture support
  const gestureRef = useGesture({
    onSwipeDown: () => {
      if (!isLoading) {
        handleClose();
      }
    },
    minSwipeDistance: 80,
    enableHaptics: true
  });

  // Define all methods
  const allMethods = [
    {
      name: 'Distill',
      image: distillImage,
      activeImage: distillActiveImage,
      caption: 'Distillation separates components by heating. It concentrates the active principles, often producing strong, warming compounds.',
      energyCost: 20,
      timeCost: 3
    },
    {
      name: 'Decoct',
      image: decoctImage,
      activeImage: decoctActiveImage,
      caption: 'Decoction is boiling to extract essences. Useful for creating strong remedies from tough substances like roots or barks.',
      energyCost: 15,
      timeCost: 2
    },
    {
      name: 'Calcinate',
      image: calcinateImage,
      activeImage: calcinateActiveImage,
      caption: 'Calcination burns ingredients into ashes to purify and concentrate their properties. Often used to produce powders.',
      energyCost: 18,
      timeCost: 3
    },
    {
      name: 'Confection',
      image: confectionImage,
      activeImage: confectionActiveImage,
      caption: 'Confectioning involves mixing powders with honey or syrup to create palatable pastes, pills, or lozenges.',
      energyCost: 10,
      timeCost: 1
    },
    {
      name: 'Sublimate',
      image: sublimateImage,
      activeImage: sublimateActiveImage,
      caption: 'Sublimation transforms a solid directly into a gas and back to a solid, purifying and concentrating the substance.',
      energyCost: 25,
      timeCost: 4
    }
  ];

  const availableMethods = allMethods.filter(method => unlockedMethods.includes(method.name));

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleDrop = (item, method) => {
    setSelectedSimples(prev => ({
      ...prev,
      [method.name]: (prev[method.name] || []).concat({
        ...item,
        emoji: item.emoji
      })
    }));
    setIsMixButtonEnabled(true);
    setError(null);
  };

  const handleRemoveIngredient = (methodName, ingredientIndex) => {
    setSelectedSimples(prev => {
      const updatedIngredients = [...(prev[methodName] || [])];
      updatedIngredients.splice(ingredientIndex, 1);

      // If no ingredients left in this method, remove the method key
      if (updatedIngredients.length === 0) {
        const newSimples = { ...prev };
        delete newSimples[methodName];
        return newSimples;
      }

      return {
        ...prev,
        [methodName]: updatedIngredients
      };
    });

    // Check if any ingredients remain in any method
    setIsMixButtonEnabled(
      Object.values(selectedSimples).some(ingredients => ingredients && ingredients.length > 0)
    );
  };

  const handleMixing = async () => {
    const selectedMethod = Object.keys(selectedSimples).find(method => selectedSimples[method].length > 0);
    const ingredients = selectedSimples[selectedMethod];
    const method = allMethods.find(m => m.name === selectedMethod);

    if (!selectedMethod || !ingredients || ingredients.length === 0) return;

    setIsLoading(true);
    setError(null);

    const systemPrompt = `
CRITICAL: You must respond with ONLY a valid JSON object. No markdown, no code fences, no explanatory text - ONLY the raw JSON object.

You are simulating 17th century pharmaceutical practice as practiced in Mexico City, 1680. Channel William Salmon's Pharmacopoeia Londinensis (1678) - mix Latin pharmaceutical terms with practical English and Spanish vernacular.

NAMING CONVENTIONS (authentic 1680s apothecary style):

Vernacular Names (common, descriptive):
- English: Plague Water, Hysteric Water, Snail Water, Spirit of Scurvy-Grass, Oil of Swallows, Syrup of Poppies, Powder of Sympathy, Venice Treacle, London Treacle
- Spanish: Agua de Azahar, Jarabe de Violetas, Aceite de Almendras, Ungüento Populeon

Latin Pharmaceutical Terms:
- Tinctura Opii, Decoctum Sennae, Aqua Vitae, Spiritus Vini Rectificatus, Sal Volatile Oleosum, Magistery of Pearl, Calx Antimonii, Flores Sulphuris

Mixed Vernacular + Latin:
- Balsam of Peru / Balsamum Peruvianum, Jesuit's Powder, Cardinal's Powder, English Saffron Pills, Dutch Drops

Practitioner/Geographic Attribution:
- Named after physicians: Sydenham's Laudanum, Riverius's Powder, Paracelsus's Arcanum
- Regional origin: Hungarian Water, Carmelite Water, Barbados Tar, Agua da Inglaterra

GALENIC PRINCIPLES (apply these - don't memorize rigid recipes):
- Cold substances counter hot conditions (fever, inflammation)
- Dry substances counter moist conditions (phlegm, diarrhea)
- Hot substances counter cold conditions (chills, lethargy)
- Moist substances counter dry conditions (constipation, dry cough)

CREATIVE NAMING GUIDELINES - VARY YOUR APPROACH:

AVOID formulaic patterns like "Decoctum [X] cum [Y]" or "Tincture of [X]" every time. Mix these approaches:

1. GEOGRAPHIC/CULTURAL (30% of the time):
   - "Agua da Inglaterra" (English Water - cinchona preparation)
   - "Hungarian Water" (rosemary cordial)
   - "Barbados Tar" (molasses-based medicine)
   - "Carmelite Water" (melissa balm)
   - "Sevillian Balsam," "Venetian Cordial," "Lima Remedy"

2. EFFECT-BASED POETIC (25% of the time):
   - "Hysteric Water" (calming preparation)
   - "Carminative Elixir" (digestive aid)
   - "Restorative Cordial," "Soporific Draught"
   - "Febrifuge Water," "Stomachic Wine"

3. PRACTITIONER ATTRIBUTION (20% of the time):
   - "Sydenham's Laudanum" (opium + saffron + wine)
   - "Paracelsus's Arcanum" (alchemical preparation)
   - "Riverius's Powder," "Gascon's Remedy"
   - Invent plausible historical names: "Valles's Tincture," "Monardes's Extract"

4. TRADITIONAL/MYTHIC (15% of the time):
   - "Venice Treacle," "London Treacle" (complex theriac variants)
   - "Plague Water" (prophylactic compound)
   - "Powder of Sympathy," "Elixir Proprietatis"
   - "Aqua Celestis," "Divine Balsam"

5. DESCRIPTIVE PHARMACEUTICAL (10% of the time only):
   - "Decoctum Sennae" (plain senna decoction)
   - "Tinctura Opii" (opium tincture)
   - Use ONLY for very simple, single-ingredient preparations

METHOD-SPECIFIC NAMING TIPS:
Distillation → Favor "Waters" (Aqua, Agua), "Spirits," geographic names
Decoction → Favor effect-based ("Febrifuge," "Emetic"), wine-based names
Calcination → Favor Latin terms ("Calx," "Sal," "Flores"), alchemical names
Confection → Favor sweet names ("Conserve," "Electuary," "Trochisci"), condition-based
Sublimation → Favor mystical/alchemical names ("Flowers of...," "Quintessence," rare terms)

FAILURES (realistic, named properly - NOT "Unusable Sludge"):
- "Weak Tincture" / "Tinctura Debilis" (too dilute, low potency, worth 1-2 reales)
- "Burnt Syrup" (overheated confection, acrid taste, worth 0-1 reales)
- "Precipitate" (crystallized, needs redissolving, worth 1-2 reales)
- "Empyreumatic Oil" (smoky, burnt distillation, worth 0-1 reales)
- "Acrid Vinegar" (soured preparation, worth 0 reales)

TOXIC BUT USABLE (label clearly in medicinalEffects):
- "Mercurial Purgative - TOXIC, use sparingly"
- "Antimony Emetic - violent vomiting, dangerous in excess"
- "Corrosive Sublimate - deadly poison, external use only"

CRITICAL: Be CREATIVE with names! Follow the percentages above - favor geographic, effect-based, and practitioner names over boring descriptive ones. A cinchona+balsam decoction could be:
- "Lima Febrifuge" (geographic) ✓
- "Peruvian Remedy" (cultural) ✓
- "Restorative Balsam" (effect-based) ✓
NOT just "Decoction of Quina with Balsam" ✗

Same ingredients should produce DIFFERENT names on repeated mixing. Vary your approach! Be historically plausible but imaginative.

When provided with ingredients and a compounding method, return a JSON object with the following fields:

{
  "name": "Name of the compound (following naming conventions above)",
  "latinName": "The Latin name of the compound",
  "spanishName": "The name of the compound in Spanish",
  "humoralQualities": "Temperature in Xth degree, Moisture in Yth degree (e.g., 'Cold in 4th degree, Dry in 3rd degree' for opium, or 'Warm in 1st degree, Moist in 2nd degree' for chamomile). Use degrees 1-4 to indicate intensity.",
  "medicinalEffects": "The specific effects it has on health and the body - defined in a phrase, like 'soporific and resolutive, but potentially toxic'",
  "description": "Brief, pithy description of the process and result (no more than a single short sentence)",
  "price": Number of reales in value (failures: 0-2, simple preparations: 3-8, complex: 10-30, rare: 40-100, legendary: 150+),
  "emoji": "A single HISTORICALLY ACCURATE emoji to represent the result",
  "citation": "Real primary source or historical reference which mentions it or something like it (e.g., 'Salmon's Pharmacopoeia Londinensis, 1678' or 'Culpeper's Complete Herbal, 1653')",
  "quantity": "1"
}

CRITICAL REMINDER: Return ONLY the raw JSON object above. Do not wrap it in markdown code fences (no \`\`\`json), do not add explanatory text, and do not include comments. Your entire response must be valid JSON that can be parsed directly.
    `;

    const userInput = `
Ingredients: ${ingredients.map(i => i.name).join(' and ')}
Compounding Method: ${selectedMethod}
    `;

    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ];

      const data = await createChatCompletion(
        messages,
        0.9,           // temperature
        1000,          // maxTokens
        { type: 'json_object' }  // responseFormat - enforce JSON output
      );
      let compoundData;

      // DEBUG: Log raw LLM response to diagnose JSON parsing issues
      console.log('=== MIXING WORKSHOP DEBUG ===');
      console.log('RAW LLM RESPONSE:', data.choices[0].message.content);
      console.log('RESPONSE LENGTH:', data.choices[0].message.content.length);
      console.log('FIRST 200 CHARS:', data.choices[0].message.content.substring(0, 200));
      console.log('LAST 200 CHARS:', data.choices[0].message.content.substring(data.choices[0].message.content.length - 200));
      console.log('============================');

      try {
        // Defensive JSON parsing: strip markdown code fences and extra whitespace
        let rawContent = data.choices[0].message.content.trim();

        // Remove markdown code fences (```json ... ``` or ``` ... ```)
        if (rawContent.startsWith('```')) {
          rawContent = rawContent.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
        }

        // Remove any leading/trailing explanatory text before/after JSON object
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          rawContent = jsonMatch[0];
        }

        console.log('[MixingWorkshop] Sanitized JSON:', rawContent.substring(0, 100) + '...');
        compoundData = JSON.parse(rawContent);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        console.error('Attempted to parse:', data.choices[0].message.content);
        throw new Error('Invalid JSON');
      }

      // Apply Alchemist L25/L30 ability: Prevent failures
      let compoundName = compoundData.name || 'Weak Tincture';
      // CRITICAL: Parse price as number (LLM sometimes returns string instead of number)
      let compoundPrice = parseInt(compoundData.price, 10) || 0;

      if (canPreventSludge(gameState.chosenProfession, gameState.playerLevel)) {
        // Master Alchemist can salvage failures into weak but usable preparations
        if (compoundPrice <= 2) {
          compoundName = 'Experimental Tincture';
          compoundPrice = Math.max(3, Math.floor(Math.random() * 5) + 3); // 3-8 reales
          console.log('[Alchemist] Master Alchemist ability salvaged a failure!');
        }
      }

      // RARITY CALCULATION SYSTEM (DETERMINISTIC)
      // Based on ingredient count + method complexity (no RNG)
      const calculateRarity = (ingredientCount, methodName) => {
        // Method complexity bonuses
        const methodBonus = {
          'Sublimate': 30,   // Rarest, most complex
          'Distill': 20,     // Complex, requires apparatus
          'Calcinate': 15,   // Requires heat control
          'Decoct': 5,       // Common, simple
          'Confection': 0    // Most basic
        };

        // Calculate complexity score
        let complexity = ingredientCount * 10; // Each ingredient = 10 points
        complexity += methodBonus[methodName] || 0;

        // Determine tier based on complexity thresholds
        if (complexity >= 70) {
          // 5+ ingredients + Sublimate, or 7+ ingredients + Distill
          return { tier: 'legendary', multiplier: 5.0 };
        } else if (complexity >= 45) {
          // 3+ ingredients + Distill, or 5+ ingredients + Calcinate
          return { tier: 'rare', multiplier: 2.5 };
        } else if (complexity >= 25) {
          // 2+ ingredients + Calcinate, or 3+ ingredients + Decoct
          return { tier: 'scarce', multiplier: 1.5 };
        } else {
          // Simple preparations (1-2 ingredients, basic methods)
          return { tier: 'common', multiplier: 1.0 };
        }
      };

      // Calculate rarity based on ingredient count and method
      const rarity = calculateRarity(ingredients.length, selectedMethod);

      // Apply rarity multiplier to price
      compoundPrice = Math.ceil(compoundPrice * rarity.multiplier);

      console.log(`[Mixing] Ingredients: ${ingredients.length}, Method: ${selectedMethod}`);
      console.log(`[Mixing] Determined rarity: ${rarity.tier} (${rarity.multiplier}x multiplier)`);
      console.log(`[Mixing] Final price: ${compoundPrice} reales`);

      // Apply Alchemist L20/L30 ability: Double batch chance
      // CRITICAL: Parse quantity as number (LLM sometimes returns string "1" instead of number 1)
      let compoundQuantity = parseInt(compoundData.quantity, 10) || 1;
      const doubleBatchChance = getDoubleBatchChance(gameState.chosenProfession, gameState.playerLevel);

      if (doubleBatchChance > 0 && Math.random() < doubleBatchChance && compoundName !== 'Unusable Sludge') {
        compoundQuantity *= 2;
        console.log('[Alchemist] Double Batch ability triggered! Created 2x quantity');
      }

      const newCompound = {
        id: new Date().getTime(),
        name: compoundName,
        latinName: compoundData.latinName || 'N/A',
        spanishName: compoundData.spanishName || 'N/A',
        emoji: compoundData.emoji || '☠️',
        price: compoundPrice,
        humoralQualities: compoundData.humoralQualities || 'N/A',
        medicinalEffects: compoundData.medicinalEffects || 'N/A',
        description: compoundData.description || 'The mixing process failed.',
        citation: compoundData.citation || 'N/A',
        quantity: compoundQuantity,
        rarity: rarity.tier // Rarity tier based on complexity
      };

      // Add compound to inventory
      addCompoundToInventory(newCompound);

      // Generate journal entry
      if (newCompound.price <= 2) {
        // Failure (low value indicates failed preparation)
        addJournalEntry(`Maria's attempt to create a compound resulted in **${newCompound.name}**. ${newCompound.description}`);
      } else {
        // Success
        addJournalEntry(`Maria created a new compound named **${newCompound.name}** using the ${selectedMethod} method. The compound is ${newCompound.humoralQualities} with ${newCompound.medicinalEffects} effects and is worth ${newCompound.price} silver coins.`);
      }

      // Award XP for compound creation - scales with rarity
      // Common: 1 XP, Scarce: 3 XP, Rare: 5 XP, Legendary: 10 XP
      const xpRewards = {
        'common': 1,
        'scarce': 3,
        'rare': 5,
        'legendary': 10
      };
      const xpAmount = xpRewards[rarity.tier] || 1;

      if (typeof awardXP === 'function') {
        awardXP(xpAmount, `compound_creation_${newCompound.name}`);
        console.log(`[XP] Awarded ${xpAmount} XP for creating ${rarity.tier} compound: ${newCompound.name}`);
      }

      // Award alchemy skill XP - also scales with rarity
      // Failures still give some XP (you learn from mistakes)
      const alchemySkillXP = {
        'common': newCompound.price <= 2 ? 3 : 8,  // Failures give reduced XP
        'scarce': 12,
        'rare': 18,
        'legendary': 30
      };
      const skillXpAmount = alchemySkillXP[rarity.tier] || 8;

      if (typeof awardSkillXP === 'function') {
        awardSkillXP('alchemy', skillXpAmount);
        console.log(`[Alchemy] Awarded ${skillXpAmount} alchemy skill XP for ${rarity.tier} compound`);
      }

      // Deduct ingredients from inventory
      ingredients.forEach(ingredient => {
        updateInventory(ingredient.name, -1);
      });

      // Apply Alchemist L10/L30 ability: Ingredient retention
      const retentionChance = getIngredientRetentionChance(gameState.chosenProfession, gameState.playerLevel);

      if (retentionChance > 0 && Math.random() < retentionChance) {
        // Restore all ingredients
        ingredients.forEach(ingredient => {
          updateInventory(ingredient.name, 1);
        });
        console.log('[Alchemist] Efficient Mixing ability retained ingredients!');

        // Add journal note
        if (addJournalEntry) {
          addJournalEntry("⚗️ Maria's alchemical expertise preserved her ingredients during mixing!");
        }
      }

      // Advance time based on method
      // Apply Alchemist L15/L30 ability: Swift Compounds
      const timeMultiplier = getMixingTimeMultiplier(gameState.chosenProfession, gameState.playerLevel);
      const actualTimeCost = method.timeCost * timeMultiplier;

      if (advanceTime) {
        advanceTime({ hours: actualTimeCost });
      }

      if (timeMultiplier < 1.0) {
        console.log(`[Alchemist] Swift Compounds reduced time from ${method.timeCost} to ${actualTimeCost} hours`);
      }

      setCompoundResult(newCompound);
      setSelectedSimples({});
      setIsMixButtonEnabled(false);

    } catch (error) {
      console.error('Error generating compound:', error);
      const failedPreparation = {
        id: new Date().getTime(),
        name: 'Burnt Residue',
        latinName: 'Residuum Combustum',
        spanishName: 'Residuo Quemado',
        emoji: '🔥',
        price: 0,
        humoralQualities: 'Hot in 3rd degree, Dry in 4th degree',
        medicinalEffects: 'Acrid and useless for medicine',
        description: 'The preparation was ruined - likely from excessive heat or incompatible ingredients.',
        citation: 'Common failure mode in pharmaceutical practice',
        quantity: 1,
        rarity: 'common'
      };

      addCompoundToInventory(failedPreparation);
      addJournalEntry("Maria's preparation failed, leaving only **Burnt Residue**. A costly mistake.");

      ingredients.forEach(ingredient => {
        updateInventory(ingredient.name, -1);
      });

      setCompoundResult(failedPreparation);
      setSelectedSimples({});
      setIsMixButtonEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedSimples({});
    setIsMixButtonEnabled(false);
    setCompoundResult(null);
    setError(null);
  };

  // Filter simples by medicine type
  const filteredSimples = useMemo(() => {
    if (medicineTypeFilter === 'all') {
      return simples;
    }
    return simples.filter(item => {
      const itemType = inferMedicineType(item);
      return itemType === medicineTypeFilter;
    });
  }, [simples, medicineTypeFilter]);

  // Count simples by medicine type
  const medicineCountsByType = useMemo(() => {
    const counts = { all: simples.length };
    getAllMedicineTypes().forEach(type => {
      counts[type.id] = simples.filter(item => inferMedicineType(item) === type.id).length;
    });
    return counts;
  }, [simples]);

  // Get selected method costs
  const selectedMethodCosts = useMemo(() => {
    const selectedMethodName = Object.keys(selectedSimples).find(method => selectedSimples[method]?.length > 0);
    const method = allMethods.find(m => m.name === selectedMethodName);
    return method ? { energy: method.energyCost, time: method.timeCost } : null;
  }, [selectedSimples, allMethods]);

  // Predict medicine type based on selected ingredients and method
  const predictedMedicineType = useMemo(() => {
    const selectedMethod = Object.keys(selectedSimples).find(method => selectedSimples[method]?.length > 0);
    const ingredients = selectedSimples[selectedMethod] || [];

    if (ingredients.length === 0) return null;

    // Single ingredient = Simples
    if (ingredients.length === 1) {
      return {
        typeId: 'simples',
        reason: 'Single ingredient preparation'
      };
    }

    // Check for alchemical ingredients or methods
    const hasAlchemicalIngredient = ingredients.some(ing => {
      const name = ing.name.toLowerCase();
      return name.includes('quicksilver') || name.includes('mercury') ||
             name.includes('sal ammoniac') || name.includes('vitriol') ||
             name.includes('cinnabar') || name.includes('antimony');
    });

    const isAlchemicalMethod = selectedMethod === 'Distill' || selectedMethod === 'Calcinate' || selectedMethod === 'Sublimate';

    if (hasAlchemicalIngredient && isAlchemicalMethod) {
      return {
        typeId: 'alchemical',
        reason: 'Alchemical ingredients with chemical process'
      };
    }

    // Check for Indies drugs (exotic imports)
    const hasIndiesDrug = ingredients.some(ing => {
      const name = ing.name.toLowerCase();
      return name.includes('cacao') || name.includes('tobacco') ||
             name.includes('quina') || name.includes('cinchona') ||
             name.includes('pepper') || name.includes('cinnamon') ||
             name.includes('dragon') || name.includes('brasil');
    });

    if (hasIndiesDrug && ingredients.length === 1) {
      return {
        typeId: 'indies_drugs',
        reason: 'Exotic import preparation'
      };
    }

    // Check for food-based medicines
    const isFoodBased = ingredients.some(ing => {
      const name = ing.name.toLowerCase();
      return name.includes('honey') || name.includes('sugar') ||
             name.includes('barley') || name.includes('broth') ||
             name.includes('milk');
    });

    if (isFoodBased && (selectedMethod === 'Decoct' || selectedMethod === 'Confection')) {
      return {
        typeId: 'foods',
        reason: 'Dietary medicine preparation'
      };
    }

    // Check for animal products
    const hasAnimalPart = ingredients.some(ing => {
      const name = ing.name.toLowerCase();
      return name.includes('bezoar') || name.includes('mummy') ||
             name.includes('viper') || name.includes('bone') ||
             name.includes('millipede') || name.includes('crab');
    });

    if (hasAnimalPart) {
      return {
        typeId: 'animal_products',
        reason: 'Animal-derived medicine'
      };
    }

    // Alchemical methods typically create alchemical products
    if (isAlchemicalMethod) {
      return {
        typeId: 'alchemical',
        reason: `${selectedMethod} process creates chemical preparation`
      };
    }

    // Multiple ingredients with non-alchemical method = Compounds
    return {
      typeId: 'compounds',
      reason: 'Multi-ingredient compound medicine'
    };
  }, [selectedSimples]);

  if (!isOpen) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`fixed inset-0 bg-ink-900/90 dark:bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}
        onClick={(e) => {
          // Close modal when clicking backdrop
          if (e.target === e.currentTarget && !isLoading) {
            handleClose();
          }
        }}
      >
        <div
          ref={gestureRef}
          className={`bg-gradient-to-br from-parchment-50 via-parchment-100 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-none sm:rounded-3xl shadow-2xl max-w-full sm:max-w-7xl w-full h-screen sm:h-[92vh] flex flex-col border-4 border-double border-amber-700/50 dark:border-amber-500/30 relative transition-all duration-300 ${isClosing ? 'animate-modal-scale-out' : 'animate-modal-scale-in'}`}
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: '95vh', overflow: 'hidden' }}
        >

          {/* Ornate corner decorations */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-amber-600/40 dark:border-amber-400/30 rounded-tl-3xl pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-amber-600/40 dark:border-amber-400/30 rounded-tr-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-amber-600/40 dark:border-amber-400/30 rounded-bl-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-amber-600/40 dark:border-amber-400/30 rounded-br-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="relative px-6 py-4 border-b border-amber-700/30 dark:border-amber-500/20 bg-gradient-to-r from-amber-100/50 via-parchment-100/50 to-amber-100/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-parchment-900 dark:text-amber-100 tracking-wide">
                Alchemical Workshop
              </h2>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-ink-800 hover:bg-ink-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-sans text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg leading-none">✕</span>
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 ">

            {/* Instructions - Compact */}
            <div className="bg-amber-50/50 dark:bg-slate-800/20 border-l-2 border-amber-600/40 dark:border-amber-500/30 rounded px-4 py-2 mb-4">
              <p className="font-serif text-lg text-ink-800 dark:text-amber-200/70 italic flex items-center gap-2">
                
                <span>Drag ingredients onto methods below. Each produces different results.</span>
              </p>
            </div>

            {/* Active Profession Bonuses */}
            <ActiveBonusIndicator
              context="mixing"
              profession={gameState.chosenProfession}
              playerLevel={gameState.playerLevel}
            />

            {/* Error Display */}
            {error && (
              <div className="bg-gradient-to-r from-danger-50 to-danger-100 dark:from-red-900/30 dark:to-red-800/30 border-2 border-danger-400 dark:border-red-600/50 rounded-xl p-4 mb-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚠️</span>
                  <p className="text-base text-danger-900 dark:text-red-200 font-serif font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Method Grid - Centered and responsive */}
            <div className="flex justify-center mb-5">
              <div className={`grid gap-5 w-full ${
                availableMethods.length === 1 ? 'grid-cols-1 max-w-md' :
                availableMethods.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' :
                availableMethods.length === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl' :
                availableMethods.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-6xl'
              }`}>
                {availableMethods.map(method => (
                  <MethodDropZone
                    key={method.name}
                    method={method}
                    ingredients={selectedSimples[method.name] || []}
                    onDrop={handleDrop}
                    onRemove={handleRemoveIngredient}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Predicted Medicine Type */}
            {predictedMedicineType && isMixButtonEnabled && (
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100/80 to-amber-50/80 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-300/50 dark:border-amber-600/30 shadow-sm">
                  <span className="text-lg">{getMedicineType(predictedMedicineType.typeId).emoji}</span>
                  <span className="font-serif text-sm text-ink-700 dark:text-amber-200">
                    Creating: <span className="font-semibold">{getMedicineType(predictedMedicineType.typeId).name}</span>
                  </span>
                  <span className="text-xs text-ink-500 dark:text-amber-400/70 italic">
                    ({predictedMedicineType.reason})
                  </span>
                </div>
              </div>
            )}

            {/* Inventory Section - Paginated */}
            <div className="bg-ink-50/50 dark:bg-slate-800/30 rounded-xl p-3 border border-ink-200/30 dark:border-slate-600/30 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <h3 className="font-serif text-base font-bold text-ink-800 dark:text-amber-100 flex items-center gap-2">
                  <span>Materia Medica</span>
                  <span className="text-sm font-normal text-ink-500 dark:text-amber-300/60">
                    ({filteredSimples.length} items)
                  </span>
                </h3>

                {/* Medicine Type Filter Dropdown */}
                <select
                  value={medicineTypeFilter}
                  onChange={(e) => setMedicineTypeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-ink-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-ink-800 dark:text-amber-100 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-all cursor-pointer hover:border-amber-500 dark:hover:border-amber-400"
                >
                  <option value="all">All Types ({medicineCountsByType.all})</option>
                  {getAllMedicineTypes().map(type => (
                    <option value={type.id} key={type.id}>
                      {type.emoji} {type.name} ({medicineCountsByType[type.id] || 0})
                    </option>
                  ))}
                </select>

                {filteredSimples.length > 14 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInventoryPage(Math.max(0, inventoryPage - 1))}
                      disabled={inventoryPage === 0}
                      className="p-1.5 rounded-lg bg-amber-100 dark:bg-slate-700 text-ink-800 dark:text-amber-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-200 dark:hover:bg-slate-600 transition-all"
                      aria-label="Previous page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-xs text-ink-600 dark:text-amber-300/70 font-sans">
                      {inventoryPage + 1} / {Math.ceil(filteredSimples.length / 14)}
                    </span>
                    <button
                      onClick={() => setInventoryPage(Math.min(Math.ceil(filteredSimples.length / 14) - 1, inventoryPage + 1))}
                      disabled={inventoryPage >= Math.ceil(filteredSimples.length / 14) - 1}
                      className="p-1.5 rounded-lg bg-amber-100 dark:bg-slate-700 text-ink-800 dark:text-amber-100 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-200 dark:hover:bg-slate-600 transition-all"
                      aria-label="Next page"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {filteredSimples.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-30">
                    {simples.length === 0 ? '🧪' : '🔍'}
                  </div>
                  <p className="text-lg text-ink-500 dark:text-amber-300/50 font-serif italic">
                    {simples.length === 0
                      ? 'Your inventory is empty. Purchase ingredients from the market to begin mixing.'
                      : 'No items in this category. Try selecting a different filter.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 p-2 auto-rows-fr">
                  {filteredSimples.slice(inventoryPage * 18, (inventoryPage + 1) * 18).map(simple => (
                    <DraggableIngredient
                      key={simple.id}
                      simple={simple}
                      onHover={setHoveredSimple}
                      onLeave={() => setHoveredSimple(null)}
                      isDisabled={isLoading}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-amber-700/30 dark:border-amber-500/20 bg-gradient-to-r from-amber-100/50 via-parchment-100/50 to-amber-100/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 flex justify-between items-center shadow-inner">
            <button
              onClick={resetSelection}
              className="px-3 py-1.5 text-sm font-sans text-ink-600 dark:text-amber-300/70 hover:text-ink-900 dark:hover:text-amber-100 transition-colors duration-200 flex items-center gap-1"
              title="Clear all selected ingredients"
            >
              <span className="text-base">↺</span>
              <span>Reset</span>
            </button>

            <button
              onClick={handleMixing}
              disabled={!isMixButtonEnabled || isLoading}
              className={`relative px-8 py-3 rounded-xl font-sans text-base font-bold shadow-lg transition-all duration-200 overflow-hidden group ${
                isMixButtonEnabled && !isLoading
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:via-amber-600 hover:to-amber-700 dark:from-amber-500 dark:via-amber-400 dark:to-amber-500 dark:hover:from-amber-600 dark:hover:via-amber-500 dark:hover:to-amber-600 text-white shadow-amber-600/40 hover:shadow-xl hover:shadow-amber-600/50 hover:scale-105 active:scale-95'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {isMixButtonEnabled && !isLoading && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              )}
              <span className="relative flex items-center gap-2 justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Transmuting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">⚗️</span>
                    <div className="flex flex-col items-center">
                      <span>Begin Transmutation</span>
                      {selectedMethodCosts && (
                        <span className="text-xs opacity-75 font-normal">
                          ({selectedMethodCosts.energy} energy, {selectedMethodCosts.time} {selectedMethodCosts.time === 1 ? 'hour' : 'hours'})
                        </span>
                      )}
                    </div>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Compound Result Modal - Overlays the mixing workshop */}
        {compoundResult && (
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn"
            onClick={() => setCompoundResult(null)}
          >
            <div
              className="bg-gradient-to-br from-parchment-50 via-parchment-100 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-none sm:rounded-2xl shadow-2xl max-w-full sm:max-w-3xl w-full overflow-hidden border-4 border-double border-amber-700/50 dark:border-amber-500/30 animate-slideUp flex flex-col"
              style={{ maxHeight: '85vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Scrollable content area */}
              <div className="flex-1 overflow-hidden">
                <CompoundResultCard compound={compoundResult} onClose={() => setCompoundResult(null)} />
              </div>

              {/* Continue Button - Fixed at bottom */}
              <div
                className="flex-shrink-0 px-6 py-3 border-t flex justify-center"
                style={{
                  background: isDark
                    ? 'linear-gradient(to bottom, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))'
                    : 'linear-gradient(to bottom, rgba(245, 238, 223, 0.5), rgba(250, 248, 243, 0.3))',
                  borderColor: isDark
                    ? 'rgba(251, 191, 36, 0.15)'
                    : 'rgba(139, 92, 46, 0.15)'
                }}
              >
                <button
                  onClick={() => setCompoundResult(null)}
                  className="px-8 py-2.5 rounded-lg font-sans text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  style={{
                    background: isDark
                      ? 'linear-gradient(to right, #10b981, #059669)'
                      : 'linear-gradient(to right, #059669, #047857)',
                    color: '#ffffff'
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

MixingWorkshop.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  simples: PropTypes.array.isRequired,
  addCompoundToInventory: PropTypes.func.isRequired,
  updateInventory: PropTypes.func.isRequired,
  addJournalEntry: PropTypes.func.isRequired,
  unlockedMethods: PropTypes.array,
  advanceTime: PropTypes.func,
  awardXP: PropTypes.func,
  awardSkillXP: PropTypes.func
};

export default MixingWorkshop;
