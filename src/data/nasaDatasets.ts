import { MarsSolId, MarsSolScenario, MissionId, MissionTradeOffOption } from '../types/game';

export const MARS_SOL_SCENARIOS: MarsSolScenario[] = [
  {
    id: 'sol_142_clear',
    solLabel: 'Sol 142 · Sunny Day',
    title: 'Clear Sunny Mars Day',
    shortTag: 'Sunny Sky · Safe Rays · 14m Radio Wait',
    kidSummary:
      'Clear red sky! Medium sunlight helps space veggies grow, and talking to Earth takes 7 minutes each way.',
    scienceSummary:
      'Based on Perseverance MEDA clear-sky readings (Tau 0.42, ~742 Pa), Curiosity RAD quiet-Sun surface dose (~0.64 mSv/day), and Mars at ~126 million km from Earth (7 min one-way light time).',
    radiationMsvPerDay: 0.64,
    radiationNote: 'Low (0.64 mSv/day)',
    dustOpticalDepthTau: 0.42,
    pressurePa: 742,
    tempRangeC: '-21°C day / -79°C night',
    earthDistanceMillionKm: 126,
    oneWayDelayMin: 7.0,
    roundTripDelayMin: 14.0,
    sunlightPercentForCrops: 43,
    oxygenDrainMultiplier: 1.0,
    batteryDrainMultiplier: 1.0,
    shieldingDrainPerSec: 0.08,
    severity: 'CALM',
    datasetSource: 'Curated NASA Curiosity RAD, Perseverance MEDA & DSN Light-Time Snapshot',
  },
  {
    id: 'sol_288_dusty',
    solLabel: 'Sol 288 · Dusty Day',
    title: 'Dusty Sky & Weak Sunlight',
    shortTag: 'Dusty Sky · Weak Sun · 28m Radio Wait',
    kidSummary:
      'Thick orange dust blocks sunlight! Space veggies and rover wheels need more power, and Earth takes 28 minutes to reply.',
    scienceSummary:
      'Based on Perseverance MEDA dusty-season readings (Tau 1.65 cutting surface sunlight to ~18%, ~758 Pa), Curiosity RAD (~0.67 mSv/day), and ~252 million km Earth-Mars distance (14 min one-way lag).',
    radiationMsvPerDay: 0.67,
    radiationNote: 'Medium (0.67 mSv/day + dust)',
    dustOpticalDepthTau: 1.65,
    pressurePa: 758,
    tempRangeC: '-34°C day / -84°C night',
    earthDistanceMillionKm: 252,
    oneWayDelayMin: 14.0,
    roundTripDelayMin: 28.0,
    sunlightPercentForCrops: 18,
    oxygenDrainMultiplier: 1.05,
    batteryDrainMultiplier: 1.3,
    shieldingDrainPerSec: 0.12,
    severity: 'MODERATE',
    datasetSource: 'Curated NASA Perseverance MEDA & DSN Distance Snapshot',
  },
  {
    id: 'sol_419_solar_storm',
    solLabel: 'Sol 419 · Solar Storm!',
    title: 'Solar Particle Storm Alert!',
    shortTag: 'High Space Rays! · 42m Radio Wait',
    kidSummary:
      'A Sun burst sends extra space rays! Mars is far from Earth (42 min reply!), so your crew must stay shielded and decide fast.',
    scienceSummary:
      'Modeled on NASA Curiosity RAD Sept 2017 Solar Particle Event (~3.8 mSv/day, ~6x normal) near maximum Earth-Mars separation (~378 million km = 21 min one-way, 42 min round-trip radio delay).',
    radiationMsvPerDay: 3.8,
    radiationNote: 'High Storm (3.80 mSv/day)',
    dustOpticalDepthTau: 0.55,
    pressurePa: 725,
    tempRangeC: '-19°C day / -76°C night',
    earthDistanceMillionKm: 378,
    oneWayDelayMin: 21.0,
    roundTripDelayMin: 42.0,
    sunlightPercentForCrops: 40,
    oxygenDrainMultiplier: 1.0,
    batteryDrainMultiplier: 1.05,
    shieldingDrainPerSec: 0.34,
    severity: 'HIGH',
    datasetSource: 'Curated NASA MSL RAD Sept 2017 Solar Storm & DSN Max-Lag Snapshot',
  },
];

export function getSolScenarioById(id?: MarsSolId): MarsSolScenario {
  return MARS_SOL_SCENARIOS.find((s) => s.id === id) ?? MARS_SOL_SCENARIOS[0];
}

export function pickRandomSolScenario(excludeId?: MarsSolId): MarsSolScenario {
  const pool = excludeId
    ? MARS_SOL_SCENARIOS.filter((s) => s.id !== excludeId)
    : MARS_SOL_SCENARIOS;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? MARS_SOL_SCENARIOS[0];
}

export const MISSION_TRADE_OFFS: Record<MissionId, MissionTradeOffOption[]> = {
  mission_1: [
    {
      id: 'm1_auto_relay_power',
      missionId: 'mission_1',
      title: 'Smart Auto-Radio',
      badge: 'RADIO & POWER',
      gainText: 'Makes the radio signal easier to tune and uses 25% less Rover Battery while driving.',
      costText: 'The lighter rover frame loses Condition 25% faster from space rays and rock bumps.',
      realScienceNote:
        'Because radio messages take about 3 to 22 minutes each way, NASA builds smart onboard computers so rovers do not wait for Earth.',
      effects: {
        batteryDrainMultiplier: 0.75,
        shieldingDrainMultiplier: 1.25,
      },
    },
  ],

  mission_2: [
    {
      id: 'm2_canyon_shelter',
      missionId: 'mission_2',
      title: 'Deep Canyon Wall Path',
      badge: 'SHIELDING',
      gainText: 'Tall canyon cliffs block almost half of space rays on your drive!',
      costText: 'Deep loose sand uses 35% more Rover Battery while driving.',
      realScienceNote:
        'Steep cliffs block part of the sky to cut space radiation, while soft sand makes rover wheels work harder.',
      effects: {
        shieldingDrainMultiplier: 0.55,
        batteryDrainMultiplier: 1.35,
      },
    },
    {
      id: 'm2_high_ridge',
      missionId: 'mission_2',
      title: 'Fast Hard-Rock Path',
      badge: 'POWER SAVER',
      gainText: 'Flat solid rock saves 25% Rover Battery on your way to the cave!',
      costText: 'Open high ground exposes your crew to 40% more space rays outside.',
      realScienceNote:
        'Flat bedrock saves rover power (great for driving), but open hilltops have zero natural radiation cover.',
      effects: {
        batteryDrainMultiplier: 0.75,
        shieldingDrainMultiplier: 1.4,
      },
    },
    {
      id: 'm2_deep_science',
      missionId: 'mission_2',
      title: 'Cave Farm & Ice Test Kit',
      badge: 'FOOD & SCIENCE',
      gainText: 'Earns +30 Science Points checking if dark caves can hold water ice & greenhouses!',
      costText: 'Heavy gear starts Shielding at 86% and uses 15% more Rover Battery.',
      realScienceNote:
        'Carrying extra underground radar and water sensors uses precious weight and battery power on Mars rovers.',
      effects: {
        startingCondition: 86,
        batteryDrainMultiplier: 1.15,
        bonusScienceScore: 30,
      },
    },
  ],

  mission_3: [
    {
      id: 'm3_storm_shield',
      missionId: 'mission_3',
      title: 'Storm & Ray Armor',
      badge: 'SHIELDING',
      gainText: 'Cuts dust tornado and space ray damage nearly in half!',
      costText: 'Heavy suit armor uses 20% more Suit Air when walking outside.',
      realScienceNote:
        'Extra thermal and radiation layers protect astronauts during launch prep, at the cost of extra suit weight.',
      effects: {
        shieldingDrainMultiplier: 0.55,
        oxygenDrainMultiplier: 1.2,
      },
    },
    {
      id: 'm3_light_rocket',
      missionId: 'mission_3',
      title: 'Auto-Pilot Light Rocket',
      badge: 'RADIO & ROCKET',
      gainText: 'Handles the Earth radio delay, flies 18% faster, and saves 20% Rover Battery!',
      costText: 'Thin frame takes 30% more wear from dust tornadoes & space rays.',
      realScienceNote:
        'Earth cannot steer a Mars rocket live because radio takes about 3 to 22 minutes each way, so the rocket steers itself.',
      effects: {
        batteryDrainMultiplier: 0.8,
        shieldingDrainMultiplier: 1.3,
        ascentSpeedMultiplier: 1.18,
      },
    },
    {
      id: 'm3_food_ration_pod',
      missionId: 'mission_3',
      title: 'Fresh Veggie Lunch Pod',
      badge: 'FOOD & SCIENCE',
      gainText: 'Brings fresh Mars-grown food into orbit + earns +30 Science Points!',
      costText: 'Food cooler borrows rover energy, starting Rover Battery at 82%.',
      realScienceNote:
        'Returning astronauts spend months floating in microgravity; fresh space-grown veggies keep vitamins strong for the trip home.',
      effects: {
        startingBattery: 82,
        bonusScienceScore: 30,
      },
    },
  ],
};

export interface GlossaryEntry {
  term: string;
  simpleMeaning: string;
  scienceDetail: string;
}

export const SCIENCE_GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Sol',
    simpleMeaning: 'One Mars day! A Mars day is 24 hours and 39 minutes long.',
    scienceDetail:
      'NASA uses "sol" instead of Earth days to track rover operations because Mars rotates ~39.5 minutes slower than Earth.',
  },
  {
    term: 'Radiation Dose',
    simpleMeaning: 'Invisible fast rays from the Sun and deep space that can hurt astronauts.',
    scienceDetail:
      'Measured in millisieverts (mSv). Curiosity RAD measured ~0.64–0.67 mSv/day normally, spiking over 3.8 mSv/day during solar storms.',
  },
  {
    term: 'Shielding',
    simpleMeaning: 'Walls, rocks, or special suit layers that block space rays and dust.',
    scienceDetail:
      'Mars lacks a global magnetic field and thick atmosphere, so astronauts rely on habitat shielding, regolith, or volcanic lava tubes.',
  },
  {
    term: 'Hydroponics (Space Farming)',
    simpleMeaning: 'Growing veggies in clean water + nutrients without Martian dirt!',
    scienceDetail:
      'Real Martian soil contains toxic perchlorate salts (~0.5–1%). NASA VEGGIE & APH grow lettuce, radishes, and peppers in clean water matrices using tuned red/blue LEDs.',
  },
  {
    term: 'Light-Time Delay',
    simpleMeaning: 'How long a radio message takes traveling at light speed between Earth and Mars!',
    scienceDetail:
      'At c = 299,792 km/s over 55–401 million km, one-way radio messages take 3 to 22 minutes (up to 44 minutes for a reply!).',
  },
  {
    term: 'Microgravity',
    simpleMeaning: 'The tiny floating feeling astronauts have when orbiting in space.',
    scienceDetail:
      'In orbit around Mars or Earth, spacecraft and astronauts are in continuous free-fall, creating near-weightlessness (~10^-6 g).',
  },
  {
    term: 'Lava Tube',
    simpleMeaning: 'A giant underground tunnel left behind after ancient volcano lava flowed away.',
    scienceDetail:
      'Thick basalt roofs (tens of meters of rock) block ~95%+ of solar and cosmic radiation and keep temperatures much steadier.',
  },
  {
    term: 'Tau (Dust Depth)',
    simpleMeaning: 'A number showing how dusty and hazy the Mars sky is.',
    scienceDetail:
      'MEDA optical depth Tau ~0.4 is a clear sky; Tau > 1.5–3.0 means heavy dust cutting sunlight for solar panels and greenhouses.',
  },
];

export interface DatasetProvenanceItem {
  id: string;
  datasetName: string;
  instrument: string;
  realValuesUsed: string;
  howGameUsesIt: string;
  disclosure: string;
  sourceUrl: string;
}

export const NASA_DATA_PROVENANCE: DatasetProvenanceItem[] = [
  {
    id: 'msl_rad',
    datasetName: 'Mars Surface Radiation Assessment (MSL Curiosity RAD)',
    instrument: 'Curiosity RAD Detector',
    realValuesUsed:
      '~0.64–0.67 mSv/day quiet background; ~3.8+ mSv/day Solar Particle Event (Sept 2017); ~95% reduction under thick basalt rock.',
    howGameUsesIt:
      'Drives Shielding wear per Sol weather scenario and rewards sheltering inside the habitat or Mission 2 lava cave.',
    disclosure: 'Curated real NASA dataset embedded offline (not a live API stream).',
    sourceUrl: 'https://science.nasa.gov/mission/msl-curiosity/',
  },
  {
    id: 'm2020_meda',
    datasetName: 'Jezero Crater Weather & Dust Measurements (Perseverance MEDA)',
    instrument: 'Perseverance MEDA Weather Station',
    realValuesUsed:
      'Surface pressure ~710–760 Pa (~0.7% of Earth); temperatures -18°C to -84°C; optical depth Tau 0.42 (clear) vs Tau 1.65+ (dusty).',
    howGameUsesIt:
      'Sets Rover Battery & greenhouse grow-light power penalties across Clear, Dusty, and Solar Storm Sols.',
    disclosure: 'Curated real NASA dataset embedded offline (not a live API stream).',
    sourceUrl: 'https://mars.nasa.gov/mars2020/spacecraft/instruments/meda/',
  },
  {
    id: 'nasa_veggie',
    datasetName: 'Space Crop & Mars Food Production (NASA VEGGIE & APH)',
    instrument: 'ISS Veggie / Advanced Plant Habitat & Phoenix MECA',
    realValuesUsed:
      'Mars receives only ~43% of Earth sunlight (~18% during dust storms); Martian soil has ~0.5–1% toxic perchlorates; plants recycle CO₂ into O₂.',
    howGameUsesIt:
      'Drives the Hydroponic Food & Air trade-off: crops boost base oxygen recovery & science points while LED grow lights draw extra power.',
    disclosure: 'Curated real NASA crop & Mars regolith chemistry data (offline snapshot).',
    sourceUrl: 'https://www.nasa.gov/missions/station/iss-research/growing-plants-in-space/',
  },
  {
    id: 'nasa_dsn',
    datasetName: 'Earth–Mars Communication Light-Time Delay (Deep Space Network)',
    instrument: 'NASA Deep Space Network (Goldstone, Madrid, Canberra)',
    realValuesUsed:
      'Earth–Mars distance 55–401 million km; speed of light ~299,792 km/s → 3 to 22 min one-way lag (7, 14, or 21 min in game Sols).',
    howGameUsesIt:
      'Shows live Earth-Mars light-delay timing, drives the interactive Radio Delay Simulator, and rewards autonomous rover/rocket systems.',
    disclosure: 'Computed from real orbital distances & speed of light (offline snapshot).',
    sourceUrl: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/deep-space-network/',
  },
  {
    id: 'm2020_rimfax',
    datasetName: 'Subsurface Ground-Penetrating Radar & Sample Return',
    instrument: 'Perseverance RIMFAX & Coring Drill',
    realValuesUsed:
      'Radar sounding ~10 meters underground; titanium sample tubes (~10–15 g rock core); two-stage Mars Ascent Vehicle orbital rendezvous.',
    howGameUsesIt:
      'Powers the Mission 2 acoustic sonar meter, ground sensor placement, Tube #14 rock core drill, and Mission 3 MAV launch.',
    disclosure: 'Curated real NASA mission documentation and imagery.',
    sourceUrl: 'https://mars.nasa.gov/mars2020/spacecraft/instruments/rimfax/',
  },
];
