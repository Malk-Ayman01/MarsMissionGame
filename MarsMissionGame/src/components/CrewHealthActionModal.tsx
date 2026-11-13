import React, { useState } from 'react';
import { Mission3HealthBoostChoice } from '../types/game';
import { sounds } from '../audio/SoundManager';
import { PixelIcon } from './PixelIcon';

interface CrewHealthActionModalProps {
  onComplete: (boostChoice: Mission3HealthBoostChoice) => void;
}

interface HealthChallenge {
  id: 'bones' | 'sleep' | 'immune';
  title: string;
  concept: string;
  wrongLabel: string;
  wrongAfterEffect: string;
  rightLabel: string;
  rightAfterEffect: string;
  icon: 'activity' | 'sun' | 'sprout';
}

const HEALTH_CHALLENGES: HealthChallenge[] = [
  {
    id: 'bones',
    title: '1. Bones & Muscles in Zero-G (Hazaloom)',
    concept: 'In microgravity, astronauts float effortlessly—so bones and leg muscles stop working!',
    wrongLabel: 'Skip Workout to Rest',
    wrongAfterEffect:
      'AFTER-EFFECT: Without pushing against gravity, astronauts lose 1–2% bone strength each month and get too weak to walk on Earth!',
    rightLabel: '2-Hour Daily Resistance Gym',
    rightAfterEffect:
      'SOLVED! Pulling against space resistance machines keeps Hazaloom’s bones & muscles strong (+5 Science)!',
    icon: 'activity',
  },
  {
    id: 'sleep',
    title: '2. 16 Sunrises a Day! (Samantha)',
    concept: 'In orbit, the Sun rises and sets every 90 minutes, confusing the brain’s sleep clock!',
    wrongLabel: 'Bright White Lights 24/7',
    wrongAfterEffect:
      'AFTER-EFFECT: Constant bright white light tricks your brain into thinking it is noon all the time—causing tired mistakes!',
    rightLabel: 'Blue-Tuned Sleep Clock Lights',
    rightAfterEffect:
      'SOLVED! Special NASA sleep lights mimic Earth day and night so Samantha rests deep (+5 Science)!',
    icon: 'sun',
  },
  {
    id: 'immune',
    title: '3. Space Immune Shield (Hedeya)',
    concept: 'Long space trips stress immune cells, making astronauts catch germs much easier!',
    wrongLabel: 'Dry Crackers & Candy Only',
    wrongAfterEffect:
      'AFTER-EFFECT: Zero fresh vitamins leaves immune cells sluggish during the 7-month flight back to Earth!',
    rightLabel: 'Fresh Hydroponic Space Veggies',
    rightAfterEffect:
      'SOLVED! Crisp space-grown lettuce & greens boost vitamins AND recycle cabin oxygen (+5 Science)!',
    icon: 'sprout',
  },
];

export const CrewHealthActionModal: React.FC<CrewHealthActionModalProps> = ({
  onComplete,
}) => {
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [wrongFeedback, setWrongFeedback] = useState<Record<string, boolean>>({});
  const [boostChoice, setBoostChoice] = useState<Mission3HealthBoostChoice | null>(null);

  const allProblemsSolved = HEALTH_CHALLENGES.every((c) => solved[c.id]);
  const allReady = allProblemsSolved && boostChoice !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto pixel-box-emerald bg-[#081510] p-5 sm:p-6 text-slate-100">
        <div className="pb-3 border-b-2 border-[#14532d]">
          <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <PixelIcon name="shieldCheck" className="w-4 h-4" />
            <span>DOCKED IN ORBIT // ZERO-GRAVITY CREW CHECK</span>
          </div>
          <h2 className="font-title text-base sm:text-xl font-bold text-white uppercase">
            Solve Crew Health &amp; Pick Your Home Ship Boost!
          </h2>
          <p className="font-mono-hud text-xs text-emerald-200 mt-1 leading-relaxed">
            Reaching orbit is only half the trip! The flight home takes months in zero gravity. Test each NASA choice below to see its <b className="text-white">after-effect</b> and fix all 3 crew problems:
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {HEALTH_CHALLENGES.map((item) => {
            const isSolved = Boolean(solved[item.id]);
            const triedWrong = Boolean(wrongFeedback[item.id]);
            return (
              <div
                key={item.id}
                className={`p-3.5 border-2 ${
                  isSolved
                    ? 'bg-emerald-950/65 border-emerald-400'
                    : 'bg-[#0b1f17] border-[#14532d]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <PixelIcon name={item.icon} className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-title text-xs font-bold text-white">{item.title}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono-hud font-bold ${
                      isSolved
                        ? 'bg-emerald-400 text-black'
                        : 'bg-[#07120e] border border-amber-500 text-amber-300'
                    }`}
                  >
                    {isSolved ? 'SOLVED!' : 'PICK FIX'}
                  </span>
                </div>

                <p className="font-mono-hud text-[11px] text-slate-300 mb-2.5 leading-snug">
                  <b className="text-sky-300">CONCEPT:</b> {item.concept}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSolved}
                    onClick={() => {
                      sounds.playCrash();
                      setWrongFeedback((prev) => ({ ...prev, [item.id]: true }));
                    }}
                    className={`p-2 text-left border text-[11px] font-mono-hud ${
                      isSolved
                        ? 'bg-[#07120e]/50 border-slate-800 text-slate-500 cursor-not-allowed'
                        : triedWrong
                        ? 'bg-red-950/80 border-red-400 text-red-200 cursor-pointer'
                        : 'bg-[#07120e] border-[#14532d] hover:border-amber-400 text-slate-200 cursor-pointer'
                    }`}
                  >
                    {item.wrongLabel}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPickup();
                      setSolved((prev) => ({ ...prev, [item.id]: true }));
                      setWrongFeedback((prev) => ({ ...prev, [item.id]: false }));
                    }}
                    className={`p-2 text-left border text-[11px] font-mono-hud cursor-pointer ${
                      isSolved
                        ? 'bg-emerald-500 border-emerald-300 text-black font-bold'
                        : 'bg-[#07120e] border-[#14532d] hover:border-emerald-400 text-emerald-200'
                    }`}
                  >
                    {item.rightLabel}
                  </button>
                </div>

                {triedWrong && !isSolved && (
                  <p className="mt-2 p-2 bg-red-950/70 border border-red-500 text-[11px] font-mono-hud text-red-200 leading-snug">
                    {item.wrongAfterEffect} Try the real NASA fix!
                  </p>
                )}

                {isSolved && (
                  <p className="mt-2 p-2 bg-emerald-950/80 border border-emerald-500 text-[11px] font-mono-hud text-emerald-200 leading-snug">
                    {item.rightAfterEffect}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Final Return Ship Power Decision */}
        <div className="mt-4 pt-3 border-t-2 border-[#14532d]">
          <div className="text-xs font-mono-hud font-bold text-amber-300 uppercase tracking-wider mb-2">
            FINAL DECISION: WHERE DO YOU SEND EXTRA HOME SHIP POWER?
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playPickup();
                setBoostChoice('fitness');
              }}
              className={`p-2.5 text-left border-2 cursor-pointer ${
                boostChoice === 'fitness'
                  ? 'bg-emerald-950/70 border-emerald-400'
                  : 'bg-[#0b1f17] border-[#14532d] hover:border-emerald-500'
              }`}
            >
              <div className="font-title text-[11px] text-white uppercase">Space Health Lab</div>
              <div className="font-mono-hud text-[10px] text-emerald-300 mt-1">
                +20 Science · Tracks bone &amp; muscle recovery!
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playPickup();
                setBoostChoice('shield');
              }}
              className={`p-2.5 text-left border-2 cursor-pointer ${
                boostChoice === 'shield'
                  ? 'bg-emerald-950/70 border-emerald-400'
                  : 'bg-[#0b1f17] border-[#14532d] hover:border-emerald-500'
              }`}
            >
              <div className="font-title text-[11px] text-white uppercase">Solar Ray Shield</div>
              <div className="font-mono-hud text-[10px] text-sky-300 mt-1">
                +15% Final Shielding · Extra deep-space ray protection!
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playPickup();
                setBoostChoice('hydroponics');
              }}
              className={`p-2.5 text-left border-2 cursor-pointer ${
                boostChoice === 'hydroponics'
                  ? 'bg-emerald-950/70 border-emerald-400'
                  : 'bg-[#0b1f17] border-[#14532d] hover:border-emerald-500'
              }`}
            >
              <div className="font-title text-[11px] text-white uppercase">Greenhouse Air</div>
              <div className="font-mono-hud text-[10px] text-amber-300 mt-1">
                +15% Life Support &amp; +10 Science · Fresh food &amp; O₂!
              </div>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-[#14532d] flex justify-end">
          <button
            onClick={() => {
              if (!allReady || !boostChoice) return;
              sounds.playMissionSuccess();
              onComplete(boostChoice);
            }}
            disabled={!allReady}
            className={`pixel-btn w-full py-3.5 font-title text-xs uppercase flex items-center justify-center gap-2 ${
              allReady
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <PixelIcon name="rocket" className="w-4 h-4" />
            <span>
              {allReady
                ? 'Fire Thrusters & Fly Home!'
                : !allProblemsSolved
                ? 'Solve All 3 Crew Health Problems Above'
                : 'Pick Your Final Home Ship Power Boost'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
