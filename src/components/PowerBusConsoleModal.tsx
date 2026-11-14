import React, { useState } from 'react';
import { sounds } from '../audio/SoundManager';
import { BreakerAllocationChoice } from '../types/game';
import { PixelIcon } from './PixelIcon';
import { PixelImage } from './PixelImage';

interface PowerBusConsoleModalProps {
  onSolved: (choice: BreakerAllocationChoice) => void;
  onClose: () => void;
}

export const PowerBusConsoleModal: React.FC<PowerBusConsoleModalProps> = ({
  onSolved,
  onClose,
}) => {
  const [phase, setPhase] = useState<'guide' | 'solve'>('guide');
  const [heaterBrokenOn, setHeaterBrokenOn] = useState(true);
  const [bonusMode, setBonusMode] = useState<BreakerAllocationChoice>('shield');
  const [suitAirOn, setSuitAirOn] = useState(true);
  const [wheelsOn, setWheelsOn] = useState(true);

  const totalWatts =
    (heaterBrokenOn ? 380 : 0) +
    (bonusMode === 'shield' ? 80 : bonusMode === 'scanner' ? 80 : 0) +
    (suitAirOn ? 140 : 0) +
    (wheelsOn ? 180 : 0);

  const isFaultIsolated = !heaterBrokenOn;
  const isLoadNominal = totalWatts <= 400;
  const areEssentialsOnline = suitAirOn && wheelsOn;
  const isReadyToDrive = isFaultIsolated && isLoadNominal && areEssentialsOnline;

  const handleLockAndDrive = () => {
    if (!isReadyToDrive) return;
    sounds.playObjectiveStinger();
    onSolved(bonusMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto pixel-box-amber bg-[#120b09] p-5 sm:p-7 text-slate-100">
        <div className="flex items-start justify-between pb-4 border-b-2 border-[#49302b]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-amber-400 uppercase tracking-wider mb-1">
              <PixelIcon name="zap" className="w-4 h-4" />
              <span>
                {phase === 'guide'
                  ? 'HEDEYA EXPLAINS // STEP 1: WHY WATTS MATTER'
                  : 'HEDEYA HELPS // STEP 2: FIX & DECIDE'}
              </span>
            </div>
            <h2 className="font-title text-base sm:text-xl font-bold text-white uppercase">
              {phase === 'guide'
                ? 'Why Won’t the Rover Start?'
                : 'Fix Broken Heater & Pick Next Tool'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="pixel-btn p-2 bg-[#1e1412] hover:bg-[#2a1b18] text-slate-300 hover:text-white cursor-pointer"
          >
            <PixelIcon name="x" className="w-4 h-4" />
          </button>
        </div>

        {phase === 'guide' ? (
          <div className="mt-4 flex flex-col gap-3.5">
            <div className="p-4 bg-[#1a100e] border-2 border-[#49302b] flex items-start gap-3.5">
              <div className="relative w-14 h-14 bg-blue-950 border-2 border-blue-500 overflow-hidden flex items-center justify-center shrink-0">
                <PixelImage
                  src="/assets/characters/had.png"
                  alt="Hedeya"
                  pixelWidth={32}
                  colorLevels={9}
                  className="w-full h-full object-contain pb-2 pixelated"
                />
              </div>
              <div className="text-xs font-mono-hud text-slate-200 leading-relaxed">
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                  WHAT IS A WATT (400W BUDGET)?
                </div>
                Think of <b className="text-white">400 Watts (400W)</b> like having <b className="text-amber-300">400 buckets of electricity</b> inside our Rover! Right now, fine Mars dust jammed <b className="text-red-300">Heater #2 ON</b>, spilling 380 buckets! That leaves way too little power for our Suit Air (140W) and Rover Wheels (180W).
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-hud">
              <div className="p-3 bg-[#1a100e] border-2 border-sky-500/70">
                <div className="text-[10px] font-bold text-sky-300 uppercase mb-1">
                  WHY TURN OFF HEATER #2 FIRST?
                </div>
                <p className="text-slate-200 leading-relaxed">
                  140W (Suit Air) + 180W (Wheels) = <b className="text-emerald-300">320W</b>! Once Broken Heater #2 is OFF, you still have <b className="text-amber-300">80W left over</b> to power ONE special helper tool for the dangerous road ahead!
                </p>
              </div>
              <div className="p-3 bg-[#1a100e] border-2 border-amber-500/70">
                <div className="text-[10px] font-bold text-amber-300 uppercase mb-1">
                  WHY THE ROAD TO THE ROCKET IS HARD:
                </div>
                <p className="text-slate-200 leading-relaxed">
                  Spinning <b className="text-red-300">dust tornadoes</b> are sweeping across the desert between here and the Mars Rocket! Each helper tool protects you in one way—but changes your Battery or Shield on the drive.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-[#49302b] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  sounds.playPickup();
                  setPhase('solve');
                }}
                className="pixel-btn w-full sm:w-auto px-7 py-3 bg-amber-500 hover:bg-amber-400 text-black font-title text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Got It — Let&apos;s Fix the Switches!</span>
                <PixelIcon name="arrowRight" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Step 1: Turn OFF the Broken Heater (Saves 380W!)
                </div>
                <button
                  type="button"
                  onClick={() => setPhase('guide')}
                  className="px-2.5 py-1 bg-[#1e1412] border border-amber-500/60 text-[10px] font-mono-hud text-amber-300 cursor-pointer"
                >
                  ← Review Guide
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playSwitchClick();
                  setHeaterBrokenOn((prev) => !prev);
                }}
                className={`w-full p-4 text-left cursor-pointer ${
                  heaterBrokenOn
                    ? 'pixel-box-red bg-red-950/65'
                    : 'pixel-box-emerald bg-emerald-950/45'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 border-2 flex items-center justify-center ${
                        heaterBrokenOn
                          ? 'bg-red-950 border-red-500 text-red-400'
                          : 'bg-emerald-950 border-emerald-500 text-emerald-400'
                      }`}
                    >
                      <PixelIcon name="flame" className={`w-5 h-5 ${heaterBrokenOn ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <div className="font-title text-sm font-bold text-white">
                        Broken Heater #2 (380W Leak)
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        {heaterBrokenOn
                          ? 'Mars dust jammed this heater so it wastes 380W! Tap here to shut it OFF.'
                          : 'Great! Broken Heater #2 is OFF — now Suit Air + Wheels fit inside 400W!'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-3 py-1.5 border-2 text-xs font-bold ${
                      heaterBrokenOn
                        ? 'bg-red-500 border-red-300 text-white animate-pulse'
                        : 'bg-emerald-500 border-emerald-300 text-black'
                    }`}
                  >
                    {heaterBrokenOn ? 'TAP TO TURN OFF' : 'OFF (SAFE!)'}
                  </span>
                </div>
              </button>
            </div>

            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Step 2: Use Your Extra 80W — Pick One Helper Tool for the Tornado Drive:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playPickup();
                    setBonusMode('shield');
                  }}
                  className={`p-3.5 text-left cursor-pointer ${
                    bonusMode === 'shield'
                      ? 'pixel-box-emerald bg-emerald-950/55'
                      : 'pixel-box bg-[#180f0c] hover:bg-[#221511]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <PixelIcon name="shield" className="w-5 h-5 text-emerald-400" />
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-[#0c0706] border border-emerald-500 text-emerald-300">
                      +80W = 400W
                    </span>
                  </div>
                  <div className="font-title text-xs sm:text-sm font-bold text-white mb-1.5">
                    Ray &amp; Dust Shield
                  </div>
                  <p className="text-xs text-emerald-200 leading-snug">
                    <b>Why pick this:</b> Cuts dust tornado damage in half! <b>After-effect:</b> Full 400W drains Battery 25% faster—grab Energy Cells!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playPickup();
                    setBonusMode('scanner');
                  }}
                  className={`p-3.5 text-left cursor-pointer ${
                    bonusMode === 'scanner'
                      ? 'pixel-box-amber bg-amber-950/50'
                      : 'pixel-box bg-[#180f0c] hover:bg-[#221511]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <PixelIcon name="radio" className="w-5 h-5 text-amber-400" />
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-[#0c0706] border border-amber-500 text-amber-300">
                      +80W = 400W
                    </span>
                  </div>
                  <div className="font-title text-xs sm:text-sm font-bold text-white mb-1.5">
                    Rock Scanner
                  </div>
                  <p className="text-xs text-amber-200 leading-snug">
                    <b>Why pick this:</b> Scans Mars dust &amp; rocks for +25 Science (+5 bonus/cell)! <b>After-effect:</b> Uses 25% more Battery &amp; no extra ray shield.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playPickup();
                    setBonusMode('eco');
                  }}
                  className={`p-3.5 text-left cursor-pointer ${
                    bonusMode === 'eco'
                      ? 'pixel-box-cyan bg-sky-950/50'
                      : 'pixel-box bg-[#180f0c] hover:bg-[#221511]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <PixelIcon name="batteryCharging" className="w-5 h-5 text-sky-400" />
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-[#0c0706] border border-sky-500 text-sky-300">
                      0W = 320W ECO
                    </span>
                  </div>
                  <div className="font-title text-xs sm:text-sm font-bold text-white mb-1.5">
                    Battery Boost
                  </div>
                  <p className="text-xs text-sky-200 leading-snug">
                    <b>Why pick this:</b> Saves 80W (+15% Battery &amp; 20% less drain)! <b>After-effect:</b> Lighter shield wears 25% faster—dodge tornadoes!
                  </p>
                </button>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-[#180f0c] border-2 border-[#49302b] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold uppercase">Rover Power Meter (Safe limit: 400W)</span>
                <span className={`font-bold text-sm ${isLoadNominal ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totalWatts}W / 400W {isLoadNominal ? 'SAFE!' : 'TOO HIGH!'}
                </span>
              </div>
              <div className="w-full h-3.5 p-0.5 bg-[#0a0605] border-2 border-[#49302b] overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    isLoadNominal ? 'bg-emerald-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (totalWatts / 780) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playSwitchClick();
                    setSuitAirOn((prev) => !prev);
                  }}
                  className={`flex items-center justify-between px-3 py-2 border-2 text-xs cursor-pointer ${
                    suitAirOn
                      ? 'bg-sky-950/45 border-sky-500 text-sky-200'
                      : 'bg-red-950/75 border-red-500 text-red-200 animate-pulse'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <PixelIcon name="wind" className="w-3.5 h-3.5" />
                    Suit Air (140W)
                  </span>
                  <span className="font-bold">{suitAirOn ? 'ON' : 'TURN ON!'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playSwitchClick();
                    setWheelsOn((prev) => !prev);
                  }}
                  className={`flex items-center justify-between px-3 py-2 border-2 text-xs cursor-pointer ${
                    wheelsOn
                      ? 'bg-sky-950/45 border-sky-500 text-sky-200'
                      : 'bg-red-950/75 border-red-500 text-red-200 animate-pulse'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <PixelIcon name="compass" className="w-3.5 h-3.5" />
                    Wheels (180W)
                  </span>
                  <span className="font-bold">{wheelsOn ? 'ON' : 'TURN ON!'}</span>
                </button>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t-2 border-[#49302b] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                {isReadyToDrive ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <PixelIcon name="check" className="w-4 h-4 shrink-0" />
                    <span>Awesome! Rover is safe and ready to drive!</span>
                  </span>
                ) : !areEssentialsOnline ? (
                  <span className="flex items-center gap-1.5 text-red-400 font-bold">
                    <PixelIcon name="shieldAlert" className="w-4 h-4 shrink-0" />
                    <span>Turn Suit Air and Rover Wheels back ON!</span>
                  </span>
                ) : (
                  <span className="text-red-300 font-semibold">
                    Tap &ldquo;Broken Heater #2&rdquo; above to turn it OFF first!
                  </span>
                )}
              </div>

              <button
                onClick={handleLockAndDrive}
                disabled={!isReadyToDrive}
                className={`pixel-btn w-full sm:w-auto px-7 py-3 font-title text-xs uppercase flex items-center justify-center gap-2 ${
                  isReadyToDrive
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <PixelIcon name="zap" className="w-4 h-4" />
                <span>Drive to Rocket!</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
