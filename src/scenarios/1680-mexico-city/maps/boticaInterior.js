import { entityManager } from '../../../core/entities/EntityManager';

/**
 * Interior map: Botica de la Amargura
 * Maria de Lima's apothecary shop
 * Colonial-style layout with shop floor, laboratory, and living quarters
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
const boticaInteriorMap = {
  id: 'botica-interior',
  type: 'interior',
  name: 'Botica de la Amargura',
  style: 'colonial-interior',
  bounds: {
    width: 1000,  // Increased to add margin around house
    height: 800
  },
  startPosition: [510, 480], // Behind counter on shop floor (grid 25, 31)

  // Rooms - Simplified to 3 larger, clearer spaces with margin around house
  rooms: [
    // Main shop floor - where customers enter (LARGER - full bottom half)
    {
      id: 'shop-floor',
      name: 'Shop Floor',
      polygon: [
        [100, 400],   // Added 100px margin on left, moved down
        [900, 400],
        [900, 700],
        [100, 700]
      ],
      type: 'shop-floor',
      spawnPoint: { x: 510, y: 480 } // Behind counter (default start position)
    },

    // Laboratory - where Maria mixes compounds (Top right)
    {
      id: 'laboratory',
      name: 'Laboratory',
      polygon: [
        [500, 100],   // Added margin
        [900, 100],
        [900, 400],
        [500, 400]
      ],
      type: 'laboratory',
      spawnPoint: { x: 700, y: 250 } // Center of room, near workbench
    },

    // Bedroom - Maria's private quarters (Top left)
    {
      id: 'bedroom',
      name: 'Bedroom',
      polygon: [
        [100, 100],   // Added margin
        [500, 100],
        [500, 400],
        [100, 400]
      ],
      type: 'bedroom',
      spawnPoint: { x: 300, y: 250 } // Center of room, near bed
    }
  ],

  // Doors and connections - Wider doors for better visibility
  doors: [
    // Main entrance from street to shop floor
    {
      id: 'main-entrance',
      from: 'street',
      to: 'shop-floor',
      position: [355, 700],  // Adjusted for new coordinates
      width: 90,             // Much wider door
      rotation: 0,
      isLocked: false
    },

    // Shop floor to laboratory (through dividing wall)
    {
      id: 'lab-door',
      from: 'shop-floor',
      to: 'laboratory',
      position: [675, 400],  // Adjusted for new coordinates
      width: 80,
      rotation: 0,
      isLocked: false
    },

    // Shop floor to bedroom (through dividing wall)
    {
      id: 'bedroom-door',
      from: 'shop-floor',
      to: 'bedroom',
      position: [290, 400],  // Adjusted for new coordinates
      width: 80,
      rotation: 0,
      isLocked: false
    },


  ],

  // Furniture - Minimal, high-quality pieces with labels
  furniture: [
    // Shop Floor - Counter, back wall cabinet, corner chair (positioned below label area)
    {
      id: 'shop-counter',
      name: 'Sales Counter',
      type: 'counter',
      position: [455, 550],  // Centered, below label area
      rotation: 0,
      size: [460, 70]  // Wide counter, not too deep
    },
    {
      id: 'drug-cabinet',
      name: 'Drug Cabinet',
      type: 'shelf',
      position: [130, 563],  // Moved down to avoid label overlap
      rotation: 0,
      size: [53, 220]  // Slightly shorter to fit better
    },
    {
      id: 'customer-chair',
      name: 'Waiting Chair',
      type: 'chair',
      position: [830, 630],  // Corner area, more visible
      rotation: 40,
      size: [50, 50]  // Larger for better visibility
    },

    // Laboratory - Workbench and herb shelf (positioned below label area)
    {
      id: 'workbench',
      name: 'Workbench',
      type: 'table',
      position: [620, 210],  // Moved down to avoid label overlap
      rotation: 0,
      size: [200, 80]  // Fits within laboratory boundaries (x: 500-900)
    },
    {
      id: 'herb-shelf',
      name: 'Herb Shelf',
      type: 'shelf',
      position: [830, 240],  // Moved down and adjusted to avoid label overlap
      rotation: 0,
      size: [94, 170]  // Shorter to fit better and avoid top wall
    },

    // Bedroom - Bed, bookshelf, clothing chest (positioned below label area)
    {
      id: 'bed',
      name: 'Bed',
      type: 'bed',
      position: [290, 220],  // Moved down to avoid label overlap
      rotation: 0,
      size: [130, 180]  // More realistic bed proportions
    },
    {
      id: 'bookshelf',
      name: 'Bookshelf',
      type: 'shelf',
      position: [165, 160],  // Moved down to avoid label overlap
      rotation: 0,
      size: [80, 85]  // Slightly shorter to fit better
    },
    {
      id: 'clothing-chest',
      name: 'Clothing Chest',
      type: 'chest',
      position: [413, 351],  // Adjusted for better spacing
      rotation: 0,
      size: [60, 63]
    }
  ],

  backgroundColor: '#1a1f2e'
};

/**
 * Register shop furniture as POI entities for clickable links
 * Called during map initialization
 */
export const registerBoticaFurniture = () => {
  // Register Drug Cabinet
  entityManager.register({
    name: 'Drug Cabinet',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A magnificent wooden cabinet crowned with the gilded label "Medicina Composta," its three shelves displaying rows of hand-painted ceramic jars bearing Latin names—ROSA, CONSOLID, HYSCOP, EL CADE—each jar a small work of art with botanical motifs in cobalt blue. Below the display shelves, three rows of small drawers with brass ring pulls contain powdered simples and compounds, while a bronze mortar and pestle rest on the third shelf alongside neatly folded linen cloths.',
    position: [130, 563],
    properties: ['Storage', 'Display', 'Inventory Management'],
    historicalContext: `Medicine cabinets in 17th-century apothecaries served both practical and symbolic purposes. The prominent display of beautifully decorated ceramic drug jars (albarelli) demonstrated the apothecary's learning and exotic imports, while the many small drawers below stored powdered simples and compounds. The labeled jars followed Renaissance pharmaceutical tradition, advertising the shop's sophistication to literate customers.`
  });

  // Register Sales Counter
  entityManager.register({
    name: 'Sales Counter',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A long wooden counter, its polished surface deeply scarred by decades of daily work—knife scores from cutting roots, burn marks from sealing wax, ink stains from ledger-keeping. Behind it, shelves hold bundles of dried herbs hanging from iron hooks, ceramic jars labeled in Latin script, and small wooden boxes containing exotic spices from the Manila galleons.',
    position: [455, 550],
    properties: ['Commerce', 'Measurement', 'Display'],
    historicalContext: `The counter in a colonial apothecary was the primary point of interaction with customers. Its surface bore the marks of daily work: knife scores from cutting roots, burn marks from sealing wax, and ink stains from maintaining ledgers required by the Protomedicato.`
  });

  // Register Waiting Chair
  entityManager.register({
    name: 'Waiting Chair',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A humble wicker chair woven over a simple wooden frame, its seat cushion worn thin and slightly concave from the weight of countless anxious patients. A small tear mars the wicker weave on the left armrest, and a dark stain—blood or wine, impossible to tell—marks the cushion beside carved initials "M.S. 1673" left by some long-ago visitor.',
    position: [830, 630],
    properties: ['Seating', 'Patient Care', 'Comfort'],
    historicalContext: `Seating for patients in colonial medical practices reflected social hierarchies. This simple wicker chair suggests a practice serving middling and common folk. Elite patients would expect cushioned chairs, while the poor often stood.`
  });

  // LABORATORY FURNITURE

  // Register Workbench
  entityManager.register({
    name: 'Workbench',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A sturdy oak workbench dominates the laboratory, its surface a palimpsest of alchemical labor—burn marks from overturned crucibles, acid stains creating abstract patterns, knife scores from cutting roots and barks. The bench holds the apparatus of transformation: copper alembics and glass retorts, a small athanor for controlled heating, mortars of varying sizes, and a forest of specialized vessels—cucurbits, pelicans—each designed for specific operations.',
    position: [620, 210],
    properties: ['Crafting', 'Alchemy', 'Preparation'],
    historicalContext: `The laboratory workbench was the apothecary's true workspace, where Galenic theory met Paracelsian practice. Its scarred surface bore witness to countless operations: distillations, calcinations, and the preparation of compounds. The bench held specialized equipment—alembics, retorts, mortars—each piece representing significant investment and technical knowledge.`
  });

  // Register Herb Shelf
  entityManager.register({
    name: 'Herb Shelf',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A towering wooden shelf reaches nearly to the ceiling, its dozens of compartments organized by medical property and continental origin—European herbs, Asian spices, American botanicals, each labeled in careful script. Some compartments overflow with bundled dried plants while others stand nearly empty, a reminder of supply chains stretching across oceans and months.',
    position: [830, 240],
    properties: ['Storage', 'Organization', 'Pharmacopeia'],
    historicalContext: `The herb shelf represented the apothecary's accumulated pharmacopeia. In colonial Mexico City, it held a unique synthesis: traditional European medicinals brought across the Atlantic, Asian spices carried on the Manila galleons, and indigenous plants documented by Francisco Hernández. Organization reflected both medical theory (grouping by property) and practical necessity (frequency of use).`
  });

  // BEDROOM FURNITURE

  // Register Bed
  entityManager.register({
    name: 'Bed',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A simple wooden bed frame holds a straw-filled mattress covered by rough wool blankets, the whole showing the wear of daily use and restless sleep. The headboard bears simple geometric carvings—the work of some long-dead carpenter—and the rope supports sag slightly, requiring periodic tightening.',
    position: [290, 220],
    properties: ['Rest', 'Sleep', 'Privacy'],
    historicalContext: `Beds in colonial households varied dramatically by social class. This modest bed—wooden frame, straw mattress, wool blankets—marks its owner as middling rather than elite. The lack of curtains or canopy suggests limited concern for privacy or warmth, though the solid construction indicates resources above the poorest classes who might sleep on mats.`
  });

  // Register Bookshelf
  entityManager.register({
    name: 'Bookshelf',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A modest wooden shelf holds a carefully curated collection of medical texts. Among the professional volumes hide personal treasures: a prayer book for appearances, a volume of poetry, and several notebooks filled with observations in your own hand.',
    position: [165, 160],
    properties: ['Study', 'Knowledge', 'Reference'],
    historicalContext: `Books were precious commodities in New Spain. A personal library, even a small one, marked education and professional status. Medical practitioners required foundational texts—Dioscorides, Galen, Avicenna—as well as newer works describing American materia medica. The presence of books also invited scrutiny; the Inquisition monitored private libraries for prohibited works.`
  });

  // Register Clothing Chest
  entityManager.register({
    name: 'Clothing Chest',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: 'A dark wooden chest reinforced with iron corner brackets and a substantial iron lock, its polished surface bearing the marks of years of handling. The chest contains a modest wardrobe—work dresses in black and brown, a better dress for Mass, spare linens—and beneath a cleverly concealed false bottom, those items too dangerous to display openly.',
    position: [413, 351],
    properties: ['Storage', 'Security', 'Privacy'],
    historicalContext: `The clothing chest served multiple functions in colonial households: storing garments, securing valuables, and concealing sensitive items. Iron fittings and a robust lock protected contents from theft in a city where domestic servants and visitors might access private spaces. For those harboring dangerous secrets—prohibited books, evidence of Jewish practices, seditious correspondence—a false bottom provided additional security.`
  });

  console.log('[BoticaInterior] Registered 9 furniture POI entities (3 shop + 3 lab + 3 bedroom)');
};

// Call furniture registration immediately
registerBoticaFurniture();

export default boticaInteriorMap;
