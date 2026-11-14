import React, { useState } from 'react';
import { EducationalFact, ExplorerMode } from '../types/game';
import { sounds } from '../audio/SoundManager';
import { PixelIcon } from './PixelIcon';

interface EducationalModalProps {
  fact: EducationalFact;
  explorerMode?: ExplorerMode;
  onClose: () => void;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({
  fact,
  explorerMode = 'junior',
  onClose,
}) => {
  const [showDeepScience, setShowDeepScience] = useState(explorerMode === 'commander');

  const handleClose = () => {
    sounds.playPickup();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto pixel-box-amber bg-[#120b0a] p-5 sm:p-6 text-slate-100">

        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-[#49302b]">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-amber-950 border-2 border-amber-500 text-amber-400">
              <PixelIcon name="sparkles" className="w-3.5 h-3.5" />
            </span>
            <span className="font-mono-hud text-xs font-bold text-amber-400 tracking-wider uppercase">
              MARS DISCOVERY // {fact.category}
            </span>
          </div>

          {fact.instrumentName && (
            <div className="px-2 py-0.5 bg-[#1a110f] border-2 border-[#49302b] text-slate-300 text-[10px] font-mono-hud">
              {fact.instrumentName}
            </div>
          )}
        </div>

        <div className="mt-3">
          <h2 className="font-title text-base sm:text-xl font-bold text-white tracking-wide">
            {fact.title}
          </h2>
          <p className="font-mono-hud text-xs text-amber-300/80 mt-1">
            {fact.subtitle}
          </p>
        </div>

        <div className="mt-4 border-3 border-[#49302b] bg-black">
          <img
            src={fact.imageSrc}
            alt={fact.title}
            style={{ imageRendering: 'auto' }}
            className="w-full h-44 sm:h-52 object-cover object-center"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="p-2.5 bg-[#0a0605] border-t-2 border-[#49302b] text-[11px] font-mono-hud text-slate-400">
            {fact.imageCaption}
          </div>
        </div>

        <div className="mt-4 p-3.5 bg-[#1a100e] border-2 border-[#49302b]">
          <p className="font-mono-hud text-xs sm:text-sm text-slate-100 leading-relaxed">
            {fact.nasaFact}
          </p>
          <p className="mt-2 pt-2 border-t-2 border-[#49302b] font-mono-hud text-xs text-amber-300 leading-relaxed">
            {fact.gameContext}
          </p>

          {(fact.olderKidsNote || fact.classroomPrompt) && (
            <div className="mt-3 pt-2.5 border-t border-[#49302b]">
              <button
                type="button"
                onClick={() => {
                  sounds.playSwitchClick();
                  setShowDeepScience((prev) => !prev);
                }}
                className="flex items-center gap-1.5 text-[11px] font-mono-hud font-bold text-sky-300 hover:text-sky-200 cursor-pointer"
              >
                <PixelIcon name="info" className="w-3.5 h-3.5" />
                <span>
                  {showDeepScience
                    ? 'Hide Deep Science (Ages 11–15)'
                    : 'Read Deep Science & Math (Ages 11–15)'}
                </span>
              </button>

              {showDeepScience && (
                <div className="mt-2 p-2.5 bg-[#0f1722] border border-sky-500/60 space-y-1.5 font-mono-hud text-xs text-sky-100 leading-relaxed">
                  {fact.olderKidsNote && <p>{fact.olderKidsNote}</p>}
                  {fact.classroomPrompt && (
                    <p className="text-emerald-300 font-semibold">{fact.classroomPrompt}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-[#49302b] font-mono-hud text-[11px] text-slate-400">
            Source: <span className="text-slate-200">{fact.sourceName}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="pixel-btn w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-title text-[10px] flex items-center justify-center gap-2 cursor-pointer"
          >
            <PixelIcon name="check" className="w-4 h-4" />
            <span>Got It — Back to Game!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
