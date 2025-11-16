// Script to add preparationAdvice to initial inventory items
// Run with: node scripts/addPreparationAdvice.js

const fs = require('fs');
const path = require('path');

// Preparation advice for items 11-70
const preparationAdviceData = {
  11: { //Senna
    decoction: "Steep leaves in warm water; mild but thorough purgative for bile and choler.",
    distillation: "Not suitable—senna's virtues reside in fixed salts, not volatile spirits.",
    calcination: "Burn leaves to ash for harsh purge; too violent for most constitutions.",
    confection: "Mix powder with figs and tamarind for electuary; sweetens bitter purge."
  },
  12: { // Sugar
    decoction: "Dissolve in decoctions as sweetener and preservative; extends shelf life.",
    distillation: "Not applicable—sugar caramelizes before distilling; use for syrups instead.",
    calcination: "Burn to black carbon for filtering waters; loses sweetness entirely.",
    confection: "Essential base for all confections; blend with drugs to mask unpleasant tastes."
  },
  13: { // Honey
    decoction: "Dissolve in decoctions to sweeten and preserve; adds cordial virtue.",
    distillation: "Not suitable—honey scorches before distilling; better for electuaries.",
    calcination: "Wasteful—burning destroys therapeutic sugars and wax.",
    confection: "Perfect vehicle for pills and electuaries; binds powders, soothes throat."
  },
  14: { // Spanish Wine
    decoction: "Ideal menstruum for decocting tough roots and barks; extracts more than water.",
    distillation: "Distill for brandy-wine or aqua vitae; fortifies and preserves tinctures.",
    calcination: "Not applicable—wine evaporates before calcination; use lees for tartar.",
    confection: "Mix with spices and sugar for cordial wines; strengthens vital spirits."
  },
  15: { // Sal Ammoniac
    decoction: "Dissolve in hot water for purgative draught; expels thick phlegm.",
    distillation: "Sublime with quicklime for volatile spirit; powerful but dangerous.",
    calcination: "Already a purified salt from sublimation; no further calcination needed.",
    confection: "Dissolve in syrups for pectoral lohochs; loosens stubborn coughs."
  },
  16: { // Ginger
    decoction: "Boil dried root in water or wine; warming stomachic for cold phlegm.",
    distillation: "Distill fresh root for fiery spirit; excellent carminative and stimulant.",
    calcination: "Burn to ash for mild alkaline salt; useful in digestive powders.",
    confection: "Candy in sugar for warming confection; aids digestion, prevents nausea."
  },
  17: { // Bezoar Stone
    decoction: "Scrape shavings into warm wine; universal alexipharmic against poisons.",
    distillation: "Not suitable—mineral stone doesn't distill; virtues in fixed matter.",
    calcination: "Not recommended—burning destroys occult antipoisonous virtue.",
    confection: "Grind to finest powder, mix with cordial waters for antidote pills."
  },
  18: { // Red Coral
    decoction: "Boil powdered coral in barley water; cooling cordial for palpitations.",
    distillation: "Not applicable—mineral matter yields no distillate.",
    calcination: "Burn to white ash for gentle alkaline; less caustic than lime.",
    confection: "Mix powder with rose conserve for heart-strengthening lohoch."
  },
  19: { // Mechoacan
    decoction: "Slice root thinly, infuse in warm water; gentler purge than jalap.",
    distillation: "Not suitable—purgative resins don't volatile distill well.",
    calcination: "Wasteful—burning destroys cathartic principles entirely.",
    confection: "Powder and mix with cinnamon and sugar; masks taste, eases griping."
  },
  20: { // Cochineal
    decoction: "Boil insects in water for crimson tincture; astringent for fluxes.",
    distillation: "Not recommended—dye and medicine reside in body, not vapors.",
    calcination: "Burn to ash for red pigment; loses most medicinal virtue.",
    confection: "Grind to powder, mix with sugar for cordial troches; stops bleeding."
  },
  21: { // Alum
    decoction: "Dissolve crystals in water for astringent gargle; tightens gums, stops flux.",
    distillation: "Not applicable—mineral salt yields no useful distillate.",
    calcination: "Already calcined from ore; roasting intensifies astringency.",
    confection: "Powder finely, mix with honey for topical paste against ulcers."
  },
  22: { // Dragon's Blood
    decoction: "Dissolve resin in wine for red tincture; powerful styptic and vulnerary.",
    distillation: "Not recommended—resin's virtue resides in fixed matter, not volatile oils.",
    calcination: "Wasteful—burning destroys astringent resins entirely.",
    confection: "Melt with wax and oil for wound plaster; seals cuts, stops bleeding."
  },
  23: { // Crocus Metallorum
    decoction: "Infuse powder in wine; violent emetic and purgative—use sparingly.",
    distillation: "Dangerously volatile—produces toxic antimony vapors; avoid.",
    calcination: "Already calcined from antimony ore; further burning increases toxicity.",
    confection: "Mix tiny dose with sugar for emetic pills; causes forceful vomiting."
  },
  24: { // Cinnamon
    decoction: "Boil bark in water or wine for warming cordial; strengthens stomach.",
    distillation: "Distill for fragrant spirit; excellent carminative and stomachic.",
    calcination: "Burn to ash for alkaline salt; destroys aromatic principles.",
    confection: "Powder and mix with sugar for warming electuary; aids digestion."
  },
  25: { // Clove
    decoction: "Infuse buds in wine for warming tincture; relieves toothache and nausea.",
    distillation: "Distill for potent essential oil; numbs pain, aids digestion.",
    calcination: "Burn to ash for mild salt; wastes precious aromatic oils.",
    confection: "Powder and mix with honey for dental paste; eases tooth pain."
  },
  26: { // Nutmeg
    decoction: "Grate and infuse in warm wine; comforts cold stomach and brain.",
    distillation: "Distill for concentrated oil; powerfully warming and narcotic in large doses.",
    calcination: "Wasteful—destroys volatile oils that contain medicinal virtue.",
    confection: "Grate and mix with sugar for warming confection; strengthens memory."
  },
  27: { // Amber
    decoction: "Does not dissolve in water; grind and add to tinctures instead.",
    distillation: "Sublime for oil of amber; antispasmodic for hysteria and convulsions.",
    calcination: "Burn for pungent smoke; fumigant against pestilent airs.",
    confection: "Powder finely and mix with cordial electuaries; calms nervous fits."
  },
  28: { // Guaiacum
    decoction: "Chip wood and boil for hours; classic sudorific for French disease.",
    distillation: "Distill resin for spirit; less common than decoction but potent.",
    calcination: "Burn wood to ash for alkaline salt; useful in scorbutic tinctures.",
    confection: "Mix powdered wood with treacle for alterative pills; cleanses blood."
  },
  29: { // Tobacco
    decoction: "Boil leaves briefly for purgative clyster; evacuates lower belly violently.",
    distillation: "Distill fresh leaves for narcotic oil; dangerously strong, use externally only.",
    calcination: "Burn to alkaline ash for salt; caustic, useful in wound powders.",
    confection: "Dry and powder for snuff or poultice; purges head, applied to wounds."
  },
  30: { // Copal Resin
    decoction: "Dissolve in wine or oil for fragrant tincture; soothes inflammation.",
    distillation: "Distill for aromatic spirit and turpentine; use in wound balsams.",
    calcination: "Burn as incense for fumigation; resinous smoke clears pestilent air.",
    confection: "Melt with wax and oils for soothing unguent; applied to inflamed skin."
  },
  31: { // Cacao
    decoction: "Grind beans and boil in water or milk for nourishing chocolate; cordial and sustaining.",
    distillation: "Not suitable—cacao's virtues reside in fixed oils and butter, not volatile spirits.",
    calcination: "Roast beans before grinding; enhances flavor but don't burn to ash.",
    confection: "Grind roasted beans with sugar and spices for chocolate cakes; nourishes and cheers."
  },
  32: { // Rue
    decoction: "Boil fresh herb briefly for bitter tincture; expels poisons and clears sight.",
    distillation: "Distill for potent water; antidote to venomous bites and pestilence.",
    calcination: "Burn to alkaline ash; too harsh for internal use, better for external plasters.",
    confection: "Mix dried herb with figs and honey for antidote electuary; guards against plague."
  },
  33: { // Cinchona Bark
    decoction: "Boil bark chips for hours in wine; sovereign febrifuge for tertian agues.",
    distillation: "Not recommended—bitter principles reside in fixed extract, not volatile oils.",
    calcination: "Wasteful—burning destroys the febrifuge alkaloids entirely.",
    confection: "Powder finely and mix with wine and sugar for tincture; masks bitterness."
  },
  34: { // Tamarind
    decoction: "Dissolve pulp in water for cooling purge; gentle laxative for bilious fevers.",
    distillation: "Not suitable—acidic pulp doesn't yield useful distillate.",
    calcination: "Wasteful—burning destroys cooling and laxative properties.",
    confection: "Mix pulp with sugar for conserve; pleasant-tasting gentle purge."
  },
  35: { // Aloes
    decoction: "Dissolve resin in warm water or wine; powerful bitter purgative.",
    distillation: "Not suitable—aloe's cathartic virtues reside in resinous juice, not volatile oils.",
    calcination: "Wasteful—burning destroys purgative principles.",
    confection: "Mix powdered aloe with myrrh and saffron for aperient pills; strong purge."
  },
  36: { // Turpentine
    decoction: "Mix with oil and simmer gently; used as base for balsams, not water decoction.",
    distillation: "Distill for spirit of turpentine; powerful solvent and vulnerary.",
    calcination: "Not applicable—resin liquefies and burns without calcining to ash.",
    confection: "Melt with wax and oils for drawing salve; pulls corruption from wounds."
  },
  37: { // Balsam of Peru
    decoction: "Dissolve in wine for cordial tincture; warms and fortifies the heart.",
    distillation: "Distill for fragrant spirit; excellent for chest complaints and wounds.",
    calcination: "Not suitable—resinous balsam burns without yielding useful ash.",
    confection: "Mix with wax and oils for fragrant healing ointment; applied to ulcers."
  },
  38: { // Sarsaparilla
    decoction: "Boil roots for hours to extract depurative; classic alterative for venereal disease.",
    distillation: "Not recommended—sudorific virtues reside in woody extract, not volatile parts.",
    calcination: "Burn to alkaline ash for mild salt; less effective than decoction.",
    confection: "Powder dried root and mix with guaiacum for cleansing pills."
  },
  39: { // Jalap
    decoction: "Infuse powdered root in wine; powerful hydragogue cathartic for dropsy.",
    distillation: "Not suitable—resinous purgative doesn't yield useful distillate.",
    calcination: "Wasteful—burning destroys cathartic resin entirely.",
    confection: "Mix powder with cream of tartar and sugar for purgative electuary."
  },
  40: { // Sassafras
    decoction: "Boil wood chips in water for hours; sudorific for venereal complaints.",
    distillation: "Distill for fragrant oil; warming and carminative.",
    calcination: "Burn to alkaline ash for salt; less potent than decoction.",
    confection: "Powder bark and mix with treacle for alterative electuary."
  },
  41: { // Balsam of Tolu
    decoction: "Dissolve in warm wine for pectoral tincture; soothes coughs and catarrhs.",
    distillation: "Distill for sweet spirit; excellent for chest complaints and wheezing.",
    calcination: "Not suitable—resin burns without calcining to useful ash.",
    confection: "Mix with sugar for soothing lozenges; eases dry coughs and sore throat."
  },
  42: { // Myrrh
    decoction: "Dissolve gum in wine for astringent tincture; strengthens gums and womb.",
    distillation: "Distill for acrid oil; too harsh for most uses, better for wound balsams.",
    calcination: "Not recommended—destroys antiseptic resins.",
    confection: "Powder and mix with honey for mouth troches; fortifies gums, freshens breath."
  },
  43: { // Frankincense
    decoction: "Dissolve tears in wine for warming tincture; strengthens brain and memory.",
    distillation: "Distill for fragrant oil; comforts cold catarrhs and dries wounds.",
    calcination: "Burn as incense for fumigation; resinous smoke clears phlegm and infection.",
    confection: "Powder finely and mix with wax for healing plaster; dries weeping sores."
  },
  44: { // Mastic
    decoction: "Dissolve tears in wine for astringent tincture; strengthens stomach and gums.",
    distillation: "Distill for delicate oil; rarely done, resin better used whole.",
    calcination: "Not suitable—burns before calcining to useful ash.",
    confection: "Chew tears raw or powder into tooth powder; strengthens teeth and gums."
  },
  45: { // Castoreum
    decoction: "Infuse in wine for antispasmodic tincture; relieves hysteria and convulsions.",
    distillation: "Distill for pungent oil; powerfully antihysteric but rarely prepared.",
    calcination: "Not recommended—destroys aromatic antispasmodic principles.",
    confection: "Powder and mix with amber for hysteric pills; calms fits and faintings."
  },
  46: { // Cassia Fistula
    decoction: "Boil pods to extract sweet pulp; gentle laxative for hot constitutions.",
    distillation: "Not suitable—laxative sugars don't distill.",
    calcination: "Wasteful—burning destroys mild purgative properties.",
    confection: "Mix pulp with senna and tamarind for pleasant-tasting purge electuary."
  },
  47: { // Anise
    decoction: "Infuse seeds in hot water for carminative tea; expels wind, aids digestion.",
    distillation: "Distill for sweet oil; powerful carminative for colic and flatulence.",
    calcination: "Burn to ash for mild salt; destroys aromatic oils.",
    confection: "Coat seeds with sugar for comfits; pleasant carminative after meals."
  },
  48: { // Rhubarb Root
    decoction: "Slice and infuse in wine for gentle aperient; purges without violence or griping.",
    distillation: "Not suitable—cathartic principles reside in resinous extract.",
    calcination: "Wasteful—burning destroys valuable purgative virtues.",
    confection: "Powder and mix with ginger and sugar for stomachic pills; strengthens after purging."
  },
  49: { // Ipecacuanha
    decoction: "Infuse powdered root in wine; swift and certain emetic for poisonings.",
    distillation: "Not suitable—emetic alkaloids reside in fixed powder, not volatiles.",
    calcination: "Wasteful—burning destroys vomitive principles.",
    confection: "Mix tiny amounts with sugar for emetic troches; precise dosing crucial."
  },
  50: { // Scammony
    decoction: "Dissolve resin in wine for drastic hydragogue; use only in desperate dropsies.",
    distillation: "Not suitable—purgative resin doesn't distill.",
    calcination: "Wasteful and dangerous—destroys already violent cathartic.",
    confection: "Mix minute amounts with jalap and sugar; temper violence with gentler purges."
  },
  51: { // Antimony
    decoction: "Not water-soluble; prepare as wine of antimony by digesting metal in wine.",
    distillation: "Sublime for volatile butter of antimony; corrosive and emetic.",
    calcination: "Roast with sulfur for liver of antimony; powerful alterative and sudorific.",
    confection: "Grind calcined antimony into emetic pills; causes forceful vomiting and purging."
  },
  52: { // Hartshorn
    decoction: "Boil shavings in water for nourishing jelly; cordial for fevers and weakness.",
    distillation: "Dry-distill antler for volatile spirit; acrid stimulant for fainting fits.",
    calcination: "Burn to white ash for alkaline salt; useful in testaceous powders.",
    confection: "Dissolve jelly in cordial waters for restorative lohoch; strengthens feeble patients."
  },
  53: { // Vitriol
    decoction: "Dissolve crystals in water for astringent eyewash; tightens tissue, checks flux.",
    distillation: "Distill for vitriolic acid; powerfully caustic, use with extreme caution.",
    calcination: "Roast vitriol for colcothar; astringent red powder for styptic applications.",
    confection: "Mix dilute solution with rose water for eye drops; strengthens weak eyes."
  },
  54: { // Cardamom
    decoction: "Infuse seeds in wine for aromatic cordial; warms stomach and brain.",
    distillation: "Distill for concentrated essential oil; powerful warming stomachic.",
    calcination: "Wasteful—destroys precious aromatic oils.",
    confection: "Powder seeds and mix with sugar for warming comfits; aids digestion after meals."
  },
  55: { // Black Pepper
    decoction: "Boil crushed berries briefly; warming decoction for cold stomach and agues.",
    distillation: "Distill for fiery oil; extremely pungent stimulant and rubefacient.",
    calcination: "Burn to alkaline ash for hot salt; too harsh for most uses.",
    confection: "Powder and mix with ginger and honey for warming electuary; opens obstructions."
  },
  56: { // Storax
    decoction: "Dissolve resin in wine for pectoral tincture; loosens tough phlegm.",
    distillation: "Distill for fragrant oil; excellent for chronic coughs and chest complaints.",
    calcination: "Burn as fumigant for pestilent air; resinous smoke clears infection.",
    confection: "Mix with honey for pectoral lohoch; soothes coughs and eases breathing."
  },
  57: { // Benzoin
    decoction: "Dissolve tears in spirits for vulnerary tincture; heals wounds and ulcers.",
    distillation: "Distill for fragrant benzoin oil; used in wound balsams and cordials.",
    calcination: "Burn as incense for fumigation; sweet smoke clears corrupted air.",
    confection: "Mix with storax and wax for friar's balsam; applied to wounds and burns."
  },
  58: { // Gentian
    decoction: "Boil chopped root for intensely bitter tonic; strengthens stomach, expels worms.",
    distillation: "Distill in wine for bitter water; less common than decoction.",
    calcination: "Burn to ash for alkaline salt; bitterness lost but some virtue remains.",
    confection: "Powder and mix with orange peel and sugar; masks bitterness somewhat."
  },
  59: { // Valerian
    decoction: "Boil root briefly for calming tea; relieves nervous complaints and convulsions.",
    distillation: "Distill for pungent oil; antiepileptic and antispasmodic.",
    calcination: "Not recommended—destroys nervine principles.",
    confection: "Powder and mix with aromatic spices for antispasmodic pills; controls fits."
  },
  60: { // Wormwood
    decoction: "Infuse leaves in water or wine; intensely bitter vermifuge and stomachic.",
    distillation: "Distill for green oil; powerfully bitter and potentially toxic in excess.",
    calcination: "Burn to alkaline ash for salt; some virtue but bitterness lost.",
    confection: "Mix powdered herb with honey; masks extreme bitterness for worm pills."
  },
  61: { // Liquorice
    decoction: "Boil root extensively for sweet demulcent syrup; soothes throat and chest.",
    distillation: "Not suitable—sweet principle doesn't distill, resides in fixed extract.",
    calcination: "Wasteful—burning destroys sweet demulcent properties.",
    confection: "Extract juice and dry into black cakes; soothing troches for coughs."
  },
  62: { // Marshmallow Root
    decoction: "Boil root for mucilaginous decoction; supremely demulcent for inflammations.",
    distillation: "Not suitable—slimy virtue resides in fixed mucilage, not volatiles.",
    calcination: "Wasteful—destroys moistening and softening properties.",
    confection: "Mix powdered root with honey for soothing paste; applied to irritations."
  },
  63: { // Balsam of Copaiba
    decoction: "Mix with milk or mucilage as vehicle; balsam doesn't truly decoct in water.",
    distillation: "Distill for clear oil; powerful vulnerary for ulcers and venereal complaints.",
    calcination: "Not applicable—liquid oleoresin burns without calcining.",
    confection: "Mix with wax and oils for healing salve; excellent for chronic wounds."
  },
  64: { // Contraherva
    decoction: "Boil root in water or wine; classic alexipharmic against poisons and fevers.",
    distillation: "Distill for antidotal water; less common than decoction.",
    calcination: "Burn to ash for antipoisonous salt; some occult virtue remains.",
    confection: "Powder and mix with Venice treacle for antidote electuary; resist venoms."
  },
  65: { // Maguey Sap
    decoction: "Boil briefly if needed but usually applied fresh; cooling for burns and inflammations.",
    distillation: "Distill for weak aqua vitae; better fermented and used fresh.",
    calcination: "Not applicable—mostly water, evaporates before calcining.",
    confection: "Mix with wax for cooling salve; soothes inflamed and burned skin."
  },
  66: { // Peyote
    decoction: "Infuse dried buttons in water; narcotic analgesic but causes disturbing visions.",
    distillation: "Not suitable—visionary alkaloids degrade in distillation heat.",
    calcination: "Wasteful—burning destroys medicinal and psychotropic principles.",
    confection: "Dry and powder for pills; precise dosing crucial to avoid madness."
  },
  67: { // Liquidambar
    decoction: "Dissolve resin in wine for pectoral tincture; soothes coughs and chest pains.",
    distillation: "Distill for sweet-smelling oil; used in wound balsams and cordials.",
    calcination: "Burn as fumigant for corrupted air; fragrant smoke clears infection.",
    confection: "Mix with wax and oils for healing unguent; applied to ulcers and sores."
  },
  68: { // Willow Bark
    decoction: "Boil bark for hours in water; bitter febrifuge for agues and inflammatory pains.",
    distillation: "Not recommended—antipyretic salicin resides in watery extract.",
    calcination: "Burn to alkaline ash for mild salt; less effective than decoction.",
    confection: "Powder bark and mix with wine for tincture; masks bitterness somewhat."
  },
  69: { // Chia Seeds
    decoction: "Soak seeds in water for mucilaginous drink; cooling and moistening for fevers.",
    distillation: "Not suitable—demulcent virtue resides in slimy mucilage, not volatiles.",
    calcination: "Wasteful—burning destroys cooling and nourishing properties.",
    confection: "Mix soaked seeds with fruit juice for refreshing drink; cools internal heat."
  },
  70: { // China Root
    decoction: "Chip root and boil for hours; powerful alterative for chronic pains and French disease.",
    distillation: "Not suitable—sudorific virtues reside in woody extract, not volatile oils.",
    calcination: "Burn to ash for weak alkali; far less effective than long decoction.",
    confection: "Powder and mix with sarsaparilla for cleansing pills; depurative for blood."
  }
};

// Read the original file
const filePath = path.join(__dirname, '../src/initialInventory.js');
let content = fs.readFileSync(filePath, 'utf8');

// For each item that needs preparation advice
Object.entries(preparationAdviceData).forEach(([id, advice]) => {
  const idNum = parseInt(id);

  // Create the preparationAdvice string
  const adviceString = `preparationAdvice: {
            decoction: "${advice.decoction}",
            distillation: "${advice.distillation}",
            calcination: "${advice.calcination}",
            confection: "${advice.confection}"
        }`;

  // Find the item by searching for its id
  // Look for pattern like "id: 11," followed by properties, ending before next "id:" or end of array
  const itemRegex = new RegExp(
    `(\\{\\s*id: ${idNum},\\s*[\\s\\S]*?)(\\n    },)`,
    'g'
  );

  // Check if this item already has preparationAdvice
  const hasAdviceRegex = new RegExp(
    `id: ${idNum},[\\s\\S]*?preparationAdvice:`,
    ''
  );

  if (hasAdviceRegex.test(content)) {
    console.log(`Item ${idNum} already has preparationAdvice, skipping...`);
    return;
  }

  // Replace the item, adding preparationAdvice before the closing brace
  content = content.replace(itemRegex, (match, itemBody, closing) => {
    // Add preparationAdvice before the closing brace
    // Remove trailing comma from last property if present
    const updatedBody = itemBody.replace(/,(\s*)$/, '$1');
    return `${updatedBody},\n        ${adviceString}${closing}`;
  });
});

// Write the updated content back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Added preparation advice to all items!');
