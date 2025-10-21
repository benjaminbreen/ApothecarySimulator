import { entityManager } from '../../../core/entities/EntityManager';

/**
 * Interior map: Catedral Metropolitana
 * Large cross-shaped cathedral with nave, transepts, sanctuary, and sacristy
 * Grand religious space under construction in 1680
 *
 * @type {import('../../../core/types/map.types').InteriorMapData}
 */
const cathedralInteriorMap = {
  id: 'cathedral-interior',
  type: 'interior',
  name: 'Catedral Metropolitana',
  style: 'colonial-interior',
  bounds: {
    width: 1200,
    height: 1000
  },
  startPosition: [600, 850], // Nave near entrance

  // 5 rooms in cross formation
  rooms: [
    // Nave - Main central hall (large vertical rectangle)
    {
      id: 'nave',
      name: 'Nave',
      polygon: [
        [400, 400],
        [800, 400],
        [800, 950],
        [400, 950]
      ],
      type: 'nave',
      spawnPoint: { x: 600, y: 850 }
    },

    // Transept West - Left arm of cross
    {
      id: 'transept-west',
      name: 'West Transept',
      polygon: [
        [50, 350],
        [400, 350],
        [400, 650],
        [50, 650]
      ],
      type: 'transept',
      spawnPoint: { x: 225, y: 500 }
    },

    // Transept East - Right arm of cross
    {
      id: 'transept-east',
      name: 'East Transept',
      polygon: [
        [800, 350],
        [1150, 350],
        [1150, 650],
        [800, 650]
      ],
      type: 'transept',
      spawnPoint: { x: 975, y: 500 }
    },

    // Sanctuary/Altar - Top of cross (holy of holies)
    {
      id: 'sanctuary',
      name: 'Sanctuary',
      polygon: [
        [400, 50],
        [800, 50],
        [800, 400],
        [400, 400]
      ],
      type: 'sanctuary',
      spawnPoint: { x: 600, y: 250 }
    },

    // Sacristy - Priest preparation room (off to side)
    {
      id: 'sacristy',
      name: 'Sacristy',
      polygon: [
        [800, 50],
        [1100, 50],
        [1100, 300],
        [800, 300]
      ],
      type: 'sacristy',
      spawnPoint: { x: 975, y: 175 }
    }
  ],

  // Doors connecting the cross
  doors: [
    // Main entrance to nave from street
    {
      id: 'main-entrance',
      from: 'street',
      to: 'nave',
      position: [600, 950],
      width: 200,
      rotation: 0,
      isLocked: false
    },

    // Nave to west transept
    {
      id: 'nave-to-west',
      from: 'nave',
      to: 'transept-west',
      position: [400, 500],
      width: 80,
      rotation: 90,
      isLocked: false
    },

    // Nave to east transept
    {
      id: 'nave-to-east',
      from: 'nave',
      to: 'transept-east',
      position: [800, 500],
      width: 80,
      rotation: 90,
      isLocked: false
    },

    // Nave to sanctuary (no physical door, open passage)
    {
      id: 'nave-to-sanctuary',
      from: 'nave',
      to: 'sanctuary',
      position: [600, 400],
      width: 240,
      rotation: 0,
      isLocked: false
    },

    // Sanctuary to sacristy (priests only)
    {
      id: 'sanctuary-to-sacristy',
      from: 'sanctuary',
      to: 'sacristy',
      position: [800, 175],
      width: 60,
      rotation: 90,
      isLocked: false
    }
  ],

  // Religious furniture and fixtures
  furniture: [
    // === NAVE - Pews and central aisle (centered symmetrically around x=600) ===
    {
      id: 'pew-row-1-left',
      name: 'Pew',
      type: 'furniture',
      position: [500, 700],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-1-right',
      name: 'Pew',
      type: 'furniture',
      position: [700, 700],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-2-left',
      name: 'Pew',
      type: 'furniture',
      position: [500, 600],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-2-right',
      name: 'Pew',
      type: 'furniture',
      position: [700, 600],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-3-left',
      name: 'Pew',
      type: 'furniture',
      position: [500, 500],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'pew-row-3-right',
      name: 'Pew',
      type: 'furniture',
      position: [700, 500],
      rotation: 0,
      size: [120, 40]
    },
    {
      id: 'baptismal-font',
      name: 'Baptismal Font',
      type: 'furniture',
      position: [720, 880],
      rotation: 0,
      size: [60, 60]
    },

    // === SANCTUARY - Altar and religious items ===
    {
      id: 'main-altar',
      name: 'Main Altar',
      type: 'table',
      position: [600, 120],
      rotation: 0,
      size: [200, 100]
    },
    {
      id: 'altar-candles-left',
      name: 'Candles',
      type: 'decoration',
      position: [500, 140],
      rotation: 0,
      size: [30, 30]
    },
    {
      id: 'altar-candles-right',
      name: 'Candles',
      type: 'decoration',
      position: [700, 140],
      rotation: 0,
      size: [30, 30]
    },
    {
      id: 'pulpit',
      name: 'Pulpit',
      type: 'furniture',
      position: [720, 320],
      rotation: 0,
      size: [70, 70]
    },

    // === TRANSEPT WEST - Side chapel ===
    {
      id: 'west-side-altar',
      name: 'Side Altar',
      type: 'table',
      position: [100, 400],
      rotation: 0,
      size: [120, 60]
    },
    {
      id: 'west-religious-painting',
      name: 'Religious Painting',
      type: 'decoration',
      position: [80, 500],
      rotation: 0,
      size: [80, 120]
    },

    // === TRANSEPT EAST - Side chapel ===
    {
      id: 'east-side-altar',
      name: 'Side Altar',
      type: 'table',
      position: [980, 400],
      rotation: 0,
      size: [120, 60]
    },
    {
      id: 'confessional-booth',
      name: 'Confessional Booth',
      type: 'furniture',
      position: [1050, 550],
      rotation: 0,
      size: [80, 80]
    },

    // === SACRISTY - Priest preparation room ===
    {
      id: 'vestment-chest',
      name: 'Vestment Chest',
      type: 'chest',
      position: [920, 100],
      rotation: 0,
      size: [100, 70]
    },
    {
      id: 'sacristy-table',
      name: 'Preparation Table',
      type: 'table',
      position: [980, 260],
      rotation: 0,
      size: [120, 60]
    },
    {
      id: 'religious-book-shelf',
      name: 'Book Shelf',
      type: 'shelf',
      position: [1060, 120],
      rotation: 0,
      size: [70, 140]
    }
  ],

  backgroundColor: '#1a1f2e'
};

/**
 * Register cathedral furniture as POI entities for clickable links
 * Called during map initialization
 */
export const registerCathedralFurniture = () => {
  // Register Main Altar
  entityManager.register({
    name: 'Main Altar',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A massive stone altar carved with scenes from Christ's passion, its top surface covered in white linen and supporting a gilded tabernacle housing the Blessed Sacrament. Dozens of candles in brass holders flank the altar on stepped platforms, their combined light creating a blazing focal point visible from the distant entrance.`,
    position: [600, 120],
    properties: ['Sacred', 'Liturgical', 'Consecrated'],
    historicalContext: `The main altar in colonial cathedrals represented the summit of religious architecture and craft. Its stone was consecrated by the bishop and contained relics of martyrs sealed within. The tabernacle held the consecrated hosts—the body of Christ—making the altar the most sacred object in the building. During Mass, this altar became the site of transubstantiation, where bread and wine became flesh and blood.`
  });

  // Register Pulpit
  entityManager.register({
    name: 'Pulpit',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `An octagonal wooden pulpit carved with images of the four evangelists—Matthew with his angel, Mark with his lion, Luke with his ox, John with his eagle—each figure holding their gospel book. A curved wooden stairway ascends to the elevated preaching platform, designed to project the priest's voice across the vast nave.`,
    position: [720, 320],
    properties: ['Preaching', 'Authority', 'Acoustics'],
    historicalContext: `Pulpits in colonial churches were engineering marvels designed for sound projection in an age before amplification. Positioned at the junction of nave and sanctuary, the elevated platform gave preachers both visual prominence and acoustic advantage. The carvings of the evangelists emphasized that sermons drew authority from Scripture. In New Spain, pulpits were battlegrounds for theological and political messaging—where priests denounced heresies, condemned sins, and reinforced colonial hierarchies.`
  });

  // Register Baptismal Font
  entityManager.register({
    name: 'Baptismal Font',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `An octagonal stone baptismal font carved with the symbols of the four evangelists on its sides, its basin deep enough to immerse an infant's head. Water fills the basin—blessed during the Easter Vigil—waiting to wash away original sin and mark the soul as Christian.`,
    position: [720, 880],
    properties: ['Sacramental', 'Initiation', 'Sacred Water'],
    historicalContext: `Baptismal fonts stood near cathedral entrances because baptism marked the soul's entrance into the Church. The octagonal shape symbolized the eighth day—the day of resurrection and new creation. In colonial Mexico City, baptism was both spiritual sacrament and legal record—the baptismal register documented not only the child's Christian name but also their casta classification, legitimacy, and parentage. For conversos, baptismal records were scrutinized by Inquisition officials searching for evidence of Jewish heritage or irregular practices.`
  });

  // Register Confessional Booth
  entityManager.register({
    name: 'Confessional Booth',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A substantial wooden confessional booth with two chambers separated by a screened grille—one for the priest, one for the penitent. The dark wood panels ensure privacy while the screen allows the priest to hear whispered sins without seeing the confessor's face.`,
    position: [1050, 550],
    properties: ['Sacrament', 'Penance', 'Privacy'],
    historicalContext: `Confessional booths emerged from Counter-Reformation concerns about propriety and scandal. The screened partition prevented inappropriate contact while maintaining the seal of confession. In New Spain, confessionals were spaces of both spiritual healing and social control—where priests extracted information about blasphemy, superstition, and heresy. For conversos and crypto-Jews, confession was dangerous: a careless word could trigger Inquisition investigation. The booth's darkness concealed identity but also created vulnerability.`
  });

  // Register Pews (consolidating all 6 into one POI)
  entityManager.register({
    name: 'Pews',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `Rows of oak pews fill the nave, their wooden surfaces worn smooth by generations of worshippers—knife scores, carved initials, dark stains from countless hands and knees. The pews near the sanctuary are more ornate, reserved for elite families; those near the entrance are simple benches for common folk.`,
    position: [600, 600], // Central position representing all pews
    properties: ['Seating', 'Hierarchy', 'Community'],
    historicalContext: `Pew placement in colonial cathedrals reflected strict social hierarchies. Front pews belonged to wealthy Spanish families who paid annual fees for reserved seating. Middle pews accommodated respectable merchants and artisans. Back pews served the poor, indigenous converts, and those of mixed casta. Standing room only awaited slaves and the destitute. During Mass, the cathedral's seating arrangement visually displayed New Spain's racial and economic order—a congregation literally stratified by blood and wealth.`
  });

  // Register West Side Altar
  entityManager.register({
    name: 'West Side Altar',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A smaller altar in the western transept, its carved wooden front depicting scenes of Mary's assumption into heaven. Votive candles flicker before a small statue of the Virgin, their wax pooling on the altar's stone surface.`,
    position: [100, 400],
    properties: ['Devotion', 'Marian', 'Prayer'],
    historicalContext: `Side altars in colonial cathedrals served as focal points for specific devotions. This altar's dedication to the Virgin Mary reflected New Spain's intense Marian piety, which synthesized Spanish Catholicism with indigenous goddess worship. Wealthy families often endowed side altars, ensuring perpetual Masses for their souls. The votive candles represented prayers—each flame a supplication for healing, protection, or intercession. For women especially, Marian altars offered a feminine face of divinity in a patriarchal Church.`
  });

  // Register East Side Altar
  entityManager.register({
    name: 'East Side Altar',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A side altar in the eastern transept dedicated to San José, its carved front showing the saint with the infant Christ. Candles burn before a painted statue of Joseph holding his carpenter's tools and a flowering staff.`,
    position: [980, 400],
    properties: ['Devotion', 'Patron Saint', 'Prayer'],
    historicalContext: `San José—Saint Joseph—was patron of workers, fathers, and the dying. His cult grew during the Counter-Reformation as an exemplar of humble obedience. In colonial Mexico, Joseph represented the ideal head of household: protective, industrious, submissive to divine will. Carpenters, builders, and artisans claimed him as their patron. His flowering staff—a miracle from the apocryphal gospels—symbolized divine favor despite advanced age, offering hope to the old and barren.`
  });

  // Register West Religious Painting
  entityManager.register({
    name: 'West Religious Painting',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A large oil painting depicting the Virgin of Guadalupe as she appeared to Juan Diego—dark-skinned, surrounded by golden rays, standing on a crescent moon held by an angel. Her blue mantle is studded with stars; her red dress flows with celestial wind.`,
    position: [80, 500],
    properties: ['Art', 'Miraculous', 'Indigenous'],
    historicalContext: `The Virgin of Guadalupe's 1531 apparition to an indigenous convert transformed Mexican Catholicism. Her dark skin made her accessible to indigenous and mixed-race populations who saw themselves reflected in her image. The painting's iconography synthesized Christian and Nahuatl symbolism: the crescent moon evoked both Mary and indigenous lunar deities; the golden rays suggested both Christian halos and Aztec sun imagery. By 1680, Guadalupe had become New Spain's most powerful religious image—a symbol of creole identity and indigenous Christianity. Her presence in the cathedral legitimized local devotion while asserting Mexican uniqueness within Spanish Catholicism.`
  });

  // Register Vestment Chest
  entityManager.register({
    name: 'Vestment Chest',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A large wooden chest with iron fittings holds the priest's sacred vestments—layers of silk and brocade in liturgical colors. Green chasubles for Ordinary Time, white for feast days, purple for Lent and Advent, red for Pentecost and martyrs—each vestment embroidered with crosses and sacred monograms.`,
    position: [920, 100],
    properties: ['Liturgical', 'Sacred', 'Storage'],
    historicalContext: `Priestly vestments transformed ordinary men into liturgical actors. Each garment had symbolic meaning: the alb represented baptismal purity, the stole marked priestly authority, the chasuble—the outer robe—signified the yoke of Christ. Colors followed the liturgical calendar, creating visual continuity across the Catholic world. In New Spain, vestments were extraordinarily expensive—imported silk from China via the Manila galleons, gold thread from Spain, local embroidery by indigenous craftswomen. A complete set of vestments could cost more than a year's salary for a common laborer. Their richness demonstrated the Church's wealth and the sacred importance of the Mass.`
  });

  // Register Preparation Table
  entityManager.register({
    name: 'Preparation Table',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A table in the sacristy covered with white linen, holding the sacred vessels for Mass—a silver chalice for the wine, a golden paten for the bread, glass cruets for water and wine, and a covered ciborium for the consecrated hosts. Each vessel gleams from careful polishing.`,
    position: [980, 220],
    properties: ['Liturgical', 'Sacred Vessels', 'Preparation'],
    historicalContext: `The preparation of sacred vessels was governed by strict rubrics. The chalice and paten must be silver or gold, materials worthy of holding Christ's body and blood. The vessels were consecrated by the bishop and could only be touched by ordained hands. Before Mass, the priest prepared these objects in the sacristy—filling the cruets, counting the hosts, ensuring everything was clean and ready. This careful preparation reflected the Catholic understanding of Mass as not mere symbol but actual sacrifice, a re-presentation of Calvary. Any error or irreverence risked sacrilege.`
  });

  // Register Religious Book Shelf
  entityManager.register({
    name: 'Religious Book Shelf',
    entityType: 'item',
    type: 'furniture',
    category: 'Furniture',
    description: `A wooden shelf in the sacristy holds liturgical books—the Roman Missal with its prayers for Mass, breviaries for the Divine Office, a lectionary with Scripture readings, and various manuals for administering sacraments. The books are bound in leather, their pages gilt-edged and marked with ribbon placeholders.`,
    position: [1050, 100],
    properties: ['Liturgical', 'Books', 'Reference'],
    historicalContext: `Liturgical books were the script of Catholic worship, ensuring uniformity across the global Church. The Roman Missal—standardized after the Council of Trent—prescribed exact prayers, gestures, and timings for every Mass. The breviary required priests to pray the Divine Office daily—eight sets of psalms, hymns, and readings spread across the day. These books were expensive, often chained to prevent theft. In colonial cathedrals, they represented Rome's authority over local practice. Any deviation from prescribed texts risked accusations of heresy or protestantism.`
  });

  console.log('[CathedralInterior] Registered 11 furniture POI entities (nave + sanctuary + transepts + sacristy)');
};

// Call furniture registration immediately
registerCathedralFurniture();

export default cathedralInteriorMap;
