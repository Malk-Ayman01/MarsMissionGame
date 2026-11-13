import React, { useState } from 'react';
import { MISSION_2_ROUTES, MISSION_2_EVIDENCE, NASA_MEDA_WEATHER_ARCHIVE } from '../../data/mission2Data';
import { RouteOption, GameResources } from '../../types/game';
import { sounds } from '../../audio/SoundManager';
import { PixelIcon } from '../PixelIcon';

interface Mission2InterfaceProps {
  resources: GameResources;
  onUpdateResources: (res: Partial<GameResources>) => void;
  onCompletePhase: (phaseName: string) => void;
  onFinishMission2: () => void;
}

type M2Phase = 'phase_a_route' | 'phase_b_geology' | 'phase_c_env' | 'phase_d_power' | 'phase_e_target' | 'debrief';

export const Mission2Interface: React.FC<Mission2InterfaceProps> = ({
  resources,
  onUpdateResources,
  onCompletePhase,
  onFinishMission2,
}) => {
  const [currentPhase, setCurrentPhase] = useState<M2Phase>('phase_a_route');

  const [selectedRoute, setSelectedRoute] = useState<RouteOption>(MISSION_2_ROUTES[1]);
  const [routeRationale, setRouteRationale] = useState<string | null>(null);
  const [showRouteRationaleExplanation, setShowRouteRationaleExplanation] = useState(false);

  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [geologyAnswer, setGeologyAnswer] = useState<string | null>(null);
  const [showGeologyExplanation, setShowGeologyExplanation] = useState(false);

  const [envDecision, setEnvDecision] = useState<string | null>(null);
  const [showEnvExplanation, setShowEnvExplanation] = useState(false);

  const [powerBudget, setPowerBudget] = useState({
    navigation: 35,
    science: 25,
    comms: 15,
    safety: 25,
  });

  const [isDrilling, setIsDrilling] = useState(false);
  const [drillProgress, setDrillProgress] = useState(0);

  const handleConfirmRoute = () => {
    sounds.playPickup();
    setShowRouteRationaleExplanation(true);
    onUpdateResources({
      selectedRouteId: selectedRoute.id,
      battery: Math.max(20, resources.battery - selectedRoute.estimatedBatteryCostPercent),
    });
  };

  const handleFinishPhaseA = () => {
    sounds.playObjectiveStinger();
    onCompletePhase('m2_phase_b_geology_water');
    setCurrentPhase('phase_b_geology');
  };

  const toggleEvidenceSelect = (id: string) => {
    sounds.playPickup();
    setSelectedEvidence((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleEvaluateGeology = (choice: string) => {
    sounds.playPickup();
    setGeologyAnswer(choice);
    setShowGeologyExplanation(true);
    const score = choice === 'kodiak_and_rochette' ? 100 : choice === 'kodiak_only' ? 80 : 50;
    onUpdateResources({
      geologicalScore: score,
      evidenceCollected: selectedEvidence,
    });
  };

  const handleFinishPhaseB = () => {
    sounds.playObjectiveStinger();
    onCompletePhase('m2_phase_c_environment');
    setCurrentPhase('phase_c_env');
  };

  const handleSelectEnvAction = (action: string) => {
    sounds.playPickup();
    setEnvDecision(action);
    setShowEnvExplanation(true);
  };

  const handleFinishPhaseC = () => {
    sounds.playObjectiveStinger();
    onCompletePhase('m2_phase_d_power_crisis');
    setCurrentPhase('phase_d_power');
  };

  const handleAdjustPower = (field: 'navigation' | 'science' | 'comms' | 'safety', delta: number) => {
    setPowerBudget((prev) => {
      const current = prev[field];
      const next = Math.max(10, Math.min(50, current + delta));
      return { ...prev, [field]: next };
    });
    sounds.playPickup();
  };

  const handleLockPower = () => {
    sounds.playObjectiveStinger();
    onUpdateResources({
      powerAllocation: powerBudget,
    });
    setTimeout(() => {
      onCompletePhase('m2_phase_e_complete_target');
      setCurrentPhase('phase_e_target');
    }, 1200);
  };

  const handleStartCoring = () => {
    sounds.playDrillSound();
    setIsDrilling(true);
    setDrillProgress(0);

    const interval = setInterval(() => {
      setDrillProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDrilling(false);
          sounds.playPickup();
          sounds.playObjectiveStinger();
          onUpdateResources({ hasCoreSample: true });
          return 100;
        }
        if (Math.random() < 0.3) sounds.playDrillSound();
        return prev + 20;
      });
    }, 400);
  };

  return (
    <div className="absolute inset-0 z-35 flex items-center justify-center p-3 sm:p-6 bg-black/90 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 pixel-box-cyan text-white overflow-hidden">

        <div className="p-4 sm:p-5 border-b-4 border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-cyan-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono-hud font-bold tracking-widest text-cyan-400 uppercase">
                MISSION 2: THE RED FRONTIER // SURVIVE. EXPLORE. DISCOVER.
              </span>
            </div>
            <h2 className="font-title text-sm sm:text-lg font-bold uppercase text-white mt-1 leading-snug">
              {currentPhase === 'phase_a_route' && 'Phase A: Read the Planet (Traverse Planning)'}
              {currentPhase === 'phase_b_geology' && 'Phase B: The Geology of Ancient Water'}
              {currentPhase === 'phase_c_env' && 'Phase C: The Environmental Warning (MEDA Analysis)'}
              {currentPhase === 'phase_d_power' && 'Phase D: The Rover Power Budget Challenge'}
              {currentPhase === 'phase_e_target' && 'Phase E: Target Documentation & Sample Coring'}
              {currentPhase === 'debrief' && 'Mission 2 Debrief: Scientific & Operational Evaluation'}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono-hud">
            {['A', 'B', 'C', 'D', 'E'].map((letter, idx) => {
              const phases: M2Phase[] = [
                'phase_a_route',
                'phase_b_geology',
                'phase_c_env',
                'phase_d_power',
                'phase_e_target',
              ];
              const isActive = currentPhase === phases[idx];
              const isPast = phases.indexOf(currentPhase) > idx;

              return (
                <div
                  key={letter}
                  className={`w-7 h-7 flex items-center justify-center font-bold border-2 ${
                    isActive
                      ? 'bg-cyan-500 text-black border-cyan-300'
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

        {currentPhase === 'phase_a_route' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-3.5 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-300">
              <span className="font-bold text-cyan-400 uppercase">SAMANTHA (PLANETARY NAVIGATOR):</span>{' '}
              "Before we move, we need to understand the ground beneath us. A beautiful route is not necessarily a safe route. Analyze the orbital observations of Jezero Crater and select a traverse vector."
            </div>

            <div className="relative overflow-hidden border-2 border-slate-700 bg-black">
              <img
                src="/assets/nasa/jezero_crater.jpg"
                alt="Jezero Crater Orbital Map"
                style={{ imageRendering: 'auto' }}
                className="w-full h-44 sm:h-52 object-cover object-center contrast-115"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/90 border-2 border-emerald-500 text-[10px] font-mono-hud text-emerald-300 flex items-center gap-1.5">
                <PixelIcon name="shieldCheck" className="w-3.5 h-3.5" />
                <span>REAL NASA ORBITAL OBSERVATION // MRO HiRISE / CRISM CONTEXT</span>
              </div>
              <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/90 border-2 border-slate-700 text-[10px] font-mono-hud text-slate-400">
                Landing Site &amp; River Delta Outflow
              </div>
            </div>

            <div>
              <div className="text-xs font-mono-hud font-bold text-slate-400 uppercase mb-2">
                SELECT TRAVERSE VECTOR TO DELTA SCARP (GAME DERIVED ESTIMATES):
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MISSION_2_ROUTES.map((route) => {
                  const isSelected = selectedRoute.id === route.id;
                  return (
                    <button
                      key={route.id}
                      onClick={() => {
                        setSelectedRoute(route);
                        sounds.playPickup();
                      }}
                      className={`text-left p-4 border-2 transition-none cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-[4px_4px_0_rgba(34,211,238,0.3)]'
                          : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[9px] font-mono-hud font-bold px-2 py-0.5 border ${
                              route.terrainRisk === 'LOW'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-500'
                                : route.terrainRisk === 'MODERATE'
                                ? 'bg-amber-950 text-amber-400 border-amber-500'
                                : 'bg-red-950 text-red-400 border-red-500'
                            }`}
                          >
                            RISK: {route.terrainRisk}
                          </span>
                          <span className="text-[10px] font-mono-hud text-slate-400">
                            {route.distanceMeters}m
                          </span>
                        </div>
                        <div className="font-title text-xs font-bold text-white mt-2">
                          {route.title}
                        </div>
                        <p className="font-mono-hud text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                          {route.terrainDescription}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t-2 border-slate-800 text-[10px] font-mono-hud text-slate-400 flex flex-col gap-1">
                        <div className="flex justify-between">
                          <span>Est. Battery Cost:</span>
                          <span className="text-amber-300 font-bold">~{route.estimatedBatteryCostPercent}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Travel Time:</span>
                          <span className="text-sky-300 font-bold">{route.estimatedMinutes} min</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {!showRouteRationaleExplanation ? (
              <div className="p-4 bg-slate-900 border-2 border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono-hud font-bold text-slate-200">
                    Selected: <span className="text-cyan-400">{selectedRoute.title}</span>
                  </div>
                  <div className="text-[11px] font-mono-hud text-slate-400 mt-0.5">
                    {selectedRoute.tradeOffSummary}
                  </div>
                </div>

                <button
                  onClick={handleConfirmRoute}
                  className="pixel-btn w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono-hud text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Confirm Traverse Route</span>
                  <PixelIcon name="arrowRight" className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 bg-cyan-950/50 border-2 border-cyan-500 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-cyan-400">
                  <PixelIcon name="help" className="w-4 h-4" />
                  <span>SAMANTHA ASKS: "WHY DID YOU CHOOSE THIS ROUTE?"</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'safety',
                      label: 'Prioritized Terrain Safety & Vehicle Preservation',
                    },
                    {
                      id: 'energy',
                      label: 'Prioritized Energy & Battery Conservation',
                    },
                    {
                      id: 'science',
                      label: 'Prioritized Direct Proximity to Scientific Targets',
                    },
                  ].map((ans) => (
                    <button
                      key={ans.id}
                      onClick={() => {
                        setRouteRationale(ans.id);
                        sounds.playPickup();
                      }}
                      className={`p-2.5 text-left text-xs font-mono-hud border-2 cursor-pointer ${
                        routeRationale === ans.id
                          ? 'bg-cyan-950 border-cyan-400 text-white font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {ans.label}
                    </button>
                  ))}
                </div>

                {routeRationale && (
                  <div className="p-3 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-200 mt-1">
                    <span className="font-bold text-emerald-400">LEARNING PRINCIPLE:</span> Real planetary traverse planning involves balancing distance against mechanical hazard, terrain slope, thermal constraints, and scientific returns. The shortest route across rough boulders often costs far more energy than taking a smoother, longer terrace!
                  </div>
                )}

                <div className="flex justify-end mt-1">
                  <button
                    disabled={!routeRationale}
                    onClick={handleFinishPhaseA}
                    className="pixel-btn px-6 py-2.5 bg-cyan-500 disabled:opacity-50 hover:bg-cyan-400 text-black font-mono-hud text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Phase B: Water Geology</span>
                    <PixelIcon name="arrowRight" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPhase === 'phase_b_geology' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-3.5 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-300">
              <span className="font-bold text-emerald-400 uppercase">SAMANTHA (PLANETARY SCIENTIST):</span>{' '}
              "Liquid water shaped parts of ancient Mars. If we want to understand whether this environment could once have supported life, we need to investigate the rocks, not jump to conclusions. Examine the three NASA evidence cards below."
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {MISSION_2_EVIDENCE.map((ev) => {
                const isSelected = selectedEvidence.includes(ev.id);
                return (
                  <div
                    key={ev.id}
                    onClick={() => toggleEvidenceSelect(ev.id)}
                    className={`p-4 border-2 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-400'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500 text-[9px] font-mono-hud font-bold">
                          REAL NASA OBSERVATION
                        </span>
                        <span className="text-[10px] font-mono-hud text-slate-400">{ev.sol}</span>
                      </div>

                      <div className="overflow-hidden border-2 border-slate-700 mb-2.5 bg-black">
                        <img
                          src={ev.imageSrc}
                          alt={ev.title}
                          style={{ imageRendering: 'auto' }}
                          className="w-full h-32 object-cover object-center"
                        />
                      </div>

                      <h4 className="font-title text-xs font-bold text-white">{ev.title}</h4>
                      <p className="font-mono-hud text-[11px] text-slate-300 mt-1.5 leading-relaxed">
                        {ev.observationSummary}
                      </p>

                      <div className="mt-2.5 p-2 bg-slate-950 border-2 border-slate-800 text-[10px] font-mono-hud text-slate-400">
                        <span className="text-sky-300 font-bold">Interpretation:</span> {ev.scientificInterpretation}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t-2 border-slate-800 flex items-center justify-between text-[10px] font-mono-hud">
                      <span className="text-slate-400">Water Relevance:</span>
                      <span
                        className={`font-bold ${
                          ev.relevanceToWater === 'HIGH'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {ev.relevanceToWater}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-900 border-2 border-slate-700 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-emerald-400">
                <PixelIcon name="help" className="w-4 h-4" />
                <span>SCIENTIFIC ANALYSIS: Which observations provide the strongest evidence for investigating an ancient water-related environment?</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'kodiak_and_rochette',
                    label: 'Evidence A & B (Layered Delta Stratification + Aqueous Mineral Salts)',
                  },
                  {
                    id: 'kodiak_only',
                    label: 'Evidence A Only (Sedimentary Layering in Isolation)',
                  },
                  {
                    id: 'ventifact',
                    label: 'Evidence C (Smooth Ventifact Boulders Carved by Wind)',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleEvaluateGeology(opt.id)}
                    className={`p-3 text-left text-xs font-mono-hud border-2 cursor-pointer ${
                      geologyAnswer === opt.id
                        ? 'bg-emerald-950/60 border-emerald-400 text-white font-bold'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {showGeologyExplanation && (
                <div className="p-3.5 bg-slate-950 border-2 border-slate-700 text-xs font-mono-hud text-slate-200 mt-1 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                    <PixelIcon name="check" className="w-4 h-4" />
                    <span>SAMANTHA’S SCIENTIFIC CONCLUSION:</span>
                  </div>
                  "Multiple lines of evidence (the delta top-sets/fore-sets of Kodiak combined with carbonate alteration salts inside rock pores) prove that Jezero Crater hosted persistent water. However, evidence of ancient water does not prove life existed—it only confirms an ancient habitable environment!"
                </div>
              )}

              {showGeologyExplanation && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleFinishPhaseB}
                    className="pixel-btn px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono-hud text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Phase C: Environmental Warning</span>
                    <PixelIcon name="arrowRight" className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentPhase === 'phase_c_env' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-3.5 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-300">
              <span className="font-bold text-amber-400 uppercase">HEDEYA (SYSTEMS ENGINEER):</span>{' '}
              "Mars is not just a cold desert. Its thin atmosphere, dust, temperature extremes, and radiation environment all affect how we plan our activities. Examine our live telemetry from the MEDA weather instrument."
            </div>

            <div className="p-4 bg-slate-900 border-2 border-slate-700 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <PixelIcon name="activity" className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono-hud text-xs font-bold text-white uppercase">
                    {NASA_MEDA_WEATHER_ARCHIVE.station}
                  </span>
                </div>
                <div className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-400 text-[10px] font-mono-hud font-bold">
                  AUTHENTIC NASA PDS ARCHIVE // {NASA_MEDA_WEATHER_ARCHIVE.sol}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono-hud text-xs">
                <div className="p-3 bg-black border-2 border-slate-800">
                  <div className="text-slate-400 text-[10px]">ATMOSPHERIC PRESSURE</div>
                  <div className="font-title text-sm font-bold text-white mt-1">
                    {NASA_MEDA_WEATHER_ARCHIVE.pressurePa} Pa
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">
                    {NASA_MEDA_WEATHER_ARCHIVE.pressureEarthRatio}
                  </div>
                </div>

                <div className="p-3 bg-black border-2 border-slate-800">
                  <div className="text-slate-400 text-[10px]">AIR TEMPERATURE</div>
                  <div className="font-title text-sm font-bold text-amber-300 mt-1">
                    {NASA_MEDA_WEATHER_ARCHIVE.tempMinCelsius}°C to {NASA_MEDA_WEATHER_ARCHIVE.tempMaxCelsius}°C
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">Diurnal swing of ~50°C</div>
                </div>

                <div className="p-3 bg-black border-2 border-slate-800">
                  <div className="text-slate-400 text-[10px]">DUST OPTICAL DEPTH (TAU)</div>
                  <div className="font-title text-sm font-bold text-orange-400 mt-1">
                    {NASA_MEDA_WEATHER_ARCHIVE.dustOpticalDepthTau}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">Moderate airborne dust</div>
                </div>

                <div className="p-3 bg-black border-2 border-slate-800">
                  <div className="text-slate-400 text-[10px]">SOLAR UV FLUX</div>
                  <div className="font-title text-sm font-bold text-purple-300 mt-1">
                    {NASA_MEDA_WEATHER_ARCHIVE.uvRadiationWm2} W/m²
                  </div>
                  <div className="text-[9px] text-slate-500 mt-1">Zero ozone shielding</div>
                </div>
              </div>

              <div className="text-[10px] font-mono-hud text-slate-500 italic">
                Source: {NASA_MEDA_WEATHER_ARCHIVE.provenance}
              </div>
            </div>

            <div className="p-4 bg-amber-950/40 pixel-box-amber flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <PixelIcon name="alert" className="w-4 h-4 text-amber-400" />
                <span className="font-mono-hud text-xs font-bold text-amber-300 uppercase">
                  SIMULATED MISSION SCENARIO // LOCALIZED DUST SQUALL &amp; TEMPERATURE DROP
                </span>
              </div>

              <p className="font-mono-hud text-xs text-amber-100 leading-relaxed">
                Optical opacity is rising sharply and ambient temperatures have plummeted to -45°C. Rover radiator efficiency is degraded by dust settling on thermal blankets. How does the expedition respond?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'shelter',
                    label: 'Delay Outdoor Drilling & Protect Equipment Thermal Blankets',
                  },
                  {
                    id: 'ignore',
                    label: 'Ignore Warning & Accelerate Traverse at Maximum Speed',
                  },
                  {
                    id: 'canyon',
                    label: 'Move to Lower-Elevation Sheltered Canyon Outcrop',
                  },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleSelectEnvAction(act.id)}
                    className={`p-3 text-left text-xs font-mono-hud border-2 cursor-pointer ${
                      envDecision === act.id
                        ? 'bg-amber-950 border-amber-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>

              {showEnvExplanation && (
                <div className="p-3.5 bg-slate-950 border-2 border-slate-700 text-xs font-mono-hud text-slate-200 mt-1 leading-relaxed">
                  <span className="font-bold text-cyan-400">OPERATIONAL PRINCIPLE:</span> Changing plans to protect equipment radiators from dust settling is the safest and most scientifically responsible choice. Ignoring environmental warnings leads to critical battery cold-soaks and motor failures!
                </div>
              )}

              {showEnvExplanation && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleFinishPhaseC}
                    className="pixel-btn px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono-hud text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Phase D: Power Crisis</span>
                    <PixelIcon name="arrowRight" className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentPhase === 'phase_d_power' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-3.5 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-300">
              <span className="font-bold text-amber-400 uppercase">HEDEYA (SYSTEMS ENGINEER):</span>{' '}
              "The selected traverse and thermal conditions have lowered our usable energy budget. We must prioritize which subsystems receive power so we can drill the core sample without draining life support!"
            </div>

            <div className="p-4 sm:p-5 bg-slate-900 border-2 border-slate-700 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                <span className="font-mono-hud text-xs font-bold text-white uppercase">
                  SIMULATED ROVER POWER BUDGET ALLOCATION
                </span>
                <span className="font-mono-hud text-xs text-amber-300 font-bold">
                  Total Allocated: {powerBudget.navigation + powerBudget.science + powerBudget.comms + powerBudget.safety}%
                </span>
              </div>

              {[
                {
                  key: 'navigation' as const,
                  label: 'Rover Mobility & Motor Actuators',
                  desc: 'Provides drive torque through sand and slope traversal',
                },
                {
                  key: 'safety' as const,
                  label: 'PLSS Life Support Heating & O2 Scrubber',
                  desc: 'Critical suit thermal blankets and oxygen circulation',
                },
                {
                  key: 'comms' as const,
                  label: 'UHF Transceiver & Base Downlink',
                  desc: 'Maintains radio carrier lock with Ares-1 habitat beacon',
                },
                {
                  key: 'science' as const,
                  label: 'Science Contact Sensors & Sample Coring Arm',
                  desc: 'Rotary coring motor and optical spectrometer',
                },
              ].map((subsys) => (
                <div key={subsys.key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-black border-2 border-slate-800">
                  <div>
                    <div className="font-title text-xs font-bold text-white">{subsys.label}</div>
                    <div className="font-mono-hud text-[11px] text-slate-400 mt-1">{subsys.desc}</div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleAdjustPower(subsys.key, -5)}
                      className="pixel-btn w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white font-mono-hud font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono-hud font-bold text-amber-300 text-sm">
                      {powerBudget[subsys.key]}%
                    </span>
                    <button
                      onClick={() => handleAdjustPower(subsys.key, 5)}
                      className="pixel-btn w-8 h-8 bg-slate-800 hover:bg-slate-700 text-white font-mono-hud font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleLockPower}
                className="pixel-btn w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-black font-mono-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <PixelIcon name="check" className="w-4 h-4" />
                <span>Confirm Power Budget &amp; Deploy Coring Arm</span>
              </button>
            </div>
          </div>
        )}

        {currentPhase === 'phase_e_target' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="p-3.5 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-300">
              <span className="font-bold text-cyan-400 uppercase">HAZALOOM (COMMANDER):</span>{' '}
              "We have reached the target delta scarp. Samantha has confirmed the cross-stratification layers, and Hedeya has secured our power budget. Let’s extract and hermetically seal the rock core sample."
            </div>

            <div className="p-5 bg-slate-900 border-2 border-slate-700 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-cyan-950 text-cyan-400 border-2 border-cyan-500 flex items-center justify-center">
                <PixelIcon name="sparkles" className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h3 className="font-title text-base font-bold uppercase text-white">
                  Rotary Percussive Coring Drill // Titanium Tube #14
                </h3>
                <p className="font-mono-hud text-xs text-slate-400 max-w-md mt-2">
                  Extracts a chalk-sized cylindrical core of sedimentary rock, preserving layered carbonates and clay minerals deposited by ancient Jezero lake waters.
                </p>
              </div>

              {!resources.hasCoreSample ? (
                <div className="w-full max-w-md flex flex-col gap-3">
                  {isDrilling && (
                    <div className="w-full">
                      <div className="flex justify-between text-xs font-mono-hud text-cyan-400 mb-1">
                        <span>Coring in Progress...</span>
                        <span>{drillProgress}%</span>
                      </div>
                      <div className="w-full h-4 bg-slate-800 border-2 border-slate-600 p-0.5 flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 h-full ${
                              drillProgress >= (i + 1) * 10 ? 'bg-cyan-400' : 'bg-slate-900'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    disabled={isDrilling}
                    onClick={handleStartCoring}
                    className="pixel-btn w-full py-3.5 px-6 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-mono-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isDrilling ? 'Drilling Core...' : 'Engage Coring Drill'}</span>
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-md p-4 bg-emerald-950/60 border-2 border-emerald-500 text-emerald-200 font-mono-hud text-xs flex flex-col gap-2">
                  <div className="flex items-center justify-center gap-2 font-bold text-emerald-400 text-sm">
                    <PixelIcon name="check" className="w-5 h-5" />
                    <span>SAMPLE CORE SECURED &amp; HERMETICALLY SEALED</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Tube #14 cached in the rover belly carousel. Ready for eventual Earth laboratory analysis.
                  </p>
                </div>
              )}
            </div>

            {resources.hasCoreSample && (
              <div className="p-4 bg-red-950/50 pixel-box-red flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-red-400">
                  <PixelIcon name="alert" className="w-4 h-4" />
                  <span>CRITICAL EQUIPMENT ALERT // TELEMETRY POWER BUS TRIPPED</span>
                </div>
                <p className="font-mono-hud text-xs text-red-200 leading-relaxed">
                  Hedeya reports: "Hazaloom! The thermal contraction and dust load on the radiator has tripped Auxiliary Bus #2! Our return telemetry is intermittent and our return plan must be adapted immediately!"
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentPhase('debrief')}
                    className="pixel-btn px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono-hud text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <span>Review Mission 2 Debrief &amp; Transition to Mission 3</span>
                    <PixelIcon name="arrowRight" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPhase === 'debrief' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-5">
            <div className="text-center pb-4 border-b-2 border-slate-800">
              <span className="text-xs font-mono-hud font-bold text-cyan-400 uppercase tracking-widest">
                // MISSION 2 DEBRIEF: THE RED FRONTIER //
              </span>
              <h3 className="font-title text-xl sm:text-2xl font-bold uppercase text-white mt-2">
                Surface Exploration Phase Complete
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-hud">
              <div className="p-3 bg-slate-900 border-2 border-slate-700">
                <span className="text-slate-400">Selected Route:</span>
                <div className="font-title text-xs font-bold text-white mt-1">{selectedRoute.title}</div>
              </div>

              <div className="p-3 bg-slate-900 border-2 border-slate-700">
                <span className="text-slate-400">Geological Score:</span>
                <div className="font-title text-xs font-bold text-emerald-400 mt-1">
                  {resources.geologicalScore ?? 90}%
                </div>
              </div>

              <div className="p-3 bg-slate-900 border-2 border-slate-700">
                <span className="text-slate-400">Core Sample:</span>
                <div className="font-title text-xs font-bold text-cyan-400 mt-1">
                  Tube #14 Cached
                </div>
              </div>

              <div className="p-3 bg-slate-900 border-2 border-slate-700">
                <span className="text-slate-400">Power Remaining:</span>
                <div className="font-title text-xs font-bold text-amber-300 mt-1">
                  {Math.round(resources.battery)}%
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border-2 border-slate-700 text-xs font-mono-hud text-slate-300 leading-relaxed">
              <span className="font-bold text-cyan-400">EDUCATIONAL TAKEAWAY:</span> You successfully interpreted orbital Jezero Crater maps, evaluated genuine sedimentary water evidence at Kodiak Butte, examined authentic NASA MEDA surface meteorological data, and managed rover power constraints. Now, an emergency systems failure threatens your return.
            </div>

            <button
              onClick={onFinishMission2}
              className="pixel-btn w-full py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-mono-hud text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Transition Directly to Mission 3: The Return Protocol</span>
              <PixelIcon name="arrowRight" className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
