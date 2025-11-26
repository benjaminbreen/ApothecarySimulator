# Apothecary Simulator

**A Medical History Educational Game**

Step into the shoes of Maria de Lima, a converso apothecary in 1680 Mexico City. Diagnose patients using humoral medicine, craft remedies from historical materia medica, navigate the dangers of the Inquisition, and build your reputation in a richly detailed colonial world.

![Diagnosis Interface](./public/ui/apothecary-simulator-diagnosis.jpg)
*Examining a patient: Ask questions, check vital signs, and make a diagnosis based on early modern medical theory*

---

## Overview

Apothecary Simulator is a single-player narrative RPG that uses AI agents (GPT-4o/Gemini) to generate dynamic stories, patient encounters, and medical challenges. The game is built on historically-researched content including:

- **100+ authentic materia medica** from 17th-century pharmacopeias
- **Humoral medicine system** with the four humors (blood, phlegm, yellow bile, black bile)
- **Period-accurate social dynamics** including casta hierarchies, religious tensions, and guild politics
- **Procedurally-generated NPCs** with unique appearances, personalities, and medical conditions

![Apothecary Shop](./public/ui/isometricboticaday.png)
*Your shop, the Botica de la Amargura, in colonial Mexico City*

---

## Features

### Medical System
- **Patient Examination**: Ask questions, check pulse, examine tongue, view urine
- **Humoral Diagnosis**: Determine imbalances based on symptoms and patient constitution
- **Body Map**: Visual symptom tracker for locating ailments
- **Treatment Outcomes**: Your prescriptions have consequences - cure, harm, or kill your patients

### Crafting & Alchemy
- **Compound Creation**: Combine ingredients using historical methods
- **Preparation Methods**: Distill, decoct, calcinate, and create confections
- **Emergent Recipes**: The AI validates your combinations based on historical plausibility

![Workshop](./public/ui/boticaworkshop.png)
*The workshop where you prepare medicines*

### Progression
- **Skill System**: Level up Diagnosis, Pharmacy, Herbalism, Anatomy, Alchemy, and more
- **Profession Paths**: Specialize as an Alchemist, Herbalist, Surgeon, Poisoner, Scholar, or Court Physician
- **Reputation Factions**: Build standing with the Church, Elite, Merchants, Common Folk, Indigenous communities, and the Guild

### Dynamic World
- **30+ Random Events**: Street encounters, religious processions, market opportunities, dangers
- **NPC Relationships**: Characters remember your interactions and form opinions
- **Time & Weather**: Day/night cycle with dynamic weather affecting gameplay
- **Scripted Quests**: Story-driven encounters with recurring characters

![Shop Entrance](./public/ui/boticaentrance.png)
*View from inside the botica looking out to the street*

---

## Getting Started

### Prerequisites
- Node.js 18+
- An OpenAI API key (GPT-4o) and/or Google AI API key (Gemini)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/apothecary-simulator.git
cd apothecary-simulator

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your API keys:
# VITE_OPENAI_API_KEY=your_openai_key
# VITE_GOOGLE_API_KEY=your_google_key

# Start development server
npm start
```

The game will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output is in the `dist/` folder, ready for static hosting.

---

## How to Play

### Basic Commands
Type natural language commands to interact with the world:
- `"Open the shop for the day"` - Begin seeing patients
- `"Examine the patient's tongue"` - Gather diagnostic information
- `"Mix chamomile and honey into a decoction"` - Create medicines
- `"Travel to the market"` - Move to different locations

### Special Commands
- `#prescribe` - Open the prescription interface
- `#buy` - Open the market to purchase ingredients
- `#mix` - Open the crafting workshop
- `#sleep` - Rest to restore energy and advance time

### Tips for Success
1. **Ask patients about their symptoms** before diagnosing
2. **Check the humoral balance** - treatments should oppose the imbalance
3. **Manage your energy** - complex tasks drain stamina
4. **Build relationships** - reputation affects who seeks your help
5. **Be careful with the Inquisition** - your converso identity is a secret

---

## Architecture

```
src/
├── core/
│   ├── agents/          # LLM agent coordination (Narrative, State, Entity)
│   ├── entities/        # NPC/Patient/Item data models
│   ├── services/        # LLM integration, save system
│   └── systems/         # Leveling, reputation, resources
├── features/
│   ├── medical/         # Diagnosis, prescriptions, symptoms
│   ├── crafting/        # Mixing workshop
│   ├── commerce/        # Buy/sell mechanics
│   └── character/       # Player stats, portraits
├── scenarios/
│   └── 1680-mexico-city/  # Scenario configuration
└── pages/
    └── GamePage.jsx     # Main game loop
```

### Agent System
The game uses three specialized AI agents:
1. **NarrativeAgent**: Generates story text, dialogue, and scene descriptions
2. **StateAgent**: Extracts structured game state changes from narratives
3. **EntityAgent**: Selects contextually appropriate NPCs and patients

---

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion
- **AI**: OpenAI GPT-4o, Google Gemini 2.0 Flash
- **Build**: Vite
- **State**: React Context + localStorage saves

---

## Contributing

Contributions are welcome! Areas where help is needed:

- **New scenarios**: 1940s New York, 1880s London, or your own historical setting
- **Medical content**: Additional materia medica, diseases, treatments
- **UI/UX**: Accessibility improvements, mobile optimization
- **Testing**: Automated test coverage

See [CLAUDE.md](CLAUDE.md) for detailed technical documentation.

---

## Roadmap

- [ ] LLM response streaming for better UX
- [ ] Multiple save slots
- [ ] Additional historical scenarios
- [ ] Procedural quest generation
- [ ] NPC daily schedules
- [ ] Multiplayer/social features

---

## Credits

**Lead Developer**: Benjamin Breen

**Historical Research**: Based on primary sources from 17th-century medical texts, Inquisition records, and colonial Mexican archives.

**AI Models**: OpenAI GPT-4o, Google Gemini

---

## License

TBD

---

## Screenshots

| Diagnosis | Workshop | Shop |
|-----------|----------|------|
| ![Diagnosis](./public/ui/apothecary-simulator-diagnosis.jpg) | ![Workshop](./public/ui/boticaworkshop.png) | ![Shop](./public/ui/isometricboticaday.png) |

---

*"In the year of our Lord 1680, in the City of Mexico, there lived an apothecary..."*
