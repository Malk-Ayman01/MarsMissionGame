import React, { useState } from 'react';
import { sounds } from '../audio/SoundManager';
import { ExplorerMode, MissionId } from '../types/game';
import { CrewMember } from '../data/CrewData';
import { PixelIcon } from './PixelIcon';
import { PixelImage } from './PixelImage';

interface MainMenuProps {
  selectedMission: MissionId;
  completedMissions: MissionId[];
  selectedCrew?: CrewMember | null;
  explorerMode: ExplorerMode;
  onSelectExplorerMode: (mode: ExplorerMode) => void;
  onSelectMission: (mission: MissionId) => void;
  onStartGame: () => void;
  onOpenFieldGuide: () => void;
  onChangeCrew?: () => void;
  onBackToHome?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  selectedMission,
  completedMissions,
  selectedCrew,
  explorerMode,
  onSelectExplorerMode,
  onSelectMission,
  onStartGame,
  onOpenFieldGuide,
  onChangeCrew,
  onBackToHome,
}) => {
  const [showBriefing, setShowBriefing] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const isMission1Done = completedMissions.includes('mission_1');
  const isMission2Done = completedMissions.includes('mission_2');
  const isMission3Done = completedMissions.includes('mission_3');

  const isMission2Unlocked = isMission1Done;
  const isMission3Unlocked = isMission2Done;

  const isSelectedUnlocked =
    selectedMission === 'mission_1' ||
    (selectedMission === 'mission_2' && isMission2Unlocked) ||
    (selectedMission === 'mission_3' && isMission3Unlocked);

  const handleStart = () => {
    if (!isSelectedUnlocked) return;
    sounds.playObjectiveStinger();
    onStartGame();
  };

  const bgImage =
    selectedMission === 'mission_3'
      ? '/assets/nasa/sample_core_tube.jpg'
      : selectedMission === 'mission_2'
      ? '/assets/nasa/kodiak_layered_rock.jpg'
      : '/assets/nasa/jezero_crater.jpg';

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-12 overflow-y-auto select-none bg-[#0c0706]">

      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Mars Surface"
          style={{ imageRendering: 'auto' }}
          className="w-full h-full object-cover object-center brightness-[0.35] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0706] via-[#0c0706]/75 to-[#0c0706]/45" />
      </div>

      <div className="relative z-10 flex items-center justify-between border-b-4 border-orange-950/80 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 bg-red-500 animate-ping" />
          <span className="font-mono-hud text-xs sm:text-sm font-bold tracking-widest text-orange-400 uppercase">
            MARS EXPLORER // JEZERO CRATER
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#1e100d] border-2 border-orange-500/60 text-xs font-mono-hud text-orange-300">
          <PixelIcon name="sparkles" className="w-3.5 h-3.5 text-amber-400" />
          <span>REAL NASA MARS ADVENTURE</span>
        </div>
      </div>

      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-5xl mx-auto py-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#24100d] border-2 border-red-500 text-red-300 text-xs font-mono-hud font-bold uppercase mb-3 shadow-[3px_3px_0_#020302]">
          {selectedCrew?.image ? (
            <PixelImage
              src={selectedCrew.image}
              alt={selectedCrew.name}
              pixelWidth={24}
              colorLevels={9}
              className="w-6 h-6 object-contain bg-black border border-red-500/60 pixelated"
            />
          ) : (
            <PixelIcon name="radio" className="w-3.5 h-3.5 animate-pulse text-red-400" />
          )}
          <span>
            {selectedCrew
              ? `CREW LEADER: ${selectedCrew.name.toUpperCase()} · ${selectedCrew.role.toUpperCase()}`
              : 'PLAY WITH HAZALOOM, HEDEYA & SAMANTHA'}
          </span>
        </div>

        <h1 className="font-title text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[4px_4px_0_#020302]">
          MARS MISSION
        </h1>
        <p className="font-mono-hud text-xs sm:text-sm text-slate-300 mt-3 max-w-2xl">
          Your 3 astronauts are stranded on Mars! Help them survive each crisis, use real NASA data to make smart trade-offs, and get everyone safely back to Earth!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-6">

          <button
            onClick={() => {
              onSelectMission('mission_1');
              sounds.playPickup();
            }}
            className={`p-4 text-left cursor-pointer ${
              selectedMission === 'mission_1'
                ? 'pixel-box-amber bg-[#261a0a]'
                : 'pixel-box bg-[#140e0d] hover:bg-[#1e1412]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono-hud font-bold text-amber-400 uppercase tracking-wider">
                MISSION 1
              </span>
              {isMission1Done ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 text-[9px] font-mono-hud font-bold">
                  <PixelIcon name="check" className="w-3 h-3" />
                  <span>DONE!</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 text-[9px] font-mono-hud font-bold">
                  OPEN
                </span>
              )}
            </div>
            <div className="font-title text-sm sm:text-base font-bold text-white uppercase mt-2">
              Call Earth For Help
            </div>
            <p className="font-mono-hud text-xs text-slate-300 mt-2 leading-relaxed">
              A landing blast broke your return ship and radio! Grab the spare part, drive to the Hill Tower to warn Earth, and beat the dust storm!
            </p>
          </button>

          <button
            disabled={!isMission2Unlocked}
            onClick={() => {
              if (!isMission2Unlocked) return;
              onSelectMission('mission_2');
              sounds.playPickup();
            }}
            className={`p-4 text-left ${
              !isMission2Unlocked
                ? 'pixel-box bg-[#0e0a09] opacity-65 cursor-not-allowed'
                : selectedMission === 'mission_2'
                ? 'pixel-box-cyan bg-[#0a1d24] cursor-pointer'
                : 'pixel-box bg-[#140e0d] hover:bg-[#1e1412] cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono-hud font-bold text-cyan-400 uppercase tracking-wider">
                MISSION 2
              </span>
              {!isMission2Unlocked ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 text-[9px] font-mono-hud font-bold">
                  <PixelIcon name="lock" className="w-3 h-3 text-amber-400" />
                  <span>LOCKED</span>
                </span>
              ) : isMission2Done ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 text-[9px] font-mono-hud font-bold">
                  <PixelIcon name="check" className="w-3 h-3" />
                  <span>DONE!</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500 text-cyan-300 text-[9px] font-mono-hud font-bold">
                  UNLOCKED!
                </span>
              )}
            </div>
            <div className="font-title text-sm sm:text-base font-bold text-white uppercase mt-2">
              Cave Shield &amp; Rock #14
            </div>
            <p className="font-mono-hud text-xs text-slate-300 mt-2 leading-relaxed">
              {!isMission2Unlocked
                ? 'Finish Mission 1 first so Earth can send your rescue plan!'
                : 'Use radar sensors to find a radiation-safe lava cave, drill Rock Tube #14 for launch tests, and escape a Marsquake!'}
            </p>
          </button>

          <button
            disabled={!isMission3Unlocked}
            onClick={() => {
              if (!isMission3Unlocked) return;
              onSelectMission('mission_3');
              sounds.playPickup();
            }}
            className={`p-4 text-left ${
              !isMission3Unlocked
                ? 'pixel-box bg-[#0e0a09] opacity-65 cursor-not-allowed'
                : selectedMission === 'mission_3'
                ? 'pixel-box-red bg-[#260c0e] cursor-pointer'
                : 'pixel-box bg-[#140e0d] hover:bg-[#1e1412] cursor-pointer'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono-hud font-bold text-red-400 uppercase tracking-wider">
                MISSION 3
              </span>
              {!isMission3Unlocked ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 text-[9px] font-mono-hud font-bold">
                  <PixelIcon name="lock" className="w-3 h-3 text-amber-400" />
                  <span>LOCKED</span>
                </span>
              ) : isMission3Done ? (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 text-[9px] font-mono-hud font-bold">
                  <PixelIcon name="check" className="w-3 h-3" />
                  <span>DONE!</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-red-950 border border-red-500 text-red-300 text-[9px] font-mono-hud font-bold">
                  UNLOCKED!
                </span>
              )}
            </div>
            <div className="font-title text-sm sm:text-base font-bold text-white uppercase mt-2">
              Launch &amp; Fly Home
            </div>
            <p className="font-mono-hud text-xs text-slate-300 mt-2 leading-relaxed">
              {!isMission3Unlocked
                ? 'Finish Mission 2 first to collect Rock Tube #14 for the rocket!'
                : 'Shut off a power-leaking heater, dodge dust tornadoes to the Rocket Pad, steer into orbit, and keep your crew healthy all the way home!'}
            </p>
          </button>
        </div>

        <div className="mt-5 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              sounds.playSwitchClick();
              onSelectExplorerMode('junior');
            }}
            className={`p-2.5 text-left cursor-pointer border-2 ${
              explorerMode === 'junior'
                ? 'bg-emerald-950/75 border-emerald-400 shadow-[3px_3px_0_#020302]'
                : 'bg-[#140e0d] border-[#49302b] hover:border-emerald-600'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono-hud font-bold">
              <span className="text-emerald-300">AGES 7–10 // JUNIOR EXPLORER</span>
              {explorerMode === 'junior' && (
                <span className="px-1.5 py-0.5 bg-emerald-400 text-black text-[9px]">ACTIVE</span>
              )}
            </div>
            <div className="font-mono-hud text-[11px] text-slate-300 mt-1">
              Gentler Suit Air drain, wider Rocket &amp; Drill zones, optional Read-Aloud audio.
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playSwitchClick();
              onSelectExplorerMode('commander');
            }}
            className={`p-2.5 text-left cursor-pointer border-2 ${
              explorerMode === 'commander'
                ? 'bg-amber-950/75 border-amber-400 shadow-[3px_3px_0_#020302]'
                : 'bg-[#140e0d] border-[#49302b] hover:border-amber-600'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono-hud font-bold">
              <span className="text-amber-300">AGES 11–15 // SENIOR COMMANDER</span>
              {explorerMode === 'commander' && (
                <span className="px-1.5 py-0.5 bg-amber-400 text-black text-[9px]">ACTIVE</span>
              )}
            </div>
            <div className="font-mono-hud text-[11px] text-slate-300 mt-1">
              Real NASA hazard pacing, tight orbital rocket steering, &amp; deeper STEM telemetry.
            </div>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full max-w-lg">
          <button
            disabled={!isSelectedUnlocked}
            onClick={handleStart}
            className={`w-full sm:flex-1 py-4 px-6 pixel-btn font-title text-xs tracking-wider uppercase flex items-center justify-center gap-2 ${
              !isSelectedUnlocked
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : selectedMission === 'mission_3'
                ? 'bg-red-500 hover:bg-red-400 text-white cursor-pointer'
                : selectedMission === 'mission_2'
                ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer'
                : 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer'
            }`}
          >
            <PixelIcon name="play" className="w-4 h-4" />
            <span>
              Play {selectedMission === 'mission_3' ? 'Mission 3' : selectedMission === 'mission_2' ? 'Mission 2' : 'Mission 1'}
            </span>
          </button>

          <button
            onClick={onOpenFieldGuide}
            className="w-full sm:w-auto py-4 px-5 pixel-btn bg-[#1e1412] hover:bg-[#2a1b18] text-slate-200 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <PixelIcon name="book" className="w-4 h-4 text-purple-400" />
            <span>Space Facts Book</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setShowBriefing(true)}
            className="flex items-center gap-1.5 text-xs font-mono-hud text-slate-300 hover:text-amber-300 cursor-pointer"
          >
            <PixelIcon name="info" className="w-3.5 h-3.5" />
            <span>Story</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center gap-1.5 text-xs font-mono-hud text-slate-300 hover:text-amber-300 cursor-pointer"
          >
            <PixelIcon name="compass" className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </button>
          {onChangeCrew && (
            <>
              <span className="text-slate-600">|</span>
              <button
                onClick={onChangeCrew}
                className="flex items-center gap-1.5 text-xs font-mono-hud text-slate-300 hover:text-amber-300 cursor-pointer"
              >
                <PixelIcon name="users" className="w-3.5 h-3.5" />
                <span>Crew</span>
              </button>
            </>
          )}
          {onBackToHome && (
            <>
              <span className="text-slate-600">|</span>
              <button
                onClick={onBackToHome}
                className="flex items-center gap-1.5 text-xs font-mono-hud text-slate-300 hover:text-amber-300 cursor-pointer"
              >
                <PixelIcon name="home" className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono-hud text-slate-400 border-t-4 border-[#49302b] pt-3 gap-2">
        <div>FINISH MISSION 1 TO UNLOCK MISSION 2 AND MISSION 3!</div>
        <div>REAL NASA MARS FACTS INSIDE</div>
      </div>

      {showBriefing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="relative w-full max-w-xl pixel-box-amber bg-[#140c0a] p-6 text-white max-h-[85vh] overflow-y-auto">
            <h3 className="font-title text-lg font-bold uppercase text-amber-400 mb-4">
              Your Rescue Story
            </h3>

            <div className="p-3.5 border-2 border-[#49302b] bg-[#0c0706] mb-3">
              <span className="text-xs font-mono-hud font-bold text-amber-400 uppercase">
                MISSION 1: WHY WE MUST FIX THE HILL RADIO
              </span>
              <p className="font-mono-hud text-xs text-slate-200 leading-relaxed mt-1">
                Right after landing, an explosion breaks your ship&apos;s return thrusters and radio! Earth thinks you are fine. You must grab the spare coupler from the Orange Box, ride the Rover to save Suit Air, reconnect Earth at the Hill Radio Tower, see Earth&apos;s dust-storm satellite scan, and race back to the green Base ring!
              </p>
            </div>

            <div className="p-3.5 border-2 border-[#49302b] bg-[#0c0706] mb-3">
              <span className="text-xs font-mono-hud font-bold text-cyan-400 uppercase">
                MISSION 2: WHY WE HIDE &amp; DRILL IN A LAVA CAVE
              </span>
              <p className="font-mono-hud text-xs text-slate-200 leading-relaxed mt-1">
                Earth&apos;s backup launch rocket needs a core sample (Rock Tube #14), and surface radiation is rising! You place 2 NASA RIMFAX radar sensors in Neretva Valley to map a hidden lava cave that blocks 95% of space rays—then drill the rock and outrun a Marsquake!
              </p>
            </div>

            <div className="p-3.5 border-2 border-[#49302b] bg-[#0c0706] mb-4">
              <span className="text-xs font-mono-hud font-bold text-red-400 uppercase">
                MISSION 3: WHY EVERY WATT &amp; HABIT COUNTS FOR HOME
              </span>
              <p className="font-mono-hud text-xs text-slate-200 leading-relaxed mt-1">
                Dust jams Heater #2, stealing 380W of your Rover&apos;s 400W power budget. You turn it off, pick your survival upgrade to reach the Mars Rocket past dust tornadoes, steer the two-stage launch yourself (since Earth is too far away!), and activate healthy crew habits for the flight home!
              </p>
            </div>

            <button
              onClick={() => setShowBriefing(false)}
              className="w-full py-3 pixel-btn bg-amber-500 hover:bg-amber-400 text-black text-xs font-title cursor-pointer"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      {showControls && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
          <div className="relative w-full max-w-lg pixel-box-amber bg-[#140c0a] p-6 text-white">
            <h3 className="font-title text-lg font-bold uppercase text-amber-400 mb-4">
              How to Play
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-hud mb-4">
              <div className="p-2.5 bg-[#0c0706] border-2 border-[#49302b]">
                <div className="text-slate-400">Walk / Drive / Dock:</div>
                <div className="text-amber-300 font-bold">WASD or Arrow Keys</div>
              </div>
              <div className="p-2.5 bg-[#0c0706] border-2 border-[#49302b]">
                <div className="text-slate-400">Pick Up / Use / Drill:</div>
                <div className="text-amber-300 font-bold">[E] Key</div>
              </div>
              <div className="p-2.5 bg-[#0c0706] border-2 border-[#49302b]">
                <div className="text-slate-400">Next Message:</div>
                <div className="text-amber-300 font-bold">[SPACE] or [ENTER]</div>
              </div>
              <div className="p-2.5 bg-[#0c0706] border-2 border-[#49302b]">
                <div className="text-slate-400">Fill Suit Air:</div>
                <div className="text-emerald-400 font-bold">Stand in Green Circle</div>
              </div>
            </div>
            <p className="font-mono-hud text-xs text-slate-300 leading-relaxed mb-4">
              • Follow the yellow diamond on your radar map at the bottom left.<br />
              • Watch the top bar for your current goal.<br />
              • Finish Mission 1 to unlock Mission 2, and finish Mission 2 to unlock Mission 3!
            </p>
            <button
              onClick={() => setShowControls(false)}
              className="w-full py-3 pixel-btn bg-amber-500 hover:bg-amber-400 text-black text-xs font-title cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
