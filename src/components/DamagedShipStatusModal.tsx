import React from 'react';
import { PixelIcon } from './PixelIcon';

interface DamagedShipStatusModalProps {
  onStartMission: () => void;
  onReplayCutscene: () => void;
}

export const DamagedShipStatusModal: React.FC<DamagedShipStatusModalProps> = ({
  onStartMission,
  onReplayCutscene,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      role="dialog"
      aria-label="Damaged Spacecraft Emergency Status"
    >
      <div className="relative w-full max-w-2xl pixel-box-red bg-[#120908] text-white overflow-hidden">
        <div className="relative h-44 sm:h-52 w-full bg-black overflow-hidden border-b-4 border-[#49302b]">
          <img
            src="/assets/nasa/jezero_crater.jpg"
            alt="Jezero Crater landing zone on Mars near the damaged spacecraft"
            style={{ imageRendering: 'auto' }}
            className="w-full h-full object-cover object-center brightness-50 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120908] via-[#120908]/55 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-red-400 font-mono-hud text-xs font-bold uppercase tracking-wider mb-1">
                <PixelIcon name="alert" className="w-4 h-4 shrink-0" />
                <span>EMERGENCY SHIP REPORT</span>
              </div>
              <h2 className="font-title text-lg sm:text-2xl font-black uppercase tracking-wide text-white">
                SHIP DAMAGED — FIRST STEP OUTSIDE!
              </h2>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
          <div className="p-3.5 bg-[#1b100d] border-2 border-amber-500/70 text-left">
            <div className="text-[11px] font-mono-hud font-bold text-amber-400 uppercase tracking-wider mb-1">
              WHAT JUST HAPPENED &amp; WHY WE NEED YOU:
            </div>
            <p className="font-mono-hud text-xs text-slate-200 leading-relaxed">
              The landing blast broke <strong className="text-red-300">both</strong> our Return Rocket and our ship&apos;s Earth Radio! Right now Earth thinks we landed safely and cannot warn us about Mars dust storms.
            </p>
            <p className="font-mono-hud text-xs text-emerald-200 leading-relaxed mt-2">
              <strong className="text-emerald-300">First:</strong> Step outside to the{' '}
              <b className="text-amber-300">Orange Box [E]</b> to grab the spare Radio Power Part, then walk to the{' '}
              <b className="text-sky-300">Mars Rover [E]</b>—watch your Blue Suit Air bar outside so you feel why a pressurized Rover helps!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono-hud text-xs">
            <div className="flex items-center justify-between p-2.5 bg-red-950/60 border-2 border-red-500">
              <div className="flex items-center gap-2 text-slate-200">
                <PixelIcon name="flame" className="w-4 h-4 text-red-400 shrink-0" />
                <span>Main Return Rocket</span>
              </div>
              <span className="px-2 py-0.5 bg-red-500/30 border border-red-400 text-red-300 font-bold">
                BROKEN
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-red-950/60 border-2 border-red-500">
              <div className="flex items-center gap-2 text-slate-200">
                <PixelIcon name="radio" className="w-4 h-4 text-red-400 shrink-0" />
                <span>Ship Earth Radio</span>
              </div>
              <span className="px-2 py-0.5 bg-red-500/30 border border-red-400 text-red-300 font-bold">
                NO SIGNAL
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-amber-950/50 border-2 border-amber-500">
              <div className="flex items-center gap-2 text-slate-200">
                <PixelIcon name="wrench" className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Spare Radio Part</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/30 border border-amber-400 text-amber-300 font-bold">
                ORANGE BOX
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-emerald-950/50 border-2 border-emerald-500">
              <div className="flex items-center gap-2 text-slate-200">
                <PixelIcon name="shieldCheck" className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your Crew</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-bold">
                3 / 3 SAFE
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onReplayCutscene}
              className="w-full sm:w-auto py-3 px-5 pixel-btn bg-[#1e1412] hover:bg-[#2a1b18] text-slate-200 font-mono-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PixelIcon name="rotate" className="w-4 h-4 text-sky-400" />
              <span>Replay Scene</span>
            </button>

            <button
              onClick={onStartMission}
              className="w-full sm:flex-1 py-3.5 px-6 pixel-btn bg-amber-500 hover:bg-amber-400 text-black font-title text-xs uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PixelIcon name="play" className="w-4 h-4" />
              <span>Step Outside &amp; Get Spare Part!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
