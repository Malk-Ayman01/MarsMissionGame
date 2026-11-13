import React from 'react';
import { PixelIcon } from './PixelIcon';

interface GameOverModalProps {
  onRestart: () => void;
  onReturnToMenu?: () => void;
  reason?: string;
  tip?: string;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRestart,
  onReturnToMenu,
  reason = 'Your suit air ran out before getting back to the safe base.',
  tip = 'Tip: Walking outside burns Suit Air twice as fast! Ride inside the Rover, avoid rock bumps, or step into the green Hydroponics Base ring to refill.',
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90">
      <div className="relative w-full max-w-lg pixel-box-red bg-[#120808] p-6 sm:p-8 text-white text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-950 text-red-500 border-3 border-red-500 mb-4 animate-pulse shadow-[3px_3px_0_#020302]">
          <PixelIcon name="alert" className="w-8 h-8" />
        </div>

        <div className="font-mono-hud text-xs tracking-widest text-red-400 font-bold uppercase mb-1">
          CREW RESCUE PAUSED // TRY AGAIN
        </div>
        <h1 className="font-title text-2xl sm:text-3xl font-black tracking-wider uppercase text-white drop-shadow-[3px_3px_0_#020302]">
          MISSION STOPPED
        </h1>

        <div className="my-5 p-4 bg-red-950/60 border-2 border-red-500 text-left">
          <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-red-400 mb-1">
            <PixelIcon name="alert" className="w-4 h-4 shrink-0" />
            <span>WHAT HAPPENED TO YOUR CREW:</span>
          </div>
          <p className="font-mono-hud text-xs text-red-200 leading-relaxed">
            {reason}
          </p>
        </div>

        <p className="font-mono-hud text-xs text-amber-200 leading-relaxed mb-6 p-3 bg-[#1a100e] border border-amber-500/40 text-left">
          <b className="text-amber-400">NASA RESCUE TIP: </b>
          {tip}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {onReturnToMenu && (
            <button
              onClick={onReturnToMenu}
              className="pixel-btn flex-1 py-3.5 px-4 bg-[#1e1412] hover:bg-[#2a1b18] text-slate-200 font-mono-hud text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <PixelIcon name="home" className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          )}
          <button
            onClick={onRestart}
            className="pixel-btn flex-1 py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-title text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
          >
            <PixelIcon name="rotate" className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
