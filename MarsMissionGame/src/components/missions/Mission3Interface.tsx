import React, { useState } from 'react';
import { MISSION_3_DIAGNOSTICS, RETURN_ROUTES, ReturnRouteChoice } from '../../data/mission3Data';
import { GameResources, MissionStats } from '../../types/game';
import { sounds } from '../../audio/SoundManager';
import { PixelIcon } from '../PixelIcon';

interface Mission3InterfaceProps {
  resources: GameResources;
  onUpdateResources: (res: Partial<GameResources>) => void;
  onCompletePhase: (phaseName: string) => void;
  onFinishExpedition: (finalStats: MissionStats) => void;
  onOpenFieldGuide: () => void;
  onReplayExpedition: () => void;
}

type M3Phase = 'phase_a_diagnosis' | 'phase_b_safety' | 'phase_c_nav' | 'phase_d_decision' | 'phase_e_summary';

export const Mission3Interface: React.FC<Mission3InterfaceProps> = ({
  resources,
  onUpdateResources,
  onCompletePhase,
  onFinishExpedition,
  onOpenFieldGuide,
}) => {
  const [currentPhase, setCurrentPhase] = useState<M3Phase>('phase_a_diagnosis');

  const [isolatedSubsystem, setIsolatedSubsystem] = useState<string | null>(null);
  const [diagnosticSolved, setDiagnosticSolved] = useState(false);

  const [selectedReturnRoute, setSelectedReturnRoute] = useState<ReturnRouteChoice>(RETURN_ROUTES[1]);

  const [finalScienceDecision, setFinalScienceDecision] = useState<'pursue' | 'prioritize_safety' | null>(null);

  const handleSelectDiagnostic = (id: string) => {
    sounds.playPickup();
    setIsolatedSubsystem(id);
    if (id === 'power_bus_aux') {
      setDiagnosticSolved(true);
      sounds.playObjectiveStinger();
      onUpdateResources({ diagnosedSubsystem: id });
    }
  };

  const handleFinishPhaseA = () => {
    sounds.playObjectiveStinger();
    onCompletePhase('m3_phase_b_oxygen_safety');
    setCurrentPhase('phase_b_safety');
  };

  const handleConfirmSafety = () => {
    sounds.playObjectiveStinger();
    setTimeout(() => {
      onCompletePhase('m3_phase_c_return_navigation');
      setCurrentPhase('phase_c_nav');
    }, 1000);
  };

  const handleConfirmReturnRoute = () => {
    sounds.playObjectiveStinger();
    onUpdateResources({
      battery: Math.max(15, resources.battery - selectedReturnRoute.batteryCostPercent),
    });
    setTimeout(() => {
      onCompletePhase('m3_phase_d_final_science');
      setCurrentPhase('phase_d_decision');
    }, 1000);
  };

  const handleConfirmFinalDecision = (choice: 'pursue' | 'prioritize_safety') => {
    sounds.playPickup();
    setFinalScienceDecision(choice);

    const costBattery = choice === 'pursue' ? 12 : 0;
    const costO2 = choice === 'pursue' ? 14 : 0;

    onUpdateResources({
      battery: Math.max(10, resources.battery - costBattery),
      oxygen: Math.max(20, resources.oxygen - costO2),
      pursuedFinalOptionalScience: choice === 'pursue',
    });

    sounds.playMissionSuccess();
    setTimeout(() => {
      onCompletePhase('m3_phase_e_final_debrief');
      setCurrentPhase('phase_e_summary');
    }, 1200);
  };

  const finalStats: MissionStats = {
    missionId: 'mission_3',
    elapsedSeconds: resources.elapsedSeconds + 720,
    finalOxygen: resources.oxygen,
    finalBattery: resources.battery,
    finalCondition: resources.condition,
    factsDiscovered: 8,
    totalFacts: 8,
    rockCollisions: resources.rockCollisions,
    routeChoice: selectedReturnRoute.name,
    scientificScore: finalScienceDecision === 'pursue' ? 100 : 90,
    safetyScore: selectedReturnRoute.id === 'delta_shelf' ? 100 : 70,
    hasCoreSample: true,
    pursuedOptionalScience: finalScienceDecision === 'pursue',
  };

  return (
    <div className="absolute inset-0 z-35 flex items-center justify-center p-3 sm:p-6 bg-black/90 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 pixel-box-red text-white overflow-hidden">

        <div className="p-4 sm:p-5 border-b-4 border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono-hud font-bold tracking-widest text-red-400 uppercase">
                MISSION 3: THE RETURN PROTOCOL // SURVIVE. ADAPT. COME HOME.
              </span>
            </div>
            <h2 className="font-title text-sm sm:text-lg font-bold uppercase text-white mt-1 leading-snug">
              {currentPhase === 'phase_a_diagnosis' && 'Phase A: Emergency Systems Diagnosis'}
              {currentPhase === 'phase_b_safety' && 'Phase B: Oxygen & Crew Safety Margins'}
              {currentPhase === 'phase_c_nav' && 'Phase C: Navigate Back to Safety'}
              {currentPhase === 'phase_d_decision' && 'Phase D: The Final Scientific Decision'}
              {currentPhase === 'phase_e_summary' && 'Phase E: Final Expedition Debrief'}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono-hud">
            {['A', 'B', 'C', 'D', 'E'].map((letter, idx) => {
              const phases: M3Phase[] = [
                'phase_a_diagnosis',
                'phase_b_safety',
                'phase_c_nav',
                'phase_d_decision',
                'phase_e_summary',
              ];
              const isActive = currentPhase === phases[idx];
              const isPast = phases.indexOf(currentPhase) > idx;

              return (
                <div
                  key={letter}
                  className={`w-7 h-7 flex items-center justify-center font-bold border-2 ${
                    isActive
                      ? 'bg-red-500 text-white border-red-300'
                      : isPast
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        </div>

        {currentPhase === 'phase_a_diagnosis' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-3.5 bg-red-950/50 border-2 border-red-500 text-xs font-mono-hud text-red-200">
              <span className="font-bold text-red-400 uppercase">HEDEYA (SYSTEMS ENGINEER):</span>{' '}
              "We have an unexpected systems failure! Before taking action, we must understand what failed, what still works, and which systems we cannot afford to lose. Inspect the diagnostics below and identify the fault to isolate."
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MISSION_3_DIAGNOSTICS.map((subsys) => {
                const isSelected = isolatedSubsystem === subsys.id;
                return (
                  <button
                    key={subsys.id}
                    onClick={() => handleSelectDiagnostic(subsys.id)}
                    className={`p-4 text-left border-2 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? subsys.status === 'CRITICAL_FAULT'
                          ? 'bg-red-950/60 border-red-400'
                          : 'bg-amber-950/60 border-amber-400'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[9px] font-mono-hud font-bold px-2 py-0.5 border ${
                            subsys.status === 'CRITICAL_FAULT'
                              ? 'bg-red-950 text-red-400 border-red-500'
                              : subsys.status === 'WARNING'
                              ? 'bg-amber-950 text-amber-400 border-amber-500'
                              : 'bg-emerald-950 text-emerald-400 border-emerald-500'
                          }`}
                        >
                          STATUS: {subsys.status}
                        </span>
                        <span className="text-[10px] font-mono-hud text-slate-400">
                          {subsys.currentDrawWatts}W
                        </span>
                      </div>
                      <div className="font-title text-xs font-bold text-white mt-2">
                        {subsys.name}
                      </div>
                      <p className="font-mono-hud text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                        {subsys.symptom}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t-2 border-slate-800 text-[10px] font-mono-hud text-cyan-300">
                      Recommendation: {subsys.recommendedAction}
                    </div>
                  </button>
                );
              })}
            </div>

            {diagnosticSolved && (
              <div className="p-4 bg-emerald-950/50 pixel-box-emerald flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs font-mono-hud text-emerald-200">
                  <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                    <PixelIcon name="check" className="w-4 h-4" />
                    <span>AUXILIARY BUS #2 ISOLATED &amp; CONSTRAINED</span>
                  </div>
                  Primary life support and drive motors are protected. Rover power draw has stabilized!
                </div>

                <button
                  onClick={handleFinishPhaseA}
                  className="pixel-btn w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Phase B: Crew Safety Margins</span>
                  <PixelIcon name="arrowRight" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {currentPhase === 'phase_b_safety' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-3.5 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-300">
              <span className="font-bold text-sky-400 uppercase">HAZALOOM (COMMANDER):</span>{' '}
              "Every extra activity has a cost. Our return plan must account for crew safety before we consider optional objectives. Hedeya, display our life-support reserves and required safety margin."
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-slate-900 border-2 border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-400">
                    <PixelIcon name="wind" className="w-4 h-4 text-sky-400" />
                    <span>SIMULATED OXYGEN LEVEL</span>
                  </div>
                  <div className="font-title text-lg font-bold text-sky-300 mt-2">
                    {Math.round(resources.oxygen)}%
                  </div>
                </div>
                <div className="text-[10px] font-mono-hud text-slate-500 mt-3">
                  Estimated duration: ~45 minutes
                </div>
              </div>

              <div className="p-4 bg-slate-900 border-2 border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-400">
                    <PixelIcon name="battery" className="w-4 h-4 text-amber-400" />
                    <span>SIMULATED ROVER BATTERY</span>
                  </div>
                  <div className="font-title text-lg font-bold text-amber-300 mt-2">
                    {Math.round(resources.battery)}%
                  </div>
                </div>
                <div className="text-[10px] font-mono-hud text-slate-500 mt-3">
                  Constrained by low-torque drive mode
                </div>
              </div>

              <div className="p-4 bg-slate-900 border-2 border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-400">
                    <PixelIcon name="shieldCheck" className="w-4 h-4 text-emerald-400" />
                    <span>REQUIRED SAFETY BUFFER</span>
                  </div>
                  <div className="font-title text-lg font-bold text-emerald-400 mt-2">
                    25% Reserve
                  </div>
                </div>
                <div className="text-[10px] font-mono-hud text-slate-500 mt-3">
                  Mandatory non-expendable buffer
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border-2 border-slate-700 flex flex-col gap-3">
              <div className="text-xs font-mono-hud font-bold text-emerald-400 flex items-center gap-2">
                <PixelIcon name="check" className="w-4 h-4" />
                <span>SAFETY PRINCIPLE ESTABLISHED:</span>
              </div>
              <p className="font-mono-hud text-xs text-slate-300 leading-relaxed">
                "A scientifically interesting discovery is not worth sacrificing crew safety. In planetary mission architecture, all return trajectories must maintain a minimum 25% life-support reserve against unexpected delays, mechanical wear, or terrain obstacles."
              </p>

              <div className="flex justify-end mt-2">
                <button
                  onClick={handleConfirmSafety}
                  className="pixel-btn px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-mono-hud text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <span>Confirm Safety Reserve &amp; Plan Return Traverse</span>
                  <PixelIcon name="arrowRight" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentPhase === 'phase_c_nav' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-3.5 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-300">
              <span className="font-bold text-emerald-400 uppercase">SAMANTHA (PLANETARY NAVIGATOR):</span>{' '}
              "Navigation is not just knowing where we want to go. We must understand the terrain between our current position and the Ares-1 habitat. With our wheel torque limited, we must choose our return route carefully."
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RETURN_ROUTES.map((route) => {
                const isSelected = selectedReturnRoute.id === route.id;
                return (
                  <button
                    key={route.id}
                    onClick={() => {
                      setSelectedReturnRoute(route);
                      sounds.playPickup();
                    }}
                    className={`p-4 text-left border-2 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[9px] font-mono-hud font-bold px-2 py-0.5 border ${
                            route.riskAssessment === 'LOW'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500'
                              : 'bg-red-950 text-red-400 border-red-500'
                          }`}
                        >
                          RISK: {route.riskAssessment}
                        </span>
                        <span className="text-[10px] font-mono-hud text-slate-400">
                          {route.distanceMeters}m
                        </span>
                      </div>
                      <div className="font-title text-xs font-bold text-white mt-2">
                        {route.name}
                      </div>
                      <p className="font-mono-hud text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                        {route.description}
                      </p>
                    </div>

                    <div className="mt-3 p-2.5 bg-black border-2 border-slate-800 text-[10px] font-mono-hud text-slate-400">
                      {route.crewEvaluation}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={handleConfirmReturnRoute}
                className="pixel-btn px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-mono-hud text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <span>Execute Return Traverse: {selectedReturnRoute.name}</span>
                <PixelIcon name="arrowRight" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentPhase === 'phase_d_decision' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-3.5 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-300">
              <span className="font-bold text-cyan-400 uppercase">HAZALOOM (COMMANDER):</span>{' '}
              "We have reached the junction near the base. Samantha has spotted an exposed delta gravel outcrop containing ancient river conglomerates. We must make the final mission decision: pursue this optional observation, or prioritize safe return to the airlock?"
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleConfirmFinalDecision('pursue')}
                className={`p-5 text-left border-2 cursor-pointer flex flex-col justify-between ${
                  finalScienceDecision === 'pursue'
                    ? 'bg-cyan-950/60 border-cyan-400'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono-hud font-bold text-cyan-400 uppercase mb-1">
                    OPTION A: COMPLETE OPTIONAL OBSERVATION
                  </div>
                  <h4 className="font-title text-xs font-bold text-white">
                    Sample Conglomerate Gravel Bed
                  </h4>
                  <p className="font-mono-hud text-xs text-slate-300 mt-2 leading-relaxed">
                    Provides direct physical evidence of peak river discharge velocity in ancient Jezero Crater. Consumes an additional 12% battery and 14% suit oxygen.
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t-2 border-slate-800 text-[10px] font-mono-hud text-cyan-300">
                  Trade-off: Higher science yield, reduced safety buffer margin.
                </div>
              </button>

              <button
                onClick={() => handleConfirmFinalDecision('prioritize_safety')}
                className={`p-5 text-left border-2 cursor-pointer flex flex-col justify-between ${
                  finalScienceDecision === 'prioritize_safety'
                    ? 'bg-emerald-950/60 border-emerald-400'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono-hud font-bold text-emerald-400 uppercase mb-1">
                    OPTION B: PRIORITIZE CREW SAFETY &amp; RETURN
                  </div>
                  <h4 className="font-title text-xs font-bold text-white">
                    Direct Airlock Return
                  </h4>
                  <p className="font-mono-hud text-xs text-slate-300 mt-2 leading-relaxed">
                    Leaves the secondary observation for a future expedition. Guarantees maximum life-support reserve and protects the primary core sample already secured.
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t-2 border-slate-800 text-[10px] font-mono-hud text-emerald-300">
                  Trade-off: Prioritizes crew survival and flawless mission completion.
                </div>
              </button>
            </div>
          </div>
        )}

        {currentPhase === 'phase_e_summary' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="text-center pb-4 border-b-2 border-slate-800">
              <span className="text-xs font-mono-hud font-bold text-emerald-400 uppercase tracking-widest">
                // EXPEDITION COMPLETE //
              </span>
              <h3 className="font-title text-xl sm:text-3xl font-black uppercase text-white mt-2">
                ARES-1 EXPEDITION ACCOMPLISHED
              </h3>
              <p className="font-mono-hud text-xs text-slate-400 mt-2">
                THREE MISSIONS. ONE EXPEDITION. A UNIVERSE OF QUESTIONS.
              </p>
            </div>

            <div className="p-4 bg-slate-900 border-2 border-slate-700 flex flex-col gap-3 text-xs font-mono-hud">
              <div>
                <span className="font-bold text-orange-400">HAZALOOM (COMMANDER):</span>{' '}
                <span className="italic text-slate-200">
                  “We came to explore Mars. We leave knowing how much careful planning exploration requires.”
                </span>
              </div>
              <div>
                <span className="font-bold text-emerald-400">SAMANTHA (PLANETARY SCIENTIST):</span>{' '}
                <span className="italic text-slate-200">
                  “Every observation gave us evidence. Every unanswered question gave us a reason to keep learning.”
                </span>
              </div>
              <div>
                <span className="font-bold text-blue-400">HEDEYA (SYSTEMS ENGINEER):</span>{' '}
                <span className="italic text-slate-200">
                  “And every safe decision brought us one step closer to making future exploration possible.”
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-hud">
              <div className="p-3.5 bg-slate-900 border-2 border-slate-700">
                <span className="text-slate-400">Scientific Reasoning:</span>
                <div className="font-title text-xs font-bold text-emerald-400 mt-1">
                  {finalStats.scientificScore}% Verified
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 border-2 border-slate-700">
                <span className="text-slate-400">Safety &amp; Planning:</span>
                <div className="font-title text-xs font-bold text-sky-400 mt-1">
                  {finalStats.safetyScore}% Nominal
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 border-2 border-slate-700">
                <span className="text-slate-400">Titanium Core Sample:</span>
                <div className="font-title text-xs font-bold text-cyan-400 mt-1">
                  Tube #14 Secured
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 border-2 border-slate-700">
                <span className="text-slate-400">NASA Facts Discovered:</span>
                <div className="font-title text-xs font-bold text-purple-400 mt-1">
                  8 / 8 Unlocked
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/40 pixel-box-emerald text-center text-xs font-mono-hud text-emerald-200">
              "Real exploration begins with evidence, preparation, and the courage to make responsible decisions."
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={onOpenFieldGuide}
                className="pixel-btn w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono-hud text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <PixelIcon name="book" className="w-4 h-4 text-purple-400" />
                <span>Open Full NASA Science Field Guide</span>
              </button>

              <button
                onClick={() => onFinishExpedition(finalStats)}
                className="pixel-btn w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono-hud text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <PixelIcon name="check" className="w-4 h-4" />
                <span>Return to Main Mission Control</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
