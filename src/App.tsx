import React, { useState, useRef, useCallback } from 'react';
import { MarsGameCanvas } from './game/MarsGameCanvas';
import { SceneCallbacks } from './game/scenes/Mission1Scene';
import { HUD } from './components/HUD';
import { DialogueOverlay } from './components/DialogueOverlay';
import { EducationalModal } from './components/EducationalModal';
import { MissionCompleteModal } from './components/MissionCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseMenu } from './components/PauseMenu';
import { NasaFieldGuide } from './components/NasaFieldGuide';
import { MainMenu } from './components/MainMenu';
import { PowerBusConsoleModal } from './components/PowerBusConsoleModal';
import { DisasterCinematicModal } from './components/DisasterCinematicModal';
import { DamagedShipStatusModal } from './components/DamagedShipStatusModal';
import { RadioRepairMiniGameModal } from './components/RadioRepairMiniGameModal';
import { RockDrillMiniGameModal } from './components/RockDrillMiniGameModal';
import { CrewHealthActionModal } from './components/CrewHealthActionModal';
import { DecisionChoiceItem, MissionDecisionModal } from './components/MissionDecisionModal';
import HomePage from './components/HomePage';
import LoadingScreen from './components/LoadingScreen';
import CrewSelectionPage from './components/CrewSelectionPage';
import CrewDetailsPage from './components/CrewDetailsPage';
import RotateDevice from './components/RotateDevice';
import { CrewMember } from './data/CrewData';
import { DIALOGUE_SCRIPTS, NASA_FACTS } from './data/nasaContent';
import { getSolScenarioById, MISSION_TRADE_OFFS, pickRandomSolScenario } from './data/nasaDatasets';
import { fetchSpaceWeather, SpaceWeatherData } from './services/nasaApi';
import {
  BreakerAllocationChoice,
  CinematicEventType,
  ExplorerMode,
  GameResources,
  MarsSolScenario,
  Mission2DrillChoice,
  Mission3HealthBoostChoice,
  Mission3LaunchChoice,
  MissionStage,
  MissionTradeOffOption,
  Waypoint,
  DialogueLine,
  EducationalFact,
  MissionStats,
  MissionId,
} from './types/game';
import { sounds } from './audio/SoundManager';

type GameScreenState =
  | 'home'
  | 'loading'
  | 'crew_selection'
  | 'crew_details'
  | 'menu'
  | 'playing'
  | 'mission_complete'
  | 'mission_failed';

const COMPLETED_STORAGE_KEY = 'mars_mission_completed_v1';

// -------------  MODIFIED PART ------------
type Mission2QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

const MISSION_2_QUIZ: Record<string, Mission2QuizQuestion> = {
  rimfax: {
    id: 'rimfax',
    question: 'What does the RIMFAX sensor do?',
    options: [
      'It sends radar signals underground to reveal hidden layers.',
      'It measures the astronaut’s heart rate.',
      'It produces oxygen from rocks.',
    ],
    correctAnswer: 0,
    explanation:
      'RIMFAX sends radar signals into the ground to help reveal what is hidden beneath the surface.',
  },

  sensors: {
    id: 'sensors',
    question: 'Why do we need Sensor 2 after placing Sensor 1?',
    options: [
      'To recharge the Rover battery.',
      'The two sensor readings help locate a hidden underground lava cave.',
      'To send the rock sample back to Earth.',
    ],
    correctAnswer: 1,
    explanation:
      'The two sensor pings work together to help identify the hidden cave.',
  },

  cave: {
    id: 'cave',
    question: 'Why is the lava cave a safer place during the mission?',
    options: [
      'Its thick rock helps block about 95% of harmful space rays.',
      'It makes the Rover move faster.',
      'It produces sunlight for the crew.',
    ],
    correctAnswer: 0,
    explanation:
      'The cave’s thick rock provides shielding from much of the harmful space radiation.',
  },

  sample: {
    id: 'sample',
    question: 'Why is Rock Tube #14 stored in a clean titanium tube?',
    options: [
      'To make it heavier.',
      'To keep the sample from being contaminated.',
      'To protect it from sunlight only.',
    ],
    correctAnswer: 1,
    explanation:
      'The sample is sealed in a clean container to help prevent contamination.',
  },

  marsquake: {
    id: 'marsquake',
    question: 'What should the crew do when a Marsquake starts?',
    options: [
      'Stay beside the drill.',
      'Drive deeper into the cave.',
      'Run toward the blue Cave Exit circle.',
    ],
    correctAnswer: 2,
    explanation:
      'The mission tells the crew to escape falling rocks and reach the blue Cave Exit.',
  },
};

// -------------------------

function loadCompletedMissions(): MissionId[] {
  try {
    const raw = window.localStorage.getItem(COMPLETED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (id): id is MissionId => id === 'mission_1' || id === 'mission_2' || id === 'mission_3'
    );
  } catch {
    return [];
  }
}

function isMissionUnlocked(missionId: MissionId, completed: MissionId[]): boolean {
  if (missionId === 'mission_1') return true;
  if (missionId === 'mission_2') return completed.includes('mission_1');
  if (missionId === 'mission_3') return completed.includes('mission_2');
  return false;
}

export default function App() {
  const [activeMission, setActiveMission] = useState<MissionId>('mission_1');
  const [explorerMode, setExplorerMode] = useState<ExplorerMode>('junior');
  const [completedMissions, setCompletedMissions] = useState<MissionId[]>(loadCompletedMissions);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [screenState, setScreenState] = useState<GameScreenState>('home');
  const [stage, setStage] = useState<MissionStage>('stage_0_opening_explore');

  const [resources, setResources] = useState<GameResources>({
    oxygen: 100,
    battery: 100,
    condition: 100,
    hasCoupler: false,
    isInRover: false,
    isInsideHabitat: true,
    isDustStormActive: false,
    elapsedSeconds: 0,
    rockCollisions: 0,
    signalStrength: 20,
    beaconsPlaced: 0,
    totalBeacons: 2,
    hasCoreSample: false,
    isInLavaTube: false,
    seismicTremor: false,
  });

  const [activeDialogue, setActiveDialogue] = useState<DialogueLine[] | null>(null);
  const [factQueue, setFactQueue] = useState<EducationalFact[]>([]);
  const activeEducationalFact = factQueue[0] ?? null;
  const [unlockedFactIds, setUnlockedFactIds] = useState<string[]>([]);
  const [waypoint, setWaypoint] = useState<Waypoint | null>(null);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // -------------- MODIFIED PART -------------
  const [mission2TermPopup, setMission2TermPopup] = useState<{
  id: string;
  title: string;
  explanation: string;
} | null>(null);

const [pendingMission2QuizId, setPendingMission2QuizId] =
  useState<string | null>(null);

const [activeMission2QuizId, setActiveMission2QuizId] =
  useState<string | null>(null);

const [selectedMission2Answer, setSelectedMission2Answer] =
  useState<number | null>(null);

const [mission2QuizResults, setMission2QuizResults] = useState<
  { quizId: string; selectedAnswer: number; correct: boolean }[]
>([]);

const activeMission2Quiz = activeMission2QuizId
  ? MISSION_2_QUIZ[activeMission2QuizId] ?? null
  : null;

const activeMission2QuizResult = activeMission2Quiz
  ? mission2QuizResults.find(
      (result) => result.quizId === activeMission2Quiz.id
    )
  : undefined;

  // -----------------------

  const [isPaused, setIsPaused] = useState(false);
  const [isFieldGuideOpen, setIsFieldGuideOpen] = useState(false);
  const [isBreakerConsoleOpen, setIsBreakerConsoleOpen] = useState(false);
  const [isRadioMiniGameOpen, setIsRadioMiniGameOpen] = useState(false);
  const [isDrillMiniGameOpen, setIsDrillMiniGameOpen] = useState(false);
  const [isCrewHealthModalOpen, setIsCrewHealthModalOpen] = useState(false);
  const [factToastTitle, setFactToastTitle] = useState<string | null>(null);
  const [activeEventCinematic, setActiveEventCinematic] = useState<CinematicEventType | null>(null);
  const [isDamagedStatusOpen, setIsDamagedStatusOpen] = useState(false);
  const [isMission1RoverPlanOpen, setIsMission1RoverPlanOpen] = useState(false);
  const [isMission2PlanOpen, setIsMission2PlanOpen] = useState(false);
  const [isMission3LaunchModalOpen, setIsMission3LaunchModalOpen] = useState(false);

  const [spaceWeather, setSpaceWeather] = useState<SpaceWeatherData | null>(null);
  const [replaySolOverride, setReplaySolOverride] = useState<MarsSolScenario | null>(null);
  const [healthScienceBonus, setHealthScienceBonus] = useState(0);
  const [m3HealthBoostChoice, setM3HealthBoostChoice] = useState<Mission3HealthBoostChoice | undefined>(undefined);
  const [m3BonusCondition, setM3BonusCondition] = useState(0);
  const [m3BonusOxygen, setM3BonusOxygen] = useState(0);

  React.useEffect(() => {
    fetchSpaceWeather().then((data) => {
      if (data) setSpaceWeather(data);
    });
  }, []);

  const activeSolScenario: MarsSolScenario = React.useMemo(() => {
    if (replaySolOverride) return replaySolOverride;

    const base =
      spaceWeather?.severity === 'HIGH'
        ? getSolScenarioById('sol_419_solar_storm')
        : spaceWeather?.severity === 'MODERATE'
        ? getSolScenarioById('sol_288_dusty')
        : getSolScenarioById('sol_142_clear');

    if (!spaceWeather) return base;
    const radMsv = spaceWeather.solarRadiationMsvDay ?? base.radiationMsvPerDay;
    const scaledShieldDrain = Number(
      (0.08 * Math.max(0.8, Math.min(4.5, radMsv / 0.64))).toFixed(3)
    );
    return {
      ...base,
      radiationMsvPerDay: radMsv,
      shieldingDrainPerSec: scaledShieldDrain,
      solLabel: `${base.solLabel.split(' · ')[0]} · ${spaceWeather.stormTitle}`,
    };
  }, [spaceWeather, replaySolOverride]);

  const gameRef = useRef<{
    resetMission: (waitForPlan?: boolean) => void;
    solveBreakerTriage?: (choice?: BreakerAllocationChoice) => void;
    startPostDisasterMission?: () => void;
    startPostQuakeEvacuation?: () => void;
    startMavAscentAfterEvent?: () => void;
    confirmLaunchChoice?: (choice: Mission3LaunchChoice) => void;
    completeRadioRepairMiniGame?: (choice?: 'auto' | 'wait_earth') => void;
    completeDrillMiniGame?: (batteryUsed?: number, drillChoice?: Mission2DrillChoice) => void;
    setReadingPaused?: (paused: boolean) => void;
    setSolScenario?: (sol: MarsSolScenario) => void;
    setCrewSpecialty?: (crewId?: string) => void;
    setExplorerMode?: (mode: ExplorerMode) => void;
    applyMissionConfig?: (
      sol: MarsSolScenario,
      tradeOff: MissionTradeOffOption,
      startNow?: boolean
    ) => void;
    applyMission1RoverPlan?: (tradeOff: MissionTradeOffOption) => void;
  } | null>(null);

  const isReplayingCutsceneRef = useRef(false);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const factToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const markMissionComplete = useCallback((missionId: MissionId) => {
    setCompletedMissions((prev) => {
      if (prev.includes(missionId)) return prev;
      const next = [...prev, missionId];
      try {
        window.localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write failure
      }
      return next;
    });
  }, []);

  const handleWarning = useCallback((msg: string) => {
    setWarningMessage(msg);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => {
      setWarningMessage(null);
 
    }, 4000);
  }, []);

  const handleDialogueTrigger = useCallback((dialogueKey: string) => {
    const lines = DIALOGUE_SCRIPTS[dialogueKey];
    if (lines && lines.length > 0) {
      setActiveDialogue(lines);
    }
  }, []);

  const handleFactUnlock = useCallback((factId: string) => {
    setUnlockedFactIds((prev) => {
      if (prev.includes(factId)) return prev;
      const fact = NASA_FACTS.find((f) => f.id === factId);
      if (fact) {
        const isStickyHazardFact =
          factId === 'space_communications' || factId === 'martian_lava_tubes';
        if (isStickyHazardFact) {
          setFactQueue((queue) =>
            queue.some((item) => item.id === fact.id) ? queue : [...queue, fact]
          );
        } else {
          setFactToastTitle(fact.title);
          if (factToastTimeoutRef.current) clearTimeout(factToastTimeoutRef.current);
          factToastTimeoutRef.current = setTimeout(() => {
            setFactToastTitle(null);
          }, 3600);
        }
      }
      return [...prev, factId];
    });
  }, []);

  const handleStageChange = useCallback((newStage: MissionStage) => {
    setStage(newStage);
  }, []);

  const handleMissionEnd = useCallback(
    (success: boolean) => {
      if (success) {
        markMissionComplete(activeMission);
        if (activeMission === 'mission_3') {
          setActiveEventCinematic('mission_3_final_home');
        } else {
          setScreenState('mission_complete');
        }
      } else {
        setScreenState('mission_failed');
      }
    },
    [activeMission, markMissionComplete]
  );

  const callbacks: SceneCallbacks = {
    onResourceUpdate: (res) => {
      setResources(res);
      if (res.oxygen <= 0 && screenState === 'playing') {
        setScreenState('mission_failed');
      }
    },
    onStageChange: handleStageChange,
    onPromptChange: (prompt) => setInteractionPrompt(prompt),
    onDialogueTrigger: handleDialogueTrigger,
    onFactUnlock: handleFactUnlock,
    onWarning: handleWarning,
    onWaypointUpdate: (wp) => setWaypoint(wp),
    onMissionEnd: handleMissionEnd,
    onOpenBreakerConsole: () => setIsBreakerConsoleOpen(true),
    onOpenRadioMiniGame: () => setIsRadioMiniGameOpen(true),
    onOpenDrillMiniGame: () => setIsDrillMiniGameOpen(true),
    onOpenCrewHealthModal: () => {
      setActiveDialogue(null);
      setIsCrewHealthModalOpen(true);
    },
    onOpenLaunchDecision: () => {
      setActiveDialogue(null);
      setIsMission3LaunchModalOpen(true);
    },
    onOpenRoverPrepDecision: () => {
      setActiveDialogue(null);
      setIsMission1RoverPlanOpen(true);
    },
    onOpenMission2RouteDecision: () => {
      setActiveDialogue(null);
      setIsMission2PlanOpen(true);
    },

    // ------------- MODIFIED PART ------------
  onMission2TermLearned: (term) => {
  console.log('[Mission 2] Term received in App:', term);
  setMission2TermPopup(term);
},

onMission2QuizRequested: (quizId) => {
  console.log('[Mission 2] Quiz requested:', quizId);

  if (activeMission === 'mission_2' && MISSION_2_QUIZ[quizId]) {
    setPendingMission2QuizId(quizId);
  }
},

    // -------------------
    onTriggerDisasterCinematic: (eventType: CinematicEventType = 'mission_1_explosion') => {
      isReplayingCutsceneRef.current = false;
      setActiveDialogue(null);
      setIsPaused(false);
      setIsDamagedStatusOpen(false);
      setActiveEventCinematic(eventType);
    },
  };

  // ------------- MODIFIED PART ------------
    // Mission 2: Show a pending quiz when all other overlays are closed.
  React.useEffect(() => {
    if (
      screenState !== 'playing' ||
      activeMission !== 'mission_2' ||
      pendingMission2QuizId === null ||
      activeDialogue !== null ||
      mission2TermPopup !== null
    ) {
      return;
    }

    if (!MISSION_2_QUIZ[pendingMission2QuizId]) {
      setPendingMission2QuizId(null);
      return;
    }

    setActiveMission2QuizId(pendingMission2QuizId);
    setPendingMission2QuizId(null);
    setSelectedMission2Answer(null);
  }, [
    screenState,
    activeMission,
    pendingMission2QuizId,
    activeDialogue,
    mission2TermPopup,
  ]);

  //-----------------

  const resetUiForMissionStart = (
    missionId: MissionId,
    solOverride: MarsSolScenario = activeSolScenario
  ) => {
    setIsPaused(false);
    setHealthScienceBonus(0);
    setM3HealthBoostChoice(undefined);
    setM3BonusCondition(0);
    setM3BonusOxygen(0);
    setIsBreakerConsoleOpen(false);
    setIsRadioMiniGameOpen(false);
    setIsDrillMiniGameOpen(false);
    setIsCrewHealthModalOpen(false);
    setIsMission1RoverPlanOpen(false);
    setIsMission2PlanOpen(false);
    setIsMission3LaunchModalOpen(false);
    setFactToastTitle(null);
    setActiveEventCinematic(null);
    setIsDamagedStatusOpen(false);
    setActiveDialogue(null);
    setFactQueue([]);
    setInteractionPrompt(null);
    setWarningMessage(null);

         // -------- MODIFIED PART ----------
      setMission2TermPopup(null);

      setPendingMission2QuizId(null);
setActiveMission2QuizId(null);
setSelectedMission2Answer(null);
setMission2QuizResults([]);
      // --------------
    setStage(
      missionId === 'mission_3'
        ? 'm3_stage_1_grid_triage'
        : missionId === 'mission_2'
        ? 'm2_stage_1_canyon_transit'
        : 'stage_0_opening_explore'
    );
    setResources({
      oxygen: 100,
      battery: 100,
      condition: 100,
      hasCoupler: false,
      isInRover: false,
      isInsideHabitat: true,
      isDustStormActive: false,
      elapsedSeconds: 0,
      rockCollisions: 0,
      signalStrength: 20,
      beaconsPlaced: 0,
      totalBeacons: 2,
      hasCoreSample: missionId === 'mission_3',
      isInLavaTube: false,
      seismicTremor: false,
      breakersConfigured: false,
      solId: solOverride.id,
      solLabel: solOverride.solLabel,
      radiationMsvPerDay: solOverride.radiationMsvPerDay,
    });
  };

  const handleSelectMission = (missionId: MissionId) => {
    if (!isMissionUnlocked(missionId, completedMissions)) return;
    setActiveMission(missionId);
    setStage(
      missionId === 'mission_3'
        ? 'm3_stage_1_grid_triage'
        : missionId === 'mission_2'
        ? 'm2_stage_1_canyon_transit'
        : 'stage_0_opening_explore'
    );
  };

  const handleStartGame = () => {
    if (!isMissionUnlocked(activeMission, completedMissions)) return;
    setReplaySolOverride(null);
    resetUiForMissionStart(activeMission);
    setScreenState('playing');
    sounds.playObjectiveStinger();
  };

  const handleRestartMission = () => {
    const nextSol = pickRandomSolScenario(activeSolScenario.id);
    setReplaySolOverride(nextSol);
    resetUiForMissionStart(activeMission, nextSol);
    setScreenState('playing');
    gameRef.current?.setSolScenario?.(nextSol);
    gameRef.current?.resetMission(false);
  };

  const handleContinueToMission2 = () => {
    if (!completedMissions.includes('mission_1')) return;
    setReplaySolOverride(null);
    setActiveMission('mission_2');
    resetUiForMissionStart('mission_2');
    setScreenState('playing');
  };

  const handleContinueToMission3 = () => {
    if (!completedMissions.includes('mission_2')) return;
    setReplaySolOverride(null);
    setActiveMission('mission_3');
    resetUiForMissionStart('mission_3');
    setScreenState('playing');
  };

  const handleReturnToMenu = () => {
    sounds.stopCinematicAudio();
    setReplaySolOverride(null);
    setIsPaused(false);
    setIsBreakerConsoleOpen(false);
    setIsRadioMiniGameOpen(false);
    setIsDrillMiniGameOpen(false);
    setIsCrewHealthModalOpen(false);
    setIsMission1RoverPlanOpen(false);
    setIsMission2PlanOpen(false);
    setIsMission3LaunchModalOpen(false);
    setFactToastTitle(null);
    setActiveEventCinematic(null);
    setIsDamagedStatusOpen(false);
    setActiveDialogue(null);
    // ---------- MODIFIED PART ----------
    setMission2TermPopup(null);
    setPendingMission2QuizId(null);
setActiveMission2QuizId(null);
setSelectedMission2Answer(null);
setMission2QuizResults([]);

    // ----------------
    setFactQueue([]);
    setScreenState('menu');
  };

  React.useEffect(() => {
    if (screenState !== 'playing') {
      gameRef.current?.setReadingPaused?.(false);
      return;
    }
    const shouldPauseScene = Boolean(
      activeEducationalFact ||
      // ------ MODIFIED PART --------
      activeMission2QuizId ||
          mission2TermPopup ||

      // ------------
        isPaused ||
        isBreakerConsoleOpen ||
        isRadioMiniGameOpen ||
        isDrillMiniGameOpen ||
        isCrewHealthModalOpen ||
        isDamagedStatusOpen ||
        isMission1RoverPlanOpen ||
        isMission2PlanOpen ||
        isMission3LaunchModalOpen ||
        activeEventCinematic ||
        isFieldGuideOpen
    );
    gameRef.current?.setReadingPaused?.(shouldPauseScene);
  }, [
    screenState,
    activeEducationalFact,

    // ---------MODIFIED PART --------
    mission2TermPopup,
activeMission2QuizId,
    // --------------
    isPaused,
    isBreakerConsoleOpen,
    isRadioMiniGameOpen,
    isDrillMiniGameOpen,
    isCrewHealthModalOpen,
    isDamagedStatusOpen,
    isMission1RoverPlanOpen,
    isMission2PlanOpen,
    isMission3LaunchModalOpen,
    activeEventCinematic,
    isFieldGuideOpen,
  ]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        screenState !== 'playing' ||
        // ----------MODIFIED PART ----------
        activeMission2QuizId !== null ||

        // ------------
        activeEventCinematic !== null ||
        isDamagedStatusOpen ||
        isCrewHealthModalOpen ||
        isMission1RoverPlanOpen ||
        isMission2PlanOpen ||
        isMission3LaunchModalOpen
      ) {
        return;
      }
      if (e.code === 'Escape') {
        if (isBreakerConsoleOpen) {
          setIsBreakerConsoleOpen(false);
        } else if (isRadioMiniGameOpen) {
          setIsRadioMiniGameOpen(false);
        } else if (isDrillMiniGameOpen) {
          setIsDrillMiniGameOpen(false);
        } else {
          setIsPaused((prev) => !prev);
        }
      } else if (e.code === 'KeyM') {
        setIsFieldGuideOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    screenState,
    // ------------ MODIFIED PART ----------
 activeMission2QuizId,
    //-------------
    isBreakerConsoleOpen,
    isRadioMiniGameOpen,
    isDrillMiniGameOpen,
    isCrewHealthModalOpen,
    activeEventCinematic,
    isDamagedStatusOpen,
    isMission1RoverPlanOpen,
    isMission2PlanOpen,
    isMission3LaunchModalOpen,
  ]);

  const missionStats: MissionStats = {
    missionId: activeMission,
    elapsedSeconds: resources.elapsedSeconds,
    finalOxygen: Math.min(100, resources.oxygen + m3BonusOxygen),
    finalBattery: resources.battery,
    finalCondition: Math.min(100, resources.condition + m3BonusCondition),
    factsDiscovered: unlockedFactIds.length,
    totalFacts: NASA_FACTS.length,
    rockCollisions: resources.rockCollisions,
    beaconsPlaced: resources.beaconsPlaced,
    hasCoreSample: resources.hasCoreSample,
    solScenario: activeSolScenario,
    tradeOffTitle: resources.tradeOffTitle,
        tradeOffChoice: MISSION_TRADE_OFFS[activeMission]?.find((t) => t.id === resources.tradeOffId),
    breakerChoice: resources.breakerChoice,
    m1StormChoice: resources.m1StormChoice,
    m2DrillChoice: resources.m2DrillChoice,
    m3LaunchChoice: resources.m3LaunchChoice,
    m3HealthBoostChoice,
    explorerMode,
    scienceScore: (resources.scienceScore ?? 10) + healthScienceBonus,
  };

  const mission1RoverChoices: DecisionChoiceItem[] = MISSION_TRADE_OFFS.mission_1.map((opt) => ({
    id: opt.id,
    title: opt.title,
    badge: opt.badge,
    whyPickText: opt.gainText,
    afterEffectText: opt.costText,
    solveNextText:
      opt.id === 'm1_heavy_shield'
        ? 'Drive inside the pressurized Rover instead of walking so you save Suit Air!'
        : opt.id === 'm1_greenhouse_food'
        ? 'Pick up glowing Yellow Solar Cells in the desert to top up your Rover Battery!'
        : 'Steer cleanly around boulders to protect your lighter Shielding!',
    nasaScienceNote: opt.realScienceNote,
  }));

  const mission2Choices: DecisionChoiceItem[] = MISSION_TRADE_OFFS.mission_2.map((opt) => ({
    id: opt.id,
    title: opt.title,
    badge: opt.badge,
    whyPickText: opt.gainText,
    afterEffectText: opt.costText,
    solveNextText:
      opt.id === 'm2_canyon_shelter'
        ? 'Steer around deep sand patches so your Rover Battery lasts to Sensor 2 & the Cave!'
        : opt.id === 'm2_high_ridge'
        ? 'Drive straight to Sensor 2 and duck into the Lava Cave before surface rays wear Shielding down!'
        : 'Collect glowing blue Ice Crystals to keep Suit Air & Shielding strong on your drive!',
    nasaScienceNote: opt.realScienceNote,
  }));

  const mission3LaunchChoices: DecisionChoiceItem[] = [
    {
      id: 'heavy_shield',
      title: 'Heavy Heat-Shield Hull',
      badge: 'ARMOR',
      whyPickText: 'Restores +20% Shielding & cuts hull damage in half if you slip outside the green climb box!',
      afterEffectText: 'Extra armor makes the rocket heavy, so it climbs 14% slower into space.',
      solveNextText: 'Hold steady inside the green climb box with [A]/[D] over a slightly longer flight!',
      nasaScienceNote:
        'Extra thermal and radiation shielding protects rockets during launch, but added mass makes engines work harder against gravity.',
    },
    {
      id: 'light_autopilot',
      title: 'Ultra-Light Auto-Pilot',
      badge: 'SPEED & RADIO',
      whyPickText: 'Strips extra metal so the rocket climbs 24% faster with crisp [A]/[D] steering!',
      afterEffectText: 'Thin frame takes almost 2x hull wear if you drift out of the green box.',
      solveNextText: 'Use sharp [A]/[D] steering to stay locked inside the green corridor!',
      nasaScienceNote:
        'Radio messages between Earth and Mars take about 3 to 22 minutes each way, so a Mars rocket must steer itself with its own computer.',
    },
    {
      id: 'science_cargo',
      title: 'Extra Science & Veggie Pod',
      badge: 'BONUS SCIENCE',
      whyPickText: 'Packs extra Mars rocks & space veggies for +35 Science Points!',
      afterEffectText: 'Stage 1 fuel burns faster AND Mars crosswinds push your rocket left and right.',
      solveNextText: 'Counter-steer against wind gusts with [A]/[D] and drop Stage 1 with [SPACE] fast!',
      nasaScienceNote:
        'In the Rocket Equation, every extra kilogram of science cargo burns extra propellant during Stage 1 liftoff.',
    },
  ];

  const isOverlayBlockingHud =
    activeEventCinematic !== null ||

    // ----------- MODIFIED PART -------------
activeMission2QuizId !== null ||
    // ---------------
    isDamagedStatusOpen ||
    isMission1RoverPlanOpen ||
    isMission2PlanOpen ||
    isMission3LaunchModalOpen;


  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c0706] font-display crt-overlay">
      <RotateDevice />

      {screenState === 'home' && (
        <HomePage onStart={() => setScreenState('loading')} />
      )}

      {screenState === 'loading' && (
        <LoadingScreen onComplete={() => setScreenState('crew_selection')} />
      )}

      {screenState === 'crew_selection' && (
        <CrewSelectionPage
          onContinue={(crew) => {
            setSelectedCrew(crew);
            setScreenState('crew_details');
          }}
          onBack={() => setScreenState('home')}
        />
      )}

      {screenState === 'crew_details' && selectedCrew && (
        <CrewDetailsPage
          crew={selectedCrew}
          onBack={() => setScreenState('crew_selection')}
          onContinue={() => setScreenState('menu')}
        />
      )}

      {screenState === 'menu' && (
        <MainMenu
          selectedMission={activeMission}
          completedMissions={completedMissions}
          selectedCrew={selectedCrew}
          explorerMode={explorerMode}
          onSelectExplorerMode={setExplorerMode}
          onSelectMission={handleSelectMission}
          onStartGame={handleStartGame}
          onOpenFieldGuide={() => setIsFieldGuideOpen(true)}
          onChangeCrew={() => setScreenState('crew_selection')}
          onBackToHome={() => setScreenState('home')}
        />
      )}

      {(screenState === 'playing' || screenState === 'mission_complete' || screenState === 'mission_failed') && (
        <div className="relative w-full h-full">
          <MarsGameCanvas
            callbacks={callbacks}
            activeMission={activeMission}
            solScenario={activeSolScenario}
            crewId={selectedCrew?.id}
            explorerMode={explorerMode}
            gameRef={gameRef}
          />

          {resources.isDustStormActive && (
            <div
              className="pointer-events-none absolute inset-0 z-25 border-[12px] border-red-600/60 storm-vignette"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(220, 38, 38, 0.16) 0 4px, transparent 4px 12px)',
              }}
            />
          )}

          {resources.seismicTremor && (
            <div
              className="pointer-events-none absolute inset-0 z-25 border-[12px] border-amber-500/60 storm-vignette"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(-45deg, rgba(245, 158, 11, 0.14) 0 4px, transparent 4px 12px)',
              }}
            />
          )}

          {screenState === 'playing' && !isOverlayBlockingHud && (
            <HUD
              resources={resources}
              stage={stage}
              activeMission={activeMission}
              waypoint={waypoint}
              interactionPrompt={interactionPrompt}
              warningMessage={warningMessage}
              discoveredFactsCount={unlockedFactIds.length}
              totalFactsCount={NASA_FACTS.length}
              factToastTitle={factToastTitle}
              onOpenFieldGuide={() => setIsFieldGuideOpen(true)}
              onOpenPauseMenu={() => setIsPaused(true)}
            />
          )}

          {activeDialogue && screenState === 'playing' && !isOverlayBlockingHud && (
            <DialogueOverlay
              dialogues={activeDialogue}
              blockSpaceKey={stage === 'm3_stage_4_mav_ascent'}
              paused={Boolean(
                activeEducationalFact ||
                // -----------MODIFIED PART -------
                  mission2TermPopup ||
                  activeMission2QuizId ||
                //------------
                  isBreakerConsoleOpen ||
                  isRadioMiniGameOpen ||
                  isDrillMiniGameOpen ||
                  isCrewHealthModalOpen ||
                  isFieldGuideOpen
              )}
              onComplete={() => {
                setActiveDialogue(null);
                if (stage === 'm3_cinematic_ending') {
                  markMissionComplete('mission_3');
                  setActiveEventCinematic('mission_3_final_home');
                } else if (stage === 'cinematic_ending' || stage === 'm2_cinematic_ending') {
                  markMissionComplete(activeMission);
                  setScreenState('mission_complete');
                }
              }}
            />
          )}

          {activeEducationalFact && !isOverlayBlockingHud && (
            <EducationalModal
              fact={activeEducationalFact}
              explorerMode={explorerMode}
              onClose={() => setFactQueue((prev) => prev.slice(1))}
            />
          )}

          {/* ----------- MODIFIED PART ------------- */}

          {mission2TermPopup &&
  screenState === 'playing' &&
  activeMission === 'mission_2' && (
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-lg rounded-2xl border-2 border-cyan-400 bg-slate-950 p-6 text-center shadow-2xl">
        <div className="mb-3 text-sm font-bold tracking-[0.25em] text-cyan-300">
          NEW SCIENCE TERM
        </div>

        <h2 className="mb-4 text-3xl font-black text-white">
          {mission2TermPopup.title}
        </h2>

        <p className="mb-6 text-base leading-relaxed text-slate-200">
          {mission2TermPopup.explanation}
        </p>

        <button
          type="button"
          onClick={() => setMission2TermPopup(null)}
          className="rounded-xl bg-cyan-400 px-8 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
        >
          Got it! Continue Mission
        </button>
      </div>
    </div>
  )}


  {activeMission2Quiz &&
  screenState === 'playing' &&
  activeMission === 'mission_2' && (
    <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-xl rounded-2xl border-2 border-cyan-400 bg-slate-950 p-6 text-center shadow-2xl">

        <div className="mb-3 text-xs font-bold tracking-[0.25em] text-cyan-300">
          MISSION 2 KNOWLEDGE CHECK
        </div>

        <h2 className="mb-6 text-xl font-black leading-relaxed text-white">
          {activeMission2Quiz.question}
        </h2>

        <div className="mb-5 flex flex-col gap-3">
          {activeMission2Quiz.options.map((option, index) => {
            const isSelected = selectedMission2Answer === index;
            const isCorrect = activeMission2Quiz.correctAnswer === index;
            const hasAnswered = Boolean(activeMission2QuizResult);

            let optionStyle =
              'border-slate-700 bg-slate-900 text-slate-200 hover:border-cyan-400';

            if (!hasAnswered && isSelected) {
              optionStyle = 'border-cyan-400 bg-cyan-950 text-white';
            }

            if (hasAnswered && isCorrect) {
              optionStyle = 'border-emerald-400 bg-emerald-950 text-white';
            } else if (hasAnswered && isSelected && !isCorrect) {
              optionStyle = 'border-red-400 bg-red-950 text-white';
            }

            return (
              <button
                key={index}
                type="button"
                disabled={hasAnswered}
                onClick={() => setSelectedMission2Answer(index)}
                className={`w-full rounded-xl border-2 p-4 text-left text-sm font-bold transition ${optionStyle}`}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            );
          })}
        </div>

        {activeMission2QuizResult && (
          <div className="mb-5 rounded-xl bg-slate-900 p-4 text-left">
            <p
              className={`mb-2 font-black ${
                activeMission2QuizResult.correct
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              {activeMission2QuizResult.correct
                ? 'Correct! Great work!'
                : 'Not quite! Let’s learn from it.'}
            </p>

            <p className="text-sm leading-relaxed text-slate-200">
              {activeMission2Quiz.explanation}
            </p>
          </div>
        )}

        {!activeMission2QuizResult ? (
          <button
            type="button"
            disabled={selectedMission2Answer === null}
            onClick={() => {
              if (selectedMission2Answer === null) return;

              const correct =
                selectedMission2Answer === activeMission2Quiz.correctAnswer;

              setMission2QuizResults((prev) => [
                ...prev.filter(
                  (result) => result.quizId !== activeMission2Quiz.id
                ),
                {
                  quizId: activeMission2Quiz.id,
                  selectedAnswer: selectedMission2Answer,
                  correct,
                },
              ]);
            }}
            className="w-full rounded-xl bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check Answer
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setActiveMission2QuizId(null);
              setSelectedMission2Answer(null);
            }}
            className="w-full rounded-xl bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300"
          >
            Continue Mission
          </button>
        )}
      </div>
    </div>
  )}


          {/* -------------------------- */}

          {activeEventCinematic && (screenState === 'playing' || activeEventCinematic === 'mission_3_final_home') && (
            <DisasterCinematicModal
              eventType={activeEventCinematic}
              onComplete={() => {
                const finishedEvent = activeEventCinematic;
                const wasPauseReplay = isReplayingCutsceneRef.current;
                isReplayingCutsceneRef.current = false;
                setActiveEventCinematic(null);
                if (wasPauseReplay) {
                  return;
                }
                if (finishedEvent === 'mission_1_explosion') {
                  if (stage === 'stage_0_opening_explore') {
                    setIsDamagedStatusOpen(true);
                  }
                } else if (finishedEvent === 'mission_2_marsquake') {
                  gameRef.current?.startPostQuakeEvacuation?.();
                } else if (finishedEvent === 'mission_3_launch_crisis') {
                  gameRef.current?.startMavAscentAfterEvent?.();
                } else if (finishedEvent === 'mission_3_final_home') {
                  setScreenState('mission_complete');
                }
              }}
            />
          )}

          {isDamagedStatusOpen && screenState === 'playing' && (
            <DamagedShipStatusModal
              onReplayCutscene={() => {
                isReplayingCutsceneRef.current = false;
                setIsDamagedStatusOpen(false);
                setActiveEventCinematic('mission_1_explosion');
              }}
              onStartMission={() => {
                setIsDamagedStatusOpen(false);
                gameRef.current?.startPostDisasterMission?.();
              }}
            />
          )}

          {isMission1RoverPlanOpen && screenState === 'playing' && activeMission === 'mission_1' && (
            <MissionDecisionModal
              theme="amber"
              stepTag="ROVER DOCK // PREP FOR THE RADIO TOWER"
              title="Upgrade Your Rover Before Driving Out!"
              imageSrc="/assets/nasa/jezero_crater.jpg"
              imageAlt="Mars Rover preparing to cross Jezero Crater"
              guideSpeaker="BIOLOGIST HEDEYA"
              guideCharacterId="hedeya"
              guideIntroTitle="WHY YOU NEED AN UPGRADE RIGHT NOW"
              guideIntroText="Feel how fast your Blue Suit Air bar started dropping outside? Walking all the way to the Radio Tower on foot burns 2x Suit Air and takes forever. Your Rover protects you—but the Rover only has one spare slot, so first look at how each top meter works:"
              guidePoints={[
                {
                  label: 'BLUE BAR · SUIT AIR',
                  text: 'Sitting inside the Rover cuts Suit Air loss in half! Walking back inside Base refills Suit Air fast using greenhouse plants.',
                  colorClass: 'text-sky-300',
                },
                {
                  label: 'YELLOW BAR · ROVER BATTERY',
                  text: 'Drives your wheels across the crater and deep soft sand. You can grab glowing Yellow Solar Cells along the road to recharge!',
                  colorClass: 'text-amber-300',
                },
                {
                  label: 'GREEN BAR · SHIELDING',
                  text: 'Invisible space rays and rock bumps slowly wear it down. If Shielding hits 0%, your suit leaks Suit Air twice as fast!',
                  colorClass: 'text-emerald-300',
                },
              ]}
              guideButtonLabel="Now I Know Why — Pick Rover Upgrade!"
              decisionPromptText="Pick 1 Rover Upgrade for the drive to the Radio Tower. Every helper helps one bar while borrowing from another—and you'll solve that trade-off on the road!"
              choices={mission1RoverChoices}
              confirmLabel="Fit Upgrade & Drive!"
              onConfirm={(choiceId) => {
                const chosen =
                  MISSION_TRADE_OFFS.mission_1.find((t) => t.id === choiceId) ??
                  MISSION_TRADE_OFFS.mission_1[0];
                setIsMission1RoverPlanOpen(false);
                gameRef.current?.applyMission1RoverPlan?.(chosen);
              }}
            />
          )}

          {isMission2PlanOpen && screenState === 'playing' && activeMission === 'mission_2' && (
            <MissionDecisionModal
              theme="cyan"
              stepTag="SENSOR 1 SCAN READY // NERETVA VALLEY"
              title="Sensor 1 Found a Deep Canyon — Pick Your Path!"
              imageSrc="/assets/nasa/neretva_vallis.jpg"
              imageAlt="Neretva Vallis ancient Mars river valley"
              guideSpeaker="BIOLOGIST HEDEYA"
              guideCharacterId="hedeya"
              guideIntroTitle="WHAT SENSOR 1 JUST SHOWED US"
              guideIntroText="Awesome driving! Your first RIMFAX ground sensor just bounced sonar echoes off the valley ahead. Before we drive to Sensor 2 and the underground cave, here is WHY different paths change your Rover Battery and Shielding:"
              guidePoints={[
                {
                  label: '1. WHY CLIFFS BLOCK SPACE RAYS',
                  text: 'Earth has a magnetic shield; Mars does not! Tall canyon walls act like a stone umbrella blocking part of the sky, cutting ray damage.',
                  colorClass: 'text-cyan-300',
                },
                {
                  label: '2. WHY SOFT SAND DRAINS POWER',
                  text: 'Canyon bottoms trap loose windblown sand. Rover wheels slip in soft sand and use extra Battery—while hard rock ridges roll fast and save Battery!',
                  colorClass: 'text-amber-300',
                },
                {
                  label: '3. WHY WE NEED THE LAVA CAVE',
                  text: 'Sensor 2 will pinpoint a hollow lava cave ahead! Thick underground stone blocks ~95% of space rays—and might hide trapped ancient water ice!',
                  colorClass: 'text-emerald-300',
                },
              ]}
              guideButtonLabel="Got It — Choose Our Valley Path!"
              decisionPromptText="Now that you know how cliffs, sand, and rock affect your Rover, pick how to cross the valley to Sensor 2!"
              choices={mission2Choices}
              confirmLabel="Lock Path & Drive to Sensor 2!"
              onConfirm={(choiceId) => {
                const chosen =
                  MISSION_TRADE_OFFS.mission_2.find((t) => t.id === choiceId) ??
                  MISSION_TRADE_OFFS.mission_2[0];
                setIsMission2PlanOpen(false);
                gameRef.current?.applyMissionConfig?.(activeSolScenario, chosen);
              }}
            />
          )}

          {isMission3LaunchModalOpen && screenState === 'playing' && activeMission === 'mission_3' && (
            <MissionDecisionModal
              theme="red"
              stepTag="ROCKET PAD // PRE-LAUNCH SETUP"
              title="Set Up Your Mars Rocket Before Blast-Off!"
              imageSrc="/assets/nasa/sample_core_tube.jpg"
              imageAlt="Mars sample return tube ready for rocket launch"
              guideSpeaker="COMMANDER HAZALOOM"
              guideCharacterId="hazaloom"
              guideIntroTitle="WHY YOU MUST SET UP THE ROCKET YOURSELF"
              guideIntroText="You made it past the dust tornadoes to the Launch Pad! Before we hit the ignition switch, here are the two real rocket rules that explain WHY every part you bolt onto the rocket changes your flight:"
              guidePoints={[
                {
                  label: '1. EARTH RADIO IS TOO SLOW!',
                  text: `Mars is far from Earth right now (${activeSolScenario.roundTripDelayMin} min for a reply!). Nobody on Earth can steer your rocket live—YOU steer with [A] and [D] inside the green box!`,
                  colorClass: 'text-red-300',
                },
                {
                  label: '2. THE ROCKET WEIGHT RULE',
                  text: 'In rocket science, every extra gram of armor or science rocks makes the rocket heavier—so it climbs slower or burns Stage 1 fuel faster!',
                  colorClass: 'text-amber-300',
                },
                {
                  label: '3. TWO STAGES TO ORBIT',
                  text: 'First, fly straight inside the green box until Stage 1 empties, press [SPACE] to drop the heavy empty tank, then gently dock in orbit!',
                  colorClass: 'text-sky-300',
                },
              ]}
              guideButtonLabel="Ready — Pick Rocket Setup!"
              decisionPromptText="Pick 1 Rocket Setup! Notice why each one helps and what flight challenge you'll steer through right after liftoff."
              choices={mission3LaunchChoices}
              confirmLabel="Ignite Mars Rocket!"
              onConfirm={(choiceId) => {
                setIsMission3LaunchModalOpen(false);
                gameRef.current?.confirmLaunchChoice?.(choiceId as Mission3LaunchChoice);
              }}
            />
          )}

          {isBreakerConsoleOpen && screenState === 'playing' && (
            <PowerBusConsoleModal
              onSolved={(choice) => {
                gameRef.current?.solveBreakerTriage?.(choice);
                setIsBreakerConsoleOpen(false);
              }}
              onClose={() => setIsBreakerConsoleOpen(false)}
            />
          )}

          {isRadioMiniGameOpen && screenState === 'playing' && (
            <RadioRepairMiniGameModal
              solScenario={activeSolScenario}
              currentOxygen={resources.oxygen}
              hasAutoRadioUpgrade={resources.tradeOffId === 'm1_auto_relay_power'}
              explorerMode={explorerMode}
              onComplete={(choice) => {
                setIsRadioMiniGameOpen(false);
                setUnlockedFactIds((prev) =>
                  prev.includes('martian_dust_storms') ? prev : [...prev, 'martian_dust_storms']
                );
                gameRef.current?.completeRadioRepairMiniGame?.(choice);
              }}
              onClose={() => setIsRadioMiniGameOpen(false)}
            />
          )}

          {isDrillMiniGameOpen && screenState === 'playing' && (
            <RockDrillMiniGameModal
              explorerMode={explorerMode}
              onComplete={(batteryUsed, drillChoice) => {
                setIsDrillMiniGameOpen(false);
                gameRef.current?.completeDrillMiniGame?.(batteryUsed, drillChoice);
              }}
              onClose={() => setIsDrillMiniGameOpen(false)}
            />
          )}

          {isCrewHealthModalOpen && screenState === 'playing' && (
            <CrewHealthActionModal
              onComplete={(boostChoice) => {
                setIsCrewHealthModalOpen(false);
                setM3HealthBoostChoice(boostChoice);
                if (boostChoice === 'fitness') {
                  setHealthScienceBonus(35);
                } else if (boostChoice === 'shield') {
                  setHealthScienceBonus(25);
                  setM3BonusCondition(15);
                } else {
                  setHealthScienceBonus(25);
                  setM3BonusOxygen(15);
                }
                setUnlockedFactIds((prev) =>
                  prev.includes('astronaut_health_microgravity')
                    ? prev
                    : [...prev, 'astronaut_health_microgravity']
                );
                markMissionComplete('mission_3');
                setActiveEventCinematic('mission_3_final_home');
              }}
            />
          )}

          {isPaused && !isOverlayBlockingHud && (
            <PauseMenu
              onResume={() => setIsPaused(false)}
              onRestart={handleRestartMission}
              onReturnToMenu={handleReturnToMenu}
              onOpenFieldGuide={() => {
                setIsPaused(false);
                setIsFieldGuideOpen(true);
              }}
              onReplayCutscene={
                (activeMission === 'mission_1' && stage !== 'stage_0_opening_explore') ||
                (activeMission === 'mission_2' &&
                  (stage === 'm2_stage_5_seismic_evacuation' || stage === 'm2_cinematic_ending')) ||
                (activeMission === 'mission_3' &&
                  (stage === 'm3_stage_4_mav_ascent' ||
                    stage === 'm3_stage_5_orbital_dock' ||
                    stage === 'm3_cinematic_ending'))
                  ? () => {
                      setIsPaused(false);
                      isReplayingCutsceneRef.current = true;
                      const eventForMission: CinematicEventType =
                        activeMission === 'mission_3'
                          ? 'mission_3_launch_crisis'
                          : activeMission === 'mission_2'
                          ? 'mission_2_marsquake'
                          : 'mission_1_explosion';
                      setActiveEventCinematic(eventForMission);
                    }
                  : undefined
              }
            />
          )}
        </div>
      )}

      {screenState === 'mission_complete' && activeEventCinematic === null && (
        <MissionCompleteModal
          stats={missionStats}
          onReplay={handleRestartMission}
          onContinueToMission2={
            completedMissions.includes('mission_1') ? handleContinueToMission2 : undefined
          }
          onContinueToMission3={
            completedMissions.includes('mission_2') ? handleContinueToMission3 : undefined
          }
          onWatchFinalHomeVideo={
            activeMission === 'mission_3'
              ? () => setActiveEventCinematic('mission_3_final_home')
              : undefined
          }
          onSelectMission={(m) => {
            if (isMissionUnlocked(m, completedMissions)) {
              handleSelectMission(m);
            } else {
              setActiveMission('mission_1');
            }
            setScreenState('menu');
          }}
          onOpenFieldGuide={() => setIsFieldGuideOpen(true)}
        />
      )}

      {screenState === 'mission_failed' && (
        <GameOverModal
          onRestart={handleRestartMission}
          onReturnToMenu={handleReturnToMenu}
          reason={
            resources.oxygen <= 0
              ? resources.condition <= 0
                ? 'Your Shielding hit 0% and leaked Suit Air twice as fast before you reached safety!'
                : 'Your Suit Air ran out before getting your crew back to the green Base ring!'
              : resources.condition <= 0
              ? 'Your Rover Shielding wore down to 0% from rocks, dust tornadoes, and space rays!'
              : 'Your rocket drifted off course during launch or docking!'
          }
          tip={
            resources.oxygen <= 0
              ? 'Ride inside the Rover outside to save Suit Air (walking burns 2x more), pick Auto-Send at the Radio Tower if Suit Air is low, or return to the green Hydroponics ring at Base!'
              : resources.condition <= 0
              ? 'Steer around boulders and dust tornadoes! If Shielding drops low, drive back inside the green Base ring (patches up to 65%) or duck inside the Lava Cave.'
              : 'Stay inside the green climb box with [A]/[D], press [SPACE] when Stage 1 empties, and tap [WASD] gently in zero gravity to dock.'
          }
        />
      )}

      {isFieldGuideOpen && (
        <NasaFieldGuide
          unlockedFactIds={unlockedFactIds}
          onClose={() => setIsFieldGuideOpen(false)}
        />
      )}
    </div>
  );
}
