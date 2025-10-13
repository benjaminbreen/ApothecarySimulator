import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import MethodDropZone from './MethodDropZone';
import DraggableIngredient from './DraggableIngredient';
import CompoundResultCard from './CompoundResultCard';
import ActiveBonusIndicator from './ActiveBonusIndicator';
import { createChatCompletion } from '../core/services/llmService';
import resourceManager from '../systems/ResourceManager';
import {
  getMixingTimeMultiplier,
  getIngredientRetentionChance,
  getDoubleBatchChance,
  canPreventSludge
} from '../core/systems/professionAbilities';

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
      if (e.key === 'Escape') onClose();
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

  const handleMixing = async () => {
    const selectedMethod = Object.keys(selectedSimples).find(method => selectedSimples[method].length > 0);
    const ingredients = selectedSimples[selectedMethod];
    const method = allMethods.find(m => m.name === selectedMethod);

    if (!selectedMethod || !ingredients || ingredients.length === 0) return;

    setIsLoading(true);
    setError(null);

    const systemPrompt = `
You are a 1680s iatrochemist tasked with simulating the process of creating compound drugs based on real principles of "chymical medicine." Some potential compound drug names: Balsamum Lucatelli, Elixir Proprietatis, Theriac, Sal Volatile Oleosum, Aurum Potabile, Emetic Wine, Gascon's Powder, Tinctura Antimonii, Elixir de Paracelso, Balsamo Peruviano, Salt of Mallow, Pulvis Cephalico, Hysteric Water, Cinnamon Water, Aqua Celestis, Camphorated Wine Spirit, Volatile Spirit, Aqua Vitae, Tinctura Opii Crocata, Plague Water, Mercurius Dulcis, Balsam of Sulphur, Aqua Mercurialis, Camphorated Oil, Quicksilver Liniment, Mithridate.

When provided with two or more simple ingredients (materia medica) and a compounding method, you must generate a historically plausible compound drug. Mention if it is toxic in the description. Toxic drugs can either be unusable sludge or can be usable purgatives (classified as "Vomitorios").

Guide for mixing (other combos work too - this is just a guide to general logic):
Quicksilver: Calcination of quicksilver ALWAYS yields toxic but highly valuable red precipitate of mercury (used in ointments); distillation yields distilled quicksilver, other methods nothing, as quicksilver is volatile and not suited for these methods. Distillation yields Distilled Quicksilver which is toxic and usually produces toxic compounds (not unusable sludge - actual named compounds with toxic properties) when mixed.
Camphor: Distillation yields camphor oil (medicinal), Confectioning produces Trochisci de Camphora (lozenges); Decoction destroys camphor's volatile properties, creating ineffective residue.
Rose Water: Distillation for Aqua Rosae (calming); Confectioning with improper ingredients can result in bitter, ineffective syrup.
Opium: Distillation produces forms of Laudanum (for instance, opium distilled with saffron = Sydenham's Laudanum, while opium distilled with alchemical products like quicksilver produces Laudanum Paracelsi) or variant; Decoction makes ineffective solution, as opium must be distilled for potency. Opiate compound drugs are highly potent and can be toxic. Mixing opium with any spirits or alcohol creates laudanum.
Powdered Millipedes: Confection for Pulvis Millepedum (skin treatment), decoction with any plant or herb for asthma treatment.
Powdered Crab's Eyes: Calcination yields various valuable alchemical elemental products.
Crocus Metallorum yields valuable compounds when decocted with wine (yielding valuable Emeting Wine), or when distilled with other alchemical products like quicksilver.
Saffron distilled with other herbs makes valuable Hysteric Water.
Sugar: Confectioning alone makes Syrupus Simplex; with other simples makes various juleps and treacles. Calcined sugar = molasses. Distillation makes an alcoholic spirit which varies depending on other ingredients; distilled sugar = rum, distilled wine = brandy, and so forth.
Laudanum mixed with other simples can be toxic, especially when mixed with alcoholic simples.
Senna: Decoction for Decoctum Sennae (laxative); Confectioning weakens potency, creating ineffective cheap compound.
White Horehound: Makes tea when decocted alone, or horehound ale when decocted with sugar. Creates valuable balsams when distilled in herbal compounds, and mithridate when distilled with laudanum or opium.
Decoction works with most every plant but not with alchemical substances. Nettle, Chamomile, saffron, mint, pennyroyal and other herbs ALWAYS create usable medicine via Decoction method; a tea or infusion if used alone, a cordial if used with rosewater or sugar.
Calcination of all substances breaks them down into simpler elemental material, of the sort alchemists used, like potash, sal ammoniac, magnesia (highly valuable), salt of tartar, vegetable salts, calx of vitriol.
Confectioning almost always works with everything, as long as you use sugar or honey.
Honey can be distilled into various products or will make unguents and treacles if confectioned. Decocting honey makes honey water, useful for mixing more valuable drugs. Decocting wine makes vinegar, which if combined with honey makes oxymel.
Compounds can be distilled with additional ingredients to create more valuable ones; two or more compounds distilled with make a form of mithridate.
Distilling cinchona or quina or guaiacum produces a highly valuable febrifuge "Agua" like "Agua da Inglaterra."
Sal Ammoniac can be distilled or calcined with other drugs, but may produce semi-toxic or unusual alchemical compounds. Sal Ammoniac: calcination = Calx Ammoniaci or Vaporis Pulmonalis; distillation: Spiritus Ammoniaci. Can be mixed with rosewater, syrups and sugars, and herbs. If mixed with quicksilver, it makes a deadly poison called "Alchemist's Fulminate."
Animals and animal products can ALWAYS be distilled and calcined. For instance, if Maria buys an iguana, she can calcinate it to make "iguana ash" or distill it to make "spiritus iguanae" or "iguana licqueur". Confectioning animal ashes with any plant or herb can produce an extremely valuable item, either the Bezoartico, the Lapis de Goa, or the Artificial Snakestone, depending on the admixtures. Lapis de Goa requires gold and is valued at over 200 reales.
Remember that calcination of most products = alchemical raw materials. Always. Ashes, but also other things like potash. These can sometimes be valuable and interesting.
Sublimation produces valuable, rare and unusual compounds with unusual and unexpected properties. They are often alchemical and even almost mystical or magical in nature. Be creative here.
Always observe rules above. Another option is for a drug to become something weaker, i.e., decoction of opium might create weaker, cheaper "poppy water."

When provided with ingredients and a compounding method, return a JSON object with the following fields:

{
  "name": "Name of the compound or 'Unusable Sludge'",
  "latinName": "The Latin name of the compound (be creative)",
  "spanishName": "The name of the compound in Spanish",
  "humoralQualities": "Two word description of humoral qualities: warm and moist, cold and dry, cold and moist, or warm and dry.",
  "medicinalEffects": "The specific effects it has on health and the body - defined in a phrase, like 'soporific and resolutive, but potentially toxic'",
  "description": "Brief, pithy, witty description of the process and result (no more than a single short sentence or phrase)",
  "price": Number of reales in value (0 if 'Unusable Sludge'),
  "emoji": "A single HISTORICALLY ACCURATE and CREATIVE emoji to represent the result (Unusable Sludge is always ☠️)",
  "citation": "Real primary source or historical reference which mentions it or something like it",
  "quantity": "1"
}

IMPORTANT: Ensure your response is a valid JSON object. Do not include any text outside the JSON structure.
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

      const data = await createChatCompletion(messages, 0.9);
      let compoundData;

      try {
        compoundData = JSON.parse(data.choices[0].message.content);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid JSON');
      }

      // Apply Alchemist L25/L30 ability: Prevent sludge
      let compoundName = compoundData.name || 'Unusable Sludge';
      let compoundPrice = compoundData.price || 0;

      if (canPreventSludge(gameState.chosenProfession, gameState.playerLevel)) {
        if (compoundName === 'Unusable Sludge') {
          compoundName = 'Experimental Tincture';
          compoundPrice = Math.max(1, Math.floor(Math.random() * 5) + 1); // 1-5 reales
          console.log('[Alchemist] Master Alchemist ability prevented sludge!');
        }
      }

      // Apply Alchemist L20/L30 ability: Double batch chance
      let compoundQuantity = compoundData.quantity || 1;
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
        description: compoundData.description || 'The mixing process failed, resulting in an unusable sludge.',
        citation: compoundData.citation || 'N/A',
        quantity: compoundQuantity
      };

      // Add compound to inventory
      addCompoundToInventory(newCompound);

      // Generate journal entry
      if (newCompound.name === 'Unusable Sludge') {
        addJournalEntry("Maria created a worthless compound called **Unusable Sludge**. This was a failed experiment - better luck next time!");
      } else {
        addJournalEntry(`Maria created a new compound named **${newCompound.name}** using the ${selectedMethod} method. The compound is ${newCompound.humoralQualities} with ${newCompound.medicinalEffects} effects and is worth ${newCompound.price} silver coins.`);
      }

      // Award XP for compound creation
      if (typeof awardXP === 'function') {
        if (newCompound.name === 'Unusable Sludge') {
          // Small XP for failed experiments (learning from mistakes)
          awardXP(5, 'failed_compound_creation');
        } else {
          // Base XP for successful compound creation
          let xpAmount = 15;

          // Bonus XP for valuable compounds (price > 50)
          if (newCompound.price > 50) {
            xpAmount += 10;
          }

          awardXP(xpAmount, `compound_creation_${newCompound.name}`);
          console.log(`[XP] Awarded ${xpAmount} XP for creating ${newCompound.name}`);
        }
      }

      // Award alchemy skill XP
      if (typeof awardSkillXP === 'function') {
        awardSkillXP('alchemy', newCompound.name === 'Unusable Sludge' ? 3 : 8);
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
      const unusableSludge = {
        id: new Date().getTime(),
        name: 'Unusable Sludge',
        emoji: '☠️',
        price: 0,
        humoralQualities: 'N/A',
        medicinalEffects: 'N/A',
        description: 'The mixing process failed, resulting in an unusable sludge.',
        citation: 'N/A',
        quantity: 1
      };

      addCompoundToInventory(unusableSludge);
      addJournalEntry("Maria's attempt to create a new compound failed, resulting in an unusable sludge. Better luck next time!");

      ingredients.forEach(ingredient => {
        updateInventory(ingredient.name, -1);
      });

      setCompoundResult(unusableSludge);
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

  if (!isOpen) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 bg-ink-900/90 dark:bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-gradient-to-br from-parchment-50 via-parchment-100 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] flex flex-col border-4 border-double border-amber-700/50 dark:border-amber-500/30 relative overflow-hidden">

          {/* Ornate corner decorations */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-amber-600/40 dark:border-amber-400/30 rounded-tl-3xl pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-amber-600/40 dark:border-amber-400/30 rounded-tr-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-amber-600/40 dark:border-amber-400/30 rounded-bl-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-amber-600/40 dark:border-amber-400/30 rounded-br-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="relative px-6 py-4 border-b border-amber-700/30 dark:border-amber-500/20 bg-gradient-to-r from-amber-100/50 via-parchment-100/50 to-amber-100/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-amber-100 tracking-wide">
                Alchemical Workshop
              </h2>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-ink-800 hover:bg-ink-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-sans text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

            {/* Instructions */}
            <div className="bg-botanical-50/60 dark:bg-emerald-900/10 border border-botanical-200/50 dark:border-emerald-700/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-ink-700 dark:text-amber-100/80 font-sans leading-snug text-center">
                Drag ingredients onto a method below. Each produces different results based on humoral theory.
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

            {/* Method Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
              {availableMethods.map(method => (
                <MethodDropZone
                  key={method.name}
                  method={method}
                  ingredients={selectedSimples[method.name] || []}
                  onDrop={handleDrop}
                  isLoading={isLoading}
                />
              ))}
            </div>

            {/* Inventory Section */}
            <div className="bg-ink-50/50 dark:bg-slate-800/30 rounded-xl p-4 border border-ink-200/30 dark:border-slate-600/30">
              <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-ink-600 dark:text-amber-200/70 mb-3 flex items-center gap-2">
                <span>Inventory</span>
                <span className="text-xs font-normal text-ink-500 dark:text-amber-300/50 normal-case">
                  ({simples.length} items)
                </span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                {simples.map(simple => (
                  <DraggableIngredient
                    key={simple.id}
                    simple={simple}
                    onHover={setHoveredSimple}
                    onLeave={() => setHoveredSimple(null)}
                    isDisabled={isLoading}
                  />
                ))}
              </div>
              {simples.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-ink-500 dark:text-amber-300/50 font-serif italic">
                    Your inventory is empty. Purchase ingredients from the market to begin mixing.
                  </p>
                </div>
              )}
            </div>

            {/* Hover Tooltip */}
            {hoveredSimple && (
              <div className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50 pointer-events-none">
                <div className="bg-ink-900/95 dark:bg-slate-800/95 border border-amber-500/40 rounded-lg p-3 shadow-xl max-w-xs backdrop-blur-sm">
                  <h4 className="font-sans text-base font-semibold text-amber-100 dark:text-amber-50 mb-2">
                    {hoveredSimple.name}
                  </h4>
                  <div className="space-y-1 text-xs text-amber-200/80 dark:text-amber-100/80 font-sans">
                    <p><span className="font-medium">Price:</span> {hoveredSimple.price} reales</p>
                    <p><span className="font-medium">Quantity:</span> {hoveredSimple.quantity}</p>
                    <p><span className="font-medium">Qualities:</span> {hoveredSimple.humoralQualities}</p>
                    <p><span className="font-medium">Effects:</span> {hoveredSimple.medicinalEffects}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-amber-700/30 dark:border-amber-500/20 bg-gradient-to-r from-amber-100/50 via-parchment-100/50 to-amber-100/50 dark:from-slate-800/50 dark:via-slate-700/50 dark:to-slate-800/50 flex justify-between items-center">
            <button
              onClick={resetSelection}
              className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 dark:from-slate-600 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:to-slate-800 text-white rounded-xl font-sans text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Reset
            </button>

            <button
              onClick={handleMixing}
              disabled={!isMixButtonEnabled || isLoading}
              className={`relative px-8 py-3 rounded-xl font-sans text-base font-bold shadow-lg transition-all duration-300 overflow-hidden group ${
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
                    <span>Begin Transmutation</span>
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
              className="bg-gradient-to-br from-parchment-50 via-parchment-100 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border-4 border-double border-amber-700/50 dark:border-amber-500/30 animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <CompoundResultCard compound={compoundResult} />

              {/* Continue Button */}
              <div className="px-8 pb-6 flex justify-center">
                <button
                  onClick={() => setCompoundResult(null)}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-emerald-500 dark:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700 text-white rounded-xl font-sans text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
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
