import { entityManager } from '../../../core/entities/EntityManager';

/**
 * Interior map: Middling House
 * A modest but respectable 4-room house for a middling-class family
 * Layout: Sala (reception), 2 bedrooms, storage/pantry
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
const middlingHouseInteriorMap = {
  id: 'middling-house-interior',
  type: 'interior',
  name: 'Middling House',
  style: 'colonial-interior',
  bounds: {
    width: 900,
    height: 700
  },
  startPosition: [650, 560], // In sala near entrance

  // 4 rooms arranged in square
  rooms: [
    // Sala - Reception/living area (bottom right)
    {
      id: 'sala',
      name: 'Sala',
      polygon: [
        [450, 350],
        [850, 350],
        [850, 650],
        [450, 650]
      ],
      type: 'reception',
      spawnPoint: { x: 650, y: 560 }
    },

    // Master Bedroom (top right)
    {
      id: 'master-bedroom',
      name: 'Master Bedroom',
      polygon: [
        [450, 50],
        [850, 50],
        [850, 350],
        [450, 350]
      ],
      type: 'bedroom',
      spawnPoint: { x: 650, y: 200 }
    },

    // Second Bedroom (top left)
    {
      id: 'second-bedroom',
      name: 'Second Bedroom',
      polygon: [
        [50, 50],
        [450, 50],
        [450, 350],
        [50, 350]
      ],
      type: 'bedroom',
      spawnPoint: { x: 250, y: 200 }
    },

    // Storage/Pantry (bottom left)
    {
      id: 'storage',
      name: 'Storage',
      polygon: [
        [50, 350],
        [450, 350],
        [450, 650],
        [50, 650]
      ],
      type: 'storage',
      spawnPoint: { x: 250, y: 500 }
    }
  ],

  // Doors connecting rooms
  doors: [
    // Main entrance to sala
    {
      id: 'main-entrance',
      from: 'street',
      to: 'sala',
      position: [650, 650],
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // Sala to master bedroom
    {
      id: 'sala-to-master',
      from: 'sala',
      to: 'master-bedroom',
      position: [650, 350],
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // Sala to storage
    {
      id: 'sala-to-storage',
      from: 'sala',
      to: 'storage',
      position: [450, 500],
      width: 60,
      rotation: 90,
      isLocked: false
    },

    // Storage to second bedroom
    {
      id: 'storage-to-bedroom',
      from: 'storage',
      to: 'second-bedroom',
      position: [250, 350],
      width: 60,
      rotation: 0,
      isLocked: false
    },

    // Second bedroom to master bedroom
    {
      id: 'bedrooms-connect',
      from: 'second-bedroom',
      to: 'master-bedroom',
      position: [450, 200],
      width: 60,
      rotation: 90,
      isLocked: false
    }
  ],

  // Furniture for each room
  furniture: [
    // === SALA - Reception room furniture ===
    {
      id: 'sala-table',
      name: 'Dining Table',
      type: 'table',
      position: [650, 480],
      rotation: 0,
      size: [150, 100]
    },
    {
      id: 'sala-chair-1',
      name: 'Chair',
      type: 'chair',
      position: [560, 450],
      rotation: 0,
      size: [40, 40]
    },
    {
      id: 'sala-chair-2',
      name: 'Chair',
      type: 'chair',
      position: [740, 450],
      rotation: 180,
      size: [40, 40]
    },
    {
      id: 'religious-painting',
      name: 'Religious Painting',
      type: 'decoration',
      position: [490, 380],
      rotation: 0,
      size: [50, 70]
    },

    // === MASTER BEDROOM ===
    {
      id: 'master-bed',
      name: 'Master Bed',
      type: 'bed',
      position: [650, 140],
      rotation: 0,
      size: [140, 180]
    },
    {
      id: 'master-chest',
      name: 'Clothing Chest',
      type: 'chest',
      position: [780, 280],
      rotation: 0,
      size: [70, 60]
    },
    {
      id: 'writing-desk',
      name: 'Writing Desk',
      type: 'table',
      position: [500, 280],
      rotation: 0,
      size: [100, 60]
    },

    // === SECOND BEDROOM ===
    {
      id: 'second-bed',
      name: 'Bed',
      type: 'bed',
      position: [250, 140],
      rotation: 0,
      size: [120, 160]
    },
    {
      id: 'second-chest',
      name: 'Storage Chest',
      type: 'chest',
      position: [380, 270],
      rotation: 0,
      size: [60, 50]
    },
    {
      id: 'small-shelf',
      name: 'Shelf',
      type: 'shelf',
      position: [90, 200],
      rotation: 0,
      size: [60, 120]
    },

    // === STORAGE/PANTRY ===
    {
      id: 'storage-shelf-1',
      name: 'Storage Shelf',
      type: 'shelf',
      position: [100, 420],
      rotation: 0,
      size: [80, 180]
    },
    {
      id: 'storage-shelf-2',
      name: 'Storage Shelf',
      type: 'shelf',
      position: [360, 420],
      rotation: 0,
      size: [80, 180]
    },
    {
      id: 'pantry-chest',
      name: 'Food Chest',
      type: 'chest',
      position: [230, 590],
      rotation: 0,
      size: [80, 60]
    }
  ],

  backgroundColor: '#1a1f2e'
};

/**
 * Register middling house furniture as POI entities for clickable links
 * Called during map initialization
 */
export const registerMiddlingHouseFurniture = () => {
  // === SALA FURNITURE ===

  // Register Dining Table
  entityManager.register({
    name: 'Dining Table',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A solid wooden dining table, its surface polished smooth from daily use and careful maintenance, scarred only by the honorable marks of family meals—not poverty's desperate knife scores, but the gentle wear of respectable living. Clean linens lie folded nearby, ready to transform the table for formal dining when guests visit.`,
    position: [650, 480],
    properties: ['Dining', 'Social', 'Respectability'],
    historicalContext: `For the middling classes of colonial Mexico City, the dining table was the household's social centerpiece. Unlike the poor who ate squatting or standing, middling families dined seated at a proper table with linens and matched dishes—visible markers of social status. The table hosted not just family meals but also business negotiations, social visits, and religious observances. Its quality announced the family's economic position: too fine suggested wasteful spending above one's station, too crude implied failing fortunes. The middling table was calibrated to signal exactly "respectable but not pretentious"—the narrow band between poverty and aristocracy where most urban professionals lived.`
  });

  // Register Chairs (consolidated)
  entityManager.register({
    name: 'Chairs',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `Simple wooden chairs arranged around the dining table, their seats worn smooth by years of family gatherings and formal dinners. The chairs match—not perfectly, but near enough to suggest intentional coordination rather than desperate scavenging. Each represents an investment, a commitment to proper living.`,
    position: [650, 450],
    properties: ['Seating', 'Hospitality', 'Status'],
    historicalContext: `Chairs were class markers in colonial society. The poor sat on the ground or on rough benches; the wealthy lounged on upholstered armchairs with carved backs. The middling classes occupied the space between—simple wooden chairs, matched sets if possible, comfortable enough for dignity but not ostentatious. The number of chairs mattered: enough for family meals, plus a few extra for guests. A household that could seat visitors properly announced its readiness to participate in social life beyond mere survival. Each chair represented economic stability—not wealth to burn, but resources sufficient for hospitality.`
  });

  // Register Religious Painting
  entityManager.register({
    name: 'Religious Painting',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A framed oil painting depicting a biblical scene—perhaps the Holy Family, or a saint's martyrdom—its colors still vibrant, its frame substantial though not gilded. The painting hangs prominently on the sala wall where visitors cannot fail to notice it, announcing the household's piety and cultural refinement simultaneously.`,
    position: [490, 380],
    properties: ['Religious', 'Cultural', 'Display'],
    historicalContext: `Religious art in middling homes served multiple functions. It demonstrated piety in a society where the Inquisition monitored orthodoxy. It displayed cultural sophistication—appreciation for art, ownership of valuables. It impressed visitors with the household's respectability. Unlike the poor whose religious icons were cheaply printed images or crude wooden statues, middling families could afford actual paintings. Unlike the wealthy whose art collections included European masters, middling households owned local work—competent rather than exceptional, devotional rather than artistic. The painting's subject mattered: safe, orthodox themes that couldn't raise questions about the family's religious loyalty.`
  });

  // === MASTER BEDROOM FURNITURE ===

  // Register Master Bed
  entityManager.register({
    name: 'Master Bed',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A proper bed frame supporting a mattress stuffed with wool or cotton—not the finest down, but far superior to straw—covered with clean linens and a woven blanket. The bed dominates the room, its size and construction announcing that the household heads sleep in comfort befitting their station, their rest protected from the ground's cold and damp.`,
    position: [650, 140],
    properties: ['Rest', 'Marriage', 'Status'],
    historicalContext: `The quality of one's bed marked social position with brutal clarity. The poor slept on straw mats on dirt floors. Slaves had hammocks or rough pallets. The wealthy had massive carved beds with down mattresses and silk coverlets. The middling classes had real beds—wooden frames, decent mattresses, clean linens—that provided actual comfort without aristocratic excess. The master bed was often the household's most expensive single piece of furniture, representing years of savings. It signified adult status, marital legitimacy, economic security. The bed's privacy mattered too: a door that closed, a room of one's own. Luxuries the poor could never imagine.`
  });

  // Register Clothing Chest
  entityManager.register({
    name: 'Clothing Chest',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A substantial wooden chest with iron fittings and a working lock, containing the couple's wardrobe—work clothes, church clothes, perhaps a formal outfit for special occasions. The chest's sturdy construction and secure closure protect fabrics from insects, moisture, and unauthorized access. Order maintained even in storage.`,
    position: [780, 280],
    properties: ['Storage', 'Clothing', 'Security'],
    historicalContext: `Clothing represented significant wealth in colonial society, where textiles were expensive and carefully maintained. A middling household's clothing chest might contain: everyday work clothes in durable fabrics, better garments for church and social occasions, perhaps one truly fine outfit for weddings or formal visits. The chest's lock mattered—fabrics valuable enough to steal, privacy worth protecting. Unlike the poor whose spare clothing (if any) hung on wall pegs, middling families stored garments properly, protecting their investment. The chest's contents marked seasons and life stages: summer cottons, winter wools, maternity clothes, mourning blacks. A wardrobe reflecting a full life, not mere survival.`
  });

  // Register Writing Desk
  entityManager.register({
    name: 'Writing Desk',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A modest writing desk positioned to catch good light, its surface holding inkwell, quills, and perhaps a ledger or letters awaiting response. The desk announces literacy, education, participation in the written economy of contracts and correspondence. Not everyone can read and write—this household can.`,
    position: [500, 280],
    properties: ['Literacy', 'Business', 'Education'],
    historicalContext: `Literacy divided colonial society almost as sharply as wealth. The poor were overwhelmingly illiterate; the elite educated at home or abroad. The middling classes fell between—enough education for business and advancement, but not classical learning. A writing desk signified participation in the literate economy: merchants kept ledgers, artisans signed contracts, families wrote letters to relatives in distant provinces. The desk held tools of social mobility—the ability to record, to calculate, to communicate across distance. Children might be taught at this desk, accumulating the education that distinguished middling from poor. The desk was investment in human capital, in the skills that made prosperity possible.`
  });

  // === SECOND BEDROOM FURNITURE ===

  // Register Bed (Second Bedroom)
  entityManager.register({
    name: 'Bed',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A smaller bed than the master bedroom's, but still a proper bed frame and mattress—not luxury, but solid comfort. The bed serves whoever occupies this room: children, visiting relatives, perhaps a trusted servant. Privacy granted even to household dependents, a privilege most colonials never know.`,
    position: [250, 140],
    properties: ['Rest', 'Comfort', 'Secondary'],
    historicalContext: `The second bedroom's existence marked middling status—enough space for separation of generations, enough resources for multiple real beds. In poor households, everyone slept in one room; in wealthy homes, each family member had private quarters. The middling compromise: communal space during the day, but sleeping rooms that separated adults from children, masters from servants. The second bedroom's bed was simpler than the master's but still substantial—wooden frame, adequate mattress, clean linens. Whoever slept here had privacy and comfort far beyond what most colonials experienced. The room's flexibility mattered too: children's room today, guest room tomorrow, servant's quarters next month. Adaptable to the household's changing needs.`
  });

  // Register Storage Chest (Second Bedroom)
  entityManager.register({
    name: 'Storage Chest',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A simple wooden chest for storing belongings—children's clothes perhaps, or a guest's luggage, or a servant's personal items. Less substantial than the master bedroom's locked chest, but still proper furniture, still a designated place for possessions. Order and privacy extended even to dependents.`,
    position: [380, 270],
    properties: ['Storage', 'Personal Items', 'Organization'],
    historicalContext: `Even secondary household members deserved basic storage in a properly-run middling home. This chest reflected the household's organizational values: everything in its place, possessions protected from damage and theft, privacy respected. Children learned storage habits from these chests—how to fold clothes, organize belongings, maintain order. Servants appreciated the dignity of secure storage for their meager possessions. Guests found space for their luggage. The chest's presence announced that this household ran on principles of order and respect, not the chaos of poverty or the rigid hierarchy of aristocratic homes. A small thing, but meaningful.`
  });

  // Register Shelf
  entityManager.register({
    name: 'Shelf',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A wooden shelf mounted on the wall, holding books if the household is literate, or practical items like candles, linens, and small personal treasures. The shelf organizes vertical space, preventing clutter in the modest room. Everything visible, everything accessible, everything in order.`,
    position: [90, 200],
    properties: ['Storage', 'Organization', 'Display'],
    historicalContext: `Wall shelves maximized space in modest homes where every square foot mattered. Unlike wealthy homes with dedicated libraries and storage rooms, middling households condensed multiple functions into each space. The shelf held whatever the room's current occupants needed: children's primers and catechism books, candles and candlesticks, spare linens, perhaps a few treasured objects—a carved wooden box, a ceramic figurine, a prayer book inherited from grandparents. The shelf's contents told the occupants' story, their education and aspirations made visible. Organizational furniture like this separated middling homes from poor dwellings where possessions piled haphazardly in corners, and from wealthy homes where servants maintained separate storage spaces. Here, order was the family's own achievement.`
  });

  // === STORAGE/PANTRY FURNITURE ===

  // Register Storage Shelves (consolidated)
  entityManager.register({
    name: 'Storage Shelf',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `Sturdy wooden shelves lining the storage room's walls, their surfaces holding sacks of corn and beans, jars of preserved foods, folded linens, candles, and the accumulated necessities that buffer the household against want. The shelves are organized, labeled in some cases, maintained with the care that abundance demands.`,
    position: [230, 420],
    properties: ['Storage', 'Provisions', 'Security'],
    historicalContext: `A well-stocked storage room distinguished the middling household from the poor who lived hand-to-mouth. These shelves held months of provisions: sacks of maize bought in bulk when prices dropped, preserved fruits from the market, dried chiles and herbs, honey and oil, candles purchased by the dozen. Organization mattered—knowing what was stored where, rotating stock, preventing spoilage. Unlike poor families who bought daily from necessity, middling households could plan ahead, buying strategically and storing intelligently. The shelves represented economic buffer, protection against price spikes and shortages, the cushion that separated comfort from crisis. A house with full storage shelves had achieved stability, that most precious and fragile of middling-class prizes.`
  });

  // Register Food Chest
  entityManager.register({
    name: 'Food Chest',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A large wooden chest with iron bands and a heavy lid, protecting the household's most valuable food stores from insects, rodents, and moisture. Inside rest cloth sacks of premium goods—refined sugar perhaps, imported spices, special ingredients for feast days. The chest locks, guarding precious commodities.`,
    position: [230, 590],
    properties: ['Food Storage', 'Security', 'Preservation'],
    historicalContext: `The food chest held items too valuable for open shelves: refined sugar imported from Caribbean plantations, pepper and cinnamon from Asian spice trade, chocolate for special occasions, imported olive oil for feast days. These weren't daily staples but luxury foods that marked special occasions—saint's days, weddings, important guests. The chest's lock protected against theft (by servants or visiting poor relations) and against unauthorized consumption (by children tempted by sugar). Its contents measured the household's prosperity: wealthy enough for occasional luxuries, frugal enough to preserve them carefully, sophisticated enough to deploy them strategically for social occasions. The food chest embodied middling-class values: aspiration tempered by caution, prosperity managed carefully, treats earned through discipline.`
  });

  console.log('[MiddlingHouse] Registered 11 furniture POI entities (4 sala + 3 master bedroom + 3 second bedroom + 3 storage)');
};

// Call furniture registration immediately
registerMiddlingHouseFurniture();

export default middlingHouseInteriorMap;
