import React, { useEffect, useState } from 'react';
import { GameResources, MissionStage, Waypoint, MissionId } from '../types/game';
import { sounds } from '../audio/SoundManager';
import { virtualInput } from '../game/virtualInput';
import { PixelIcon } from './PixelIcon';

interface HUDProps {
  resources: GameResources;
  stage: MissionStage;
  activeMission: MissionId;
  waypoint: Waypoint | null;
  interactionPrompt: string | null;
  warningMessage: string | null;
  discoveredFactsCount: number;
  totalFactsCount: number;
  factToastTitle?: string | null;
  onOpenFieldGuide: () => void;
  onOpenPauseMenu: () => void;
}

const PixelMeterBar: React.FC<{ value: number; colorClass: string; segments?: number }> = ({
  value,
  colorClass,
  segments = 10,
}) => {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * segments);
  return (
    <div className="grid grid-cols-10 gap-[2px] w-full h-2.5 p-[2px] bg-[#0a0605] border border-[#49302b]">
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={i < filled ? colorClass : 'bg-[#211512]'}
        />
      ))}
    </div>
  );
};

export const HUD: React.FC<HUDProps> = ({
  resources,
  stage,
  activeMission,
  waypoint,
  interactionPrompt,
  warningMessage,
  discoveredFactsCount,
  totalFactsCount,
  factToastTitle,
  onOpenFieldGuide,
  onOpenPauseMenu,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia?.('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  });
  const [lastObjective, setLastObjective] = useState<string>('');
  const [showObjectiveBanner, setShowObjectiveBanner] = useState(false);

  useEffect(() => {
    if (!showTouchControls) {
      virtualInput.resetAll();
    }
  }, [showTouchControls]);

  const getObjectiveText = (): string => {
    switch (stage) {
      case 'stage_0_opening_explore':
        return 'Check ship pressure on the blue pad [E] so Earth clears our landing!';
      case 'stage_1_leave_habitat':
        return 'Radio is dead! Walk outside to grab the spare Radio Power Part!';
      case 'stage_2_collect_coupler':
        return 'Open the Orange Box [E] for the spare Radio Power Part!';
      case 'stage_3_drive_rover':
        return 'Hop in the Rover [E] — walking burns Suit Air twice as fast!';
      case 'stage_4_repair_relay':
        return resources.hasCoupler
          ? 'Drive to the Hill Radio Tower [E] to fix our signal & warn Earth!'
          : 'Get the spare Radio Power Part from the Orange Box first!';
      case 'stage_5_escape_storm':
        return 'DUST STORM! Race back to the green Base ring for fresh hydroponic air!';
      case 'cinematic_ending':
        return 'Mission 1 Done! Earth received your SOS!';

      case 'm2_stage_1_canyon_transit':
        return 'Drop Radar Sensor 1 [E] to scan underground for a safe lava cave!';
      case 'm2_stage_2_deploy_beacons':
        return 'Drive north & drop Sensor 2 [E] to pinpoint the cave shelter!';
      case 'm2_stage_3_lava_tube_entry':
        return 'Climb into the Lava Cave [E] to block 95% of deadly space rays!';
      case 'm2_stage_4_sample_extraction':
        return 'Drill Rock Tube #14 [E] inside the safe cave for Earth launch tests!';
      case 'm2_stage_5_seismic_evacuation':
        return 'MARSQUAKE! Sprint back to the blue cave exit to save Rock #14!';
      case 'm2_cinematic_ending':
        return 'Mission 2 Done! Crew and Rock #14 are safe!';

      case 'm3_stage_1_grid_triage':
        return 'Press [E] by the Rover to shut off broken 380W Heater #2!';
      case 'm3_stage_2_scarp_traverse':
        return 'Drive east to the Rocket Pad! Dodge dust tornadoes & grab Cells!';
      case 'm3_stage_3_mav_transfer':
        return 'Board the Mars Rocket [E] with Rock #14 to launch into orbit!';
      case 'm3_stage_4_mav_ascent':
        return 'STEER THE ROCKET! Earth is too far away — use [A]/[D] in the green box!';
      case 'm3_stage_5_orbital_dock':
        return 'DOCK IN ZERO-G! Use [WASD] or Arrows to meet the Earth Spaceship!';
      case 'm3_cinematic_ending':
        return 'Crew safe & healthy! Flying home to Earth!';

      default:
        return 'Protect your crew on Mars!';
    }
  };

  const currentObjective = getObjectiveText();

  useEffect(() => {
    if (currentObjective !== lastObjective && currentObjective !== '') {
      setLastObjective(currentObjective);
      setShowObjectiveBanner(true);
      const timer = setTimeout(() => setShowObjectiveBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentObjective, lastObjective]);

  useEffect(() => {
    if (!showObjectiveBanner) return;

    const dismissOnMove = (e: KeyboardEvent) => {
      if (
        e.code === 'KeyW' ||
        e.code === 'KeyA' ||
        e.code === 'KeyS' ||
        e.code === 'KeyD' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.code === 'ArrowLeft' ||
        e.code === 'ArrowRight'
      ) {
        setShowObjectiveBanner(false);
      }
    };

    const dismissOnTouchMove = () => setShowObjectiveBanner(false);

    window.addEventListener('keydown', dismissOnMove);
    window.addEventListener('touchmove', dismissOnTouchMove, { passive: true });
    return () => {
      window.removeEventListener('keydown', dismissOnMove);
      window.removeEventListener('touchmove', dismissOnTouchMove);
    };
  }, [showObjectiveBanner]);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const isLowOxygen = resources.oxygen < 25 && !resources.isInsideHabitat;
  const isLowBattery = resources.battery < 20 && resources.isInRover;
  const isDamagedRover = resources.condition < 30;

  const missionTitle =
    activeMission === 'mission_3'
      ? 'Mission 3: Rocket Home'
      : activeMission === 'mission_2'
      ? 'Mission 2: Underground Cave'
      : 'Mission 1: Fix the Radio';

  const sectorBadge =
    activeMission === 'mission_3'
      ? stage === 'm3_stage_4_mav_ascent'
        ? `ROCKET UP // HEIGHT: ${resources.mavAltitudeKm ?? 0} KM // SPEED: ${resources.mavVelocityMs ?? 0}`
        : stage === 'm3_stage_5_orbital_dock'
        ? 'IN SPACE // MEET THE HOME SPACESHIP'
        : 'ROCKY ROAD TO ROCKET PAD'
      : activeMission === 'mission_2'
      ? resources.isInLavaTube
        ? 'UNDERGROUND LAVA CAVE'
        : 'OLD RIVER VALLEY'
      : stage === 'stage_0_opening_explore'
      ? 'LANDING SITE — ALL SYSTEMS CALM'
      : resources.isInsideHabitat
      ? 'SAFE AT DAMAGED SHIP (AIR FILLING)'
      : resources.isDustStormActive
      ? 'DUST STORM OUTSIDE!'
      : 'OUTSIDE ON MARS';

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-5 overflow-hidden">

      <div className="flex items-start justify-between w-full gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 ${
                resources.seismicTremor ? 'bg-amber-400 animate-ping' : 'bg-red-500 animate-pulse'
              }`}
            />
            <span className="font-mono-hud text-xs tracking-wider text-red-400 font-bold uppercase">
              MARS ADVENTURE //{' '}
              {activeMission === 'mission_3'
                ? 'ROCKET LAUNCH'
                : activeMission === 'mission_2'
                ? 'CAVE EXPLORER'
                : 'RADIO RESCUE'}
            </span>
          </div>
          <h1 className="font-title text-base sm:text-xl font-bold tracking-wider text-slate-100 uppercase drop-shadow-[3px_3px_0_#020302]">
            {missionTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-hud text-slate-300">
            <span className={resources.seismicTremor ? 'text-amber-400 font-bold animate-pulse' : 'text-amber-300'}>
              {resources.seismicTremor ? 'CAVE IS SHAKING! HURRY OUT!' : sectorBadge}
            </span>
            {resources.solLabel && stage !== 'stage_0_opening_explore' && (
              <span className="px-2 py-0.5 bg-[#120b09] border-2 border-[#49302b] text-[10px] text-sky-300">
                {resources.solLabel} · {resources.radiationMsvPerDay ?? 0.64} mSv/day
              </span>
            )}
            {resources.caveRadiationBlocked && (
              <span className="px-2 py-0.5 bg-emerald-950 border-2 border-emerald-500 text-[10px] font-bold text-emerald-300 animate-pulse">
                CAVE SHIELD: 95% RAYS BLOCKED!
              </span>
            )}
          </div>

          <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 pixel-box-amber bg-[#0d0807] text-xs font-mono-hud text-amber-200 max-w-lg">
            <span className="font-bold text-amber-400 shrink-0">GOAL:</span>
            <span className="truncate">{currentObjective}</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playSwitchClick();
              setShowTouchControls((prev) => !prev);
            }}
            className={`pixel-btn flex items-center gap-1.5 px-2.5 py-2 text-xs font-mono-hud cursor-pointer ${
              showTouchControls
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-[#160f0d] hover:bg-[#241613] text-slate-300'
            }`}
            title="Show or Hide On-Screen Touch / Mouse Controls"
          >
            <PixelIcon name="compass" className="w-4 h-4" />
            <span className="hidden lg:inline">Touch Pad</span>
          </button>

          <button
            onClick={onOpenFieldGuide}
            className="pixel-btn flex items-center gap-2 px-3 py-2 bg-[#160f0d] hover:bg-[#241613] text-xs font-mono-hud text-slate-200 cursor-pointer"
            title="Open NASA Space Facts Book"
          >
            <PixelIcon name="book" className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Space Facts</span>
            <span className="px-1.5 py-0.5 bg-amber-950 border border-amber-500 text-amber-300 text-[10px] font-bold">
              {discoveredFactsCount}/{totalFactsCount}
            </span>
          </button>

          <button
            onClick={handleToggleSound}
            className="pixel-btn p-2 bg-[#160f0d] hover:bg-[#241613] text-slate-300 cursor-pointer"
            title={isMuted ? 'Turn Sound On' : 'Turn Sound Off'}
          >
            {isMuted ? (
              <PixelIcon name="volumeOff" className="w-4 h-4 text-red-400" />
            ) : (
              <PixelIcon name="volumeOn" className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <button
            onClick={onOpenPauseMenu}
            className="pixel-btn p-2 bg-[#160f0d] hover:bg-[#241613] text-slate-300 cursor-pointer"
            title="Pause Game"
          >
            <PixelIcon name="menu" className="w-4 h-4 text-slate-200" />
          </button>
        </div>
      </div>

      {factToastTitle && (
        <div className="pointer-events-auto self-end mt-1 px-3 py-1.5 pixel-box-cyan bg-[#0a1419]/95 text-cyan-200 font-mono-hud text-[11px] flex items-center gap-2">
          <PixelIcon name="book" className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>FACT ADDED: <b className="text-white">{factToastTitle}</b> [M]</span>
        </div>
      )}

      <div className="w-full flex flex-col items-center justify-center my-auto">
        {showObjectiveBanner && (
          <div className="flex flex-col items-center bg-[#0d0807]/95 border-y-4 border-amber-500 px-6 sm:px-10 py-3 shadow-[4px_4px_0_#020302] max-w-2xl text-center">
            <span className="font-mono-hud text-xs tracking-widest text-amber-400 font-bold uppercase mb-1">
              NEW GOAL!
            </span>
            <span className="font-title text-sm sm:text-base font-bold tracking-wide text-white uppercase">
              {currentObjective}
            </span>
          </div>
        )}

        {warningMessage && (
          <div className="mt-3 flex items-center gap-2 px-4 py-2 pixel-box-red bg-red-950 text-red-200 font-mono-hud text-xs animate-bounce">
            <PixelIcon name="alert" className="w-4 h-4 text-red-400 shrink-0" />
            <span>{warningMessage}</span>
          </div>
        )}
      </div>

      <div className="w-full flex justify-center mb-2">
        {interactionPrompt && (
          <button
            type="button"
            onClick={() => {
              if (stage === 'm3_stage_4_mav_ascent') {
                virtualInput.triggerSpace();
              } else {
                virtualInput.triggerAction();
              }
            }}
            className="pointer-events-auto px-5 py-2.5 pixel-box-amber bg-[#120b09] hover:bg-[#1f1310] text-white font-mono-hud text-xs sm:text-sm font-bold tracking-wider flex items-center gap-2.5 animate-pulse cursor-pointer"
          >
            <span className="inline-block w-2.5 h-2.5 bg-amber-400" />
            <span>{interactionPrompt}</span>
          </button>
        )}
      </div>

      {showTouchControls && (
        <>
          <div className="pointer-events-auto absolute bottom-52 sm:bottom-56 left-4 z-40 grid grid-cols-3 gap-1 w-32 select-none">
            <div />
            <button
              type="button"
              onPointerDown={() => (virtualInput.up = true)}
              onPointerUp={() => (virtualInput.up = false)}
              onPointerLeave={() => (virtualInput.up = false)}
              onPointerCancel={() => (virtualInput.up = false)}
              className="pixel-btn h-10 bg-[#1a100d]/90 active:bg-amber-500 active:text-black text-amber-300 font-title text-xs flex items-center justify-center cursor-pointer"
              aria-label="Move Up"
            >
              ▲
            </button>
            <div />
            <button
              type="button"
              onPointerDown={() => (virtualInput.left = true)}
              onPointerUp={() => (virtualInput.left = false)}
              onPointerLeave={() => (virtualInput.left = false)}
              onPointerCancel={() => (virtualInput.left = false)}
              className="pixel-btn h-10 bg-[#1a100d]/90 active:bg-amber-500 active:text-black text-amber-300 font-title text-xs flex items-center justify-center cursor-pointer"
              aria-label="Move Left"
            >
              ◀
            </button>
            <button
              type="button"
              onPointerDown={() => (virtualInput.down = true)}
              onPointerUp={() => (virtualInput.down = false)}
              onPointerLeave={() => (virtualInput.down = false)}
              onPointerCancel={() => (virtualInput.down = false)}
              className="pixel-btn h-10 bg-[#1a100d]/90 active:bg-amber-500 active:text-black text-amber-300 font-title text-xs flex items-center justify-center cursor-pointer"
              aria-label="Move Down"
            >
              ▼
            </button>
            <button
              type="button"
              onPointerDown={() => (virtualInput.right = true)}
              onPointerUp={() => (virtualInput.right = false)}
              onPointerLeave={() => (virtualInput.right = false)}
              onPointerCancel={() => (virtualInput.right = false)}
              className="pixel-btn h-10 bg-[#1a100d]/90 active:bg-amber-500 active:text-black text-amber-300 font-title text-xs flex items-center justify-center cursor-pointer"
              aria-label="Move Right"
            >
              ▶
            </button>
          </div>

          <div className="pointer-events-auto absolute bottom-56 sm:bottom-60 right-4 z-40 flex flex-col gap-2 select-none">
            {stage === 'm3_stage_4_mav_ascent' ? (
              <button
                type="button"
                onClick={() => virtualInput.triggerSpace()}
                className="pixel-btn px-4 py-3 bg-red-500 hover:bg-red-400 text-white font-title text-[10px] uppercase cursor-pointer"
              >
                DROP TANK [SPACE]
              </button>
            ) : (
              <button
                type="button"
                onClick={() => virtualInput.triggerAction()}
                className={`pixel-btn px-4 py-3 font-title text-[11px] uppercase cursor-pointer ${
                  interactionPrompt
                    ? 'bg-amber-500 text-black animate-pulse'
                    : 'bg-[#1a100d]/90 text-slate-300'
                }`}
              >
                USE [E]
              </button>
            )}
          </div>
        </>
      )}

      <div className="flex items-end justify-between w-full">

        {/* Pixel Radar Minimap — Points Player Toward Next Target */}
        {(() => {
          const dx = waypoint ? (waypoint.dx ?? waypoint.x - 1000) : 0;
          const dy = waypoint ? (waypoint.dy ?? waypoint.y - 1000) : 0;
          const distPx = Math.hypot(dx, dy);
          const angleRad = Math.atan2(dy, dx);
          const arrowDeg = (angleRad * 180) / Math.PI + 90;

          const getCompassDir = (rad: number) => {
            const deg = ((rad * 180) / Math.PI + 360) % 360;
            if (deg >= 337.5 || deg < 22.5) return 'E';
            if (deg < 67.5) return 'SE';
            if (deg < 112.5) return 'S';
            if (deg < 157.5) return 'SW';
            if (deg < 202.5) return 'W';
            if (deg < 247.5) return 'NW';
            if (deg < 292.5) return 'N';
            return 'NE';
          };

          const compassDir = waypoint ? getCompassDir(angleRad) : '';
          const blipRadius = distPx < 40 ? 0 : Math.min(48, Math.max(18, distPx / 14));
          const blipX = Math.round(Math.cos(angleRad) * blipRadius);
          const blipY = Math.round(Math.sin(angleRad) * blipRadius);
          const isVeryClose = waypoint ? waypoint.distanceMeters <= 5 : false;

          return (
            <div className="flex flex-col items-start gap-1">
              {waypoint && (
                <div className="px-2 py-0.5 pixel-box bg-[#120b09] border border-amber-500/80 text-[9px] sm:text-[10px] font-mono-hud font-bold text-amber-300 uppercase truncate max-w-40 sm:max-w-48">
                  TARGET: {waypoint.label}
                </div>
              )}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 pixel-box bg-[#0b0706] overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage:
                      'linear-gradient(rgba(220,101,71,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(220,101,71,0.35) 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                <div className="absolute inset-3 border border-[#49302b] pointer-events-none" />
                <div className="absolute inset-8 border border-[#3a221c] pointer-events-none" />
                <div className="absolute w-full h-[2px] bg-[#49302b]" />
                <div className="absolute h-full w-[2px] bg-[#49302b]" />

                <span className="absolute top-1 text-[9px] font-mono-hud font-bold text-slate-300">N</span>
                <span className="absolute bottom-1 right-2 text-[9px] font-mono-hud font-bold text-slate-500">S</span>
                <span className="absolute left-1.5 text-[9px] font-mono-hud font-bold text-slate-500">W</span>
                <span className="absolute right-1.5 text-[9px] font-mono-hud font-bold text-slate-500">E</span>

                {/* Directional Arrow Rotating Around Player Toward Target */}
                {waypoint && !isVeryClose && (
                  <div
                    className="absolute z-20 pointer-events-none flex items-center justify-center"
                    style={{
                      width: '68px',
                      height: '68px',
                      transform: `rotate(${arrowDeg}deg)`,
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 -translate-y-6 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]"
                      fill="none"
                    >
                      <path
                        d="M12 2L20 14H15V22H9V14H4L12 2Z"
                        fill="#fbbf24"
                        stroke="#020302"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                )}

                {/* Player Marker (Center) */}
                <div className="w-3.5 h-3.5 bg-white border-2 border-black z-10 flex items-center justify-center shadow-[0_0_6px_rgba(56,189,248,0.8)]">
                  <div className="w-1.5 h-1.5 bg-sky-400" />
                </div>

                {/* Relative Target Blip */}
                {waypoint && (
                  <div
                    className="absolute z-15 flex flex-col items-center justify-center animate-pulse pointer-events-none"
                    style={{
                      transform: `translate(${blipX}px, ${blipY}px)`,
                    }}
                  >
                    <div className="w-3 h-3 bg-amber-400 border-2 border-black" />
                  </div>
                )}

                {/* Direction + Distance Readout */}
                {waypoint && (
                  <div className="absolute bottom-1.5 px-2 py-0.5 bg-black/95 border-2 border-amber-500 text-[10px] font-mono-hud font-bold text-amber-300 z-20">
                    {isVeryClose ? `HERE! (${waypoint.distanceMeters}m)` : `GO ${compassDir} · ${waypoint.distanceMeters}m`}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        <div className="flex flex-col gap-2 items-end">

          {activeMission === 'mission_2' && (
            <div className="flex items-center gap-3 px-3 py-2 pixel-box-cyan bg-[#0a1419]">
              <div className="flex items-center justify-center w-8 h-8 bg-cyan-950 border-2 border-cyan-500 text-cyan-400">
                <PixelIcon name="activity" className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex flex-col w-28 sm:w-36">
                <div className="flex justify-between items-center text-[10px] font-mono-hud mb-1">
                  <span className="text-cyan-300 font-bold uppercase">Cave Signal</span>
                  <span className="text-cyan-400 font-bold">{resources.signalStrength ?? 20}%</span>
                </div>
                <PixelMeterBar value={resources.signalStrength ?? 20} colorClass="bg-cyan-400" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 p-2.5 pixel-box bg-[#0d0807]">

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-7 h-7 bg-sky-950 border-2 text-sky-400 ${
                  isLowOxygen ? 'border-red-500 animate-pulse' : 'border-sky-500'
                }`}
              >
                <PixelIcon name="wind" className="w-4 h-4" />
              </div>
              <div className="flex flex-col w-28 sm:w-36">
                <div className="flex justify-between items-center text-[10px] font-mono-hud mb-0.5">
                  <span className="text-slate-300 font-bold uppercase">Suit Air (O₂)</span>
                  <span className={isLowOxygen ? 'text-red-400 font-bold' : 'text-sky-300 font-bold'}>
                    {Math.round(resources.oxygen)}%
                  </span>
                </div>
                <PixelMeterBar
                  value={resources.oxygen}
                  colorClass={
                    resources.oxygen > 50
                      ? 'bg-sky-400'
                      : resources.oxygen > 25
                      ? 'bg-amber-400'
                      : 'bg-red-500'
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 bg-amber-950 border-2 border-amber-500 text-amber-400">
                <PixelIcon name="battery" className="w-4 h-4" />
              </div>
              <div className="flex flex-col w-28 sm:w-36">
                <div className="flex justify-between items-center text-[10px] font-mono-hud mb-0.5">
                  <span className="text-slate-300 font-bold uppercase">Battery</span>
                  <span className={isLowBattery ? 'text-red-400 font-bold' : 'text-amber-300 font-bold'}>
                    {Math.round(resources.battery)}%
                  </span>
                </div>
                <PixelMeterBar
                  value={resources.battery}
                  colorClass={resources.battery > 40 ? 'bg-amber-400' : 'bg-red-500'}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 bg-emerald-950 border-2 border-emerald-500 text-emerald-400">
                <PixelIcon name="shieldAlert" className="w-4 h-4" />
              </div>
              <div className="flex flex-col w-28 sm:w-36">
                <div className="flex justify-between items-center text-[10px] font-mono-hud mb-0.5">
                  <span className="text-slate-300 font-bold uppercase">Ray Shield</span>
                  <span className={isDamagedRover ? 'text-red-400 font-bold' : 'text-emerald-300 font-bold'}>
                    {Math.round(resources.condition)}%
                  </span>
                </div>
                <PixelMeterBar
                  value={resources.condition}
                  colorClass={
                    resources.condition > 50
                      ? 'bg-emerald-400'
                      : resources.condition > 25
                      ? 'bg-amber-400'
                      : 'bg-red-500'
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 items-end">
            {activeMission === 'mission_1' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 pixel-box bg-[#0d0807]">
                <PixelIcon name="zap" className={`w-3.5 h-3.5 ${resources.hasCoupler ? 'text-cyan-400' : 'text-slate-600'}`} />
                <span className="text-[10px] font-mono-hud uppercase tracking-wider text-slate-300">
                  Power Part:
                </span>
                <span
                  className={`text-[10px] font-mono-hud font-bold px-1.5 py-0.5 ${
                    resources.hasCoupler ? 'bg-cyan-950 border border-cyan-400 text-cyan-300' : 'bg-slate-900 text-slate-500'
                  }`}
                >
                  {resources.hasCoupler ? 'GOT IT!' : 'NOT YET'}
                </span>
              </div>
            ) : activeMission === 'mission_2' ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 pixel-box bg-[#0d0807]">
                  <PixelIcon name="layers" className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-mono-hud uppercase tracking-wider text-slate-300">
                    Sensors:
                  </span>
                  <span className="text-[10px] font-mono-hud font-bold px-1.5 py-0.5 bg-amber-950 border border-amber-500 text-amber-300">
                    {resources.beaconsPlaced ?? 0}/{resources.totalBeacons ?? 2} Dropped
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 pixel-box bg-[#0d0807]">
                  <PixelIcon name="sparkles" className={`w-3.5 h-3.5 ${resources.hasCoreSample ? 'text-cyan-400' : 'text-slate-600'}`} />
                  <span className="text-[10px] font-mono-hud uppercase tracking-wider text-slate-300">
                    Mars Rock:
                  </span>
                  <span
                    className={`text-[10px] font-mono-hud font-bold px-1.5 py-0.5 ${
                      resources.hasCoreSample ? 'bg-cyan-950 border border-cyan-400 text-cyan-300' : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {resources.hasCoreSample ? 'TUBE #14 SAVED' : 'NOT YET'}
                  </span>
                </div>
              </>
            ) : (
              <>
                {stage === 'm3_stage_4_mav_ascent' ? (
                  <div className="flex flex-col gap-1 p-2.5 pixel-box-amber bg-[#0d0807]">
                    <div className="flex justify-between items-center text-[10px] font-mono-hud text-amber-400 font-bold">
                      <span>MARS ROCKET</span>
                      <span>PART {resources.mavStage ?? 1}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono-hud">
                      <span className="text-slate-300">HEIGHT: <b className="text-white">{resources.mavAltitudeKm ?? 0} km</b></span>
                      <span className="text-slate-300">SPEED: <b className="text-sky-400">{resources.mavVelocityMs ?? 0}</b></span>
                    </div>
                    <PixelMeterBar value={((resources.mavAltitudeKm ?? 0) / 120) * 100} colorClass="bg-amber-400" />
                  </div>
                ) : stage === 'm3_stage_5_orbital_dock' ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 pixel-box-cyan bg-[#0a1419]">
                    <PixelIcon name="sparkles" className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono-hud uppercase tracking-wider text-cyan-300 font-bold">
                      {resources.mavDocked ? 'DOCKED SAFE!' : 'STEER TO SPACESHIP!'}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-3 py-1.5 pixel-box bg-[#0d0807]">
                      <PixelIcon name="zap" className={`w-3.5 h-3.5 ${resources.breakersConfigured ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`} />
                      <span className="text-[10px] font-mono-hud uppercase tracking-wider text-slate-300">
                        Heater #2:
                      </span>
                      <span
                        className={`text-[10px] font-mono-hud font-bold px-1.5 py-0.5 ${
                          resources.breakersConfigured ? 'bg-emerald-950 border border-emerald-500 text-emerald-300' : 'bg-red-950 border border-red-500 text-red-300'
                        }`}
                      >
                        {resources.breakersConfigured ? 'FIXED!' : 'BROKEN!'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 pixel-box bg-[#0d0807]">
                      <PixelIcon name="sparkles" className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-mono-hud uppercase tracking-wider text-slate-300">
                        Bag:
                      </span>
                      <span className="text-[10px] font-mono-hud font-bold px-1.5 py-0.5 bg-cyan-950 border border-cyan-500 text-cyan-300">
                        MARS ROCK #14
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
