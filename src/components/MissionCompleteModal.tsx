import React, { useState } from 'react';
import { MissionStats, MissionId } from '../types/game';
import { sounds } from '../audio/SoundManager';
import { PixelIcon } from './PixelIcon';

interface MissionCompleteModalProps {
  stats: MissionStats;
  onReplay: () => void;
  onContinueToMission2?: () => void;
  onContinueToMission3?: () => void;
  onWatchFinalHomeVideo?: () => void;
  onSelectMission?: (mission: MissionId) => void;
  onOpenFieldGuide: () => void;
}

export const MissionCompleteModal: React.FC<MissionCompleteModalProps> = ({
  stats,
  onReplay,
  onContinueToMission2,
  onContinueToMission3,
  onWatchFinalHomeVideo,
  onSelectMission,
  onOpenFieldGuide,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const isMission2 = stats.missionId === 'mission_2';
  const isMission3 = stats.missionId === 'mission_3';
  const isMission1 = stats.missionId === 'mission_1';
  const [mission1CheckIndex, setMission1CheckIndex] = useState(0);
  const [mission1CheckPassed, setMission1CheckPassed] = useState(false);
  const [mission1CheckComplete, setMission1CheckComplete] = useState(false);
  const [mission1CheckFeedback, setMission1CheckFeedback] = useState('');

  const mission1Checks = [
    {
      question: 'What does Jezero Crater tell us about Mars long ago?',
      answers: ['A river once flowed into a lake there.', 'Wind alone made the fan-shaped delta.', 'The rocks were made by a recent volcano.'],
      correct: 0,
    },
    {
      question: 'Why can a message from Mars take minutes to reach Earth?',
      answers: ['Radio waves need time to cross the huge distance.', 'Mars turns too slowly to send a quick reply.', 'The message must travel through the rover’s wheels.'],
      correct: 0,
    },
    {
      question: 'What can a thick dust storm do on Mars?',
      answers: ['Scatter and block some sunlight before it reaches the ground.', 'Make sunlight travel more slowly through space.', 'Make the Sun produce less energy.'],
      correct: 0,
    },
  ];
  const activeMission1Check = mission1Checks[mission1CheckIndex];

  const learnedSummary = isMission3
    ? 'You learned why dusty rover parts must be shut down inside a 400W power budget, how a two-stage Mars Rocket drops its empty tank cleanly, and how astronauts dock safely in microgravity while heading home to Earth!'
    : isMission2
    ? 'You used ground-penetrating radar (RIMFAX) across an ancient river valley, discovered how thick stone lava tubes block 95% of space rays, and sealed Rock Tube #14 before escaping the shaking Marsquake!'
    : 'You learned why astronauts repair gear with spare parts, why radio messages between Mars and Earth take several minutes, and why thin-air Mars dust storms mean crews must hurry indoors!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto pixel-box-emerald bg-[#0d110e] p-6 sm:p-8 text-white">
        <div className="text-center pb-5 border-b-2 border-[#2a4938]">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-950 text-emerald-400 border-3 border-emerald-500 mb-3 shadow-[3px_3px_0_#020302]">
            <PixelIcon name="trophy" className="w-8 h-8" />
          </div>
          <div className="font-mono-hud text-xs tracking-widest text-emerald-400 font-bold uppercase mb-1">
            GREAT JOB!
          </div>
          <h1 className="font-title text-2xl sm:text-4xl font-black tracking-wider uppercase text-white drop-shadow-[3px_3px_0_#020302]">
            {isMission3 ? 'WELCOME HOME TO EARTH!' : 'MISSION DONE!'}
          </h1>
          <p className="font-mono-hud text-xs sm:text-sm text-slate-400 mt-2">
            {isMission3
              ? 'Mission 3: Rocket Home'
              : isMission2
              ? 'Mission 2: Underground Cave'
              : 'Mission 1: Fix the Radio'}
          </p>
        </div>

        <div className="my-5 p-4 bg-[#141a15] border-2 border-[#355a44] text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono-hud font-bold mb-2">
            <PixelIcon name="radio" className="w-4 h-4 animate-pulse text-emerald-400" />
            <span>
              {isMission3
                ? 'ROCKET DOCKED SAFE — RETURNING TO EARTH!'
                : isMission2
                ? 'MARS ROCK SAVED & MISSION 3 UNLOCKED!'
                : 'RADIO FIXED & MISSION 2 UNLOCKED!'}
            </span>
          </div>
          <p className="font-title text-xs sm:text-sm font-bold text-slate-100 tracking-wide leading-relaxed">
            {isMission3
              ? '“You brought Hazaloom, Hedeya, and Samantha safely back to Earth with Rock Tube #14!”'
              : isMission2
              ? '“You protected the crew underground and escaped the Marsquake with Rock Tube #14!”'
              : '“You fixed the Hill Radio Tower, spotted Earth’s dust-storm scan, and got your crew to safety!”'}
          </p>
          <p className="text-xs font-mono-hud text-slate-300 mt-2">
            {isMission3
              ? 'Every trade-off you made in power, air, shielding, and zero-G health brought everyone home!'
              : isMission2
              ? 'Next step: launch the Mars Rocket in Mission 3 or explore your unlocked NASA findings!'
              : 'Next step: use Earth’s rescue plan in Mission 2 (Cave Shield & Rock #14) or inspect your NASA findings!'}
          </p>
        </div>

        <div className="mb-5 p-4 bg-sky-950/50 border-2 border-sky-500">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-hud font-bold text-sky-300 uppercase mb-1.5">
            <span className="flex items-center gap-1.5">
              <PixelIcon name="sun" className="w-3.5 h-3.5 text-amber-400" />
              WHAT YOU LEARNED &amp; DECIDED ON MARS
            </span>
            <span className="text-emerald-300">
              SCIENCE SCORE: {stats.scienceScore ?? 10} PTS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {learnedSummary}
          </p>

          <div className="mt-2.5 pt-2 border-t border-sky-500/40 space-y-1 text-xs font-mono-hud text-amber-200">
            {stats.tradeOffTitle && (
              <p>
                • Strategy Picked: <b className="text-white">{stats.tradeOffTitle}</b>
              </p>
            )}
            {!isMission2 && !isMission3 && stats.m1StormChoice && (
              <p>
                • Radio Tower Decision:{' '}
                <b className="text-white">
                  {stats.m1StormChoice === 'wait_earth'
                    ? 'Waited for Earth Storm Scan (+35 Science) & fought full headwind back to Base!'
                    : 'Auto-Sent SOS (-15% Battery) to outrun the heavy storm!'}
                </b>
              </p>
            )}
            {isMission2 && stats.m2DrillChoice && (
              <p>
                • Lava Cave Drill Choice:{' '}
                <b className="text-white">
                  {stats.m2DrillChoice === 'deep_ice'
                    ? 'Deep Ice-Vein Core (+55 Science, +15% Air) & dodged extra Marsquake rocks!'
                    : 'Safe Upper-Layer Core (+25 Science) for a steady cave escape!'}
                </b>
              </p>
            )}
            {isMission3 && stats.breakerChoice && (
              <p>
                • Rover 400W Power Choice:{' '}
                <b className="text-white">
                  {stats.breakerChoice === 'shield'
                    ? 'Ray & Dust Shield (cut dust tornado damage in half!)'
                    : stats.breakerChoice === 'scanner'
                    ? 'Rock Scanner (+25 extra Science Points!)'
                    : 'Battery Boost (+15% extra power saved!)'}
                </b>
              </p>
            )}
            {isMission3 && stats.m3LaunchChoice && (
              <p>
                • Rocket Launch Setup:{' '}
                <b className="text-white">
                  {stats.m3LaunchChoice === 'heavy_shield'
                    ? 'Heavy Heat-Shield Hull (+20% Shielding, steady climb)'
                    : stats.m3LaunchChoice === 'light_autopilot'
                    ? 'Ultra-Light Auto-Pilot (24% faster climb, sharp steering)'
                    : 'Extra Science & Veggie Pod (+35 Science, steered through crosswinds)'}
                </b>
              </p>
            )}
            {isMission3 && stats.m3HealthBoostChoice && (
              <p>
                • Return Ship Crew Boost:{' '}
                <b className="text-white">
                  {stats.m3HealthBoostChoice === 'fitness'
                    ? 'Space Health Lab (+20 Science)'
                    : stats.m3HealthBoostChoice === 'shield'
                    ? 'Solar Ray Shield (+15% Final Shielding)'
                    : 'Greenhouse Air (+15% Life Support & +10 Science)'}
                </b>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-[#140e0d] border-2 border-[#49302b]">
            <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-400 mb-1">
              <PixelIcon name="clock" className="w-4 h-4 text-sky-400" />
              <span>TIME</span>
            </div>
            <div className="font-title text-sm font-bold text-white mt-1">
              {formatTime(stats.elapsedSeconds)}
            </div>
          </div>

          <div className="p-3.5 bg-[#140e0d] border-2 border-[#49302b]">
            <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-400 mb-1">
              <PixelIcon name="wind" className="w-4 h-4 text-sky-400" />
              <span>LIFE SUPPORT</span>
            </div>
            <div className="font-title text-sm font-bold text-sky-300 mt-1">
              {Math.round(stats.finalOxygen)}%
            </div>
          </div>

          <div className="p-3.5 bg-[#140e0d] border-2 border-[#49302b]">
            <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-400 mb-1">
              <PixelIcon name="battery" className="w-4 h-4 text-amber-400" />
              <span>POWER LEFT</span>
            </div>
            <div className="font-title text-sm font-bold text-amber-300 mt-1">
              {Math.round(stats.finalBattery)}%
            </div>
          </div>

          <div className="p-3.5 bg-[#140e0d] border-2 border-[#49302b]">
            <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-400 mb-1">
              <PixelIcon name="shield" className="w-4 h-4 text-emerald-400" />
              <span>SHIELDING LEFT</span>
            </div>
            <div className="font-title text-sm font-bold text-emerald-300 mt-1">
              {Math.round(stats.finalCondition)}%
            </div>
          </div>

          <div className="p-3.5 bg-[#140e0d] border-2 border-[#49302b]">
            <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-400 mb-1">
              <PixelIcon name="sparkles" className="w-4 h-4 text-purple-400" />
              <span>SCIENCE SCORE</span>
            </div>
            <div className="font-title text-sm font-bold text-purple-300 mt-1">
              {stats.scienceScore ?? 10} pts
            </div>
          </div>

          <div className="p-3.5 bg-[#140e0d] border-2 border-[#49302b]">
            <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-400 mb-1">
              <PixelIcon name="book" className="w-4 h-4 text-amber-400" />
              <span>SPACE FACTS</span>
            </div>
            <div className="font-title text-sm font-bold text-amber-200 mt-1">
              {stats.factsDiscovered} / {stats.totalFacts}
            </div>
          </div>
        </div>

        {isMission1 && (
          <div className="mb-5 p-4 bg-[#141a15] border-2 border-[#355a44]">
            {!mission1CheckComplete ? (
              <>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono-hud text-[10px] text-emerald-300">
                    BEFORE THE NEXT MISSION
                  </span>
                  <span className="font-mono-hud text-[10px] text-slate-400">
                    {mission1CheckIndex + 1} / {mission1Checks.length}
                  </span>
                </div>
                <p className="font-mono-hud text-xs sm:text-sm text-white leading-relaxed mb-3">
                  {activeMission1Check.question}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {activeMission1Check.answers.map((answer, index) => (
                    <button
                      key={`${mission1CheckIndex}-${index}`}
                      type="button"
                      disabled={mission1CheckPassed}
                      onClick={() => {
                        if (index === activeMission1Check.correct) {
                          setMission1CheckPassed(true);
                          setMission1CheckFeedback('That’s right!');
                          sounds.playPickup();
                        } else {
                          setMission1CheckFeedback('Not quite — try again!');
                        }
                      }}
                      className={`px-3 py-2 text-left border font-mono-hud text-xs transition-colors ${
                        mission1CheckPassed && index === activeMission1Check.correct
                          ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200'
                          : 'bg-[#0d110e] border-[#355a44] text-slate-200 hover:border-emerald-400 hover:text-white'
                      } ${mission1CheckPassed ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
                {mission1CheckFeedback && (
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className={`font-mono-hud text-xs ${mission1CheckPassed ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {mission1CheckFeedback}
                    </span>
                    {mission1CheckPassed && (
                      <button
                        type="button"
                        onClick={() => {
                          if (mission1CheckIndex === mission1Checks.length - 1) {
                            setMission1CheckComplete(true);
                          } else {
                            setMission1CheckIndex((current) => current + 1);
                            setMission1CheckPassed(false);
                            setMission1CheckFeedback('');
                          }
                        }}
                        className="pixel-btn px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-title text-[10px] cursor-pointer"
                      >
                        {mission1CheckIndex === mission1Checks.length - 1 ? 'Finish' : 'Next'}
                        <PixelIcon name="arrowRight" className="w-3 h-3 inline ml-1" />
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="font-mono-hud text-xs text-emerald-300">
                <PixelIcon name="check" className="w-4 h-4 inline mr-1" />
                Great work — you’re ready for the next mission!
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 pt-4 border-t-2 border-[#2a4938]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenFieldGuide}
              className="pixel-btn flex-1 sm:flex-initial px-4 py-3 bg-[#1e1412] hover:bg-[#2a1b18] text-slate-200 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PixelIcon name="book" className="w-4 h-4 text-amber-400" />
              <span>Facts &amp; Data</span>
            </button>

            {onSelectMission && (
              <button
                onClick={() => onSelectMission(isMission3 ? 'mission_1' : stats.missionId)}
                className="pixel-btn px-4 py-3 bg-[#1e1412] hover:bg-[#2a1b18] text-slate-200 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                title="Main Menu"
              >
                <PixelIcon name="home" className="w-4 h-4" />
                <span>Menu</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {onWatchFinalHomeVideo && isMission3 && (
              <button
                onClick={onWatchFinalHomeVideo}
                className="pixel-btn px-4 py-3 bg-[#1e1412] hover:bg-[#2a1b18] text-emerald-300 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <PixelIcon name="film" className="w-4 h-4" />
                <span>Replay Final Home Video</span>
              </button>
            )}

            <button
              onClick={onReplay}
              className="pixel-btn px-5 py-3 bg-[#1e1412] hover:bg-[#2a1b18] text-white font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PixelIcon name="rotate" className="w-4 h-4" />
              <span>Play Again</span>
            </button>

            {!isMission2 && !isMission3 && onContinueToMission2 && (
              <button
                disabled={isMission1 && !mission1CheckComplete}
                onClick={() => {
                  sounds.playObjectiveStinger();
                  onContinueToMission2();
                }}
                className={`pixel-btn px-5 py-3 font-title text-[10px] flex items-center justify-center gap-2 ${isMission1 && !mission1CheckComplete ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer'}`}
              >
                <span>Play Mission 2!</span>
                <PixelIcon name="arrowRight" className="w-4 h-4" />
              </button>
            )}

            {isMission2 && onContinueToMission3 && (
              <button
                onClick={() => {
                  sounds.playObjectiveStinger();
                  onContinueToMission3();
                }}
                className="pixel-btn px-5 py-3 bg-red-500 hover:bg-red-400 text-white font-title text-[10px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Play Mission 3!</span>
                <PixelIcon name="arrowRight" className="w-4 h-4" />
              </button>
            )}

            {isMission3 && onSelectMission && (
              <button
                onClick={() => {
                  sounds.playObjectiveStinger();
                  onSelectMission('mission_1');
                }}
                className="pixel-btn px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-title text-[10px] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Main Menu</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
