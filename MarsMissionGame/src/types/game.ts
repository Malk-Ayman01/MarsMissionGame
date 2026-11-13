export type MissionId = 'mission_1' | 'mission_2' | 'mission_3';
export type ExplorerMode = 'junior' | 'commander';

export type CinematicEventType =
  | 'mission_1_explosion'
  | 'mission_2_marsquake'
  | 'mission_3_launch_crisis'
  | 'mission_3_final_home';

export type MissionStage =

  | 'cinematic_intro'
  | 'stage_0_opening_explore'
  | 'stage_1_leave_habitat'
  | 'stage_2_collect_coupler'
  | 'stage_3_drive_rover'
  | 'stage_4_repair_relay'
  | 'stage_5_escape_storm'
  | 'cinematic_ending'

  | 'm2_cinematic_intro'
  | 'm2_phase_a_route_planning'
  | 'm2_phase_b_geology_water'
  | 'm2_phase_c_environment'
  | 'm2_phase_d_power_crisis'
  | 'm2_phase_e_complete_target'
  | 'm2_stage_1_canyon_transit'
  | 'm2_stage_2_deploy_beacons'
  | 'm2_stage_3_lava_tube_entry'
  | 'm2_stage_4_sample_extraction'
  | 'm2_stage_5_seismic_evacuation'
  | 'm2_cinematic_ending'

  | 'm3_cinematic_intro'
  | 'm3_stage_1_grid_triage'
  | 'm3_stage_2_scarp_traverse'
  | 'm3_stage_3_mav_transfer'
  | 'm3_stage_4_mav_ascent'
  | 'm3_stage_5_orbital_dock'
  | 'm3_cinematic_ending'
  | 'm3_phase_a_diagnosis'
  | 'm3_phase_b_oxygen_safety'
  | 'm3_phase_c_return_navigation'
  | 'm3_phase_d_final_science'
  | 'm3_phase_e_final_debrief'

  | 'mission_complete'
  | 'mission_failed';

export type MarsSolId = 'sol_142_clear' | 'sol_288_dusty' | 'sol_419_solar_storm';

export interface MarsSolScenario {
  id: MarsSolId;
  solLabel: string;
  title: string;
  shortTag: string;
  kidSummary: string;
  scienceSummary: string;
  radiationMsvPerDay: number;
  radiationNote: string;
  dustOpticalDepthTau: number;
  pressurePa: number;
  tempRangeC: string;
  earthDistanceMillionKm: number;
  oneWayDelayMin: number;
  roundTripDelayMin: number;
  sunlightPercentForCrops: number;
  oxygenDrainMultiplier: number;
  batteryDrainMultiplier: number;
  shieldingDrainPerSec: number;
  severity: 'CALM' | 'MODERATE' | 'HIGH';
  datasetSource: string;
}

export interface MissionTradeOffOption {
  id: string;
  missionId: MissionId;
  title: string;
  badge: string;
  gainText: string;
  costText: string;
  realScienceNote: string;
  effects: {
    startingBattery?: number;
    startingCondition?: number;
    oxygenDrainMultiplier?: number;
    batteryDrainMultiplier?: number;
    shieldingDrainMultiplier?: number;
    repairSpeedMultiplier?: number;
    baseAirRefillMultiplier?: number;
    bonusScienceScore?: number;
    ascentSpeedMultiplier?: number;
  };
}

export type BreakerAllocationChoice = 'shield' | 'scanner' | 'eco';
export type Mission1StormChoice = 'auto' | 'wait_earth';
export type Mission2DrillChoice = 'standard' | 'deep_ice';
export type Mission3LaunchChoice = 'heavy_shield' | 'light_autopilot' | 'science_cargo';
export type Mission3HealthBoostChoice = 'fitness' | 'shield' | 'hydroponics';

export interface GameResources {
  oxygen: number;
  battery: number;
  condition: number;
  hasCoupler: boolean;
  isInRover: boolean;
  isInsideHabitat: boolean;
  isDustStormActive: boolean;
  elapsedSeconds: number;
  rockCollisions: number;

  solId?: MarsSolId;
  solLabel?: string;
  radiationMsvPerDay?: number;
  spaceWeatherSummary?: string;
  tradeOffId?: string;
  tradeOffTitle?: string;
  scienceScore?: number;
  caveRadiationBlocked?: boolean;
  breakerChoice?: BreakerAllocationChoice;
  m1StormChoice?: Mission1StormChoice;
  m2DrillChoice?: Mission2DrillChoice;
  m3LaunchChoice?: Mission3LaunchChoice;
  m3HealthBoostChoice?: Mission3HealthBoostChoice;

  selectedRouteId?: 'route_a' | 'route_b' | 'route_c';
  powerAllocation?: {
    navigation: number;
    science: number;
    comms: number;
    safety: number;
  };
  evidenceCollected?: string[];
  geologicalScore?: number;
  hasCoreSample?: boolean;
  diagnosedSubsystem?: string;
  pursuedFinalOptionalScience?: boolean;
  simulatedFaultActive?: boolean;

  signalStrength?: number;
  beaconsPlaced?: number;
  totalBeacons?: number;
  isInLavaTube?: boolean;
  seismicTremor?: boolean;

  breakersConfigured?: boolean;
  dustDevilAlert?: boolean;
  mavAltitudeKm?: number;
  mavVelocityMs?: number;
  mavPitchDegrees?: number;
  mavStage?: 1 | 2;
  mavDocked?: boolean;
}

export type CharacterId =
  | 'hazaloom'
  | 'hedeya'
  | 'samantha'
  | 'zumurda'
  | 'khepri'
  | 'seshat';

export interface DialogueLine {
  id: string;
  speaker: string;
  characterId: CharacterId;
  callsign: string;
  text: string;
  onCompleteStage?: MissionStage;
}

export interface EducationalFact {
  id: string;
  title: string;
  subtitle: string;
  category:
    | 'GEOLOGY'
    | 'ROVER TECH'
    | 'COMMUNICATIONS'
    | 'ATMOSPHERE'
    | 'METEOROLOGY'
    | 'NAVIGATION'
    | 'POWER SYSTEMS'
    | 'SUBTERRANEAN'
    | 'SPACE BIOLOGY';
  imageSrc: string;
  imageCaption: string;
  nasaFact: string;
  olderKidsNote?: string;
  classroomPrompt?: string;
  gameContext: string;
  sourceName: string;
  sourceUrl: string;
  missionId: MissionId;
  unlockedAtStage: MissionStage;

  instrumentName?: string;
  solObservation?: string;
  datasetType: 'REAL_NASA_OBSERVATION' | 'DERIVED_SCIENTIFIC_DATA' | 'SIMULATED_SCENARIO';
}

export interface Waypoint {
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  label: string;
  distanceMeters: number;
  stage: MissionStage;
}

export interface RouteOption {
  id: 'route_a' | 'route_b' | 'route_c';
  title: string;
  subtitle: string;
  distanceMeters: number;
  estimatedMinutes: number;
  terrainRisk: 'LOW' | 'MODERATE' | 'HIGH';
  estimatedBatteryCostPercent: number;
  scientificValue: string;
  terrainDescription: string;
  tradeOffSummary: string;
}

export interface EvidenceCard {
  id: string;
  title: string;
  sol: string;
  instrument: string;
  imageSrc: string;
  observationSummary: string;
  scientificInterpretation: string;
  uncertaintyNotes: string;
  relevanceToWater: 'HIGH' | 'MODERATE' | 'INSUFFICIENT';
}

export interface MissionStats {
  missionId: MissionId;
  elapsedSeconds: number;
  finalOxygen: number;
  finalBattery: number;
  finalCondition: number;
  factsDiscovered: number;
  totalFacts: number;
  rockCollisions: number;

  solScenario?: MarsSolScenario;
  tradeOffChoice?: MissionTradeOffOption;
  tradeOffTitle?: string;
  breakerChoice?: BreakerAllocationChoice;
  m1StormChoice?: Mission1StormChoice;
  m2DrillChoice?: Mission2DrillChoice;
  m3LaunchChoice?: Mission3LaunchChoice;
  m3HealthBoostChoice?: Mission3HealthBoostChoice;
  explorerMode?: ExplorerMode;
  scienceScore?: number;

  routeChoice?: string;
  scientificScore?: number;
  safetyScore?: number;
  hasCoreSample?: boolean;
  pursuedOptionalScience?: boolean;
  beaconsPlaced?: number;
}
