#!/usr/bin/env python3
"""
Add preparationAdvice to all items in initialInventory.js
"""
import re

# All advice data for items 13-70 (excluding already-added items)
ADVICE = {
    13: ("Dissolve in decoctions as sweetener and preservative; extends shelf life.", "Not applicable—sugar caramelizes before distilling; use for syrups instead.", "Burn to black carbon for filtering waters; loses sweetness entirely.", "Essential base for all confections; blend with drugs to mask unpleasant tastes."),
    14: ("Ideal menstruum for decocting tough roots and barks; extracts more than water.", "Distill for brandy-wine or aqua vitae; fortifies and preserves tinctures.", "Not applicable—wine evaporates before calcination; use lees for tartar.", "Mix with spices and sugar for cordial wines; strengthens vital spirits."),
    15: ("Dissolve in hot water for purgative draught; expels thick phlegm.", "Sublime with quicklime for volatile spirit; powerful but dangerous.", "Already a purified salt from sublimation; no further calcination needed.", "Dissolve in syrups for pectoral lohochs; loosens stubborn coughs."),
    19: ("Slice root thinly, infuse in warm water; gentler purge than jalap.", "Not suitable—purgative resins don't volatile distill well.", "Wasteful—burning destroys cathartic principles entirely.", "Powder and mix with cinnamon and sugar; masks taste, eases griping."),
    20: ("Boil insects in water for crimson tincture; astringent for fluxes.", "Not recommended—dye and medicine reside in body, not vapors.", "Burn to ash for red pigment; loses most medicinal virtue.", "Grind to powder, mix with sugar for cordial troches; stops bleeding."),
    21: ("Dissolve crystals in water for astringent gargle; tightens gums, stops flux.", "Not applicable—mineral salt yields no useful distillate.", "Already calcined from ore; roasting intensifies astringency.", "Powder finely, mix with honey for topical paste against ulcers."),
    22: ("Dissolve resin in wine for red tincture; powerful styptic and vulnerary.", "Not recommended—resin's virtue resides in fixed matter, not volatile oils.", "Wasteful—burning destroys astringent resins entirely.", "Melt with wax and oil for wound plaster; seals cuts, stops bleeding."),
    23: ("Infuse powder in wine; violent emetic and purgative—use sparingly.", "Dangerously volatile—produces toxic antimony vapors; avoid.", "Already calcined from antimony ore; further burning increases toxicity.", "Mix tiny dose with sugar for emetic pills; causes forceful vomiting."),
    26: ("Grate and infuse in warm wine; comforts cold stomach and brain.", "Distill for concentrated essence; powerful stomachic and cordial.", "Burn to ash for aromatic salt; most volatile oils lost.", "Powder and mix with sugar for digestive confection; warms vital organs."),
    27: ("Not suitable—resin melts but doesn't dissolve in water.", "Yields oil of amber by destructive distillation; intensely aromatic.", "Burn as incense for fumigation; purifies corrupted air.", "Grind to powder and mix with honey for pills; calms hysteria and convulsions."),
    28: ("Chip wood and boil for hours; classic sudorific for French disease.", "Not recommended—virtues reside in woody extract, not volatiles.", "Burn to alkaline ash for caustic salt; destroys most resinous virtues.", "Powder and mix into bolus with gums; eases administration of this bitter wood."),
    29: ("Infuse leaves in water for purgative wash; applied to wounds.", "Distill leaves for powerful oil; used in tiny doses as emetic.", "Burn leaves to caustic ash; too harsh for most medicinal uses.", "Dry and powder for snuff or smoking mixture; purges head and chest."),
    30: ("Dissolve resin in wine or spirits; water alone insufficient.", "Distill for fragrant oil; used in unguents and sacred incense.", "Burn as fumigant in brazier; smoke cleanses rooms and temples.", "Melt with wax and oils for soothing plaster; applied to inflammations."),
    31: ("Roast, grind, and infuse beans in hot water or milk; nourishing beverage.", "Not suitable—chocolate's virtue resides in fixed oils and butter.", "Wasteful—burning destroys nutritive and cordial properties.", "Grind with sugar and spices for tablets or drinking chocolate; strengthens heart."),
    32: ("Boil fresh or dried herb in water; bitter purgative and protective tonic.", "Distill for potent essential water; a few drops suffice for stomach complaints.", "Burn to acrid ash; too caustic for most uses.", "Dry and powder for pills with honey; easier to dose than decoction."),
    33: ("Boil bark for hours in water or wine; the classic decoction for tertian fevers.", "Not recommended—febrifuge alkaloids remain in aqueous extract.", "Wasteful—burning destroys the precious bark's antipyretic virtues.", "Powder bark and mix with wine or syrup; masks intense bitterness."),
    34: ("Dissolve pulp in water for cooling purge; gentle on the stomach.", "Not suitable—acidic fruit doesn't distill well.", "Wasteful—burning destroys cooling and purgative properties.", "Mix pulp with sugar and spices for electuary; pleasant-tasting laxative."),
    35: ("Infuse dried resin in water; bitter purgative draught.", "Not recommended—purgative resins don't volatilize well.", "Burn to ash for caustic powder; destroys most cathartic virtue.", "Mix powder with myrrh and mastic for wound-healing pills."),
    36: ("Warm gently in water but doesn't truly dissolve; better in spirits.", "Distill for oil of turpentine; powerful solvent and vulnerary.", "Not applicable—resin burns away entirely before calcining.", "Mix with wax and oil for drawing plaster; applied to wounds and boils."),
    37: ("Dissolve in wine or spirits; water insufficient for resinous balsam.", "Distill for concentrated oil; excellent for wound balsams and cordials.", "Not applicable—liquid balsam burns without calcining.", "Mix with wax and oil for healing salve; applied to ulcers and sores."),
    38: ("Chip root and boil for hours; classic blood cleanser often combined with guaiacum.", "Not suitable—alterative virtues reside in woody extract.", "Burn to ash for mild alkali; far less effective than long decoction.", "Powder and mix with sugar for pills; easier than drinking bitter decoction."),
    39: ("Slice root and infuse in warm water; powerful cathartic draught.", "Not suitable—purgative resins don't volatile distill.", "Wasteful—burning destroys cathartic resinous principles.", "Powder and mix with aromatics for purgative pills; masks unpleasant taste."),
    40: ("Chip wood and bark, boil for hours; sudorific diet drink for venereal complaints.", "Distill for fragrant essential oil; warming cordial and carminative.", "Burn to ash for alkali; destroys most aromatic medicinal virtues.", "Powder bark and mix with wine for tincture; alternative to long decoction."),
    41: ("Dissolve in wine or milk; water alone insufficient for resinous balsam.", "Distill for sweet oil; excellent for pectoral syrups and lozenges.", "Not applicable—liquid balsam burns without calcining.", "Mix with sugar for pectoral lozenges; soothes coughs and chest complaints."),
    42: ("Dissolve resin in wine; water insufficient for this bitter gum.", "Not recommended—astringent virtues reside in fixed resin, not volatiles.", "Burn to acrid ash; too caustic for internal use.", "Mix powder with honey or wine for pills; fortifies womb and heals ulcers."),
    43: ("Dissolve tears in wine; water alone insufficient.", "Distill for aromatic oil; used in cordial waters and fumigations.", "Burn as incense in brazier; smoke comforts brain and purifies air.", "Powder and mix with myrrh for pills; strengthens memory and dries catarrhs."),
    44: ("Dissolve tears in wine; water poorly extracts resinous virtues.", "Distill for oil of mastic; used in varnishes and fine plasters.", "Burn to ash; destroys most binding and astringent properties.", "Chew tears raw or powder into tooth powders; strengthens gums."),
    45: ("Infuse in wine; water poorly extracts this animal secretion.", "Distill for intensely aromatic spirit; use sparingly for hysteric fits.", "Not applicable—animal matter chars rather than calcines.", "Powder and mix with aromatics for antispasmodic pills; tiny doses suffice."),
    46: ("Dissolve pulp in warm water; gentle purgative syrup.", "Not suitable—laxative mucilage doesn't volatilize.", "Wasteful—burning destroys sweet pulp and purgative properties.", "Mix pulp with sugar and senna for pleasant purgative electuary."),
    47: ("Infuse seeds in hot water for carminative tea; eases wind and colic.", "Distill for concentrated essential water; powerful stomachic in small doses.", "Burn to ash; wastes aromatic oils and destroys carminative virtues.", "Coat seeds with sugar for comfits; chew after meals to aid digestion."),
    48: ("Slice root and boil briefly; the gentlest and safest of purges.", "Not suitable—purgative principles remain in watery extract.", "Burn to ash for mild alkali; destroys most purgative virtue.", "Powder and mix with aromatics for pills; corrects bitterness."),
    49: ("Infuse powdered root in warm water; causes swift and certain vomiting.", "Not suitable—emetic alkaloids remain in aqueous extract.", "Wasteful—burning destroys emetic principles.", "Mix tiny dose with sugar for pills; precise dosing crucial."),
    50: ("Infuse resin briefly in water; violent purgative—use with great caution.", "Not suitable—cathartic resins don't volatilize.", "Wasteful—burning destroys purgative principles entirely.", "Powder and mix with gentler drugs to temper; too harsh alone."),
    51: ("Infuse prepared antimony in wine; causes purging and sweating.", "Sublime with heat for butter of antimony; powerfully caustic and dangerous.", "Calcine ore to crocus metallorum; emetic and purgative mineral.", "Grind prepared antimony into pills; precise dosing essential to avoid poisoning."),
    52: ("Boil shavings in water for strengthening broth; cordial for fevers.", "Dry distill for spirit of hartshorn; volatile alkali for fainting fits.", "Calcine antler to white powder; gentle alkali for acidic stomachs.", "Mix powdered horn with cordial waters for restorative jellies."),
    53: ("Dissolve crystals in water for astringent eyewash; tightens tissues.", "Distill for oil of vitriol (sulfuric acid); extremely caustic—use with utmost care.", "Already calcined from ore; roasting intensifies astringency and drying.", "Powder crystals and mix with honey for caustic paste; burns away proud flesh."),
    54: ("Bruise seeds and infuse in wine; warming cordial for cold stomach.", "Distill for powerful essential oil; excellent carminative and cephalic.", "Burn to ash; wastes precious aromatic oils entirely.", "Coat seeds with sugar for comfits; chew for sweet breath and digestion."),
    55: ("Infuse crushed peppercorns in wine or water; warming stomachic.", "Distill for pungent essential oil; powerful rubefacient and stimulant.", "Burn to caustic ash; destroys aromatic pungency.", "Powder and mix with honey for warming electuary; opens obstructions."),
    56: ("Dissolve resin in wine; water insufficient for this balsamic gum.", "Distill for oil of storax; pectoral balsam for coughs and catarrhs.", "Burn as fumigant; aromatic smoke opens lungs and purifies air.", "Mix with wax for pectoral plaster; applied to chest for stubborn coughs."),
    57: ("Dissolve resin in spirits; water alone insufficient.", "Distill for fragrant oil; vulnerary for wounds and pectoral complaints.", "Burn as incense; sweet smoke comforts lungs and brain.", "Dissolve in spirits for wound tincture; applied topically or taken internally."),
    58: ("Boil chopped root in water or wine; intensely bitter stomachic tonic.", "Not suitable—bitter principles remain in aqueous extract.", "Burn to ash; destroys bitter tonic properties.", "Powder root and mix with aromatics to mask bitterness; for weak stomachs."),
    59: ("Boil root in water; strong-smelling tonic for nervous afflictions.", "Distill for essential oil; powerful antispasmodic and sedative.", "Burn to ash; destroys volatile medicinal principles.", "Powder root and mix with honey for pills; calms hysteria and falling sickness."),
    60: ("Infuse herb in wine or water; intensely bitter vermifuge and stomachic.", "Distill for essential oil; powerful anthelmintic in tiny doses.", "Burn to caustic ash; destroys bitter medicinal principles.", "Powder herb and mix with honey for pills; kills worms and strengthens stomach."),
    61: ("Boil root in water for sweet demulcent drink; soothes throat and coughs.", "Not suitable—sweet mucilage doesn't volatilize.", "Burn to ash; wastes sweet soothing properties entirely.", "Extract juice and boil with sugar for lozenges; excellent for sore throats."),
    62: ("Boil root for hours in water; makes thick slimy drink for dry coughs.", "Not suitable—slimy virtue resides in fixed mucilage, not volatiles.", "Wasteful—destroys moistening and softening properties.", "Mix powdered root with honey for soothing paste; applied to irritations."),
    63: ("Mix with milk or mucilage as vehicle; balsam doesn't truly decoct in water.", "Distill for clear oil; powerful vulnerary for ulcers and venereal complaints.", "Not applicable—liquid oleoresin burns without calcining.", "Mix with wax and oils for healing salve; excellent for chronic wounds."),
    64: ("Boil root in water or wine; classic alexipharmic against poisons and fevers.", "Distill for antidotal water; less common than decoction.", "Burn to ash for antipoisonous salt; some occult virtue remains.", "Powder and mix with Venice treacle for antidote electuary; resist venoms."),
    65: ("Boil briefly if needed but usually applied fresh; cooling for burns and inflammations.", "Distill for weak aqua vitae; better fermented and used fresh.", "Not applicable—mostly water, evaporates before calcining.", "Mix with wax for cooling salve; soothes inflamed and burned skin."),
    66: ("Infuse dried buttons in water; narcotic analgesic but causes disturbing visions.", "Not suitable—visionary alkaloids degrade in distillation heat.", "Wasteful—burning destroys medicinal and psychotropic principles.", "Dry and powder for pills; precise dosing crucial to avoid madness."),
    67: ("Dissolve resin in wine for pectoral tincture; soothes coughs and chest pains.", "Distill for sweet-smelling oil; used in wound balsams and cordials.", "Burn as fumigant for corrupted air; fragrant smoke clears infection.", "Mix with wax and oils for healing unguent; applied to ulcers and sores."),
    68: ("Boil bark for hours in water; bitter febrifuge for agues and inflammatory pains.", "Not recommended—antipyretic salicin resides in watery extract.", "Burn to alkaline ash for mild salt; less effective than decoction.", "Powder bark and mix with wine for tincture; masks bitterness somewhat."),
    69: ("Soak seeds in water for mucilaginous drink; cooling and moistening for fevers.", "Not suitable—demulcent virtue resides in slimy mucilage, not volatiles.", "Wasteful—burning destroys cooling and nourishing properties.", "Mix soaked seeds with fruit juice for refreshing drink; cools internal heat."),
}

with open('src/initialInventory.js', 'r') as f:
    content = f.read()

added_count = 0

for item_id, (dec, dist, calc, conf) in ADVICE.items():
    # Check if already has advice
    pattern = rf'id: {item_id},[\s\S]{{0,2000}}preparationAdvice:'
    if re.search(pattern, content):
        print(f"Item {item_id} already has preparationAdvice, skipping...")
        continue

    # Find the item block
    item_pattern = rf'(\{{[\s\S]*?id: {item_id},[\s\S]*?)((\n    (quality|rarity|categories|image|citation|pdf|emoji|description|spanishName|latinName|name): [^\n]+[,]?)*)(\n    \}},?)'

    match = re.search(item_pattern, content)
    if not match:
        print(f"Could not find item {item_id}")
        continue

    # Find last property line
    full_match = match.group(0)
    before_closing = match.group(1) + match.group(2)
    closing = match.group(6)

    # Ensure last line has comma
    if not before_closing.rstrip().endswith(','):
        before_closing = before_closing.rstrip() + ','

    # Build advice string
    advice_str = f'''
    preparationAdvice: {{
        decoction: "{dec}",
        distillation: "{dist}",
        calcination: "{calc}",
        confection: "{conf}"
    }}'''

    # Replace
    new_item = before_closing + advice_str + closing
    content = content.replace(full_match, new_item)
    added_count += 1
    print(f"Added preparationAdvice to item {item_id}")

# Write back
with open('src/initialInventory.js', 'w') as f:
    f.write(content)

print(f"\n✓ Added preparationAdvice to {added_count} items!")
