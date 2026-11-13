import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Mission1Scene, SceneCallbacks } from './scenes/Mission1Scene';
import { Mission2Scene } from './scenes/Mission2Scene';
import { Mission3Scene } from './scenes/Mission3Scene';
import {
  BreakerAllocationChoice,
  CinematicEventType,
  ExplorerMode,
  MarsSolScenario,
  Mission2DrillChoice,
  Mission3LaunchChoice,
  MissionId,
  MissionTradeOffOption,
} from '../types/game';

interface MarsGameCanvasProps {
  callbacks: SceneCallbacks;
  activeMission: MissionId;
  solScenario?: MarsSolScenario;
  crewId?: string;
  explorerMode?: ExplorerMode;
  gameRef: React.MutableRefObject<{
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
  } | null>;
}

export const MarsGameCanvas: React.FC<MarsGameCanvasProps> = ({
  callbacks,
  activeMission,
  solScenario,
  crewId,
  explorerMode = 'junior',
  gameRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const phaserInstanceRef = useRef<Phaser.Game | null>(null);
  const callbacksRef = useRef<SceneCallbacks>(callbacks);
  const solScenarioRef = useRef<MarsSolScenario | undefined>(solScenario);
  const crewIdRef = useRef<string | undefined>(crewId);
  const explorerModeRef = useRef<ExplorerMode>(explorerMode);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    solScenarioRef.current = solScenario;
    if (solScenario) {
      gameRef.current?.setSolScenario?.(solScenario);
    }
  }, [solScenario, gameRef]);

  useEffect(() => {
    crewIdRef.current = crewId;
    gameRef.current?.setCrewSpecialty?.(crewId);
  }, [crewId, gameRef]);

  useEffect(() => {
    explorerModeRef.current = explorerMode;
    gameRef.current?.setExplorerMode?.(explorerMode);
  }, [explorerMode, gameRef]);

  useEffect(() => {
    if (!containerRef.current) return;

    const stableCallbacks: SceneCallbacks = {
      onResourceUpdate: (res) => callbacksRef.current.onResourceUpdate(res),
      onStageChange: (stage) => callbacksRef.current.onStageChange(stage),
      onPromptChange: (prompt) => callbacksRef.current.onPromptChange(prompt),
      onDialogueTrigger: (key) => callbacksRef.current.onDialogueTrigger(key),
      onFactUnlock: (factId) => callbacksRef.current.onFactUnlock(factId),
      onWarning: (msg) => callbacksRef.current.onWarning(msg),
      onWaypointUpdate: (wp) => callbacksRef.current.onWaypointUpdate(wp),
      onMissionEnd: (success) => callbacksRef.current.onMissionEnd(success),
      onOpenBreakerConsole: () => callbacksRef.current.onOpenBreakerConsole?.(),
      onTriggerDisasterCinematic: (eventType?: CinematicEventType) =>
        callbacksRef.current.onTriggerDisasterCinematic?.(eventType),
      onOpenRadioMiniGame: () => callbacksRef.current.onOpenRadioMiniGame?.(),
      onOpenDrillMiniGame: () => callbacksRef.current.onOpenDrillMiniGame?.(),
      onOpenCrewHealthModal: () => callbacksRef.current.onOpenCrewHealthModal?.(),
      onOpenLaunchDecision: () => callbacksRef.current.onOpenLaunchDecision?.(),
      onOpenRoverPrepDecision: () => callbacksRef.current.onOpenRoverPrepDecision?.(),
      onOpenMission2RouteDecision: () => callbacksRef.current.onOpenMission2RouteDecision?.(),

      // ------ MODIFIED PART ----------
      onMission2TermLearned: (term) =>
  callbacksRef.current.onMission2TermLearned?.(term),

      onMission2QuizRequested: (quizId) =>
  callbacksRef.current.onMission2QuizRequested?.(quizId),
      // ---------------
    };

    const TargetSceneClass =
      activeMission === 'mission_3'
        ? Mission3Scene
        : activeMission === 'mission_2'
        ? Mission2Scene
        : Mission1Scene;

    const targetSceneKey =
      activeMission === 'mission_3'
        ? 'Mission3Scene'
        : activeMission === 'mission_2'
        ? 'Mission2Scene'
        : 'Mission1Scene';

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      backgroundColor: '#0c0706',

      scene: [TargetSceneClass],
    };

    const game = new Phaser.Game(config);
    phaserInstanceRef.current = game;

    game.scene.start(targetSceneKey, { callbacks: stableCallbacks });

    game.events.once('step', () => {
      const activeScene = game.scene.getScene(targetSceneKey) as
        | Mission1Scene
        | Mission2Scene
        | Mission3Scene;
      if (gameRef) {
        gameRef.current = {
          resetMission: (waitForPlan = false) => {
            activeScene?.resetMission(waitForPlan);
          },
          solveBreakerTriage: (choice?: BreakerAllocationChoice) => {
            if (activeScene && 'toggleBreakerTriage' in activeScene) {
              activeScene.toggleBreakerTriage(choice);
            }
          },
          startPostDisasterMission: () => {
            if (activeScene && 'startPostDisasterMission' in activeScene) {
              activeScene.startPostDisasterMission();
            }
          },
          startPostQuakeEvacuation: () => {
            if (activeScene && 'startPostQuakeEvacuation' in activeScene) {
              activeScene.startPostQuakeEvacuation();
            }
          },
          startMavAscentAfterEvent: () => {
            if (activeScene && 'startMavAscentAfterEvent' in activeScene) {
              activeScene.startMavAscentAfterEvent();
            }
          },
          confirmLaunchChoice: (choice: Mission3LaunchChoice) => {
            if (activeScene && 'confirmLaunchChoice' in activeScene) {
              activeScene.confirmLaunchChoice(choice);
            }
          },
          completeRadioRepairMiniGame: (choice?: 'auto' | 'wait_earth') => {
            if (activeScene && 'completeRadioRepairMiniGame' in activeScene) {
              activeScene.completeRadioRepairMiniGame(choice);
            }
          },
          completeDrillMiniGame: (batteryUsed?: number, drillChoice?: Mission2DrillChoice) => {
            if (activeScene && 'completeDrillMiniGame' in activeScene) {
              activeScene.completeDrillMiniGame(batteryUsed, drillChoice);
            }
          },
          setReadingPaused: (paused: boolean) => {
            if (activeScene && 'setReadingPaused' in activeScene) {
              activeScene.setReadingPaused(paused);
            }
          },
          setSolScenario: (sol: MarsSolScenario) => {
            if (activeScene && 'setSolScenario' in activeScene) {
              activeScene.setSolScenario(sol);
            }
          },
          setCrewSpecialty: (nextCrewId?: string) => {
            if (activeScene && 'setCrewSpecialty' in activeScene) {
              activeScene.setCrewSpecialty(nextCrewId);
            }
          },
          setExplorerMode: (nextMode: ExplorerMode) => {
            if (activeScene && 'setExplorerMode' in activeScene) {
              activeScene.setExplorerMode(nextMode);
            }
          },
          applyMissionConfig: (
            sol: MarsSolScenario,
            tradeOff: MissionTradeOffOption,
            startNow = false
          ) => {
            if (activeScene && 'applyMissionConfig' in activeScene) {
              if (activeScene instanceof Mission1Scene) {
                activeScene.applyMissionConfig(sol, tradeOff, startNow);
              } else {
                activeScene.applyMissionConfig(sol, tradeOff);
              }
            }
          },
          applyMission1RoverPlan: (tradeOff: MissionTradeOffOption) => {
            if (activeScene instanceof Mission1Scene) {
              activeScene.applyMission1RoverPlan(tradeOff);
            }
          },
        };
        if (solScenarioRef.current && 'setSolScenario' in activeScene) {
          activeScene.setSolScenario(solScenarioRef.current);
        }
        if (crewIdRef.current && 'setCrewSpecialty' in activeScene) {
          activeScene.setCrewSpecialty(crewIdRef.current);
        }
        if ('setExplorerMode' in activeScene) {
          activeScene.setExplorerMode(explorerModeRef.current);
        }
      }
    });

    const handleResize = () => {
      if (phaserInstanceRef.current) {
        phaserInstanceRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      game.destroy(true);
    };
  }, [activeMission]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    />
  );
};
