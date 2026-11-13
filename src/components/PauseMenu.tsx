import React from 'react';
import { sounds } from '../audio/SoundManager';
import { PixelIcon } from './PixelIcon';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenFieldGuide: () => void;
  onReturnToMenu?: () => void;
  onReplayCutscene?: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onOpenFieldGuide,
  onReturnToMenu,
  onReplayCutscene,
}) => {
  const [isMuted, setIsMuted] = React.useState(sounds.getMuted());

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="relative w-full max-w-lg pixel-box bg-[#120b09] p-6 sm:p-8 text-white">

        <div className="flex items-center justify-between pb-4 border-b-2 border-[#49302b]">
          <div className="flex items-center gap-2">
            <PixelIcon name="compass" className="w-5 h-5 text-amber-400" />
            <h2 className="font-title text-base sm:text-lg font-bold uppercase tracking-wider text-white">
              Game Paused
            </h2>
          </div>
          <button
            onClick={onResume}
            className="pixel-btn p-1.5 bg-[#1e1412] hover:bg-[#2a1b18] text-slate-300 hover:text-white cursor-pointer"
          >
            <PixelIcon name="x" className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 p-4 bg-[#1a100d] border-2 border-[#49302b]">
          <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-amber-400 mb-3">
            <PixelIcon name="keyboard" className="w-4 h-4" />
            <span>HOW TO PLAY:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono-hud">
            <div className="flex items-center justify-between p-2 bg-[#0c0706] border border-[#49302b]">
              <span className="text-slate-300">Walk / Drive:</span>
              <span className="text-amber-300 font-bold">WASD / Arrows</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#0c0706] border border-[#49302b]">
              <span className="text-slate-300">Use / Pick Up:</span>
              <span className="text-amber-300 font-bold">[E] Key</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#0c0706] border border-[#49302b]">
              <span className="text-slate-300">Next Talk:</span>
              <span className="text-amber-300 font-bold">[SPACE]</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-[#0c0706] border border-[#49302b]">
              <span className="text-slate-300">Get Air:</span>
              <span className="text-emerald-400 font-bold">Green Ring</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="pixel-btn w-full py-3 px-5 bg-amber-500 hover:bg-amber-400 text-black font-title text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <PixelIcon name="play" className="w-4 h-4" />
            <span>Keep Playing</span>
          </button>

          <button
            onClick={onOpenFieldGuide}
            className="pixel-btn w-full py-2.5 px-5 bg-[#1e1412] hover:bg-[#2a1b18] text-slate-200 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <PixelIcon name="book" className="w-4 h-4 text-purple-400" />
            <span>NASA Space Facts Book</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSound}
              className="pixel-btn flex-1 py-2.5 px-4 bg-[#1e1412] hover:bg-[#2a1b18] text-slate-300 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              {isMuted ? (
                <PixelIcon name="volumeOff" className="w-4 h-4 text-red-400" />
              ) : (
                <PixelIcon name="volumeOn" className="w-4 h-4 text-emerald-400" />
              )}
              <span>{isMuted ? 'Sound: Off' : 'Sound: On'}</span>
            </button>

            <button
              onClick={onRestart}
              className="pixel-btn flex-1 py-2.5 px-4 bg-red-950 hover:bg-red-900 text-red-300 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PixelIcon name="rotate" className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          </div>

          {onReplayCutscene && (
            <button
              onClick={onReplayCutscene}
              className="pixel-btn w-full py-2.5 px-5 bg-[#1e1412] hover:bg-[#2a1b18] text-amber-300 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PixelIcon name="film" className="w-4 h-4" />
              <span>Watch Big Event Video</span>
            </button>
          )}

          {onReturnToMenu && (
            <button
              onClick={onReturnToMenu}
              className="pixel-btn w-full py-2.5 px-5 bg-[#160f0d] hover:bg-[#241613] text-slate-300 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <PixelIcon name="home" className="w-4 h-4" />
              <span>Back to Main Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
