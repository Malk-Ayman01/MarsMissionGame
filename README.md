# Mars Mission: 

### A 2D Mars survival game where every choice costs something: and every cost is real science.

Built for the **NASA Space Apps Challenge 2026: Build a Junior Astronaut Mission Trainer**.

Three astronauts have landed at **Jezero Crater, Mars**. Then something breaks, the radio goes silent, and Earth does not know they are stranded. Players guide them through three linked missions: fix the radio, explore a lava cave, and launch home. Along the way they make the same kinds of trade-offs real mission planners make: *a choice that saves power today can cost oxygen or protection tomorrow.*

The crew are not just "roles". They are **three people who have someone waiting for them on Earth.** Every decision is really a decision about getting them home.

---

## The Crew

| Crew member | Who is waiting on Earth | Gameplay perk (and its cost) |
|---|---|---|
| **Hedeya** | Her young daughter, Lina, who crosses off every day on a calendar | Stronger shielding and faster Suit Air refills at base (slightly heavier battery gear) |
| **Samantha** | Her dad, who still looks for the red dot of Mars through his old telescope | Saves 15% rover battery and earns +10 bonus science (lighter ray protection) |
| **Hazaloom** | Little sister Noor and their mother, who keep a seat at the table | Faster rover and softer rock bumps (uses a little more Suit Air on foot) |

The player picks a lead partner before launch. Every perk has a cost, so there is no "best" crew member, only different strategies.

---

## How the Game Works

### Three core resources (kept simple for ages 7-12)

| Resource | What it means | What drains it |
|---|---|---|
| **Suit Air** (life support) | How long the crew can stay outside | Time outdoors, dust storms, heavy suits; refills inside the habitat |
| **Battery** (power) | Rover and equipment power | Driving, deep sand, dusty skies, grow-lights |
| **Shielding** (radiation protection) | The crew's protection from space radiation and dust | Radiation, dust tornadoes, rock bumps |

### No free choices

Before each mission the player picks a **strategy trade-off**. Every option has a clear gain and a clear cost. For example:

- **Super Ray Shield Suit:** blocks half of space rays and dust hits, but uses Suit Air 25% faster.
- **Space Veggie Garden:** refills Suit Air 45% faster at base and gives bonus science, but grow-lights borrow power so the Battery starts at 78%.
- **Deep Canyon Wall Path:** cliffs block almost half of space rays, but loose sand uses 35% more Battery.
- **Fast Hard-Rock Path:** saves 25% Battery, but leaves the crew exposed to 40% more space rays.

After each mission, a summary shows **what the player gained, what it cost, the real science behind the choice, and the final Suit Air, Battery and Shield.** Players see the consequences of their decision, not just a score.

### Replayability

- Three **Mars Sol weather scenarios** change radiation, dust and power: *Sol 142 Clear*, *Sol 288 Dusty Sky*, *Sol 419 Solar Storm*.
- Different trade-offs, different crew partners, and different mini-game choices change how each mission plays out.
- Losing is a chance to try another strategy, not a dead end.

---

## The Three Missions

1. **Mission 1: The Lost Signal**
   - Press **E** at the spacecraft check pad to trigger the emergency cutscene, then review the damaged-ship status.
   - Collect a spare part, drive the rover, repair the radio tower, and return to the habitat before the dust storm arrives.
   - *Teaches:* spare-parts maintenance, dust storms, and why Mars-to-Earth radio messages take minutes.

2. **Mission 2: The Lava Cave**
   - Follow the RIMFAX ground-penetrating radar signal into Neretva Vallis and place sensors.
   - Descend into a lava tube, drill **Rock Core Tube #14**, and escape before a Marsquake.
   - *Teaches:* radar, ancient river valleys, and why lava tubes block most space radiation.

3. **Mission 3: Rocket Home**
   - Balance the rover's electrical systems on the **Power Bus Console** while staying under a **400 W** budget.
   - Load the sample, launch the Mars Ascent Vehicle, separate the rocket stage, and dock with the Earth Return Orbiter.
   - *Teaches:* power budgeting, staged rocket flight, and orbital docking.

---

## Real NASA Data

We use real NASA data wherever possible, and we label what is live and what is a saved snapshot.

| Data | Source | How the game uses it | Live or snapshot |
|---|---|---|---|
| Solar activity (flares, solar particle events, CMEs) | **NASA DONKI** | Sets the current space-weather severity, which changes the game's radiation level | **Live** when the server can reach NASA; otherwise an offline snapshot, clearly labeled |
| Astronaut radiation and space-biology findings | **NASA OSDR** (RadLab and space-biology studies) | Field Guide health and radiation comparisons | Live attempt with a curated offline fallback, labeled |
| Mars surface radiation | **Curiosity rover MSL RAD** | Baseline radiation values (about 0.64 to 3.80 mSv/day) | Curated dataset |
| Mars weather and dust | **Perseverance MEDA** | Sol scenarios (pressure, dust optical depth) | Curated dataset |
| Radio delay | **NASA Deep Space Network** | 7 to 21 minute one-way Earth-Mars signal delay | Curated dataset |
| Plant growth | **NASA Veggie and Advanced Plant Habitat** | Greenhouse trade-offs | Curated dataset |
| Subsurface radar | **RIMFAX** | Mission 2 story and fact cards | Curated dataset |
| Terrain imagery | **NASA Mars Trek** and mission photos | Field Guide and mission screens | Imagery |

**An honest note on the radiation numbers:** live DONKI data decides whether space weather is *calm*, *moderate* or *high*. The game then maps each level to a radiation value taken from real Curiosity RAD measurements (0.64, 1.15 or 3.8 mSv/day). The severity is live; the dose values are curated from real measurements.

Every fact card shows its source, and the Field Guide shows whether each dataset is live or offline.

---

## Learning Supports

- **Two reading levels:** Junior Explorer (ages 7-10) uses plain English and gentler gameplay; Senior Explorer (ages 11+) adds exact NASA readings and discussion questions, so older siblings, parents and classrooms can play too.
- **Word Helpers** explain terms in context (Sol, radiation dose, hydroponics, light-time delay, microgravity, lava tube).
- **NASA Field Guide** (press **M**): 11 unlockable fact cards, a datasets tab, and an easy-word helper.
- **Optional read-aloud** audio, cutscene subtitles, and a mute button.
- **No account or download needed.** It runs in the browser.

---

## Controls

| Input | Action |
|---|---|
| **W A S D / Arrow keys** | Walk, drive the rover, or steer the rocket |
| **E** | Interact (check the ship, pick up crates, enter or exit the rover, repair, place sensors, drill, launch) |
| **Space / Enter** | Advance dialogue; **Space** drops the rocket stage in Mission 3 |
| **M** | Open the NASA Field Guide |
| **Esc** | Pause menu and controls |
| **Speaker icon** | Mute or unmute sound |

---

## Cutscenes and AI Disclosure

The Mission 1 emergency and Mission 2 Marsquake cutscenes are short videos that **were generated with AI video tools** and edited by our team. They are story illustrations only. The NASA science in the game comes from the datasets above, not from the videos. Mission 3 uses gameplay only and has no cutscene video.

To add or replace the videos, place these files in `public/assets/cinematic/`:

```text
public/assets/cinematic/mission1_event.mp4
public/assets/cinematic/mission2_event.mp4
```

If a video file is missing, the game still works and the player can continue from the cutscene screen.

---

## Run It Yourself

You need Node.js installed.

```bash
# 1. Install dependencies
npm install

# 2. Create a .env file in the project root with your free NASA key
#    (get one at https://api.nasa.gov)
#    NASA_API_KEY=your_key_here

# 3. Start the development server on port 3000
npm run dev

# 4. Check the code and build for production
npm run lint
npm run build
```

### Live NASA data in production

Live DONKI data comes from the Node server (`server.ts`), so deploy on a host that runs Node, not a static-only host. Settings:

- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start:live`
- **Environment variables:** `NODE_ENV=production` and `NASA_API_KEY=your_key`

If NASA cannot be reached, the game automatically uses its offline snapshot and labels it as offline. It never presents a snapshot as live data.

To check live data, open `/api/nasa/space-weather` and look for `"isLive": true`.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Game engine:** Phaser (Arcade Physics, multi-scene missions, particle effects)
- **Server:** Express (NASA data endpoints and caching)
- **Audio:** Procedural Web Audio sound effects

## Project Structure

```text
public/assets/
  characters/     Pixel-art crew portraits
  cinematic/      Mission 1 and 2 cutscene videos
  nasa/           Real NASA Mars photographs
src/
  audio/          Sound effects and read-aloud
  components/     Menus, HUD, crew screens, mini-games, Field Guide, mission summary
  data/           Crew, NASA datasets, fact cards, mission data
  game/           Phaser scenes (Mission1Scene, Mission2Scene, Mission3Scene)
  services/       NASA API client
server.ts         Express server: live NASA endpoints, caching, offline fallback
```

---

## Challenge Checklist

| Challenge goal | How we address it |
|---|---|
| Kids ages 7-12 manage a Moon or Mars outpost | A three-mission Mars campaign with two reading levels |
| Real trade-offs with no free choice | Every strategy has a stated gain and cost, with a result summary |
| Life support, power, shielding, food, communication delay | Suit Air, Battery, Shielding, a greenhouse trade-off, and the radio-delay mechanic |
| Use real NASA data | DONKI, OSDR, Curiosity RAD, Perseverance MEDA, DSN, Veggie, RIMFAX, Mars Trek |
| Attribute sources in the tool | Source lines on fact cards and live/offline labels in the Field Guide |
| Do not present static data as live | Offline data is always labeled; failed live calls fall back honestly |
| Replayability | Three Sol scenarios, multiple trade-offs and crew partners |
| Plain language | Word Helpers and two reading levels |

---

*This is an independent Space Apps entry. It is not an official or NASA-endorsed simulation. Gameplay values are simplified for learning; the source data is credited above.*
