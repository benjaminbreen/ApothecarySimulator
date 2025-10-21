/**
 * Pre-written narratives for interior movement in the botica
 * Eliminates expensive LLM calls for simple position changes
 *
 * Grid System:
 * - Collision grid: 20px cells (50×40 for 1000×800 map)
 * - Movement grid: 110px steps (creates 2 rows × 5 columns = 10 positions)
 * - Furniture: Drug Cabinet [130,563], Sales Counter [455,550], Waiting Chair [830,630]
 * - Keys are ROUNDED grid positions (e.g., player at 630,490 → rounds to 660,440)
 */

export const BOTICA_INTERIOR_NARRATIVES = {
  '220,440': {
    morning: `You stand in the northwestern corner of the shop floor, where morning light slants through the bedroom doorway to your north. The Drug Cabinet rises against the western wall before you, its painted ceramic jars catching the sunlight. The Sales Counter stretches away to your southeast. The scent of last night's copal incense lingers faintly.`,
    afternoon: `You occupy the northwestern corner of the shop floor. The Drug Cabinet stands against the western wall, its ceramic jars gleaming in the afternoon sun. The bedroom doorway opens to your north. The Sales Counter extends southeast, bearing the day's transactions—coin stains, herb fragments, a dusting of powder.`,
    evening: `You stand in the northwestern corner by candlelight. The Drug Cabinet looms against the western wall, its ceramic jars catching the flickering glow—ROSA, CONSOLID, their labels harder to read in the dim light. The bedroom doorway opens to your north. The Sales Counter stretches southeast into shadow.`,
    nearbyPOIs: ['Drug Cabinet']
  },

  '330,440': {
    morning: `You stand behind the western end of the Sales Counter. Before you to the south, the shop entrance admits fresh air and the sounds of the waking city—vendors calling, cart wheels on cobblestones, church bells marking the hour. The Drug Cabinet is visible to your northwest, its jars orderly. The counter's wood is smooth beneath your hands, worn by decades of transactions.`,
    afternoon: `You occupy the western end of the Sales Counter. The entrance to the south frames a view of the busy street—servants hurrying past, friars in black habits, the occasional gentleman on horseback. The Drug Cabinet stands to your northwest, several of its jars now depleted from the morning's sales. The counter bears the afternoon's accumulation: scattered coins, torn paper, a forgotten rosemary sprig.`,
    evening: `You stand behind the western end of the Sales Counter in the night's stillness. The shop entrance to the south shows a street grown quiet—shutters closed, torches guttering, the day's commerce long ended. The Drug Cabinet to your northwest is barely visible in the candlelight, its jars now shadowy forms. The wood has absorbed the day's warmth and releases it slowly into the cooling air.`,
    nearbyPOIs: ['Sales Counter', 'Drug Cabinet']
  },

  '440,440': {
    morning: `You stand behind the center of the Sales Counter. The shop entrance lies directly south, admitting morning light that illuminates the terracotta tiles. The bedroom doorway is visible to your northwest, the laboratory entrance to your northeast.`,
    afternoon: `You occupy your usual position behind the center of the Sales Counter. The shop entrance to the south admits afternoon light. The bedroom doorway opens to your northwest, the laboratory entrance to your northeast.`,
    evening: `You stand behind the Sales Counter in the quiet of night. The entrance to the south is barred and shuttered against the dark street beyond. The bedroom doorway opens to your northwest, the laboratory entrance to your northeast.`,
    nearbyPOIs: ['Sales Counter']
  },

  '550,440': {
    morning: `You stand at the eastern edge of the Sales Counter, where morning light from the high window creates shifting patterns on the floor. The laboratory doorway is just to your north; you can smell the faint chemical tang of last night's distillation drifting through. The counter stretches west, its full length visible.`,
    afternoon: `You occupy the eastern edge of the Sales Counter as afternoon heat builds. The laboratory doorway to your north offers glimpses of your workspace—alembics catching the light, herb bundles hanging from beams. The counter extends west, bearing the marks of the afternoon's activity: measuring marks in spilled flour, the ghost of a coin left too long in one spot. The air grows thick and warm.`,
    evening: `You stand at the eastern edge of the Sales Counter. The laboratory doorway to your north has grown dark. The counter stretches west into shadow. Candlelight flickers across the walls.`,
    nearbyPOIs: ['Sales Counter']
  },

  '660,440': {
    morning: `You stand in the most open area of the shop floor, where morning sunlight streams unobstructed from the high window. The laboratory entrance is to your northwest, the Waiting Chair to your southeast. The shop entrance is visible to your southwest.`,
    afternoon: `You occupy the shop floor's most open area. The sunlight has shifted, no longer streaming directly through the high window but rather reflecting off the walls in a diffuse golden glow. The laboratory entrance is to your northwest, the Waiting Chair to your southeast. The shop entrance southwest frames a view of afternoon street life: servants with market baskets, gentlemen in broad hats, the occasional patrol of soldiers.`,
    evening: `You stand in the shop's most open area. The high window no longer admits light. The laboratory entrance northwest has gone dark; the Waiting Chair southeast sits empty and shadowed. The shop entrance to your southwest is barred against the night street. The darkness beyond the candlelight seems to press in from all sides.`,
    nearbyPOIs: ['Waiting Chair']
  },

  '770,440': {
    morning: `You stand against the eastern wall of the shop floor. The Waiting Chair sits just to your south, its wicker seat empty. A simple wooden cross hangs on the wall beside you, catching the morning light. The morning air here is still, undisturbed.`,
    afternoon: `You occupy the eastern wall during the afternoon's warmth. The Waiting Chair to your south bears signs of use—compressed wicker, marks on the armrests. The wooden cross on the wall beside you casts a sharp shadow in the afternoon light. The air here is quieter, as if the eastern wall absorbs and muffles the sounds from the western side of the shop.`,
    evening: `You stand against the eastern wall in the night's stillness. The Waiting Chair to your south is empty, the day's patients long departed. The wooden cross beside you is barely visible in the candlelight. The wall behind you is cool stone.`,
    nearbyPOIs: ['Waiting Chair']
  },

  '330,550': {
    morning: `You stand in the southwest corner of the shop floor, somewhat removed from the main working areas. The Drug Cabinet is visible to your north, though at a distance. The Sales Counter lies ahead toward the center; the Waiting Chair is far to the east. The western wall here bears water stains from the rainy season. A small wooden shelf holds your personal effects: a rosary, a leather-bound commonplace book, and a crucifix. Morning light slants across the floor.`,
    afternoon: `You stand in the southwest corner of the shop floor. The Drug Cabinet to your north is distant. The Sales Counter ahead; the Waiting Chair far east. The western wall's water stains are clearly visible in afternoon light. The small shelf—rosary, commonplace book, crucifix—catches the light. The corner is warm.`,
    evening: `You stand in the southwest corner of the shop floor by candlelight. The Drug Cabinet to your north is barely visible. The Sales Counter ahead is shadowed; the Waiting Chair to the east invisible. The western wall's water stains are hidden in darkness. The small shelf—rosary, commonplace book, crucifix—catches faint candlelight. The corner is cool.`,
    nearbyPOIs: []
  },

  '440,550': {
    morning: `You stand at the Sales Counter. The counter's polished wooden surface is scarred from years of transactions—knife marks from cutting herbs, burn marks from hot wax seals, ink stains from your ledger. Behind the counter, shelves display your wares: bundles of dried herbs hanging from hooks, ceramic jars labeled in Latin, small wooden boxes containing exotic spices. A brass scale sits ready. Your accounting ledger lies open. Morning light illuminates the workspace.`,
    afternoon: `You stand at the Sales Counter. The scarred wooden surface shows the afternoon's work—fresh knife marks, new ink stains. Behind the counter, shelves display wares: dried herbs, ceramic jars, wooden boxes of spices. The brass scale has been used repeatedly. The accounting ledger lies open, new entries filling the page. Bright afternoon light.`,
    evening: `You stand at the Sales Counter by candlelight. The scarred wooden surface is barely visible. Behind the counter, shelves fade into shadow: dried herbs, ceramic jars, wooden boxes all dimmed. The brass scale catches faint light. The accounting ledger lies open, but entries are difficult to read. Candlelight creates small pools of illumination.`,
    nearbyPOIs: ['Sales Counter']
  },

  '660,550': {
    morning: `You stand in the central-southern area of your shop. The Sales Counter is to your west. The Drug Cabinet stands to your northwest. The Waiting Chair waits to your east. Behind you, the main entrance door connects to the streets of Mexico City. The terracotta floor tiles form a diamond pattern around your feet. Morning light slants through the entrance, creating long shadows toward the northern wall.`,
    afternoon: `You stand in the central-southern area of your shop. The Sales Counter to your west. The Drug Cabinet to your northwest. The Waiting Chair to your east. Behind you, the main entrance admits afternoon street sounds. The terracotta floor tiles' diamond pattern is clearly visible. Bright afternoon light creates short, sharp shadows.`,
    evening: `You stand in the central-southern area of your shop by candlelight. The Sales Counter to your west is shadowed. The Drug Cabinet to your northwest barely visible. The Waiting Chair to your east is dark. Behind you, the main entrance is barred and shuttered. The terracotta floor tiles are barely discernible. Candlelight creates small pools of light; shadows press in.`,
    nearbyPOIs: ['Sales Counter', 'Waiting Chair', 'Drug Cabinet']
  },

  '770,550': {
    morning: `You stand beside the Waiting Chair, close enough to examine its construction. Woven wicker over a wooden frame, its seat cushion worn thin and slightly concave from the weight of countless patients. Details visible in morning light: a small tear in the wicker weave on the left armrest, a dark stain on the cushion, and initials carved into the wooden backrest—"M.S. 1673." The Waiting Chair faces toward the center of the shop. A folded blanket rests on the seat.`,
    afternoon: `You stand beside the Waiting Chair. Woven wicker over wooden frame, seat cushion worn and concave. Details clear in afternoon light: the tear in the wicker weave, the dark stain on the cushion, the carved initials—"M.S. 1673." The chair faces the shop's center. The folded blanket has been moved aside if a patient used the chair today.`,
    evening: `You stand beside the Waiting Chair by candlelight. Woven wicker over wooden frame, seat cushion barely visible. Details obscured in dim light: the tear in the wicker, the stain, the carved initials "M.S. 1673" nearly illegible. The chair faces into shadow. The folded blanket is a dark shape on the seat.`,
    nearbyPOIs: ['Waiting Chair']
  },

  // === LABORATORY POSITIONS ===
  // Room bounds: X: 500-900, Y: 100-400
  // Spawn: [700, 250] → [660, 220]

  '550,110': {
    morning: `You stand against the western wall of your laboratory, near the door to your bedroom. The stone wall is cool beneath your palm. Weak morning light filters through a small window high above, illuminating dust motes suspended in air thick with the scent of drying herbs. The Workbench dominates the center; the Herb Shelf stands against the far eastern wall. A small wooden stool sits abandoned in the corner.`,
    afternoon: `You stand against the western wall of your laboratory. The stone wall has warmed in the afternoon heat. Bright light streams through the high window, casting sharp shadows. The Workbench fills the center of the room; the Herb Shelf lines the eastern wall. The air is thick with herbal scent and chemical vapors.`,
    evening: `You stand against the western wall of your laboratory by candlelight. The stone wall is cool once more. The high window admits no light. The Workbench and Herb Shelf are barely visible in the dim illumination. The scent of drying herbs intensifies in the night air.`,
    nearbyPOIs: ['Workbench', 'Herb Shelf']
  },

  '550,220': {
    morning: `You stand near the western edge of your laboratory, close to the door to your bedroom. The Workbench sprawls before you to the east, its scarred surface bearing burn marks and acid stains. The wall beside you displays a tacked parchment—Paracelsus's formula for sal ammoniac. Below it, a shelf holds reference volumes: Dioscorides, Galen, and a battered copy of the Materia Medica Novo-Hispanica.`,
    afternoon: `You stand near the western edge of your laboratory. The Workbench spreads before you, cluttered with afternoon's operations—vessels still warm, mortars in mid-use. The tacked parchment on the wall beside you curls slightly in the heat. The reference volumes on the shelf below gather dust.`,
    evening: `You stand near the western edge of your laboratory in the quiet hours. The Workbench before you is shadowed. The parchment on the wall is barely legible by candlelight. The reference volumes on the shelf are invisible in darkness.`,
    nearbyPOIs: ['Workbench']
  },

  '550,330': {
    morning: `You stand near the southwestern corner of the laboratory, between two doorways. Behind you to the south lies the passage to your shop floor; to your west, the door to your bedroom. The Workbench dominates the space before you; beyond it, the Herb Shelf looms against the eastern wall. A ceramic basin sits in the corner for washing hands, its water fresh this morning.`,
    afternoon: `You stand near the southwestern corner of the laboratory. The shop floor doorway is behind you to the south, the bedroom door to your west. The Workbench sprawls before you; the Herb Shelf beyond. The ceramic basin's water has grown murky from the afternoon's washing.`,
    evening: `You stand near the southwestern corner of the laboratory at night. The doorways to south and west are dark passages. The Workbench and Herb Shelf are shadowed forms. The ceramic basin's water is barely visible.`,
    nearbyPOIs: ['Workbench', 'Herb Shelf']
  },

  '660,110': {
    morning: `You stand against the northern wall of your laboratory, above the Workbench. The ceiling slopes lower here; you duck slightly beneath exposed wooden beams blackened by smoke and vapor. A small north-facing window admits cool morning air. Morning light angles through the window, casting long shadows across the copper vessels on the Workbench below. The Herb Shelf stands to your right. The wall behind you is bare stone.`,
    afternoon: `You stand against the northern wall of your laboratory. The low ceiling presses close; blackened beams overhead. The north-facing window admits warm afternoon air. Bright light illuminates the Workbench below, revealing every detail of the apparatus. The Herb Shelf to your right is clearly visible.`,
    evening: `You stand against the northern wall of your laboratory by candlelight. The low ceiling and blackened beams loom above. The north window admits only darkness and cool night air. The Workbench below is shadowed; the Herb Shelf barely visible. The bare stone wall behind you is cold.`,
    nearbyPOIs: ['Workbench', 'Herb Shelf']
  },

  '660,220': {
    morning: `You stand at your Workbench. The bench's surface bears burn marks from overturned crucibles, acid stains creating abstract patterns in the wood, knife scores from cutting roots and barks. Before you sprawls the apparatus: alembics of copper and glass, a small athanor, mortars of varying sizes, glass vessels—cucurbits, pelicans, retorts. The Herb Shelf stands to your east, its contents within arm's reach. Morning light illuminates the workspace.`,
    afternoon: `You stand at your Workbench in the afternoon heat. The scarred surface is warm to the touch. The apparatus before you—alembics, athanor, mortars, glass vessels—catches the bright afternoon light. The Herb Shelf to your east is clearly visible. Chemical vapors hang thick in the warm air.`,
    evening: `You stand at your Workbench by candlelight. The scarred surface is barely visible in the dim light. The apparatus before you—alembics, glass vessels, mortars—creates strange shadows. The Herb Shelf to your east fades into darkness. The air has cooled.`,
    nearbyPOIs: ['Workbench', 'Herb Shelf']
  },

  '660,330': {
    morning: `You stand just south of the Workbench, near the door to your shop floor. The Workbench looms before you to the north; the Herb Shelf occupies the eastern wall. The stone floor here is worn smooth from countless trips between workshop and shop. A small ledger rests on a side shelf, tracking which compounds are depleted.`,
    afternoon: `You stand south of the Workbench, near the shop floor door. The Workbench to the north bears the afternoon's work in progress. The Herb Shelf on the eastern wall shows gaps where ingredients have been taken. The worn stone floor is warm underfoot. The ledger on the side shelf lies open.`,
    evening: `You stand south of the Workbench near the shop floor door. The Workbench to the north is shadowed. The Herb Shelf on the eastern wall is barely visible. The stone floor is cool. The ledger on the side shelf is unreadable in the dim light.`,
    nearbyPOIs: ['Workbench', 'Herb Shelf']
  },

  '770,110': {
    morning: `You occupy the northeastern section of your laboratory, where the Workbench meets the Herb Shelf. Glass vessels crowd the bench's eastern edge. Dried plant bundles hang from the ceiling above, suspended by twine. A brass balance sits on the bench here, its pans polished. Through the north window, pale morning light illuminates the labels on the Herb Shelf.`,
    afternoon: `You occupy the northeastern section of your laboratory. Glass vessels on the bench's eastern edge catch the bright afternoon light. Dried plant bundles overhead cast shadows. The brass balance gleams. The Herb Shelf labels are clearly legible in the strong light from the north window.`,
    evening: `You occupy the northeastern section of your laboratory by candlelight. Glass vessels on the bench's edge are shadowed. Dried plant bundles overhead are barely visible. The brass balance is a dim shape. The north window admits no light; the Herb Shelf labels are unreadable.`,
    nearbyPOIs: ['Workbench', 'Herb Shelf']
  },

  '770,220': {
    morning: `You stand at the eastern edge of the Workbench, immediately beside the Herb Shelf. The Workbench surface here is particularly stained—evidence of intensive work. The Herb Shelf towers beside you, its compartments filled with European herbs, Asian spices, and indigenous plants. A small oil lamp sits permanently stationed here. The morning air is thick with competing scents: bitter chamomile, sweet cinnamon, acrid sulfur, earthy cacao.`,
    afternoon: `You stand at the eastern edge of the Workbench, beside the Herb Shelf. The heavily stained surface is warm from afternoon operations. The Herb Shelf beside you—European herbs, Asian spices, indigenous plants—is clearly visible in the bright light. The oil lamp is unneeded. The air is thick with intensified scents in the heat.`,
    evening: `You stand at the eastern edge of the Workbench, beside the Herb Shelf. The stained surface is barely visible by candlelight. The Herb Shelf beside you fades into shadow. The oil lamp here provides additional light for examining specimens. The scents in the cooling air grow fainter.`,
    nearbyPOIs: ['Workbench', 'Herb Shelf']
  },

  '770,330': {
    morning: `You stand in the southeastern quadrant of the laboratory, between the Herb Shelf to your north and the door to the shop floor behind you. The Workbench extends to your west. A small table stands against the south wall, its surface holding recent acquisitions—a bundle of fresh peppermint, several pieces of dragon's blood resin, a ceramic jar of imported theriac.`,
    afternoon: `You stand in the southeastern quadrant of the laboratory. The Herb Shelf is to your north; the shop floor door behind you. The Workbench extends to your west. The small table against the south wall now holds afternoon's purchases awaiting integration. The space is warm.`,
    evening: `You stand in the southeastern quadrant of the laboratory by candlelight. The Herb Shelf to your north is shadowed. The shop floor door behind you leads to darkness. The Workbench to your west is barely visible. The small table against the south wall is a dim shape.`,
    nearbyPOIs: ['Herb Shelf', 'Workbench']
  },

  '880,110': {
    morning: `You stand in the far northeastern corner of your laboratory, pressed against the Herb Shelf. The Herb Shelf dominates your immediate surroundings, its topmost shelves at eye level. These uppermost compartments hold your rarest materials: bezoar stones, powdered unicorn horn, mummy powder from Egypt, gold-infused mercury. The northeast corner is coolest. Through the high window, you can see a sliver of morning sky. The Workbench seems distant.`,
    afternoon: `You stand in the far northeastern corner, pressed against the Herb Shelf. The topmost shelves at eye level hold rare materials: bezoar stones, powdered unicorn horn, mummy powder, gold-infused mercury. The corner has warmed in afternoon heat, less ideal for volatile substances. The high window shows bright afternoon sky. The Workbench is far across the room.`,
    evening: `You stand in the far northeastern corner by candlelight, pressed against the Herb Shelf. The topmost shelves at eye level are barely visible. The rare materials stored here are shadowed forms. The corner is cool once more. The high window shows only darkness. The Workbench is invisible in the distance.`,
    nearbyPOIs: ['Herb Shelf', 'Workbench']
  },

  '880,220': {
    morning: `You stand directly before the Herb Shelf, centered on its expanse. Each compartment is labeled in your careful script, contents arranged by medical property (purgatives together, cordials together, vulneraries together) and by origin (European, Asian, American). Morning light illuminates the labels clearly. The scents are distinct: the sharp bite of wormwood, the sweetness of licorice root, the peculiar musk of valerian. Some compartments are nearly empty. Behind you, the Workbench.`,
    afternoon: `You stand directly before the Herb Shelf. The compartments—labeled and organized by property and origin—are clearly visible in bright afternoon light. The scents intensify in the heat: wormwood, licorice root, valerian. Several compartments show depletion from the day's work. The Workbench is behind you.`,
    evening: `You stand directly before the Herb Shelf by candlelight. The compartment labels are difficult to read in the dim light. Organization by property and origin is barely discernible. The scents fade in the cooler evening air: wormwood, licorice, valerian. Empty compartments are shadowed hollows. The Workbench behind you is dark.`,
    nearbyPOIs: ['Herb Shelf', 'Workbench']
  },

  '880,330': {
    morning: `You occupy the far southeastern corner of the laboratory, beside the lower shelves of the Herb Shelf. This area is dimmer, farther from the north window's light. The lower shelves here contain common materials used daily: chamomile, peppermint, lavender, rose petals. A small cushion on the floor. The Workbench is visible to your west; the door to the shop lies to your south.`,
    afternoon: `You occupy the far southeastern corner of the laboratory. The area is shadowed even in afternoon. The lower shelves beside you—chamomile, peppermint, lavender, rose petals—show signs of frequent access. The cushion on the floor bears the impression of recent use. The Workbench to your west; the shop door to your south.`,
    evening: `You occupy the far southeastern corner of the laboratory by candlelight. The area is quite dark. The lower shelves are barely visible—chamomile, peppermint, lavender, rose petals obscured in shadow. The cushion on the floor is a dark shape. The Workbench to your west is invisible; the shop door to your south a dim outline.`,
    nearbyPOIs: ['Herb Shelf']
  },

  // === BEDROOM POSITIONS ===
  // Room bounds: X: 100-500, Y: 100-400
  // Spawn: [300, 250] → [330, 220]

  '110,110': {
    morning: `You stand in the northwestern corner of your bedroom. The walls here are bare stone, cool and slightly damp. A small wooden crucifix hangs on the wall at eye level. The Bed dominates the room to your southeast; the Bookshelf stands to your right along the northern wall. Morning light filters weakly through the northern window. Cobwebs cling to the ceiling corner.`,
    afternoon: `You stand in the northwestern corner of your bedroom. The bare stone walls have warmed slightly in afternoon heat. The wooden crucifix on the wall is clearly visible. The Bed to your southeast; the Bookshelf to your right. Limited afternoon light reaches this corner. The cobwebs are visible in the brighter light.`,
    evening: `You stand in the northwestern corner of your bedroom by candlelight. The bare stone walls are cool once more, slightly damp. The wooden crucifix on the wall catches flickering candlelight. The Bed to your southeast is shadowed; the Bookshelf to your right barely visible. The cobwebs in the ceiling corner are invisible in darkness.`,
    nearbyPOIs: ['Bookshelf', 'Bed']
  },

  '110,220': {
    morning: `You stand against the western wall of your bedroom, equidistant from the northern and southern walls. The Bed occupies the center of the room to your east. This wall holds your only decoration: a small mirror in a carved wooden frame. In its reflection—the Bookshelf to your right, the Clothing Chest barely visible to the far left, the Bed's rumpled linens. Morning light makes the reflection clear. The western wall has a slight lean.`,
    afternoon: `You stand against the western wall of your bedroom. The Bed to your east dominates the space. The small mirror in its carved wooden frame reflects the room: the Bookshelf, the Clothing Chest in the distance, the Bed's linens disheveled. Afternoon light brightens the reflection. The wall's slight lean is more noticeable.`,
    evening: `You stand against the western wall of your bedroom by candlelight. The Bed to your east is shadowed. The small mirror reflects only dim shapes: the Bookshelf barely visible, the Clothing Chest invisible, the Bed a dark mass. Candlelight flickers in the glass. The wall's lean is imperceptible in darkness.`,
    nearbyPOIs: ['Bed', 'Bookshelf']
  },

  '110,330': {
    morning: `You occupy the southwestern corner of your bedroom, near the doorway to the shop floor. The Bed extends before you to the east; the Clothing Chest stands against the far southern wall to your right. A small table here holds a ceramic washbasin and pitcher. The water in the basin reflects ceiling beams above. Morning light slants through the doorway.`,
    afternoon: `You occupy the southwestern corner of your bedroom. The shop floor doorway is nearby. The Bed extends to the east; the Clothing Chest to the far south. The small table's ceramic washbasin holds murky afternoon water. Warm air drifts up from the shop below.`,
    evening: `You occupy the southwestern corner of your bedroom by candlelight. The shop floor doorway is dark. The Bed to the east is shadowed; the Clothing Chest barely visible. The small table's washbasin is a dim shape. The water reflects only darkness. The air from the shop below has cooled.`,
    nearbyPOIs: ['Bed', 'Clothing Chest']
  },

  '220,110': {
    morning: `You stand before the Bookshelf, positioned along the northern wall of your bedroom. Here rest your professional foundations: a Latin edition of Dioscorides's De Materia Medica, Galen's writings on the humors, Avicenna's Canon of Medicine, and a copy of Francisco Hernández's Natural History of New Spain. Personal volumes among the medical texts: a prayer book, a volume of poetry, several notebooks filled with your own observations. Morning light makes the titles legible. The Bed is to your south.`,
    afternoon: `You stand before the Bookshelf on the northern wall. The volumes—Dioscorides, Galen, Avicenna, Hernández—are clearly visible in afternoon light. Personal volumes among them: prayer book, poetry, notebooks. Bright light illuminates the spines. The Bed to your south.`,
    evening: `You stand before the Bookshelf by candlelight. The volumes—Dioscorides, Galen, Avicenna, Hernández—are shadowed forms. Personal volumes invisible among them: prayer book, poetry, notebooks. The titles are difficult to read. The Bed to your south is dark.`,
    nearbyPOIs: ['Bookshelf', 'Bed']
  },

  '220,220': {
    morning: `You stand in the north-central area of your bedroom, between the Bookshelf to your west and the Bed to your east. The Bookshelf within arm's reach; the Bed nearby; the Clothing Chest visible in the southern part of the room. The floor here shows particular wear. A small night table stands nearby, bearing a candlestick with melted wax cascading down its brass sides. Morning light illuminates the space.`,
    afternoon: `You stand in the north-central area of your bedroom. The Bookshelf to your west; the Bed to your east; the Clothing Chest to the south. The worn floor is clearly visible in afternoon light. The night table's candlestick shows accumulated wax. The room is bright.`,
    evening: `You stand in the north-central area of your bedroom by candlelight. The Bookshelf to your west is shadowed; the Bed to your east partially visible; the Clothing Chest to the south barely discernible. The worn floor is invisible in dim light. The night table's candlestick holds tonight's light. The room is dark beyond the candle's reach.`,
    nearbyPOIs: ['Bookshelf', 'Bed']
  },

  '220,330': {
    morning: `You stand along the southern area of your bedroom, near the wall but north of the Clothing Chest. The Bed rises to your right; the Bookshelf is visible to your far north. The southern wall here bears marks of damp. A tapestry covers the worst staining: a scene of Saint Cosmas and Saint Damian performing their miraculous limb transplantation. The Clothing Chest sits to your right, its iron-bound lid secure. Morning light makes the tapestry's details clear.`,
    afternoon: `You stand along the southern area of your bedroom. The Bed to your right; the Bookshelf to the far north. The southern wall's damp marks are visible despite the tapestry: Saint Cosmas and Saint Damian in bright afternoon light. The Clothing Chest to your right, its iron fittings gleaming. Warm afternoon air emphasizes the dampness.`,
    evening: `You stand along the southern area of your bedroom by candlelight. The Bed to your right is shadowed; the Bookshelf to the far north invisible. The southern wall's damp marks are hidden in darkness. The tapestry—Saint Cosmas and Saint Damian—is barely visible. The Clothing Chest to your right is a dark shape. The damp air is cool.`,
    nearbyPOIs: ['Clothing Chest', 'Bed']
  },

  '330,110': {
    morning: `You stand against the northern wall of your bedroom, centrally positioned. The Bed extends southward, its wooden frame solid but simple. This wall, being the northern exposure, remains coolest. A small window here admits cool morning air and limited light; its shutters are drawn. The Bookshelf is visible to your west; the doorway to the laboratory to the east. The Bed's disheveled state is visible. The Clothing Chest against the southern wall.`,
    afternoon: `You stand against the northern wall of your bedroom. The Bed extends southward. The northern exposure has warmed slightly in afternoon heat. The small window admits warm air and brighter light; shutters drawn. The Bookshelf to your west; the laboratory doorway to your east. The Bed's linens are clearly disheveled. The Clothing Chest to the south.`,
    evening: `You stand against the northern wall of your bedroom by candlelight. The Bed extends southward into shadow. The northern wall is cool once more. The small window admits only darkness and cool night air; shutters drawn. The Bookshelf to your west is barely visible; the laboratory doorway to your east is dark. The Bed's state is obscured. The Clothing Chest is invisible.`,
    nearbyPOIs: ['Bed', 'Bookshelf']
  },

  '330,220': {
    morning: `You stand at the center of your bedroom, equidistant from all walls. The Bed occupies this same central position; you stand beside it, close enough to touch the rough wool blanket covering the straw-filled mattress. The Bookshelf to your north, the Clothing Chest to your south, the western wall with its mirror to your left, the eastern wall with its laboratory doorway to your right. Morning light illuminates the entire room.`,
    afternoon: `You stand at the center of your bedroom. The Bed beside you, its rough wool blanket visible in afternoon light. The Bookshelf to your north, the Clothing Chest to your south, the western mirror to your left, the laboratory doorway to your right. Bright afternoon light fills the space. The straw-filled mattress beneath the blanket is evident.`,
    evening: `You stand at the center of your bedroom by candlelight. The Bed beside you is partially illuminated; the rough wool blanket barely visible. The Bookshelf to your north is shadowed, the Clothing Chest to your south darker still, the western mirror to your left reflects only dim light, the laboratory doorway to your right is black. Candlelight creates a small circle of visibility.`,
    nearbyPOIs: ['Bed', 'Bookshelf', 'Clothing Chest']
  },

  '330,330': {
    morning: `You stand in the south-central area of your bedroom, near the Clothing Chest. The Bed extends to your north. The chest sits against the southern wall, its dark wood polished by years of handling. A rosary drapes over one corner of the chest. The floor here creaks particularly loudly. Morning light reveals the chest's details. The shop floor entrance and laboratory door are both accessible from here.`,
    afternoon: `You stand in the south-central area of your bedroom, near the Clothing Chest. The Bed to your north. The chest against the southern wall, its dark wood gleaming in afternoon light. The rosary on the corner is clearly visible. The floor creaks as you shift weight. Both doorways—shop floor and laboratory—are nearby.`,
    evening: `You stand in the south-central area of your bedroom by candlelight, near the Clothing Chest. The Bed to your north is shadowed. The chest against the southern wall is a dark mass. The rosary on the corner catches faint light. The floor creaks loudly in the night stillness. The shop floor entrance and laboratory door are dark passages.`,
    nearbyPOIs: ['Clothing Chest', 'Bed']
  },

  '440,110': {
    morning: `You stand in the northeastern corner of your bedroom, near the doorway to your laboratory. The Bed is visible to your southwest. The eastern wall here holds the laboratory door. Above the door, a small sachet of dried lavender hangs. The wall shows marks where paint colors have been tested. Through the door, occasional sounds from the laboratory—the drip of condensation, the settling of cooling vessels. Morning light is weak here.`,
    afternoon: `You stand in the northeastern corner of your bedroom. The laboratory doorway is beside you. The Bed to your southwest. The lavender sachet above the door is clearly visible. The wall's paint test marks are evident in afternoon light. Through the door, sounds from the laboratory—dripping, settling. The corner is brighter in afternoon.`,
    evening: `You stand in the northeastern corner of your bedroom by candlelight. The laboratory doorway is beside you, dark beyond. The Bed to your southwest is shadowed. The lavender sachet above the door is barely visible. The wall's paint marks are invisible. Through the door, occasional sounds from the laboratory—dripping, settling in darkness. The corner is very dim.`,
    nearbyPOIs: ['Bed']
  },

  '440,220': {
    morning: `You stand along the eastern side of your bedroom, between the Bed to your west and the laboratory door to your right. The Bed dominates this view, its headboard carved with simple geometric patterns. Rope supports, straw mattress with a depression in the center, pillows needing fresh ticking. The Bookshelf is visible across the room to your northwest. Morning light from the northern window reaches this position. A small basket here contains mending—torn sleeves and loose hems.`,
    afternoon: `You stand along the eastern side of your bedroom. The Bed to your west, laboratory door to your right. The Bed's carved headboard is clearly visible. Rope supports, straw mattress, worn pillows. The Bookshelf across the room to your northwest. Bright afternoon light from the northern window illuminates this area well. The mending basket—torn sleeves, loose hems—is clearly visible.`,
    evening: `You stand along the eastern side of your bedroom by candlelight. The Bed to your west is partially visible, its carved headboard catching faint light. The laboratory door to your right is dark. Rope supports barely visible, straw mattress shadowed, pillows indistinct. The Bookshelf to your northwest is invisible. No light from the northern window. The mending basket is a dark shape.`,
    nearbyPOIs: ['Bed', 'Bookshelf']
  },

  '440,330': {
    morning: `You stand in the southeastern quarter of your bedroom, near the Clothing Chest. This corner is farthest from both the northern window and the western wall's mirror. The Clothing Chest sits immediately to your left, its iron fittings showing traces of rust. The Bed extends to your north. Three doorways are accessible from here: the shop floor to the southwest, the laboratory to the northeast, the northern window beyond. The Clothing Chest's lock is substantial. Morning light barely reaches this corner.`,
    afternoon: `You stand in the southeastern quarter of your bedroom, near the Clothing Chest. This corner remains dim even in afternoon. The Clothing Chest to your left, its iron fittings visible despite rust. The Bed to your north. Three doorways equidistant: shop floor southwest, laboratory northeast, northern window beyond. The lock is clearly visible. Afternoon warmth reaches even this enclosed space.`,
    evening: `You stand in the southeastern quarter of your bedroom by candlelight, near the Clothing Chest. This corner is the darkest. The Clothing Chest to your left is barely visible, its iron fittings catching faint light. The Bed to your north is shadowed. Three doorways all dark: shop floor southwest, laboratory northeast, northern window black. The substantial lock is a dim shape. The corner is cool.`,
    nearbyPOIs: ['Clothing Chest', 'Bed']
  }
};

/**
 * Get time of day period from hour (24-hour format)
 * @param {number} hour - Hour in 24-hour format (0-23)
 * @returns {string} - 'morning', 'afternoon', or 'evening'
 */
function getTimeOfDayPeriod(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening'; // 18:00 onwards through night
}

/**
 * Parse time string to get hour
 * @param {string} timeString - Time in format like "8:00 AM" or "14:00"
 * @returns {number} - Hour in 24-hour format
 */
function parseTimeString(timeString) {
  if (!timeString) return 12; // Default to afternoon if no time

  // Handle "8:00 AM" or "8:00 PM" format
  const ampmMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1]);
    const isPM = ampmMatch[3].toUpperCase() === 'PM';
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    return hour;
  }

  // Handle "14:00" 24-hour format
  const twentyFourMatch = timeString.match(/(\d+):(\d+)/);
  if (twentyFourMatch) {
    return parseInt(twentyFourMatch[1]);
  }

  return 12; // Default to afternoon
}

/**
 * Get pre-written narrative for a position in botica interior
 * @param {number} x - X coordinate (pixel)
 * @param {number} y - Y coordinate (pixel)
 * @param {string} currentTime - Current game time (optional, for time-of-day variants)
 * @returns {Object|null} - Narrative object or null if not found
 */
export const getInteriorNarrative = (x, y, currentTime = null) => {
  // Round to nearest movement grid position (110px steps)
  const MOVEMENT_STEP = 110;
  const gridX = Math.round(x / MOVEMENT_STEP) * MOVEMENT_STEP;
  const gridY = Math.round(y / MOVEMENT_STEP) * MOVEMENT_STEP;

  const key = `${gridX},${gridY}`;
  const narrativeData = BOTICA_INTERIOR_NARRATIVES[key];

  if (!narrativeData) return null;

  // If this position has time-of-day variants, select the appropriate one
  if (narrativeData.morning && narrativeData.afternoon && narrativeData.evening) {
    const hour = parseTimeString(currentTime);
    const period = getTimeOfDayPeriod(hour);

    return {
      description: narrativeData[period],
      nearbyPOIs: narrativeData.nearbyPOIs
    };
  }

  // Otherwise return the single description (for positions without time variants)
  return narrativeData;
};

/**
 * Check if position has a pre-written narrative
 * @param {string} mapId - Map identifier
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean}
 */
export const hasPreWrittenNarrative = (mapId, x, y) => {
  if (mapId !== 'botica-interior') return false;
  return getInteriorNarrative(x, y) !== null;
};
