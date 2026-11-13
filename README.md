# Mars Mission: Jezero Crater Expeditions

### 2D Top-Down Mars Exploration, Survival & Spaceflight Game (Phaser + React)

Join astronauts **Hazaloom**, **Hedeya**, and **Samantha** at **Ares-1 Base** inside Jezero Crater in a 3-mission interactive campaign featuring real **NASA Perseverance, RIMFAX, MEDA, and Mars Sample Return** science written in kid-friendly English.

---

## 🚀 Game Overview & Storyline

After touching down on Mars, the crew begins a routine landing check outside their spacecraft—until a sudden cabin emergency ("**The Moment Everything Changed**") damages their return ship and knocks out communications with Earth.

Progress through three linked, sequentially unlocked missions (finish each mission to unlock the next):

1. **Mission 1 — Mission Home Begins** (`Mission1Scene`)
   - Perform the opening landing check near the spacecraft to trigger the emergency cutscene (`DisasterCinematicModal`) and inspect the **Damaged Ship Status** screen.
   - Collect a spare power part from the emergency crate, drive the rover across rocky terrain, repair the Earth radio tower, and race back to the habitat before the dust storm hits.
2. **Mission 2 — Underground Cave** (`Mission2Scene`)
   - Follow the subterranean RIMFAX radar signal into Neretva Vallis and deploy two ground sensors.
   - Descend through a volcanic skylight into a dark Martian lava tube, drill a rock core sample (**Tube #14**), and escape before a Marsquake collapses the cave.
3. **Mission 3 — Rocket Home** (`Mission3Scene`)
   - Stabilize the damaged rover power grid via the interactive **Power Bus Console** (`PowerBusConsoleModal`), keeping power draw safely under `400W`.
   - Drive past dust devils to the launch pad, load the rock sample into a two-stage rocket based on NASA's **Mars Ascent Vehicle (MAV)** design, steer it to a 343 km orbit (`[SPACE]` drops Stage 1), and dock with the return spaceship.

---

## 👩‍🚀 Meet the Crew

Players start through the **ARES Program** intro (`HomePage` → `LoadingScreen` → `CrewSelectionPage` / `CrewDetailsPage`) to pick a crew leader before heading to **Mission Select** (`MissionsPage`) and the **Main Menu**:

| Crew Member | ID | Role | Portrait |
|---|---|---|---|
| **Hazaloom** | `03-CMD` | Mission Commander — Drives the Mars rover, leads the team, and guides the mission home | `public/assets/characters/haz.png` |
| **Hedeya** | `01-BIO` | Fix-It & Science Engineer — Keeps spacesuits, life support, and Mars tools running safely | `public/assets/characters/had.png` |
| **Samantha** | `02-ENG` | Space Scientist & Power Lead — Checks ship power systems and studies Martian rocks & caves | `public/assets/characters/sam.png` |

---

## 🎬 In-Game Disaster Cutscene (`<video>`) Setup

During Mission 1's opening exploration, checking the spacecraft freezes gameplay and launches `DisasterCinematicModal`—an interactive HTML5 `<video>` player with timed subtitles, a **Skip** button, and a **Replay** option.

Place your AI-generated video clip(s) (e.g., from Google Flow, Kling AI, or CapCut) inside `public/assets/cinematic/`:

- **Option 1 (Single edited video):**
  ```text
  public/assets/cinematic/cutscene.mp4
  ```
- **Option 2 (Five sequential scene clips):**
  ```text
  public/assets/cinematic/scene_01.mp4
  public/assets/cinematic/scene_02.mp4
  public/assets/cinematic/scene_03.mp4
  public/assets/cinematic/scene_04.mp4
  public/assets/cinematic/scene_05.mp4
  ```

If no `.mp4` files are placed in `public/assets/cinematic/` yet, the player also lets you load a local `.mp4`/`.webm` file directly in the browser or skip ahead to the **Damaged Ship Status** briefing.

---

## ⚙️ Survival Mechanics, Trade-Offs & Controls

### 3 Core Survival Resources
To keep gameplay intuitive for ages 7–12 without interface clutter, the HUD tracks three core systems:
1. **Life Support (`Suit Air`):** Drains outdoors, drains faster in dust storms, and refills inside the habitat safe zone (45% faster with the **Hydroponic Food & Air Garden** trade-off).
2. **Power (`Battery`):** Drains when driving (faster in deep sand or high-Tau dusty Sols). Shared with LED crop grow-lights and Mission 3's **400W Power Budget** switchboard.
3. **Shielding (`Shield / Health`):** Affected by surface radiation (`mSv/day`), dust tornadoes, and rock bumps. Entering the **Mission 2 Underground Lava Cave** cuts space radiation wear by **~95%**.

### Replayable Mars Sol Weather & No-Free-Choice Trade-Offs
Before embarking (`MissionTradeOffModal`), players inspect a real Mars weather Sol (**Sol 142 Clear**, **Sol 288 Dusty Sky**, or **Sol 419 Solar Storm**) and choose among mission trade-offs where every gain carries a mechanical cost—plus test the **Earth–Mars Light-Time Radio Delay** interactively.

### Controls
| Input | Action |
|---|---|
| **`W`, `A`, `S`, `D` / Arrow Keys** | Walk astronaut, drive rover, or steer the Mars Rocket |
| **`[E]`** | Interact (ship check, crates, board/exit rover, repair relay, place sensors, drill rock, launch rocket) |
| **`[SPACE]` / `[ENTER]`** | Advance radio dialogue; press **`[SPACE]`** in Mission 3 to drop Rocket Stage 1 |
| **`[M]`** | Open the **NASA Space Facts & Data Book** (includes Easy Word Helper & Datasets tab) |
| **`[ESC]`** | Pause Menu & Controls |
| **Speaker Icon (Top-Right)** | Mute / Unmute procedural Web Audio sound effects |

---

## 🔬 Curated Real NASA Datasets & Educational Scope

- **Ages 7–12 + Classroom Flex:** Facts default to **Kids (7–9)** plain English with inline **Word Helpers** (`Sol`, `Radiation Dose`, `Hydroponics`, `Light-Time Delay`, `Microgravity`, `Lava Tube`), and toggle to **Explorer+ (10–12 & Classrooms)** for exact NASA readings and discussion questions.
- **Honest Curated Datasets (`src/data/nasaDatasets.ts`):** All embedded values (Curiosity MSL RAD `0.64–3.80 mSv/day`, Perseverance MEDA `710–760 Pa` & `Tau 0.42–1.65`, NASA VEGGIE/APH crop sunlight `~43%` & perchlorate limits, Earth–Mars radio delay `~3–22 min` one way, and RIMFAX/Sample Return specs) are explicitly labeled as curated offline snapshots rather than live streams.
- **11 Unlockable Space Fact Cards (`src/data/nasaContent.ts`):** Includes Jezero Crater, **Growing Food on Mars (Space Farming)**, Spare Parts Maintenance, **Radio Delay: Waiting for Earth**, Mars Dust Storms, RIMFAX Radar, Neretva Valley, **Radiation-Blocking Lava Tubes**, Sample Tube #14, **400W Power Trade-Offs**, and **Two-Stage Rocket Launch & Microgravity Docking**.

---

## 📁 Project Structure

```text
├── public/
│   └── assets/
│       ├── characters/          # Pixel-art crew portraits (had.png, haz.png, sam.png)
│       ├── cinematic/           # Drop cutscene.mp4 or scene_01..05.mp4 here
│       └── nasa/                # Real NASA Mars mission photographs
├── src/
│   ├── audio/SoundManager.ts    # Procedural Web Audio synthesizer
│   ├── components/              # HomePage, LoadingScreen, CrewSelection, MissionsPage,
│   │                            # MainMenu, HUD, MissionTradeOffModal, DisasterCinematicModal,
│   │                            # DamagedShipStatusModal, PowerBusConsoleModal, NasaFieldGuide, etc.
│   ├── data/
│   │   ├── CrewData.ts          # Crew profiles (Hedeya, Samantha, Hazaloom)
│   │   ├── nasaDatasets.ts      # Curated MSL RAD, MEDA, VEGGIE, DSN datasets, Sols & Trade-offs
│   │   ├── nasaContent.ts       # Kid-friendly dialogue & 11 NASA Space Fact cards
│   │   ├── mission2Data.ts
│   │   └── mission3Data.ts
│   └── game/
│       ├── MarsGameCanvas.tsx   # Phaser lifecycle & scene bridge
│       ├── scenes/              # Mission1Scene.ts, Mission2Scene.ts, Mission3Scene.ts
│       └── textures/            # Procedural Mars terrain, rover, cave & rocket textures
├── index.html
├── metadata.json
└── package.json
```

---

## 🛠️ Tech Stack & Local Setup

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Game Engine:** Phaser (Arcade Physics, multi-scene progression, particle emitters)
- **Audio:** Procedural Web Audio API synthesizer

```bash
# 1. Install dependencies
npm install

# 2. Start the development server on port 3000
npm run dev

# 3. Type-check and build for production
npm run lint
npm run build
```
