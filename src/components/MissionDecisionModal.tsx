import React, { useEffect, useState } from 'react';
import { CharacterId } from '../types/game';
import { sounds } from '../audio/SoundManager';
import { canReadAloud, speakText, stopReadAloud } from '../audio/readAloud';
import { PixelIcon } from './PixelIcon';
import { PixelImage } from './PixelImage';

export interface GuidePoint {
  label: string;
  text: string;
  colorClass?: string;
}

export interface DecisionChoiceItem {
  id: string;
  title: string;
  badge: string;
  whyPickText: string;
  afterEffectText: string;
  solveNextText: string;
  nasaScienceNote: string;
}

interface MissionDecisionModalProps {
  theme: 'amber' | 'cyan' | 'red';
  stepTag: string;
  title: string;
  imageSrc?: string;
  imageAlt?: string;
  guideSpeaker: string;
  guideCharacterId: CharacterId;
  guideIntroTitle: string;
  guideIntroText: string;
  guidePoints: GuidePoint[];
  guideButtonLabel?: string;
  decisionPromptText: string;
  choices: DecisionChoiceItem[];
  confirmLabel: string;
  onConfirm: (choiceId: string) => void;
}

const CHARACTER_PORTRAITS: Record<string, { src: string; border: string; bg: string }> = {
  hazaloom: { src: '/assets/characters/haz.png', border: 'border-orange-500', bg: 'bg-orange-950' },
  hedeya: { src: '/assets/characters/had.png', border: 'border-blue-500', bg: 'bg-blue-950' },
  samantha: { src: '/assets/characters/sam.png', border: 'border-emerald-500', bg: 'bg-emerald-950' },
};

export const MissionDecisionModal: React.FC<MissionDecisionModalProps> = ({
  theme,
  stepTag,
  title,
  imageSrc,
  imageAlt,
  guideSpeaker,
  guideCharacterId,
  guideIntroTitle,
  guideIntroText,
  guidePoints,
  guideButtonLabel = 'I Understand — Show My Choices!',
  decisionPromptText,
  choices,
  confirmLabel,
  onConfirm,
}) => {
  const [phase, setPhase] = useState<'guide' | 'choose'>('guide');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const selectedChoice = choices.find((c) => c.id === selectedId) ?? null;
  const portrait = CHARACTER_PORTRAITS[guideCharacterId] ?? CHARACTER_PORTRAITS.hedeya;
  const speechAvailable = canReadAloud();

  useEffect(() => {
    return () => stopReadAloud();
  }, []);

  const boxClass =
    theme === 'cyan'
      ? 'pixel-box-cyan bg-[#0a1318]'
      : theme === 'red'
      ? 'pixel-box-red bg-[#14090a]'
      : 'pixel-box-amber bg-[#120b09]';

  const accentTextClass =
    theme === 'cyan'
      ? 'text-cyan-400'
      : theme === 'red'
      ? 'text-red-400'
      : 'text-amber-400';

  const borderMutedClass =
    theme === 'cyan'
      ? 'border-[#164e63]'
      : theme === 'red'
      ? 'border-[#5c1f24]'
      : 'border-[#49302b]';

  const confirmBtnClass =
    theme === 'cyan'
      ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
      : theme === 'red'
      ? 'bg-red-500 hover:bg-red-400 text-white'
      : 'bg-amber-500 hover:bg-amber-400 text-black';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      role="dialog"
      aria-label={title}
    >
      <div className={`relative w-full max-w-3xl max-h-[92vh] overflow-y-auto ${boxClass} text-white`}>
        {imageSrc && (
          <div className={`relative h-32 sm:h-40 w-full bg-black overflow-hidden border-b-4 ${borderMutedClass}`}>
            <img
              src={imageSrc}
              alt={imageAlt || title}
              style={{ imageRendering: 'auto' }}
              className="w-full h-full object-cover object-center brightness-55 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0706] via-[#0b0706]/50 to-transparent" />
            <div className="absolute bottom-3 left-5 right-5">
              <div className={`flex items-center gap-2 font-mono-hud text-xs font-bold uppercase tracking-wider mb-1 ${accentTextClass}`}>
                <PixelIcon name="sparkles" className="w-4 h-4 shrink-0" />
                <span>
                  {stepTag} // {phase === 'guide' ? 'STEP 1: LEARN WHY' : 'STEP 2: NOW YOU DECIDE'}
                </span>
              </div>
              <h2 className="font-title text-lg sm:text-2xl font-black uppercase tracking-wide text-white">
                {title}
              </h2>
            </div>
          </div>
        )}

        <div className="p-5 sm:p-6 flex flex-col gap-4">
          {!imageSrc && (
            <div className={`pb-3 border-b-2 ${borderMutedClass}`}>
              <div className={`flex items-center gap-2 font-mono-hud text-xs font-bold uppercase tracking-wider mb-1 ${accentTextClass}`}>
                <PixelIcon name="sparkles" className="w-4 h-4 shrink-0" />
                <span>
                  {stepTag} // {phase === 'guide' ? 'STEP 1: LEARN WHY' : 'STEP 2: NOW YOU DECIDE'}
                </span>
              </div>
              <h2 className="font-title text-lg sm:text-xl font-black uppercase text-white">
                {title}
              </h2>
            </div>
          )}

          {phase === 'guide' ? (
            <>
              <div className={`p-4 bg-[#0c0807] border-2 ${borderMutedClass} flex items-start gap-3.5`}>
                <div className={`relative w-14 h-14 sm:w-16 sm:h-16 ${portrait.bg} border-2 ${portrait.border} overflow-hidden flex items-center justify-center shrink-0`}>
                  <PixelImage
                    src={portrait.src}
                    alt={guideSpeaker}
                    pixelWidth={32}
                    colorLevels={9}
                    className="w-full h-full object-contain pb-2 pixelated"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className={`text-[10px] font-mono-hud font-bold uppercase tracking-wider ${accentTextClass}`}>
                      {guideSpeaker} EXPLAINS // {guideIntroTitle}
                    </div>
                    {speechAvailable && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSpeaking) {
                            stopReadAloud();
                            setIsSpeaking(false);
                          } else {
                            const fullScript = `${guideIntroText} ${guidePoints
                              .map((p) => `${p.label}: ${p.text}`)
                              .join(' ')}`;
                            const started = speakText(fullScript, () => setIsSpeaking(false));
                            setIsSpeaking(started);
                          }
                        }}
                        className={`px-2 py-0.5 border font-mono-hud text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                          isSpeaking
                            ? 'bg-sky-400 border-sky-200 text-black'
                            : 'bg-[#1a100e] border-sky-500/60 text-sky-300 hover:border-sky-300'
                        }`}
                      >
                        <PixelIcon name={isSpeaking ? 'volumeOff' : 'volumeOn'} className="w-3 h-3" />
                        <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
                      </button>
                    )}
                  </div>
                  <p className="font-mono-hud text-xs sm:text-sm text-slate-100 leading-relaxed">
                    {guideIntroText}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {guidePoints.map((pt, idx) => (
                  <div key={idx} className={`p-3.5 bg-[#0c0807] border-2 ${borderMutedClass}`}>
                    <div className={`text-[10px] font-mono-hud font-bold uppercase tracking-wider mb-1 ${pt.colorClass ?? 'text-sky-300'}`}>
                      {pt.label}
                    </div>
                    <p className="font-mono-hud text-xs text-slate-200 leading-relaxed">
                      {pt.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className={`pt-3 border-t-2 ${borderMutedClass} flex flex-col sm:flex-row items-center justify-between gap-3`}>
                <span className="font-mono-hud text-xs text-slate-300">
                  Read how each system works first, then pick your plan!
                </span>
                <button
                  type="button"
                  onClick={() => {
                    stopReadAloud();
                    setIsSpeaking(false);
                    sounds.playPickup();
                    setPhase('choose');
                  }}
                  className={`pixel-btn w-full sm:w-auto px-6 py-3 font-title text-xs uppercase flex items-center justify-center gap-2 cursor-pointer ${confirmBtnClass}`}
                >
                  <span>{guideButtonLabel}</span>
                  <PixelIcon name="arrowRight" className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono-hud text-xs text-slate-200 leading-relaxed">
                  {decisionPromptText}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playSwitchClick();
                    setPhase('guide');
                  }}
                  className="px-2.5 py-1 bg-[#1b1210] border border-slate-600 hover:border-amber-400 text-[10px] font-mono-hud text-slate-300 hover:text-amber-300 cursor-pointer shrink-0"
                >
                  ← Review Guide
                </button>
              </div>

              <div className={`grid grid-cols-1 ${choices.length > 1 ? 'md:grid-cols-3' : 'max-w-xl mx-auto w-full'} gap-3`}>
                {choices.map((choice) => {
                  const isSelected = selectedId === choice.id;
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => {
                        sounds.playPickup();
                        setSelectedId(choice.id);
                      }}
                      className={`p-3.5 text-left flex flex-col justify-between gap-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'pixel-box-emerald bg-emerald-950/60'
                          : 'pixel-box bg-[#140e0c] hover:bg-[#1f1512]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="px-2 py-0.5 bg-black/80 border border-slate-600 text-[10px] font-mono-hud font-bold text-amber-300 uppercase">
                            {choice.badge}
                          </span>
                          {isSelected && (
                            <span className="px-1.5 py-0.5 bg-emerald-500 text-black text-[9px] font-mono-hud font-bold uppercase">
                              PICKED!
                            </span>
                          )}
                        </div>
                        <h3 className="font-title text-xs sm:text-sm font-bold text-white uppercase leading-snug">
                          {choice.title}
                        </h3>

                        <div className="mt-2 space-y-1.5 font-mono-hud text-[11px] leading-snug">
                          <p className="text-emerald-300">
                            <b className="text-emerald-400">WHY PICK THIS:</b> {choice.whyPickText}
                          </p>
                          <p className="text-amber-200">
                            <b className="text-amber-400">AFTER-EFFECT:</b> {choice.afterEffectText}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/10 font-mono-hud text-[10px] text-sky-200 leading-snug">
                        <b className="text-sky-300">WHAT YOU SOLVE:</b> {choice.solveNextText}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedChoice && (
                <div className="p-3 bg-emerald-950/35 border-2 border-emerald-500/80 font-mono-hud text-xs text-emerald-100 leading-relaxed">
                  <b className="text-emerald-300 uppercase">REAL NASA REASON WHY: </b>
                  {selectedChoice.nasaScienceNote}
                </div>
              )}

              <div className={`pt-3 border-t-2 ${borderMutedClass} flex flex-col sm:flex-row items-center justify-between gap-3`}>
                <div className="text-xs font-mono-hud text-slate-300">
                  {selectedChoice ? (
                    <span>
                      Selected: <b className="text-emerald-300">{selectedChoice.title}</b> — ready to solve it!
                    </span>
                  ) : (
                    <span className="text-amber-300">
                      Pick 1 choice above after reading why each helps!
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!selectedChoice}
                  onClick={() => {
                    if (!selectedChoice) return;
                    sounds.playObjectiveStinger();
                    onConfirm(selectedChoice.id);
                  }}
                  className={`pixel-btn w-full sm:w-auto px-6 py-3 font-title text-xs uppercase flex items-center justify-center gap-2 shrink-0 ${
                    selectedChoice
                      ? `${confirmBtnClass} cursor-pointer`
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <PixelIcon name="play" className="w-4 h-4" />
                  <span>{selectedChoice ? confirmLabel : 'Pick a Choice First'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
