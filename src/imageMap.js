/**
 * imageMap.js - LEGACY IMAGE SYSTEM
 *
 * ⚠️  DO NOT USE FOR NPC/PATIENT PORTRAITS!
 * For all portrait matching, use portraitResolver.js instead.
 *
 * This file is ONLY used for:
 * - Quest banner images (Quest.js)
 * - Dream sequence images (Sleep.js)
 * - Modal background images (PrescribePopup.jsx)
 *
 * All images here are locations, items, or decorative elements.
 */

// Import all images using Vite's glob import
const images = import.meta.glob('./assets/**/*.{jpg,jpeg,png}', { eager: true });

// Helper function to get image URL from path
const getImageUrl = (path) => {
  const key = `./assets/${path}`;
  return images[key]?.default || images[key];
};

const imageMap = {
  fair: {
    src: getImageUrl('fair.jpg'),
    tags: ['town', 'fair', 'marketplace', 'venders', 'people selling', 'street life', 'colonial life']
  },

  ignaciodelacruz: {
    src: getImageUrl('ignaciodelacruz.jpg'),
    tags: ['rival', 'Ignacio de la Cruz', 'middle aged man', 'physician', 'doctor']
  },
  alfredojimenez: {
    src: getImageUrl('alfredojimenez.jpg'),
    tags: ['specific patient', 'Alredo Jimenez', 'middle aged man', 'toymaker']
  },

  pablothegoat: {
    src: getImageUrl('pablothegoat.jpg'),
    tags: ['specific patient', 'Pablo the Goat', 'goat', 'sick farm animal']
  },
  juandevargas: {
    src: getImageUrl('juandevargas.jpg'),
    tags: ['specific patient', 'Juan de Vargas', 'older man', 'philosopher', 'dementia']
  },
  sage: {
    src: getImageUrl('sage.jpg'),
    tags: ['sage', 'herb', 'medicinal', 'apothecary', 'thyme', 'herbal remedy']
  },

  thyme: {
    src: getImageUrl('thyme.jpg'),
    tags: ['thyme', 'herb', 'medicinal', 'apothecary', 'seasoning', 'herbal remedy']
  },

  lemonbalm: {
    src: getImageUrl('lemonbalm.jpg'),
    tags: ['lemon balm', 'herb', 'medicinal', 'apothecary', 'calming', 'herbal remedy']
  },

  lemon: {
    src: getImageUrl('lemon.jpg'),
    tags: ['lemon', 'fruit', 'food', 'cuisine', 'juice', 'food item']
  },

  rosemary: {
    src: getImageUrl('rosemary.jpg'),
    tags: ['rosemary', 'herb', 'medicinal', 'apothecary', 'aromatic', 'herbal remedy']
  },

  lavender: {
    src: getImageUrl('lavender.jpg'),
    tags: ['lavender', 'herb', 'medicinal', 'apothecary', 'calming', 'aromatic']
  },

  basil: {
    src: getImageUrl('basil.jpg'),
    tags: ['basil', 'herb', 'medicinal', 'apothecary', 'seasoning', 'aromatic']
  },

  mint: {
    src: getImageUrl('mint.jpg'),
    tags: ['mint', 'herb', 'medicinal', 'apothecary', 'aromatic', 'refreshing']
  },

  oregano: {
    src: getImageUrl('oregano.jpg'),
    tags: ['oregano', 'herb', 'medicinal', 'apothecary', 'seasoning', 'herbal remedy']
  },

  chamomile: {
    src: getImageUrl('chamomile.jpg'),
    tags: ['chamomile', 'herb', 'medicinal', 'apothecary', 'calming', 'herbal tea']
  },

  dill: {
    src: getImageUrl('dill.jpg'),
    tags: ['dill', 'herb', 'medicinal', 'apothecary', 'seasoning', 'herbal remedy']
  },

  parsley: {
    src: getImageUrl('parsley.jpg'),
    tags: ['parsley', 'herb', 'medicinal', 'apothecary', 'seasoning', 'herbal remedy']
  },

  cilantro: {
    src: getImageUrl('cilantro.jpg'),
    tags: ['cilantro', 'herb', 'medicinal', 'apothecary', 'seasoning', 'herbal remedy']
  },

  tarragon: {
    src: getImageUrl('tarragon.jpg'),
    tags: ['tarragon', 'herb', 'medicinal', 'apothecary', 'seasoning', 'herbal remedy']
  },

  bayleaf: {
    src: getImageUrl('bayleaf.jpg'),
    tags: ['bay leaf', 'herb', 'medicinal', 'apothecary', 'seasoning', 'herbal remedy']
  },

  fennel: {
    src: getImageUrl('fennel.jpg'),
    tags: ['fennel', 'herb', 'medicinal', 'apothecary', 'seasoning', 'herbal remedy']
  },

  sunsetshop: {
    src: getImageUrl('sunsetshop.jpg'),
    tags: ['shop', 'apothecary shop', 'dawn', 'sunset', 'twilight', 'alchemy']
  },

  youngman: {
    src: getImageUrl('youngman.jpg'),
    tags: ['young man', 'standing', 'man', 'worker', 'patient', 'unnammed young man']
  },

  rooster: {
    src: getImageUrl('rooster.jpg'),
    tags: ['rooster', 'bird', 'chicken', 'farm', 'rural life', 'items bought']
  },

  duck: {
    src: getImageUrl('rooster.jpg'),
    tags: ['duck', 'bird', 'animal', 'farm', 'rural life', 'items bought']
  },

  cow: {
    src: getImageUrl('cow.jpg'),
    tags: ['cattle', 'animal', 'cow', 'farm', 'rural life', 'items bought']
  },

  pig: {
    src: getImageUrl('pig.jpg'),
    tags: ['pig', 'animal', 'pet', 'farm', 'rural life', 'items bought']
  },

  goat: {
    src: getImageUrl('goat.jpg'),
    tags: ['goat', 'animal', 'livestock', 'farm', 'rural life', 'items bought']
  },

  sheep: {
    src: getImageUrl('sheep.jpg'),
    tags: ['sheep', 'animal', 'livestock', 'farm', 'rural life', 'items bought']
  },

  dog: {
    src: getImageUrl('dog.jpg'),
    tags: ['dog', 'animal', 'pet', 'farm', 'rural life', 'items bought']
  },

  herbalflowers: {
    src: getImageUrl('herbalflowers.jpg'),
    tags: ['herbal flowers', 'flowers', 'herbs', 'medicine', 'materia medica', 'market item', 'items bought']
  },

  cannabis: {
    src: getImageUrl('cannabis.jpg'),
    tags: ['cannabis', 'herb', 'medicine', 'materia medica', 'market item', 'items bought']
  },

  galangal: {
    src: getImageUrl('galangal.jpg'),
    tags: ['galangal', 'root', 'spices', 'medicine', 'materia medica', 'market item', 'items bought']
  },

  oil: {
    src: getImageUrl('oil.jpg'),
    tags: ['oil', 'liquid', 'medicine', 'materia medica', 'market item', 'items bought']
  },

  nuts: {
    src: getImageUrl('nuts.jpg'),
    tags: ['nuts', 'seeds', 'food', 'materia medica', 'market item', 'items bought']
  },

  root: {
    src: getImageUrl('root.jpg'),
    tags: ['root', 'spices', 'medicine', 'materia medica', 'market item', 'items bought']
  },

  cacao: {
    src: getImageUrl('cacao.jpg'),
    tags: ['cacao', 'chocolate', 'spices', 'medicine', 'materia medica', 'market item', 'items bought']
  },

  rabbit: {
    src: getImageUrl('rabbit.jpg'),
    tags: ['rabbit', 'animal', 'pet', 'bunny', 'hare', 'items bought']
  },

  onions: {
    src: getImageUrl('onions.jpg'),
    tags: ['food', 'onions', 'spices', 'materia medica', 'market item', 'items bought']
  },

  pinenuts: {
    src: getImageUrl('pinenuts.jpg'),
    tags: ['herb', 'pine nuts', 'spices', 'medicine', 'materia medica', 'market item', 'items bought']
  },

  staranise: {
    src: getImageUrl('staranise.jpg'),
    tags: ['star shaped spice', 'star anise', 'spices', 'medicine', 'materia medica', 'market item', 'items bought']
  },

  mango: {
    src: getImageUrl('mangos.jpg'),
    tags: ['fruit', 'mango', 'food', 'delicious fruit', 'market item', 'items bought']
  },

  vanilla: {
    src: getImageUrl('vanilla.jpg'),
    tags: ['vanilla', 'spices', 'medicine', 'materia medica', 'market item', 'items bought']
  },

  fish: {
    src: getImageUrl('fish.jpg'),
    tags: ['fish', 'seafood', 'food item', 'market item', 'items bought', 'nature']
  },

  chilis: {
    src: getImageUrl('chilis.jpg'),
    tags: ['chili', 'spicy', 'food item', 'market item', 'items bought', 'chili pepper']
  },

  laurelleaves: {
    src: getImageUrl('laurelleaves.jpg'),
    tags: ['plant', 'nature', 'leaf', 'market item', 'herbs bought', 'materia medica']
  },

  genericleavesorherbs: {
    src: getImageUrl('genericleavesorherbs.jpg'),
    tags: ['plant', 'nature', 'generic leaves', 'market item', 'herbs bought', 'generic herbs', 'materia medica']
  },

  aloe: {
    src: getImageUrl('aloe.jpg'),
    tags: ['plant', 'aloe', 'market item', 'herbs bought', 'materia medica']
  },

  antoniusphilalethes: {
    src: getImageUrl('antonius.jpg'),
    tags: ['Antonius Philalethes', 'alchemist', 'man', 'questNPC', 'Greek', 'patient']
  },

  conventofsanfrancisco: {
    src: getImageUrl('conventofsanfrancisco.jpg'),
    tags: ['convent of san francisco', 'convent', 'quadrangle', 'nunnery', 'nuns', 'christian', 'mexico city']
  },

  monasteryquadrangle: {
    src: getImageUrl('monasteryquadrangle.jpg'),
    tags: ['water fountain', 'fountain', 'quadrangle', 'monastery', 'monks']
  },

  palacecourtyardfountain: {
    src: getImageUrl('fountain.jpg'),
    tags: ['water fountain', 'fountain', 'palace', 'courtyard', 'wealthy home', 'inner sanctum']
  },

  courtyard: {
    src: getImageUrl('fountain.jpg'),
    tags: ['water fountain', 'fountain', 'palace', 'courtyard', 'wealthy home', 'town']
  },

  fountain: {
    src: getImageUrl('fountain.jpg'),
    tags: ['water fountain', 'fountain', 'water source', 'city', 'courtyard']
  },

  oldwoman: {
    src: getImageUrl('oldwoman.jpg'),
    tags: ['generic patient', 'old woman', 'woman', 'elderly', 'matron']
  },

  alonsogarcia: {
    src: getImageUrl('alonso_garcia.jpg'),
    tags: ['patient', 'Alonso Garcia', 'man', 'rival', 'sign painter', 'handsome', 'antagonist']
  },

  monk: {
    src: getImageUrl('monk.jpg'),
    tags: ['generic patient', 'friar', 'religious', 'monk', 'monastery']
  },

  rainydaytown: {
    src: getImageUrl('rainydaytown.jpg'),
    tags: ['rainy', 'cloudy', 'rain', 'town', 'city']
  },

  twilight: {
    src: getImageUrl('twilight.jpg'),
    tags: ['twilight', 'cloudy', 'dusk', 'beautiful sunset', 'clouds']
  },

  purchase: {
    src: getImageUrl('purchase.jpg'),
    tags: ['purchasing', 'buying', 'use this when maria buys an item', 'coins']
  },

  marketvendors: {
    src: getImageUrl('marketvendors.jpg'),
    tags: ['women', 'marketplace', 'selling', 'fruits', 'herbs']
  },

  gonzalodeloanda: {
    src: getImageUrl('gonzalodeloanda.jpg'),
    tags: ['specific patient', 'African', 'innkeeper', 'cataracts', 'middle aged']
  },

  michaeladelasierra: {
    src: getImageUrl('michaeladelasierra.jpg'),
    tags: ['specific patient', 'woman', 'wealthy', 'paralysis', 'middle aged']
  },

  sickboy: {
    src: getImageUrl('sickboy.jpg'),
    tags: ['generic patient', 'sick boy', 'mestizo', 'indigenous']
  },

  cabin: {
    src: getImageUrl('cabin.jpg'),
    tags: ['trading post', 'cabin', 'daytime', 'refuge', 'scrublands', 'indigenous', 'americas']
  },

  dryscrub: {
    src: getImageUrl('dryscrub.jpg'),
    tags: ['countryside', 'hot', 'daytime', 'desert', 'scrublands', 'dry land', 'agave']
  },

  scrub: {
    src: getImageUrl('scrub.jpg'),
    tags: ['countryside', 'hot', 'daytime', 'scrublands', 'agave', 'cacti', 'bushes']
  },

  nightsky: {
    src: getImageUrl('nightsky.jpg'),
    tags: ['night', 'stars', 'nighttime', 'cosmic', 'evening stars']
  },

  conquistadorfrontier: {
    src: getImageUrl('conquistadorfrontier.jpg'),
    tags: ['man standing', 'wearing armor', 'dusk', 'frontier', 'conquistador', 'soldier', 'new spain']
  },

  conquistador: {
    src: getImageUrl('conquistador.jpg'),
    tags: ['man standing', 'wearing armor', 'city setting', 'knight', 'conquistador', 'soldier', 'new spain']
  },

  pueblosettlement: {
    src: getImageUrl('pueblosettlement.jpg'),
    tags: ['humble abode', 'pueblo', 'frontier region', 'scrubland house', 'small house', 'hut', 'americas']
  },

  ruralhousemexicotexas: {
    src: getImageUrl('ruralhousemexicotexas.jpg'),
    tags: ['humble abode', 'texas', 'frontier region', 'mexico', 'small house', 'americas']
  },

  oceanday: {
    src: getImageUrl('oceanday.jpg'),
    tags: ['sea', 'beautiful water', 'at sea', 'horizon', 'blue', 'open ocean', 'day', 'sun on the waves']
  },

  opensea: {
    src: getImageUrl('opensea.jpg'),
    tags: ['sea', 'misty ocean', 'open ocean', 'horizon', 'blue', 'ethereal', 'foggy']
  },

  vapororswirlingclouds: {
    src: getImageUrl('vapororswirlingclouds.jpg'),
    tags: ['vapor', 'mist', 'air', 'fog', 'nature', 'ethereal', 'soft']
  },

  mud: {
    src: getImageUrl('mud.jpg'),
    tags: ['mud', 'earth', 'ground', 'puddles', 'wet', 'nature', 'soil']
  },

  wetmuddystones: {
    src: getImageUrl('wetmuddystones.jpg'),
    tags: ['rocks', 'stone', 'rough', 'terrain', 'nature', 'ground', 'landscape']
  },

  rain: {
    src: getImageUrl('rain.jpg'),
    tags: ['rain', 'weather', 'droplets', 'storm', 'nature', 'water', 'clouds']
  },

  sunsetfarm: {
    src: getImageUrl('sunsetfarm.jpg'),
    tags: ['sunset', 'farm', 'countryside', 'colonial', 'rural life', 'evening', 'peaceful']
  },

  horsedrinkingfarm: {
    src: getImageUrl('horsedrinkingfarm.jpg'),
    tags: ['horse', 'farm', 'drinking', 'water', 'countryside', 'colonial', 'rural life']
  },

  catday: {
    src: getImageUrl('catday.jpg'),
    tags: ['cat', 'daytime', 'farm', 'colonial', 'pet', 'domestic animal', 'quiet']
  },

  sheepfarmnight: {
    src: getImageUrl('sheepfarmnight.jpg'),
    tags: ['sheep', 'farm', 'night', 'colonial', 'animals', 'pasture', 'rural life']
  },

  parchment: {
    src: getImageUrl('parchment.jpg'),
    tags: ['parchment', 'writing', 'document', 'colonial', 'paper', 'manuscript', 'historical']
  },

  claypot: {
    src: getImageUrl('claypot.jpg'),
    tags: ['clay pot', 'pottery', 'colonial', 'vessel', 'handcrafted', 'kitchenware', 'utility']
  },

  lamp: {
    src: getImageUrl('lamp.jpg'),
    tags: ['lamp', 'lighting', 'colonial', 'night', 'warm glow', 'interior', 'illumination']
  },

  manwritingwithlantern: {
    src: getImageUrl('manwritingwithlantern.jpg'),
    tags: ['man', 'writing', 'lantern', 'colonial', 'night', 'quiet', 'thoughtful']
  },

  manattablecandle: {
    src: getImageUrl('manattablecandle.jpg'),
    tags: ['man', 'table', 'candle', 'colonial', 'interior', 'quiet', 'contemplation']
  },

  merchantwritingbill: {
    src: getImageUrl('merchantwritingbill.jpg'),
    tags: ['merchant', 'writing', 'bill', 'document', 'colonial', 'commerce', 'trade']
  },

  packhorse: {
    src: getImageUrl('packhorse.jpg'),
    tags: ['horse', 'packhorse', 'travel', 'colonial', 'exploration', 'rural', 'transport']
  },

  saharadesert: {
    src: getImageUrl('saharadesert.jpg'),
    tags: ['desert', 'Sahara', 'daytime', 'desolate', 'dunes', 'sand', 'exploration']
  },

  scrubchapparaldesertday: {
    src: getImageUrl('scrubchapparaldesertday.jpg'),
    tags: ['desert', 'scrub', 'chaparral', 'daytime', 'harsh landscape', 'plants', 'exploration']
  },

  desertnight: {
    src: getImageUrl('desertnight.jpg'),
    tags: ['desert', 'night', 'moonlit', 'sand', 'quiet', 'solitude', 'exploration']
  },

  sonoradesertday: {
    src: getImageUrl('sonoradesertday.jpg'),
    tags: ['desert', 'Sonora', 'daytime', 'harsh sun', 'cacti', 'exploration', 'dry', 'prickly pear', 'agave']
  },

  cobblestonesinrain: {
    src: getImageUrl('cobblestonesinrain.jpg'),
    tags: ['cobblestones', 'rain', 'wet street', 'urban', 'colonial', 'quiet', 'melancholy']
  },

  sinisteralleywaynight: {
    src: getImageUrl('sinisteralleywaynight.jpg'),
    tags: ['alleyway', 'night', 'dark', 'sinister', 'urban', 'mystery', 'danger']
  },

  stablenight: {
    src: getImageUrl('stablenight.jpg'),
    tags: ['stable', 'night', 'horses', 'colonial', 'quiet', 'working animals', 'rest']
  },

  brickpaving: {
    src: getImageUrl('brickpaving.jpg'),
    tags: ['brick', 'paving', 'road', 'urban', 'colonial', 'building materials', 'infrastructure']
  },

  twilightorsunriseovervalley: {
    src: getImageUrl('twilightorsunriseovervalley.jpg'),
    tags: ['valley', 'twilight', 'sunrise', 'nature', 'landscape', 'peaceful', 'countryside']
  },

  crackeddryearth: {
    src: getImageUrl('crackeddryearth.jpg'),
    tags: ['earth', 'cracked', 'dry', 'desert', 'nature', 'drought', 'harsh conditions']
  },

  seedlingsgrowingsoilcloseup: {
    src: getImageUrl('seedlingsgrowingsoilcloseup.jpg'),
    tags: ['seedlings', 'growing', 'soil', 'closeup', 'nature', 'life', 'growth']
  },

  sunsetcountryside: {
    src: getImageUrl('sunsetcountryside.jpg'),
    tags: ['sunset', 'countryside', 'nature', 'colonial', 'peaceful', 'farm life', 'evening']
  },

  beautifulmeadowtwilight: {
    src: getImageUrl('beautifulmeadowtwilight.jpg'),
    tags: ['meadow', 'twilight', 'nature', 'flowers', 'peaceful', 'quiet', 'countryside']
  },

  honeybeeinmeadow: {
    src: getImageUrl('honeybeeinmeadow.jpg'),
    tags: ['honeybee', 'meadow', 'flowers', 'nature', 'pollination', 'quiet', 'wildlife']
  },

  foraginglavenderorherbs: {
    src: getImageUrl('foraginglavenderorherbs.jpg'),
    tags: ['foraging', 'herbs', 'lavender', 'wildcrafting', 'nature', 'colonial', 'botany']
  },

  insectsforesttwilight: {
    src: getImageUrl('insectsforesttwilight.jpg'),
    tags: ['insects', 'forest', 'twilight', 'nature', 'wildlife', 'peaceful', 'evening']
  },

  chamomileforaging: {
    src: getImageUrl('chamomileforaging.jpg'),
    tags: ['chamomile', 'foraging', 'wildcrafting', 'herbs', 'nature', 'colonial', 'botany']
  },

  owl: {
    src: getImageUrl('owl.jpg'),
    tags: ['owl', 'wildlife', 'bird', 'nature', 'forest', 'quiet', 'night']
  },

  beautifulstreamday: {
    src: getImageUrl('beautifulstreamday.jpg'),
    tags: ['stream', 'daytime', 'water', 'nature', 'colonial', 'peaceful', 'countryside']
  },

  artist: {
    src: getImageUrl('artist.jpg'),
    tags: ['artist', 'painting', 'creativity', 'colonial', 'studio', 'intellectual', 'culture']
  },

  debateinteriornight: {
    src: getImageUrl('debateinteriornight.jpg'),
    tags: ['debate', 'interior', 'night', 'intellectual', 'discussion', 'colonial', 'scholars']
  },

  italycity: {
    src: getImageUrl('italycity.jpg'),
    tags: ['Italy', 'city', 'urban', 'colonial', 'architecture', 'culture', 'historical']
  },

  musicians: {
    src: getImageUrl('musicians.jpg'),
    tags: ['musicians', 'performance', 'colonial', 'culture', 'entertainment', 'gathering', 'music']
  },

  tabletwoemptychairscandle: {
    src: getImageUrl('tabletwoemptychairscandle.jpg'),
    tags: ['table', 'candle', 'empty chairs', 'colonial', 'quiet', 'introspection', 'evening']
  },

  snowystreet: {
    src: getImageUrl('snowystreet.jpg'),
    tags: ['street', 'snow', 'colonial', 'winter', 'quiet', 'urban life', 'evening']
  },

  painting: {
    src: getImageUrl('dutchpainting.jpg'),
    tags: ['Dutch', 'painting', 'colonial', 'art', 'culture', 'intellectual', 'studio']
  },

  tapestry: {
    src: getImageUrl('tapestry.jpg'),
    tags: ['tapestry', 'painting', 'weaving', 'art', 'culture', 'intellectual', 'beautiful artwork']
  },

  dutchinterior: {
    src: getImageUrl('dutchinterior.jpg'),
    tags: ['Dutch', 'interior', 'colonial', 'residential', 'architecture', 'home', 'historical']
  },

  gentlemanstandingindoorwaysilhouette: {
    src: getImageUrl('gentlemanstandingindoorwaysilhouette.jpg'),
    tags: ['gentleman', 'silhouette', 'doorway', 'colonial', 'introspection', 'evening', 'mystery']
  },

  floorboards: {
    src: getImageUrl('floorboards.jpg'),
    tags: ['floorboards', 'wood', 'colonial', 'interior', 'architecture', 'home', 'rustic']
  },

  inncourtyardday: {
    src: getImageUrl('inncourtyardday.jpg'),
    tags: ['inn', 'courtyard', 'daytime', 'colonial', 'social gathering', 'rest', 'exploration']
  },

  northerneuropeancitystreetnightamsterdam: {
    src: getImageUrl('northerneuropeancitystreetnightamsterdam.jpg'),
    tags: ['Northern European city', 'street', 'Amsterdam', 'night', 'colonial', 'urban', 'lanterns']
  },

  glowingdoorwaysurreal: {
    src: getImageUrl('glowingdoorwaysurreal.jpg'),
    tags: ['glowing doorway', 'surreal', 'fantasy', 'colonial', 'mystery', 'evening', 'dreamlike']
  },

  royalsocietyoflondon: {
    src: getImageUrl('royalsocietyoflondon.jpg'),
    tags: ['Royal Society of London', 'colonial', 'intellectual', 'scientific', 'society', 'gathering', 'culture']
  },

  manwearingglassesstudious1680s: {
    src: getImageUrl('1680smanwearingglassesstudious.jpg'),
    tags: ['man', 'glasses', 'studious', '1680s', 'colonial scholar', 'intellectual', 'quiet study']
  },

  scholarold1680s: {
    src: getImageUrl('1680sscholarold.jpg'),
    tags: ['scholar', 'elderly', '1680s', 'colonial', 'intellectual', 'wise', 'study']
  },

  theologianorscholar1680s: {
    src: getImageUrl('1680stheologianorscholar.jpg'),
    tags: ['theologian', 'scholar', '1680s', 'religion', 'colonial', 'study', 'intellectual']
  },

  philosopher1680s: {
    src: getImageUrl('1680sphilosopher.jpg'),
    tags: ['philosopher', '1680s', 'colonial', 'intellectual', 'study', 'wisdom', 'contemplation']
  },

  poorfamily: {
    src: getImageUrl('poorfamily.jpg'),
    tags: ['family', 'poor', 'colonial', 'struggling', '1680s', 'hardship', 'survival']
  },

  worriedfather: {
    src: getImageUrl('worriedfather.jpg'),
    tags: ['father', 'worried', 'family', 'struggling', '1680s', 'colonial', 'hardship']
  },

  oldsailornight: {
    src: getImageUrl('oldsailornight.jpg'),
    tags: ['sailor', 'night', 'colonial', 'sea', 'adventure', 'weathered', 'reflection']
  },

  oldmanholdingcandlenight: {
    src: getImageUrl('oldmanholdingcandlenight.jpg'),
    tags: ['old man', 'candlelight', 'night', 'colonial', 'quiet', 'reflection', 'elderly']
  },

  youngwomanholdinglanternnight: {
    src: getImageUrl('youngwomanholdinglanternnight.jpg'),
    tags: ['woman', 'lantern', 'night', 'quiet', 'colonial', 'mystery', 'exploration']
  },

  cityatnightstreetscene: {
    src: getImageUrl('europeancityatnightstreetscene.jpg'),
    tags: ['European city', 'night', 'street', 'lanterns', 'urban life', 'colonial', 'quiet']
  },

  pausingattheshopwindownight: {
    src: getImageUrl('pausingattheshopwindownight.jpg'),
    tags: ['shop', 'window', 'night', 'lantern', 'curiosity', 'colonial street', 'urban life']
  },

  seamstressdraperortextilemerchant: {
    src: getImageUrl('seamstressdraperortextilemerchant.jpg'),
    tags: ['seamstress', 'draper', 'textiles', 'merchant', 'colonial shop', 'market', 'commerce']
  },

  materiamedicashop: {
    src: getImageUrl('materiamedicashop.jpg'),
    tags: ['apothecary', 'materia medica', 'shop', 'herbs', 'remedies', 'colonial medicine', 'commerce']
  },

  amsterdamordutchempireday: {
    src: getImageUrl('amsterdamordutchempireday.jpg'),
    tags: ['Amsterdam', 'Dutch Empire', 'daytime', 'colonial trade', 'city street', 'urban', 'historical']
  },

  shopkeeperatwindowdusk: {
    src: getImageUrl('shopkeeperatwindowdusk.jpg'),
    tags: ['shopkeeper', 'window', 'dusk', 'commerce', 'colonial', 'quiet moment', 'evening market']
  },

  europeancityatnightstreetscene: {
    src: getImageUrl('europeancityatnightstreetscene.jpg'),
    tags: ['European city', 'night', 'street', 'lanterns', 'urban life', 'quiet', 'colonial Europe']
  },

  lisbonportugal: {
    src: getImageUrl('lisbonportugal.jpg'),
    tags: ['Lisbon', 'Portugal', 'city', 'colonial empire', 'port', 'urban life', 'historical']
  },

  wineshop: {
    src: getImageUrl('wineshop.jpg'),
    tags: ['wine', 'shop', 'commerce', 'tavern', 'drinks', 'colonial trade', 'marketplace']
  },

  nightcitystreet: {
    src: getImageUrl('nightcitystreet.jpg'),
    tags: ['city street', 'night', 'lanterns', 'quiet', 'urban life', 'colonial', 'evening walk']
  },

  sunsetcitystreet: {
    src: getImageUrl('sunsetcitystreet.jpg'),
    tags: ['city street', 'sunset', 'colonial', 'commerce', 'urban', 'end of day', 'evening shadows']
  },

  caribbeanday: {
    src: getImageUrl('caribbeanday.jpg'),
    tags: ['Caribbean', 'daytime', 'sunlight', 'tropical', 'colonial exploration', 'beach', 'trade route']
  },

  caribbeannight: {
    src: getImageUrl('caribbeannight.jpg'),
    tags: ['Caribbean', 'night', 'moonlight', 'tropical', 'colonial trade', 'beach', 'quiet']
  },

  campfireinvillagenight: {
    src: getImageUrl('campfireinvillagenight.jpg'),
    tags: ['campfire', 'village', 'night', 'community', 'colonial', 'warmth', 'gathering']
  },

  silhouetteofmanwearinghat: {
    src: getImageUrl('silhouetteofmanwearinghat.jpg'),
    tags: ['man', 'hat', 'silhouette', 'colonial', 'quiet moment', 'shadow', 'introspection']
  },

  twomendrinkingtogether: {
    src: getImageUrl('twomendrinkingtogether.jpg'),
    tags: ['men', 'drinking', 'tavern', 'conversation', 'colonial life', 'leisure', 'social']
  },

  southamericantownday: {
    src: getImageUrl('southamericantownday.jpg'),
    tags: ['South American town', 'daytime', 'colonial', 'marketplace', 'urban life', 'historical']
  },

  southamericantownnight: {
    src: getImageUrl('southamericantownnight.jpg'),
    tags: ['South American town', 'night', 'colonial', 'lanterns', 'quiet', 'urban', 'historical']
  },

  africanorindianoceanreligiousritualnight: {
    src: getImageUrl('africanorindianoceanreligiousritualnight.jpg'),
    tags: ['ritual', 'night', 'African', 'Indian Ocean', 'religious', 'ceremony', 'firelight']
  },

  divinationritual: {
    src: getImageUrl('divinationritual.jpg'),
    tags: ['divination', 'ritual', 'ceremony', 'spiritual', 'colonial', 'African', 'mysticism']
  },

  sittingbythecampfire: {
    src: getImageUrl('sittingbythecampfire.jpg'),
    tags: ['campfire', 'sitting', 'night', 'reflection', 'colonial', 'gathering', 'wilderness']
  },

  frontiervillagenight: {
    src: getImageUrl('frontiervillagenight.jpg'),
    tags: ['frontier', 'village', 'night', 'lanterns', 'quiet', 'colonial', 'community gathering']
  },

  africavillageday: {
    src: getImageUrl('africavillageday.jpg'),
    tags: ['African village', 'daytime', 'community', 'colonial', 'culture', 'village life', 'sunlight']
  },

  africavillagenight: {
    src: getImageUrl('africavillagenight.jpg'),
    tags: ['African village', 'night', 'lanterns', 'colonial', 'community', 'culture', 'quiet']
  },

  indianmerchants: {
    src: getImageUrl('indianmerchants.jpg'),
    tags: ['Indian merchants', 'market', 'commerce', 'trade', 'colonial', 'goods', 'busy marketplace']
  },

  indianoceantradingpostday: {
    src: getImageUrl('indianoceantradingpostday.jpg'),
    tags: ['Indian Ocean', 'trading post', 'daytime', 'colonial trade', 'commerce', 'market', 'port']
  },

  indianoceantradingpostnight: {
    src: getImageUrl('indianoceantradingpostnight.jpg'),
    tags: ['Indian Ocean', 'trading post', 'night', 'colonial', 'lanterns', 'commerce', 'port']
  },

  houseofthevillagechief: {
    src: getImageUrl('houseofthevillagechief.jpg'),
    tags: ['house', 'village chief', 'colonial', 'leadership', 'community', 'village life', 'residence']
  },

  onthebeachday: {
    src: getImageUrl('onthebeachday.jpg'),
    tags: ['beach', 'daytime', 'tropical', 'colonial', 'exploration', 'sunlight', 'shoreline']
  },

  onthebeachnight: {
    src: getImageUrl('onthebeachnight.jpg'),
    tags: ['beach', 'night', 'tropical', 'colonial', 'moonlight', 'quiet', 'shoreline']
  },

  junkchineseship: {
    src: getImageUrl('junkchineseship.jpg'),
    tags: ['junk', 'Chinese ship', 'colonial trade', 'maritime', 'vessel', 'ocean travel', 'historical']
  },

  southeastasiaday: {
    src: getImageUrl('southeastasiaday.jpg'),
    tags: ['Southeast Asia', 'daytime', 'colonial trade', 'tropical', 'marketplace', 'urban', 'sunlight']
  },

  southeastasianight: {
    src: getImageUrl('southeastasianight.jpg'),
    tags: ['Southeast Asia', 'night', 'colonial trade', 'lanterns', 'urban', 'quiet', 'marketplace']
  },

  frontierinn: {
    src: getImageUrl('frontierinn.jpg'),
    tags: ['frontier', 'inn', 'tavern', 'colonial', 'wild west', 'meeting place', 'gathering']
  },

  balconiesday: {
    src: getImageUrl('balconiesday.jpg'),
    tags: ['balconies', 'daytime', 'urban', 'colonial architecture', 'residential', 'sunlight', 'quiet street']
  },

  lanternnight: {
    src: getImageUrl('lanternnight.jpg'),
    tags: ['lantern', 'night', 'colonial', 'street', 'urban life', 'quiet', 'exploration']
  },

  manonhorsebacknight: {
    src: getImageUrl('manonhorsebacknight.jpg'),
    tags: ['man', 'horseback', 'night', 'colonial', 'exploration', 'quiet', 'journey']
  },

  mosque: {
    src: getImageUrl('mosque.jpg'),
    tags: ['mosque', 'colonial', 'architecture', 'religious', 'community', 'Islam', 'historical']
  },

  provincialtownnewspainday: {
    src: getImageUrl('provincialtownnewspainday.jpg'),
    tags: ['town', 'Spain', 'daytime', 'people', 'marketplace', 'street', 'colonial life']
  },

  cardplayers: {
    src: getImageUrl('cardplayers.jpg'),
    tags: ['game', 'men', 'cards', 'tavern', 'leisure', 'gambling', 'social gathering']
  },

  manandwomandinnercandlelight: {
    src: getImageUrl('manandwomandinnercandlelight.jpg'),
    tags: ['couple', 'candlelight', 'dinner', 'romantic', 'intimate', 'evening', 'colonial setting', 'flame']
  },

  tavernatsunsetbywindow: {
    src: getImageUrl('tavernatsunsetbywindow.jpg'),
    tags: ['tavern', 'sunset', 'window', 'evening', 'interior', 'colonial life', 'peaceful']
  },

  mediterraneaneuropestreetnight: {
    src: getImageUrl('mediterraneaneuropestreetnight.jpg'),
    tags: ['street', 'Mediterranean', 'Europe', 'night', 'cobblestone', 'lanterns', 'quiet town']
  },

  festivalnightmexico: {
    src: getImageUrl('festivalnightmexico.jpg'),
    tags: ['festival', 'Mexico', 'night', 'celebration', 'music', 'dancing', 'cultural event']
  },

  adobeceiling: {
    src: getImageUrl('adobeceiling.jpg'),
    tags: ['ceiling', 'adobe', 'architecture', 'interior', 'rustic', 'Mexican', 'colonial structure']
  },

  surrealdreamofhorses: {
    src: getImageUrl('surrealdreamofhorses.jpg'),
    tags: ['dream', 'horses', 'surreal', 'fantasy', 'imaginative', 'ethereal', 'nightmare']
  },

  cowboyonhorse: {
    src: getImageUrl('cowboyonhorse.jpg'),
    tags: ['cowboy', 'horse', 'wild west', 'outdoor', 'frontier', 'adventure', 'riding']
  },

  frontieroutpostday: {
    src: getImageUrl('frontieroutpostday.jpg'),
    tags: ['frontier', 'outpost', 'daytime', 'fort', 'wild west', 'remote', 'exploration']
  },

  frontiertradingpostpueblobday: {
    src: getImageUrl('frontiertradingpostpuebloday.jpg'),
    tags: ['trading post', 'pueblo', 'daytime', 'commerce', 'colonial trade', 'indigenous', 'market']
  },

  frontiertavernadobeday: {
    src: getImageUrl('frontiertavernadobeday.jpg'),
    tags: ['tavern', 'adobe', 'daytime', 'colonial', 'wild west', 'meeting place', 'drinking']
  },

  frontiertavernadobenight: {
    src: getImageUrl('frontiertavernadobenight.jpg'),
    tags: ['tavern', 'adobe', 'night', 'lanterns', 'gathering', 'colonial life', 'evening social']
  },

  mendrinkingday: {
    src: getImageUrl('mendrinkingday.jpg'),
    tags: ['men', 'drinking', 'daytime', 'tavern', 'colonial', 'leisure', 'social']
  },

  mendrinkingnight: {
    src: getImageUrl('mendrinkingnight.jpg'),
    tags: ['men', 'drinking', 'night', 'tavern', 'lantern', 'social', 'conversation']
  },

  chandeliers: {
    src: getImageUrl('chandeliers.jpg'),
    tags: ['chandelier', 'lighting', 'interior', 'luxury', 'colonial', 'high-class', 'elegance']
  },

  lookinginshopwindowday: {
    src: getImageUrl('lookinginshopwindowday.jpg'),
    tags: ['shop', 'window', 'daytime', 'market', 'consumer', 'urban', 'commerce']
  },

  lookinginshopwindownight: {
    src: getImageUrl('lookinginshopwindownight.jpg'),
    tags: ['shop', 'window', 'night', 'lantern', 'urban life', 'commerce', 'curiosity']
  },

  manonhorse: {
    src: getImageUrl('manonhorse.jpg'),
    tags: ['man', 'horse', 'rider', 'outdoor', 'travel', 'wild west', 'colonial journey']
  },

  londonevening: {
    src: getImageUrl('londonevening.jpg'),
    tags: ['London', 'evening', 'city', 'lights', 'fog', 'historical', 'urban life']
  },

  londayday: {
    src: getImageUrl('londonday.jpg'),
    tags: ['London', 'daytime', 'city', 'historical', 'busy', 'urban', 'colonial']
  },

  coffeehouseevening: {
    src: getImageUrl('coffeehouseevening.jpg'),
    tags: ['coffeehouse', 'evening', 'conversation', 'intellectual', 'colonial', 'social hub', 'discussion']
  },

  coffeehouseday: {
    src: getImageUrl('coffeehouseday.jpg'),
    tags: ['coffeehouse', 'daytime', 'leisure', 'social', 'colonial', 'meeting place', 'discussion']
  },

  swampedgeofwater: {
    src: getImageUrl('swampedgeofwater.jpg'),
    tags: ['swamp', 'water', 'edge', 'wildlife', 'nature', 'stillness', 'exploration']
  },

  fishermanonriver: {
    src: getImageUrl('fishermanonriver.jpg'),
    tags: ['fisherman', 'river', 'boat', 'outdoor', 'nature', 'fishing', 'colonial subsistence']
  },

  waterbugladybug: {
    src: getImageUrl('waterbugladybug.jpg'),
    tags: ['insects', 'water', 'bug', 'ladybug', 'nature', 'wildlife', 'creek']
  },

  beeflyingoverwater: {
    src: getImageUrl('beeflyingoverwater.jpg'),
    tags: ['bee', 'water', 'flying', 'nature', 'pollination', 'wildlife', 'stillness']
  },

  frogonlake: {
    src: getImageUrl('frogonlake.jpg'),
    tags: ['frog', 'lake', 'nature', 'wildlife', 'amphibian', 'calm water', 'pond']
  },

  sublimateactive: {
    src: getImageUrl('sublimate-active.jpg'),
    tags: ['sublimation', 'alchemy', 'alchemical practice', 'magic', 'potions', 'apothecary methods life', 'magical']
  },

  churchnight: {
    src: getImageUrl('churchnight.jpg'),
    tags: ['church', 'night', 'lantern', 'colonial', 'gathering', 'religious life', 'quiet']
  },

  rivervalleynight: {
    src: getImageUrl('rivervalleynight.jpg'),
    tags: ['river', 'valley', 'night', 'quiet', 'colonial', 'nature', 'moonlit landscape']
  },

  rivervalleyday: {
    src: getImageUrl('rivervalleyday.jpg'),
    tags: ['river', 'valley', 'daytime', 'lush', 'landscape', 'nature', 'colonial exploration']
  },

  dayrivervoyage: {
    src: getImageUrl('dayrivervoyage.jpg'),
    tags: ['river', 'voyage', 'daytime', 'boat', 'exploration', 'colonial journey', 'water travel']
  },

  nightrivervoyage: {
    src: getImageUrl('nightrivervoyage.jpg'),
    tags: ['river', 'voyage', 'night', 'boat', 'lantern', 'colonial', 'quiet journey']
  },

  voyageurs: {
    src: getImageUrl('voyageurs.jpg'),
    tags: ['voyageurs', 'boat', 'river', 'exploration', 'fur trade', 'colonial', 'canoe']
  },

  starrynightsky: {
    src: getImageUrl('starrynightsky.jpg'),
    tags: ['starry sky', 'night', 'nature', 'cosmos', 'astronomy', 'exploration', 'quiet']
  },

  nightfiredisaster: {
    src: getImageUrl('nightfiredisaster.jpg'),
    tags: ['fire', 'disaster', 'night', 'chaos', 'colonial', 'tragedy', 'destruction']
  },

  anadesoto: {
    src: getImageUrl('anadesoto.jpg'),
    tags: ['specific patient', 'Ana de Soto', 'woman', 'young', 'weaver']
  },

  apothecary: {
    src: getImageUrl('apothecary.jpeg'),
    tags: ['do not use this image']
  },

  sirrobertsouthwell: {
    src: getImageUrl('sirrobertsouthwell.jpg'),
    tags: ['specific patient', 'Sir Robert Southwell', 'man', 'English', 'foreign', 'diplomat']
  },

  sorjuanainesdelacruz: {
    src: getImageUrl('sorjuanainesdelacruz.jpg'),
    tags: ['specific patient', 'nun', 'woman', 'scholar', 'genius', 'writer', 'Sor Juana Ines de la Cruz']
  },

  franciscodiasdearaujo: {
    src: getImageUrl('franciscodiasdearaujo.jpg'),
    tags: ['specific patient', 'Francisco Dias de Araujo', 'man', 'merchant', 'well-dressed', 'handsome']
  },

  carlosenriquez: {
    src: getImageUrl('carlosenriquez.jpg'),
    tags: ['specific patient', 'Carlos Enriquez', 'man', 'attorney']
  },

  countryside: {
    src: getImageUrl('countryside.jpeg'),
    tags: ['outdoor', 'countryside', 'nature']
  },

  default: {
    src: getImageUrl('default.jpeg'),
    tags: ['never use this image, pick a different one']
  },

  donalejandrocortez: {
    src: getImageUrl('donalejandrocortez.jpg'),
    tags: ['specific patient', 'Don Alejandro Cortez', 'noble', 'judge', 'old']
  },

  donluis: {
    src: getImageUrl('donluis.jpeg'),
    tags: ['Don Luis', 'moneyleder', 'man', 'antagonist', 'aggressive']
  },

  fraypatricio: {
    src: getImageUrl('fraypatricio.jpg'),
    tags: ['Fray Patricio', 'friar', 'religious', 'patient']
  },

  nun: {
    src: getImageUrl('nun.jpg'),
    tags: ['generic nun', 'nun', 'abbess', 'religious', 'patient', 'nunnery', 'convent']
  },

  generichome: {
    src: getImageUrl('generichome.jpeg'),
    tags: ['interior', 'home', 'generic']
  },

  inquisitorfernando: {
    src: getImageUrl('inquisitorfernando.jpg'),
    tags: ['Inquisitor Fernando de Toledo', 'religious', 'man', 'antagonist']
  },

  isabeldelacruz: {
    src: getImageUrl('isabeldelacruz.jpg'),
    tags: ['patient', 'Isabel de la Cruz', 'woman']
  },

  joao: {
    src: getImageUrl('joao.jpeg'),
    tags: ['Joao', 'pet', 'cat']
  },

  juanbraga: {
    src: getImageUrl('juanbraga.jpg'),
    tags: ['patient', 'Juan Braga', 'man', 'rival', 'apothecary', 'braggart', 'antagonist']
  },

  mariacoelho: {
    src: getImageUrl('mariacoelho.jpeg'),
    tags: ['do not ever select this image']
  },

  market: {
    src: getImageUrl('market.jpeg'),
    tags: ['outdoor', 'market', 'busy']
  },

  marta: {
    src: getImageUrl('marta.jpeg'),
    tags: ['Marta', 'herbalist', 'woman', 'elderly']
  },

  outsideday: {
    src: getImageUrl('outsideday.jpg'),
    tags: ['outdoor', 'day', 'nature']
  },

  outsidenight: {
    src: getImageUrl('outsidenight.jpg'),
    tags: ['outdoor', 'night', 'street']
  },

  rosamariaperez: {
    src: getImageUrl('rosamariaperez.jpg'),
    tags: ['specific patient', 'Rosa Maria Perez', 'woman', 'housewife', 'criolla']
  },

  shopmorning: {
    src: getImageUrl('shopmorning.jpeg'),
    tags: ['shop', 'morning', 'apothecary']
  },

  shopafternoon: {
    src: getImageUrl('shopafternoon.jpeg'),
    tags: ['shop', 'afternoon', 'apothecary']
  },

  shopnight: {
    src: getImageUrl('shopnight.jpeg'),
    tags: ['shop', 'night', 'apothecary']
  },

  tejedora: {
    src: getImageUrl('tejedora.jpeg'),
    tags: ['woman', 'weaver', 'artisan', 'generic female character', 'young woman', 'patient', 'generic']
  },

  paisano: {
    src: getImageUrl('paisano.jpeg'),
    tags: ['peasant', 'worker', 'generic male character', 'patient', 'indigenous', 'make sure to give him a real name']
  },

  dona: {
    src: getImageUrl('dona.jpg'),
    tags: ['patient', 'woman', 'noble', 'dona', 'generic female character', 'generic']
  },

  caballero: {
    src: getImageUrl('caballero.jpg'),
    tags: ['man', 'noble', 'horseman', 'generic', 'patient']
  },

  manual: {
    src: getImageUrl('manual.jpeg'),
    tags: ['document', 'book', 'instruction']
  },

  rodrigoduarte: {
    src: getImageUrl('rodrigoduarte.jpg'),
    tags: ['specific patient', 'Rodrigo Duarte', 'man', 'sea captain', 'Portuguese']
  },

  diegoperez: {
    src: getImageUrl('diegoperez.jpg'),
    tags: ['specific patient', 'Diego Perez', 'man', 'carpenter', 'indigenous']
  },

  mushroom: {
    src: getImageUrl('mushroom.jpeg'),
    tags: ['shaman', 'mushroom', 'curandera']
  },

  study: {
    src: getImageUrl('study.jpeg'),
    tags: ['interior', 'study', 'scholar', 'night']
  },

  farm: {
    src: getImageUrl('farm.jpeg'),
    tags: ['farm', 'outdoor', 'agriculture', 'irrigation', 'canals']
  },

  merchant: {
    src: getImageUrl('merchant.jpeg'),
    tags: ['merchant', 'man', 'market', 'patient', 'generic']
  },

  street: {
    src: getImageUrl('street.jpeg'),
    tags: ['outdoor', 'street', 'market']
  },

  codex: {
    src: getImageUrl('codex.jpg'),
    tags: ['document', 'book', 'codex']
  },

  trippy: {
    src: getImageUrl('trippy.jpeg'),
    tags: ['dream', 'fantasy', 'abstract', 'psychedelic', 'drug experience', 'trippy', 'malos hongos', 'peyote']
  },

  herbs: {
    src: getImageUrl('herbs.jpeg'),
    tags: ['herbs', 'herb stall', 'medicine merchant']
  },

  herbalist: {
    src: getImageUrl('herbalist.jpeg'),
    tags: ['herbalist', 'plants', 'woman', 'patient', 'generic']
  },

  arturohernandez: {
    src: getImageUrl('arturohernandez.jpg'),
    tags: ['patient', 'Arturo Hernandez', 'man', 'merchant', 'suspicious']
  },

  arturoramirez: {
    src: getImageUrl('arturoramirez.jpg'),
    tags: ['antagonist', 'Arturo Ramirez', 'man', 'lawyer']
  },

  cityday: {
    src: getImageUrl('city_day.jpg'),
    tags: ['outdoor', 'city', 'day']
  },

  streetnight: {
    src: getImageUrl('street_night.jpg'),
    tags: ['outdoor', 'street', 'night']
  },

  inquisitorsantiagovaldez: {
    src: getImageUrl('inquisitorsantiagovaldez.jpg'),
    tags: ['antagonist', 'Inquisitor', 'Santiago Valdez', 'man', 'questNPC']
  },

  tlacaelel: {
    src: getImageUrl('tlacaelel.jpg'),
    tags: ['Nahuatl', 'scholar', 'man', 'questNPC']
  },

  outskirts: {
    src: getImageUrl('outskirts.jpg'),
    tags: ['outdoor', 'outskirts', 'village']
  },

  village: {
    src: getImageUrl('village.jpg'),
    tags: ['village', 'rural', 'outdoor']
  },

  dockside: {
    src: getImageUrl('dockside.jpg'),
    tags: ['port', 'outdoor', 'dock']
  },

  port: {
    src: getImageUrl('port.jpg'),
    tags: ['port', 'ocean', 'ship']
  },

  hills: {
    src: getImageUrl('hills.jpg'),
    tags: ['outdoor', 'hills', 'landscape']
  },

  forest: {
    src: getImageUrl('forest.jpg'),
    tags: ['outdoor', 'forest', 'nature']
  },

  frontier: {
    src: getImageUrl('frontier.jpg'),
    tags: ['outdoor', 'frontier', 'village']
  },

  abandonedtemple: {
    src: getImageUrl('abandonedtemple.jpg'),
    tags: ['temple', 'outdoor', 'ruins']
  },

  countrychurch: {
    src: getImageUrl('countrychurch.jpg'),
    tags: ['church', 'rural', 'religion']
  },

  canyon: {
    src: getImageUrl('canyon.jpg'),
    tags: ['outdoor', 'canyon', 'nature']
  },

  square: {
    src: getImageUrl('square.jpg'),
    tags: ['square', 'outdoor', 'city', 'Zocalo']
  },

  herbshop: {
    src: getImageUrl('herbshop.jpg'),
    tags: ['shop', 'herbs', 'interior', 'market stall', 'market']
  },

  citycenter: {
    src: getImageUrl('citycenter.jpg'),
    tags: ['city', 'center', 'busy']
  },

  hacienda: {
    src: getImageUrl('hacienda.jpg'),
    tags: ['hacienda', 'noble', 'interior']
  },

  taverna: {
    src: getImageUrl('taverna.jpg'),
    tags: ['tavern', 'interior', 'night', 'socializing']
  },

  churchcourtyard: {
    src: getImageUrl('churchcourtyard.jpg'),
    tags: ['church', 'courtyard', 'religion', 'monks', 'nuns']
  },

  spanishnoble: {
    src: getImageUrl('spanishnoble.jpg'),
    tags: ['noble', 'man', 'wealthy', 'generic male character', 'aristocrat']
  },

  mestizo: {
    src: getImageUrl('mestizo.jpg'),
    tags: ['mestizo', 'young man', 'worker', 'patient', 'generic']
  },

  friar: {
    src: getImageUrl('friar.jpg'),
    tags: ['friar', 'religious', 'man', 'patient', 'generic']
  },

  merchantman: {
    src: getImageUrl('merchantman.jpg'),
    tags: ['merchant', 'man', 'market', 'generic male character', 'patient', 'generic']
  },

  laborer: {
    src: getImageUrl('laborer.jpg'),
    tags: ['worker', 'laborer', 'young man', 'farmer', 'generic male character', 'patient', 'generic']
  },

  frontiersoldier: {
    src: getImageUrl('frontiersoldier.jpg'),
    tags: ['soldier', 'military', 'man', 'patient', 'generic', 'desert', 'frontier']
  },

  soldier: {
    src: getImageUrl('frontiersoldier.jpg'),
    tags: ['soldier', 'military', 'man', 'patient', 'generic', 'city', 'armor']
  },

  soldiers: {
    src: getImageUrl('soldiers.jpg'),
    tags: ['soldier', 'military', 'men', 'plural', 'guns']
  },

  ranchero: {
    src: getImageUrl('ranchero.jpg'),
    tags: ['rancher', 'man', 'landowner', 'farmer', 'generic male character', 'patient', 'generic']
  },

  curandera: {
    src: getImageUrl('curandera.jpg'),
    tags: ['curandera', 'healer', 'woman', 'patient', 'generic']
  },

  scholar: {
    src: getImageUrl('scholar.jpg'),
    tags: ['scholar', 'study', 'student', 'man', 'patient', 'generic']
  },

  physician: {
    src: getImageUrl('physician.jpg'),
    tags: ['physician', 'doctor', 'man', 'patient', 'generic']
  },

  shopkeeper: {
    src: getImageUrl('shopkeeper.jpg'),
    tags: ['shopkeeper', 'merchant', 'man', 'patient', 'generic', 'market']
  },

  child: {
    src: getImageUrl('child.jpg'),
    tags: ['child', 'boy', 'girl', 'patient', 'generic']
  },

  priest: {
    src: getImageUrl('priest.jpg'),
    tags: ['priest', 'religion', 'man', 'patient', 'generic']
  },

  enslavedperson: {
    src: getImageUrl('enslavedperson.jpg'),
    tags: ['enslaved', 'laborer', 'person', 'patient', 'generic']
  },

  peasantwoman: {
    src: getImageUrl('peasantwoman.jpg'),
    tags: ['peasant', 'woman', 'worker', 'generic female character', 'patient', 'generic']
  },

  dons: {
    src: getImageUrl('dons.jpg'),
    tags: ['noble', 'group', 'men', 'patient', 'generic', 'don', 'use this for any generic noble character']
  },

  sailor: {
    src: getImageUrl('sailor.jpg'),
    tags: ['sailor', 'ship', 'man', 'patient', 'generic']
  },

  bandito: {
    src: getImageUrl('bandito.jpg'),
    tags: ['bandit', 'outlaw', 'man', 'patient', 'generic']
  },

  frontierdweller: {
    src: getImageUrl('frontierdweller.jpg'),
    tags: ['settler', 'man', 'frontier', 'patient', 'generic']
  },

  townsfolk: {
    src: getImageUrl('townsfolk.jpg'),
    tags: ['townsfolk', 'group', 'people', 'patient', 'generic']
  },

  cobblestones: {
    src: getImageUrl('cobblestones.jpg'),
    tags: ['street', 'cobblestones', 'outdoor']
  },

  rock: {
    src: getImageUrl('rock.jpg'),
    tags: ['rock', 'nature', 'outdoor']
  },

  ocean: {
    src: getImageUrl('ocean.jpg'),
    tags: ['ocean', 'water', 'nature']
  },

  turf: {
    src: getImageUrl('turf.jpg'),
    tags: ['grass', 'nature', 'outdoor']
  },

  shipinterior: {
    src: getImageUrl('shipinterior.jpg'),
    tags: ['ship', 'sea', 'interior', 'caravel', 'ship hold']
  },

  moon: {
    src: getImageUrl('moon.jpg'),
    tags: ['moon', 'night', 'sky']
  },

  fire: {
    src: getImageUrl('fire.jpg'),
    tags: ['fire', 'night', 'light']
  },

  horse: {
    src: getImageUrl('horse.jpg'),
    tags: ['horse', 'animal', 'transport']
  },

  bottles: {
    src: getImageUrl('bottles.jpg'),
    tags: ['bottles', 'medicine', 'container']
  },

  portalmercederes: {
    src: getImageUrl('portalmercederes.jpg'),
    tags: ['market', 'outdoor', 'shop']
  },

  metropolitancathedral: {
    src: getImageUrl('metropolitancathedral.jpg'),
    tags: ['cathedral', 'religious', 'city']
  },

  tenochtitlan: {
    src: getImageUrl('tenochtitlan.jpg'),
    tags: ['Tenochtitlan', 'ruins', 'city']
  },

  lamercedmarket: {
    src: getImageUrl('lamercedmarket.jpg'),
    tags: ['market', 'Zocalo', 'marketplace', 'Mexico City', 'bustling', 'city center']
  },

  genericstreet: {
    src: getImageUrl('street.jpg'),
    tags: ['city street', 'generic city', 'marketplace', 'urban', 'bustling', 'city center']
  },

  townmarket: {
    src: getImageUrl('townmarket.jpg'),
    tags: ['market', 'town', 'marketplace', 'small town', 'indigenous vendors']
  },

  plazamayor: {
    src: getImageUrl('plazamayor.jpg'),
    tags: ['plaza', 'outdoor', 'square']
  },

  alameda: {
    src: getImageUrl('alameda.jpg'),
    tags: ['park', 'outdoor', 'city', 'alameda', 'alameda central']
  },

  sebastianathayde: {
    src: getImageUrl('sebastianathayde.jpg'),
    tags: ['patient', 'Sebastian Athayde', 'man']
  },

  drugs: {
    src: getImageUrl('drugs.jpg'),
    tags: ['medicine', 'drugs', 'apothecary']
  },

  panchorodriguez: {
    src: getImageUrl('panchorodriguez.jpg'),
    tags: ['specific patient', 'Pancho Rodriguez', 'man']
  },

  university: {
    src: getImageUrl('university.jpg'),
    tags: ['university', 'building', 'education']
  },

  library: {
    src: getImageUrl('library.jpg'),
    tags: ['library', 'books', 'study']
  },

  frayjordanes: {
    src: getImageUrl('frayjordanes.jpg'),
    tags: ['Fray Jordanes', 'religious', 'friar', 'specific patient']
  },

  antoniadeochoa: {
    src: getImageUrl('antoniadeochoa.jpg'),
    tags: ['specific patient', 'Antonia de Ochoa', 'woman']
  },

  compounding: {
    src: getImageUrl('compounding.jpg'),
    tags: ['apothecary', 'medicine', 'compounding']
  },

  tincture: {
    src: getImageUrl('tincture.jpg'),
    tags: ['apothecary', 'medicine', 'liquid']
  },

  herbflowers: {
    src: getImageUrl('herbflowers.jpg'),
    tags: ['herbs', 'flowers', 'nature']
  },

  spices: {
    src: getImageUrl('spices.jpg'),
    tags: ['herbs', 'spices', 'medicine', 'materia medica', 'market items']
  },

  rocks: {
    src: getImageUrl('rocks.jpg'),
    tags: ['outdoor', 'rocks', 'nature']
  },

  sand: {
    src: getImageUrl('sand.jpg'),
    tags: ['outdoor', 'sand', 'nature']
  },

  weavecloseup: {
    src: getImageUrl('weavecloseup.jpg'),
    tags: ['fabric', 'texture', 'weaving']
  },

  microscopicview: {
    src: getImageUrl('microscopicview.jpg'),
    tags: ['science', 'microscope', 'closeup', 'natural philosophy', 'royal society of london']
  },

  rubble: {
    src: getImageUrl('rubble.jpg'),
    tags: ['destruction', 'rubble', 'ruins']
  },

  rope: {
    src: getImageUrl('rope.jpg'),
    tags: ['rope', 'tool', 'equipment']
  },

  tropicalrainforest: {
    src: getImageUrl('tropicalrainforest.jpg'),
    tags: ['outdoor', 'rainforest', 'nature']
  },

  forestfloor: {
    src: getImageUrl('forestfloor.jpg'),
    tags: ['outdoor', 'forest', 'nature']
  },

  foraging: {
    src: getImageUrl('foraging.jpg'),
    tags: ['outdoor', 'foraging', 'nature']
  },

  berries: {
    src: getImageUrl('berries.jpg'),
    tags: ['food', 'berries', 'foraging']
  },

  fungi: {
    src: getImageUrl('fungi.jpg'),
    tags: ['nature', 'fungi', 'foraging']
  },

  leaf: {
    src: getImageUrl('leaf.jpg'),
    tags: ['plant', 'nature', 'leaf', 'market items', 'herbs bought']
  },

  villagechurch: {
    src: getImageUrl('villagechurch.jpg'),
    tags: ['church', 'village', 'religion']
  },

  armedsoldiernight: {
    src: getImageUrl('armedsoldiernight.jpg'),
    tags: ['soldier', 'night', 'military']
  },

  adobewindows: {
    src: getImageUrl('adobewindows.jpg'),
    tags: ['architecture', 'adobe', 'windows']
  },

  corn: {
    src: getImageUrl('corn.jpg'),
    tags: ['food', 'corn', 'agriculture']
  },

  cookingpot: {
    src: getImageUrl('cookingpot.jpg'),
    tags: ['kitchen', 'pot', 'cooking']
  },

  well: {
    src: getImageUrl('well.jpg'),
    tags: ['well', 'water', 'village']
  },

  family: {
    src: getImageUrl('family.jpg'),
    tags: ['people', 'family', 'home']
  },

  peddler: {
    src: getImageUrl('peddler.jpg'),
    tags: ['market', 'peddler', 'outdoor']
  },

  mexicotown: {
    src: getImageUrl('mexicotown.jpg'),
    tags: ['town', 'Mexico City', 'architecture']
  },

  book: {
    src: getImageUrl('book.jpg'),
    tags: ['book', 'knowledge', 'study']
  },

  pitcher: {
    src: getImageUrl('pitcher.jpg'),
    tags: ['kitchen', 'vessel', 'water']
  },

  quillink: {
    src: getImageUrl('quillink.jpg'),
    tags: ['writing', 'quill', 'ink']
  },

  manila: {
    src: getImageUrl('manila.jpg'),
    tags: ['city', 'Manila', 'travel', 'Philippines']
  },

  china: {
    src: getImageUrl('china.jpg'),
    tags: ['city', 'China', 'travel']
  },

  europe: {
    src: getImageUrl('europe.jpg'),
    tags: ['city', 'Europe', 'travel', 'london', 'england', 'street scene']
  },

  india: {
    src: getImageUrl('india.jpg'),
    tags: ['city', 'India', 'travel', 'cochin']
  },

  asiancity: {
    src: getImageUrl('asiancity.jpg'),
    tags: ['city', 'Asia', 'China', 'Philippines']
  },

  middleeastcity: {
    src: getImageUrl('middleeastcity.jpg'),
    tags: ['city', 'Middle East', 'Muslim']
  },

  europeancity: {
    src: getImageUrl('europeancity.jpg'),
    tags: ['city', 'Europe', 'London', 'Paris']
  },

  lizard: {
    src: getImageUrl('lizard.jpg'),
    tags: ['animal', 'lizard', 'chameleon']
  },

  windyship: {
    src: getImageUrl('windyship.jpg'),
    tags: ['ship', 'wind', 'sea']
  },

  prophecy: {
    src: getImageUrl('prophecy.jpg'),
    tags: ['prophecy', 'vision', 'supernatural']
  },

  arrivalinnewland: {
    src: getImageUrl('arrivalinnewland.jpg'),
    tags: ['symbolic', 'arrival', 'new land']
  },

  decision: {
    src: getImageUrl('decision.jpg'),
    tags: ['symbolic', 'decision', 'judgement', 'Janus']
  },

  angel: {
    src: getImageUrl('angel.jpg'),
    tags: ['symbolic', 'religion', 'angel', 'supernatural']
  },

  dream: {
    src: getImageUrl('dream.jpg'),
    tags: ['symbolic', 'dream', 'vision', 'supernatural', 'prophecy']
  },

  dragon: {
    src: getImageUrl('dragon.jpg'),
    tags: ['symbolic', 'myth', 'dragon', 'creature']
  },

  mumia: {
    src: getImageUrl('mumia.jpg'),
    tags: ['mummy', 'mumia', 'alchemicalsample', 'chemicalsample']
  },

  governmentbuilding: {
    src: getImageUrl('governmentbuilding.jpg'),
    tags: ['building', 'government', 'authority']
  },

  writer: {
    src: getImageUrl('writer.jpg'),
    tags: ['writer', 'quill', 'author']
  },

  lawyers: {
    src: getImageUrl('lawyers.jpg'),
    tags: ['law', 'court', 'lawyers']
  },

  court: {
    src: getImageUrl('court.jpg'),
    tags: ['court', 'law', 'justice']
  },

  azteccodex: {
    src: getImageUrl('azteccodex.jpg'),
    tags: ['Aztec', 'codex', 'history']
  },

  tropicalmarket: {
    src: getImageUrl('tropicalmarket.jpg'),
    tags: ['market', 'tropical', 'trade']
  },

  candle: {
    src: getImageUrl('candle.jpg'),
    tags: ['candle', 'light', 'interior', 'flame']
  },

  palace: {
    src: getImageUrl('palace.jpg'),
    tags: ['building', 'palace', 'authority']
  },

  shipexterior: {
    src: getImageUrl('shipexterior.jpg'),
    tags: ['ship', 'exterior', 'shipatsea', 'waves']
  },

  traveler: {
    src: getImageUrl('traveler.jpg'),
    tags: ['traveler', 'journey', 'manwearinghat']
  },

  coins: {
    src: getImageUrl('coins.jpg'),
    tags: ['coins', 'money', 'currency', 'reales']
  },

  manhand: {
    src: getImageUrl('manhand.jpg'),
    tags: ['hand', 'man', 'diagnosis']
  },

  womanhand: {
    src: getImageUrl('womanhand.jpg'),
    tags: ['hand', 'woman', 'diagnosis']
  },

  bark: {
    src: getImageUrl('bark.jpg'),
    tags: ['bark', 'cinchona', 'medicinal', 'medicinebark', 'item bought', 'market item']
  },

  nutmeg: {
    src: getImageUrl('nutmeg.jpg'),
    tags: ['spice', 'ingredient', 'nutmeg', 'food item', 'materia medica', 'spice', 'item bought', 'market item']
  },

  unguents: {
    src: getImageUrl('unguents.jpg'),
    tags: ['medicine', 'unguent', 'ointment', 'materia medica']
  },

  southamericacity: {
    src: getImageUrl('newspaincityoutsidemexico.jpg'),
    tags: ['city', 'outdoor', 'urban']
  },

  citybackstreet: {
    src: getImageUrl('citybackstreet.jpg'),
    tags: ['street', 'urban', 'city']
  },

  palacedoor: {
    src: getImageUrl('palacedoor.jpg'),
    tags: ['palace', 'door', 'building']
  },

  abandonedhouseday: {
    src: getImageUrl('abandonedhouseday.jpg'),
    tags: ['house', 'abandoned', 'outdoor']
  },

  villagelaneday: {
    src: getImageUrl('villagelaneday.jpg'),
    tags: ['village', 'lane', 'outdoor']
  },

  textilemaking: {
    src: getImageUrl('textilemaking.jpg'),
    tags: ['craft', 'textile', 'artisan']
  },

  backalleynight: {
    src: getImageUrl('backalleynight.jpg'),
    tags: ['alley', 'night', 'urban']
  },

  backalleyday: {
    src: getImageUrl('backalleyday.jpg'),
    tags: ['alley', 'day', 'urban']
  },

  ruinedpalacenight: {
    src: getImageUrl('ruinedpalacenight.jpg'),
    tags: ['palace', 'ruins', 'night']
  },

  marketstallnight: {
    src: getImageUrl('marketstallnight.jpg'),
    tags: ['market', 'night', 'stall']
  },

  clutteredhouseorshop: {
    src: getImageUrl('clutteredhouseorshop.jpg'),
    tags: ['shop', 'cluttered', 'indoor', 'clutteredhouse', 'hoarder']
  },

  nightwarehouse: {
    src: getImageUrl('nightwarehouse.jpg'),
    tags: ['warehouse', 'night', 'building']
  },

  familydusk: {
    src: getImageUrl('familydusk.jpg'),
    tags: ['family', 'dusk', 'outdoor']
  },

  childevening: {
    src: getImageUrl('childevening.jpg'),
    tags: ['child', 'evening', 'outdoor']
  },

  femalescholar: {
    src: getImageUrl('femalescholar.jpg'),
    tags: ['scholar', 'woman', 'study']
  },

  eyecloseup: {
    src: getImageUrl('eyecloseup.jpg'),
    tags: ['eye', 'closeup', 'person']
  },

  shipdeckdawnorsunset: {
    src: getImageUrl('shipdeckdawnorsunset.jpg'),
    tags: ['ship', 'deck', 'dawn', 'sunset']
  },

  seacaptain: {
    src: getImageUrl('seacaptain.jpg'),
    tags: ['captain', 'sea', 'man']
  },

  shipdawntropics: {
    src: getImageUrl('shipdawntropics.jpg'),
    tags: ['ship', 'dawn', 'tropics']
  },

  palaceentryway: {
    src: getImageUrl('palaceentryway.jpg'),
    tags: ['palace', 'entryway', 'building']
  },

  houseofamadman: {
    src: getImageUrl('houseofamadman.jpg'),
    tags: ['house', 'madman', 'interior']
  },

  indigenoushutinteriorday: {
    src: getImageUrl('indigenoushutinteriorday.jpg'),
    tags: ['hut', 'indigenous', 'interior', 'day']
  },

  shipembarkingoranchoring: {
    src: getImageUrl('shipembarkingoranchoring.jpg'),
    tags: ['ship', 'embark', 'anchor']
  },

  embroidering: {
    src: getImageUrl('embroidering.jpg'),
    tags: ['craft', 'woman', 'embroidering']
  },

  womanswork: {
    src: getImageUrl('womanswork.jpg'),
    tags: ['work', 'woman', 'labor']
  },

  toymaker: {
    src: getImageUrl('toymaker.jpg'),
    tags: ['toymaker', 'craft', 'workshop']
  },

  villacourtyard: {
    src: getImageUrl('villacourtyard.jpg'),
    tags: ['villa', 'courtyard', 'outdoor']
  },

  italy: {
    src: getImageUrl('italy.jpg'),
    tags: ['italy', 'city', 'europe']
  },

  houseinindies: {
    src: getImageUrl('houseinindies.jpg'),
    tags: ['house', 'indies', 'colonial']
  },

  largehouseintown: {
    src: getImageUrl('largehouseintown.jpg'),
    tags: ['house', 'town', 'urban']
  },

  houseintown: {
    src: getImageUrl('houseintown.jpg'),
    tags: ['house', 'urban', 'town']
  },

  naturalphilosopherlaboratory: {
    src: getImageUrl('naturalphilosopherlaboratory.jpg'),
    tags: ['laboratory', 'natural philosopher', 'study', 'royal society of london', 'scientists']
  },

  workshop: {
    src: getImageUrl('workshop.jpg'),
    tags: ['workshop', 'craft', 'tools']
  },

  marketplacedawn: {
    src: getImageUrl('marketplacedawn.jpg'),
    tags: ['market', 'dawn', 'outdoor']
  },

  dutchempire: {
    src: getImageUrl('dutchempire.jpg'),
    tags: ['dutch', 'empire', 'map']
  },

  newspaincityoutsidemexico: {
    src: getImageUrl('newspaincityoutsidemexico.jpg'),
    tags: ['city', 'outdoor', 'new spain']
  },

  motherandchildrentwilight: {
    src: getImageUrl('motherandchildrentwilight.jpg'),
    tags: ['mother', 'children', 'twilight']
  },

  motherandchildrenday: {
    src: getImageUrl('motherandchildrenday.jpg'),
    tags: ['mother', 'children', 'day']
  },

  tropicalplantation: {
    src: getImageUrl('tropicalplantation.jpg'),
    tags: ['plantation', 'tropical', 'outdoor']
  },

  maritimeentrepottropics: {
    src: getImageUrl('maritimeentrepottropics.jpg'),
    tags: ['maritime', 'entrepot', 'tropics', 'port']
  },

  europestreetday: {
    src: getImageUrl('europestreetday.jpg'),
    tags: ['Europe', 'street', 'day', 'outdoor']
  },

  sunsetshopjoao: {
    src: getImageUrl('sunsetshopjoao.jpg'),
    tags: ['shop', 'sunset', 'outdoor', 'Joao']
  },

  dawnshopjoao: {
    src: getImageUrl('dawnshopjoao.jpg'),
    tags: ['shop', 'dawn', 'outdoor', 'Joao']
  },

  bannerimagegame: {
    src: getImageUrl('bannerimagegame.jpg'),
    tags: ['banner', 'game', 'image']
  },

  cubacity: {
    src: getImageUrl('cubacity.jpg'),
    tags: ['Caribbean', 'city', 'outdoor', 'day', 'Cuba', 'Spanish American port']
  },

  shipatdocks: {
    src: getImageUrl('shipatdocks.jpg'),
    tags: ['ship', 'docks', 'port', 'outdoor']
  },

  boston: {
    src: getImageUrl('boston.jpg'),
    tags: ['Boston', 'city', 'outdoor']
  },

  frontierbritishamerica: {
    src: getImageUrl('frontierbritishamerica.jpg'),
    tags: ['frontier', 'British America', 'outdoor']
  },

  rainforestday: {
    src: getImageUrl('rainforestday.jpg'),
    tags: ['rainforest', 'nature', 'day', 'outdoor']
  },

  frontieroutposttexas: {
    src: getImageUrl('frontieroutposttexas.jpg'),
    tags: ['frontier', 'outpost', 'Texas', 'outdoor']
  },

  thievestalkingnight: {
    src: getImageUrl('thievestalkingnight.jpg'),
    tags: ['thieves', 'stalking', 'night', 'outdoor']
  },

  britishamericanight: {
    src: getImageUrl('britishamericanight.jpg'),
    tags: ['British America', 'night', 'outdoor']
  },

  europenight: {
    src: getImageUrl('europenight.jpg'),
    tags: ['Europe', 'night', 'street', 'outdoor']
  },

  // Quest images
  quest0a: getImageUrl('quest0a.jpg'),
  quest0b: getImageUrl('quest0b.jpg'),
  quest0c: getImageUrl('quest0c.jpg'),
  quest0d: getImageUrl('quest0d.jpg'),
  quest0f: getImageUrl('quest0f.jpg'),
  quest1a: getImageUrl('quest1a.jpg'),
  quest1b: getImageUrl('quest1b.jpg'),
  quest1c: getImageUrl('quest1c.jpg'),
  quest1d: getImageUrl('quest1d.jpg'),
  quest2a: getImageUrl('quest2a.jpg'),
  quest2b: getImageUrl('quest2b.jpg'),
  quest2c: getImageUrl('quest2c.jpg'),
  quest2d: getImageUrl('quest2d.jpg'),
  quest3a: getImageUrl('quest3a.jpg'),
  quest3b: getImageUrl('quest3b.jpg'),
  quest3c: getImageUrl('quest3c.jpg'),
  quest3d: getImageUrl('quest3d.jpg'),
  quest4a: getImageUrl('quest4a.jpg'),
  quest4b: getImageUrl('quest4b.jpg'),
  quest4c: getImageUrl('quest4c.jpg'),
  quest4d: getImageUrl('quest4d.jpg'),
  quest5a: getImageUrl('quest5a.jpg'),
  quest5b: getImageUrl('quest5b.jpg'),
  quest5c: getImageUrl('donluis.jpeg'),
  quest5d: getImageUrl('donluis.jpeg'),

  // Dream images
  dream1: getImageUrl('dreams/dream1.jpg'),
  dream4: getImageUrl('dreams/dream4.jpg'),
  dream5: getImageUrl('dreams/dream5.jpg'),
  dream6: getImageUrl('dreams/dream6.jpg'),
  dream8: getImageUrl('dreams/dream8.jpg'),
  dream10: getImageUrl('dreams/dream10.jpg'),
};

export default imageMap;
