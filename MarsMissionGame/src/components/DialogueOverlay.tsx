import React, { useState, useEffect, useRef } from 'react';
import { DialogueLine } from '../types/game';
import { sounds } from '../audio/SoundManager';
import { canReadAloud, speakText, stopReadAloud } from '../audio/readAloud';
import { PixelIcon } from './PixelIcon';
import { PixelImage } from './PixelImage';

interface DialogueOverlayProps {
  dialogues: DialogueLine[];
  paused?: boolean;
  blockSpaceKey?: boolean;
  onComplete: () => void;
}

export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({
  dialogues,
  paused = false,
  blockSpaceKey = false,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const typeIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentLine = dialogues[currentIndex];
  const onCompleteRef = useRef(onComplete);
  const speechAvailable = canReadAloud();

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [dialogues]);

  useEffect(() => {
    if (!currentLine) return;

    sounds.playRadioBeep();
    setDisplayedText('');
    setIsTyping(true);
    typeIndexRef.current = 0;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (typeIndexRef.current < currentLine.text.length) {
        setDisplayedText(currentLine.text.slice(0, typeIndexRef.current + 1));
        typeIndexRef.current++;
        if (typeIndexRef.current % 4 === 0) {
          sounds.playTypewriterTick();
        }
      } else {
        setIsTyping(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 22);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopReadAloud();
      setIsSpeaking(false);
    };
  }, [currentIndex, currentLine]);

  useEffect(() => {
    return () => stopReadAloud();
  }, []);

  const advanceDialogue = () => {
    if (paused) return;
    stopReadAloud();
    setIsSpeaking(false);
    if (isTyping) {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(currentLine.text);
      setIsTyping(false);
      return;
    }

    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onCompleteRef.current();
    }
  };

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentLine) return;
    if (isSpeaking) {
      stopReadAloud();
      setIsSpeaking(false);
    } else {
      const started = speakText(`${currentLine.speaker} says: ${currentLine.text}`, () =>
        setIsSpeaking(false)
      );
      setIsSpeaking(started);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (paused) return;
      if (
        e.code === 'Tab' ||
        e.code === 'Enter' ||
        (e.code === 'Space' && !blockSpaceKey)
      ) {
        e.preventDefault();
        advanceDialogue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isTyping, dialogues.length, paused, blockSpaceKey]);

  if (!currentLine) return null;

  const renderPortrait = () => {
    switch (currentLine.characterId) {
      case 'hazaloom':
      case 'zumurda':
      case 'alex' as any:
        return (
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-orange-950 border-2 border-orange-500 overflow-hidden flex items-center justify-center shrink-0">
            <PixelImage
              src="/assets/characters/haz.png"
              alt="Hazaloom"
              pixelWidth={32}
              colorLevels={9}
              className="w-full h-full object-contain pb-2 pixelated"
            />
          </div>
        );
      case 'hedeya':
      case 'khepri':
      case 'chen' as any:
        return (
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-blue-950 border-2 border-blue-500 overflow-hidden flex items-center justify-center shrink-0">
            <PixelImage
              src="/assets/characters/had.png"
              alt="Hedeya"
              pixelWidth={32}
              colorLevels={9}
              className="w-full h-full object-contain pb-2 pixelated"
            />
          </div>
        );
      case 'samantha':
      case 'seshat':
      case 'soto' as any:
        return (
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-emerald-950 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0">
            <PixelImage
              src="/assets/characters/sam.png"
              alt="Samantha"
              pixelWidth={32}
              colorLevels={9}
              className="w-full h-full object-contain pb-2 pixelated"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pointer-events-none absolute bottom-3 inset-x-4 sm:inset-x-44 md:inset-x-52 z-35 flex justify-center">
      <div
        onClick={advanceDialogue}
        className="pointer-events-auto relative w-full max-w-xl pixel-box-amber bg-[#0b0706]/95 px-3.5 py-2.5 sm:px-4 sm:py-3 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {renderPortrait()}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <div className="flex items-center gap-1.5">
                <PixelIcon name="radio" className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="font-title text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                  {currentLine.speaker}
                </span>
                {dialogues.length > 1 && (
                  <span className="font-mono-hud text-[10px] text-slate-400">
                    ({currentIndex + 1}/{dialogues.length})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {speechAvailable && (
                  <button
                    type="button"
                    onClick={handleToggleSpeak}
                    className={`pixel-btn flex items-center gap-1 px-2 py-0.5 font-mono-hud text-[10px] font-bold cursor-pointer ${
                      isSpeaking
                        ? 'bg-sky-400 text-black'
                        : 'bg-[#1a100e] hover:bg-[#2a1b18] text-sky-300'
                    }`}
                    title={isSpeaking ? 'Stop reading aloud' : 'Read this message aloud'}
                  >
                    <PixelIcon name={isSpeaking ? 'volumeOff' : 'volumeOn'} className="w-3 h-3" />
                    <span className="hidden sm:inline">{isSpeaking ? 'STOP' : 'LISTEN'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    advanceDialogue();
                  }}
                  className="pixel-btn flex items-center gap-1 px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black font-mono-hud text-[10px] font-bold cursor-pointer shrink-0"
                  title="Next Message [SPACE / ENTER / TAB]"
                >
                  <span>{currentIndex < dialogues.length - 1 ? 'NEXT' : 'OK'}</span>
                  <PixelIcon name="chevronRight" className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="font-mono-hud text-xs text-slate-100 leading-snug">
              {displayedText}
              {isTyping && <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-1 animate-pulse" />}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
