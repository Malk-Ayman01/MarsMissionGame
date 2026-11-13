import React, { useEffect, useRef, useState } from 'react';
import { ExplorerMode, Mission2DrillChoice } from '../types/game';
import { sounds } from '../audio/SoundManager';
import { PixelIcon } from './PixelIcon';

interface RockDrillMiniGameModalProps {
  explorerMode?: ExplorerMode;
  onComplete: (batteryUsed: number, drillChoice: Mission2DrillChoice) => void;
  onClose: () => void;
}

export const RockDrillMiniGameModal: React.FC<RockDrillMiniGameModalProps> = ({
  explorerMode = 'junior',
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<'choose' | 'drill'>('choose');
  const [drillChoice, setDrillChoice] = useState<Mission2DrillChoice | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [needlePos, setNeedlePos] = useState(18);
  const [feedback, setFeedback] = useState<string>('Tap DRILL or press [SPACE] inside the green zone!');
  const dirRef = useRef(1);

  const isDeepIce = drillChoice === 'deep_ice';
  const baseBattery = isDeepIce ? 10 : 4;
  const batteryUsed = Math.min(24, baseBattery + misses * 4);
  const isDrillFinished = hits >= 2;

  const isJunior = explorerMode === 'junior';
  const sweetMin = isDeepIce ? (isJunior ? 35 : 40) : isJunior ? 27 : 32;
  const sweetMax = isDeepIce ? (isJunior ? 65 : 60) : isJunior ? 73 : 68;
  const needleSpeed = isDeepIce ? (isJunior ? 2.3 : 3.0) : isJunior ? 1.65 : 2.15;
  const inSweetSpot = needlePos >= sweetMin && needlePos <= sweetMax;

  useEffect(() => {
    if (step !== 'drill' || isDrillFinished) return;
    const interval = setInterval(() => {
      setNeedlePos((prev) => {
        let next = prev + dirRef.current * needleSpeed;
        if (next >= 96) {
          next = 96;
          dirRef.current = -1;
        } else if (next <= 4) {
          next = 4;
          dirRef.current = 1;
        }
        return next;
      });
    }, 24);
    return () => clearInterval(interval);
  }, [step, needleSpeed, isDrillFinished]);

  const attemptDrill = () => {
    if (step !== 'drill' || isDrillFinished) return;
    if (inSweetSpot) {
      sounds.playPickup();
      const nextHits = hits + 1;
      setHits(nextHits);
      if (nextHits >= 2) {
        sounds.playObjectiveStinger();
        setFeedback('ROCK TUBE #14 DRILLED & SEALED!');
      } else {
        setFeedback('GREAT! 1/2 done — hit green one more time!');
      }
    } else {
      sounds.playCrash();
      const nextMisses = misses + 1;
      setMisses(nextMisses);
      setFeedback(`Missed green! (-${Math.min(24, baseBattery + nextMisses * 4)}% Power total) — try again!`);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (step !== 'drill') return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (isDrillFinished) {
          sounds.playPickup();
          onComplete(batteryUsed, drillChoice ?? 'standard');
        } else {
          attemptDrill();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto pixel-box-cyan bg-[#0a1318] p-5 sm:p-6 text-slate-100">
        <div className="flex items-start justify-between pb-3 border-b-2 border-[#164e63]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <PixelIcon name="sparkles" className="w-4 h-4" />
              <span>
                {step === 'choose'
                  ? 'STEP 1 OF 2 // CAVE SHIELD & DRILL CHOICE'
                  : isDrillFinished
                  ? 'TUBE #14 SEALED!'
                  : 'STEP 2 OF 2 // QUICK ROCK DRILL (2 HITS)'}
              </span>
            </div>
            <h2 className="font-title text-base sm:text-xl font-bold text-white uppercase">
              {step === 'choose'
                ? 'Choose Shallow Rock or Deep Ice Vein!'
                : isDrillFinished
                ? 'Rock Tube #14 Ready for Earth!'
                : isDeepIce
                ? 'Deep Ice-Vein Drill'
                : 'Safe Upper-Layer Drill'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="pixel-btn p-2 bg-[#0f1f26] hover:bg-[#17303b] text-slate-300 hover:text-white cursor-pointer"
          >
            <PixelIcon name="x" className="w-4 h-4" />
          </button>
        </div>

        {step === 'choose' ? (
          <div className="mt-4 flex flex-col gap-3.5">
            <div className="p-3 bg-[#071014] border-2 border-cyan-500/70 flex flex-col gap-2 text-xs font-mono-hud">
              <div className="font-bold text-cyan-300 uppercase">
                WHY THIS CAVE IS SAFE: 95% OF SPACE RAYS BLOCKED!
              </div>
              <p className="text-slate-200 leading-relaxed">
                Thick cave stone drops space rays from <b className="text-red-300">0.64</b> (surface) down to <b className="text-emerald-300">0.03 mSv/day</b>—so we can safely drill! Pick which rock layer to sample:
              </p>
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-red-300">Surface Rays</span>
                    <span className="text-red-300 font-bold">0.64</span>
                  </div>
                  <div className="w-full h-2 bg-[#03090c] border border-[#164e63]">
                    <div className="h-full bg-red-500 w-[85%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-emerald-300">Inside Cave</span>
                    <span className="text-emerald-300 font-bold">0.03 (SAFE)</span>
                  </div>
                  <div className="w-full h-2 bg-[#03090c] border border-[#164e63]">
                    <div className="h-full bg-emerald-400 w-[6%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playPickup();
                  setDrillChoice('standard');
                }}
                className={`p-3.5 text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  drillChoice === 'standard'
                    ? 'pixel-box-emerald bg-emerald-950/60'
                    : 'pixel-box bg-[#0d181e] hover:bg-[#13232c]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 bg-black border border-emerald-500 text-[10px] font-mono-hud font-bold text-emerald-300">
                      SAFE &amp; STEADY
                    </span>
                    {drillChoice === 'standard' && (
                      <span className="px-1.5 py-0.5 bg-emerald-400 text-black text-[9px] font-mono-hud font-bold">
                        PICKED!
                      </span>
                    )}
                  </div>
                  <div className="font-title text-xs sm:text-sm font-bold text-white uppercase">
                    Upper-Layer Core
                  </div>
                  <p className="font-mono-hud text-[11px] text-emerald-300 mt-1.5">
                    <b>WHY PICK THIS:</b> Softer top basalt gives a wide drill zone, saves Power (~4%), +25 Science, and keeps the cave ceiling steady!
                  </p>
                  <p className="font-mono-hud text-[11px] text-amber-200 mt-1">
                    <b>AFTER-EFFECT:</b> Does not reach the deep water ice for bonus Suit Air.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPickup();
                  setDrillChoice('deep_ice');
                }}
                className={`p-3.5 text-left flex flex-col justify-between gap-2 cursor-pointer ${
                  drillChoice === 'deep_ice'
                    ? 'pixel-box-amber bg-amber-950/55'
                    : 'pixel-box bg-[#0d181e] hover:bg-[#13232c]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 bg-black border border-amber-500 text-[10px] font-mono-hud font-bold text-amber-300">
                      HIGH SCIENCE &amp; RISK
                    </span>
                    {drillChoice === 'deep_ice' && (
                      <span className="px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-mono-hud font-bold">
                        PICKED!
                      </span>
                    )}
                  </div>
                  <div className="font-title text-xs sm:text-sm font-bold text-white uppercase">
                    Deep Ice-Vein Core
                  </div>
                  <p className="font-mono-hud text-[11px] text-emerald-300 mt-1.5">
                    <b>WHY PICK THIS:</b> Splits trapped ancient ice for +55 Science &amp; +15% Suit Air!
                  </p>
                  <p className="font-mono-hud text-[11px] text-amber-200 mt-1">
                    <b>SOLVE NEXT:</b> Faster drill bar, ~10% Power, AND extra cave rocks to dodge on exit!
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t-2 border-[#164e63] flex justify-end">
              <button
                type="button"
                disabled={!drillChoice}
                onClick={() => {
                  if (!drillChoice) return;
                  sounds.playObjectiveStinger();
                  setStep('drill');
                }}
                className={`pixel-btn w-full sm:w-auto px-7 py-3 font-title text-xs uppercase flex items-center justify-center gap-2 ${
                  drillChoice
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <PixelIcon name="target" className="w-4 h-4" />
                <span>{drillChoice ? 'Start 2-Hit Drill!' : 'Pick a Drill Plan Above'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              {[1, 2].map((stageNum) => {
                const done = hits >= stageNum;
                return (
                  <div
                    key={stageNum}
                    className={`p-3 border-2 text-center font-mono-hud text-xs font-bold ${
                      done
                        ? 'bg-emerald-950/70 border-emerald-400 text-emerald-300'
                        : 'bg-[#071014] border-[#164e63] text-slate-400'
                    }`}
                  >
                    {stageNum === 1 ? '1. DRILL CORE' : '2. SEAL TUBE #14'} {done ? '— DONE!' : '...'}
                  </div>
                );
              })}
            </div>

            {!isDrillFinished ? (
              <>
                <div className="p-4 bg-[#071014] border-2 border-[#164e63]">
                  <div className="relative h-12 bg-[#03090c] border-2 border-[#164e63] overflow-hidden">
                    <div
                      className="absolute inset-y-0 bg-emerald-500/40 border-x-2 border-emerald-400"
                      style={{ left: `${sweetMin}%`, width: `${sweetMax - sweetMin}%` }}
                    />
                    <div
                      className={`absolute inset-y-0 w-3 -ml-1.5 ${
                        inSweetSpot ? 'bg-emerald-300' : 'bg-white'
                      }`}
                      style={{ left: `${needlePos}%` }}
                    />
                  </div>
                  <p className="mt-3 text-center font-mono-hud text-xs text-cyan-200 font-bold">
                    {feedback}
                  </p>
                </div>

                <button
                  onClick={attemptDrill}
                  className={`pixel-btn w-full py-4 font-title text-xs sm:text-sm uppercase flex items-center justify-center gap-2 cursor-pointer ${
                    inSweetSpot
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                  }`}
                >
                  <PixelIcon name="target" className="w-5 h-5" />
                  <span>DRILL NOW! ({hits}/2) [SPACE]</span>
                </button>
              </>
            ) : (
              <>
                <div className="p-3.5 bg-[#071014] border-2 border-emerald-500/80 flex flex-col gap-2 text-xs font-mono-hud">
                  <div className="font-bold text-emerald-300 uppercase">
                    TUBE #14 SEALED IN STERILE TITANIUM!
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    NASA seals sample tubes cleaner than a hospital room so zero Earth germs mix with Mars rocks!
                  </p>
                  {isDeepIce && (
                    <div className="p-2 bg-amber-950/60 border border-amber-400 text-amber-200 font-bold">
                      DEEP ICE RESULT: +55 Science &amp; +15% Suit Air — get ready to dodge extra rocks on your way out!
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    sounds.playPickup();
                    onComplete(batteryUsed, drillChoice ?? 'standard');
                  }}
                  className="pixel-btn w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-title text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PixelIcon name="check" className="w-4 h-4" />
                  <span>Pack Tube #14 &amp; Escape! (-{batteryUsed}% Power)</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
