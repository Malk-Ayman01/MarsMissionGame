import React, { useEffect, useState } from 'react';
import { NASA_FACTS } from '../data/nasaContent';
import { NASA_DATA_PROVENANCE, SCIENCE_GLOSSARY } from '../data/nasaDatasets';
import { EducationalFact } from '../types/game';
import { PixelIcon } from './PixelIcon';
import {
  AstronautHealthStudy,
  DEFAULT_MARS_TREK,
  DEFAULT_RADLAB_ENTRIES,
  fetchHealthStudiesWithMeta,
  fetchMarsTrekTerrain,
  fetchRadLabComparison,
  fetchSpaceWeather,
  HealthTopic,
  MarsTrekTerrainData,
  RadLabComparisonEntry,
  SpaceWeatherData,
} from '../services/nasaApi';

interface NasaFieldGuideProps {
  unlockedFactIds: string[];
  onClose: () => void;
}

type FieldGuideTab = 'facts' | 'terrain' | 'radiation' | 'health' | 'glossary';
type TrekLayerMode = 'hirise' | 'mola';

const HEALTH_TOPICS: { id: HealthTopic; label: string; badge: string }[] = [
  { id: 'bones', label: 'Bone Strength', badge: 'SKELETON' },
  { id: 'muscles', label: 'Muscle Power', badge: 'EXERCISE' },
  { id: 'sleep', label: 'Space Sleep', badge: 'BODY CLOCK' },
  { id: 'immune', label: 'Immune Shield', badge: 'DEFENSE' },
];

export const NasaFieldGuide: React.FC<NasaFieldGuideProps> = ({ unlockedFactIds, onClose }) => {
  const [selectedFact, setSelectedFact] = useState<EducationalFact>(NASA_FACTS[0]);
  const [activeTab, setActiveTab] = useState<FieldGuideTab>('facts');

  const [trekData, setTrekData] = useState<MarsTrekTerrainData>(DEFAULT_MARS_TREK);
  const [trekLayer, setTrekLayer] = useState<TrekLayerMode>('hirise');
  const [trekTileFallback, setTrekTileFallback] = useState(false);

  const [spaceWeather, setSpaceWeather] = useState<SpaceWeatherData | null>(null);
  const [radLabEntries, setRadLabEntries] = useState<RadLabComparisonEntry[]>(DEFAULT_RADLAB_ENTRIES);
  const [radLabNote, setRadLabNote] = useState<string>(
    'Curated NASA OSDR RadLab & MSL Curiosity RAD offline dataset'
  );

  const [healthTopic, setHealthTopic] = useState<HealthTopic>('bones');
  const [healthStudies, setHealthStudies] = useState<AstronautHealthStudy[]>([]);
  const [healthSourceNote, setHealthSourceNote] = useState<string>(
    'Curated NASA OSDR space biology snapshot (offline fallback)'
  );
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    fetchMarsTrekTerrain().then(setTrekData);
    fetchSpaceWeather().then((data) => {
      if (data) setSpaceWeather(data);
    });
    fetchRadLabComparison().then((res) => {
      setRadLabEntries(res.entries);
      setRadLabNote(res.dataSourceNote);
    });
  }, []);

  useEffect(() => {
    if (activeTab !== 'health') return;
    let cancelled = false;
    setLoadingHealth(true);
    fetchHealthStudiesWithMeta(healthTopic).then((res) => {
      if (!cancelled) {
        setHealthStudies(res.items);
        setHealthSourceNote(res.dataSourceNote);
        setLoadingHealth(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeTab, healthTopic]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col pixel-box bg-[#110a08] text-white overflow-hidden">

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b-4 border-[#49302b] bg-[#190f0c]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-950 text-amber-400 border-2 border-amber-500">
              <PixelIcon name="book" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-title text-base sm:text-xl font-bold uppercase tracking-wider text-white">
                Mars Field Guide
              </h2>
              <p className="font-mono-hud text-xs text-slate-400 mt-1">
                Real NASA Mars photos, Jezero elevation maps, space weather, &amp; crew health science.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="pixel-btn p-2 bg-[#241512] hover:bg-[#38211c] text-slate-300 hover:text-white cursor-pointer"
          >
            <PixelIcon name="x" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 px-4 sm:px-6 py-2.5 border-b-2 border-[#49302b] bg-[#0c0706]">
          <button
            type="button"
            onClick={() => setActiveTab('facts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 font-mono-hud text-xs font-bold cursor-pointer ${
              activeTab === 'facts'
                ? 'bg-amber-500 border-amber-300 text-black'
                : 'bg-[#160d0b] text-slate-300 hover:bg-[#241512] border-[#49302b]'
            }`}
          >
            <PixelIcon name="book" className="w-3.5 h-3.5" />
            <span>Field Logs ({unlockedFactIds.length}/{NASA_FACTS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terrain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 font-mono-hud text-xs font-bold cursor-pointer ${
              activeTab === 'terrain'
                ? 'bg-amber-500 border-amber-300 text-black'
                : 'bg-[#160d0b] text-slate-300 hover:bg-[#241512] border-[#49302b]'
            }`}
          >
            <PixelIcon name="compass" className="w-3.5 h-3.5" />
            <span>Jezero Map</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('radiation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 font-mono-hud text-xs font-bold cursor-pointer ${
              activeTab === 'radiation'
                ? 'bg-amber-500 border-amber-300 text-black'
                : 'bg-[#160d0b] text-slate-300 hover:bg-[#241512] border-[#49302b]'
            }`}
          >
            <PixelIcon name="sun" className="w-3.5 h-3.5" />
            <span>Solar &amp; Rays</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 font-mono-hud text-xs font-bold cursor-pointer ${
              activeTab === 'health'
                ? 'bg-amber-500 border-amber-300 text-black'
                : 'bg-[#160d0b] text-slate-300 hover:bg-[#241512] border-[#49302b]'
            }`}
          >
            <PixelIcon name="shieldCheck" className="w-3.5 h-3.5" />
            <span>Crew Health</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 font-mono-hud text-xs font-bold cursor-pointer ${
              activeTab === 'glossary'
                ? 'bg-amber-500 border-amber-300 text-black'
                : 'bg-[#160d0b] text-slate-300 hover:bg-[#241512] border-[#49302b]'
            }`}
          >
            <PixelIcon name="help" className="w-3.5 h-3.5" />
            <span>Mars Glossary ({SCIENCE_GLOSSARY.length})</span>
          </button>
        </div>

        {activeTab === 'facts' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-80 border-b-2 md:border-b-0 md:border-r-2 border-[#49302b] p-3 sm:p-4 overflow-y-auto flex flex-col gap-2 shrink-0 bg-[#0d0807]">
              <div className="text-[10px] font-mono-hud font-bold text-slate-500 uppercase tracking-widest px-2 py-1">
                DISCOVERIES ({unlockedFactIds.length} / {NASA_FACTS.length})
              </div>

              {NASA_FACTS.map((fact) => {
                const isUnlocked = unlockedFactIds.includes(fact.id);
                const isSelected = selectedFact.id === fact.id;

                return (
                  <button
                    key={fact.id}
                    onClick={() => setSelectedFact(fact)}
                    className={`w-full text-left p-3 font-mono-hud flex flex-col gap-1 cursor-pointer border-2 ${
                      isSelected
                        ? 'bg-[#2a1b0d] border-amber-500 shadow-[3px_3px_0_#020302]'
                        : 'bg-[#140c0a] border-[#49302b] hover:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                        {fact.missionId === 'mission_3'
                          ? 'MISSION 3 // '
                          : fact.missionId === 'mission_2'
                          ? 'MISSION 2 // '
                          : 'MISSION 1 // '}
                        {fact.category}
                      </span>
                      {isUnlocked && (
                        <span className="flex items-center gap-1 text-[9px] text-emerald-400">
                          <PixelIcon name="shieldCheck" className="w-3 h-3" />
                          <span>FOUND</span>
                        </span>
                      )}
                    </div>
                    <div className="font-title text-xs font-bold text-slate-100 line-clamp-1">
                      {fact.title}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-amber-950 border border-amber-500 text-amber-400 text-[10px] font-mono-hud font-bold uppercase">
                    {selectedFact.category}
                  </span>
                  <span className="text-xs font-mono-hud text-slate-400">
                    {selectedFact.subtitle}
                  </span>
                </div>
                <h3 className="font-title text-lg sm:text-xl font-bold text-white">
                  {selectedFact.title}
                </h3>
              </div>

              <div className="border-3 border-[#49302b] bg-black">
                <img
                  src={selectedFact.imageSrc}
                  alt={selectedFact.title}
                  style={{ imageRendering: 'auto' }}
                  className="w-full h-56 sm:h-64 object-cover object-center"
                />
                <div className="p-2.5 bg-[#0a0605] text-[11px] font-mono-hud text-slate-400 border-t-2 border-[#49302b]">
                  {selectedFact.imageCaption}
                </div>
              </div>

              <div className="p-4 bg-[#180f0c] border-2 border-[#49302b]">
                <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-sky-400 mb-2">
                  <PixelIcon name="sparkles" className="w-3.5 h-3.5" />
                  <span>SCIENCE REPORT:</span>
                </div>
                <p className="font-mono-hud text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedFact.nasaFact}
                </p>

                {selectedFact.olderKidsNote && (
                  <p className="mt-3 pt-3 border-t-2 border-[#49302b] font-mono-hud text-xs text-slate-300 leading-relaxed">
                    {selectedFact.olderKidsNote}
                  </p>
                )}
              </div>

              <div className="p-4 bg-amber-950/40 border-2 border-amber-600/70">
                <div className="text-xs font-mono-hud font-bold text-amber-400 mb-1">
                  MISSION NOTE:
                </div>
                <p className="font-mono-hud text-xs text-amber-200/90 leading-relaxed">
                  {selectedFact.gameContext}
                </p>
                {selectedFact.classroomPrompt && (
                  <p className="mt-2.5 pt-2.5 border-t border-amber-700/50 font-mono-hud text-xs text-emerald-200 leading-relaxed">
                    <span className="font-bold text-emerald-400">THINK &amp; DISCUSS: </span>
                    {selectedFact.classroomPrompt}
                  </p>
                )}
                <div className="mt-2.5 pt-2 border-t border-amber-700/50 font-mono-hud text-[11px] text-slate-300">
                  <span className="font-bold text-amber-300">DATA SOURCE: </span>
                  {selectedFact.sourceName} (
                  {selectedFact.datasetType === 'REAL_NASA_OBSERVATION'
                    ? 'Curated NASA Mission Data'
                    : selectedFact.datasetType === 'DERIVED_SCIENTIFIC_DATA'
                    ? 'Derived NASA Engineering Data'
                    : 'Mission Scenario'}
                  )
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terrain' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-title text-base sm:text-lg font-bold text-white uppercase">
                  {trekData.siteName}
                </h3>
                <p className="font-mono-hud text-xs text-slate-400 mt-0.5">
                  Real orbital imagery &amp; elevation relief of our Mars landing crater.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTrekLayer('hirise')}
                  className={`px-3 py-1.5 border-2 font-mono-hud text-xs font-bold cursor-pointer ${
                    trekLayer === 'hirise'
                      ? 'bg-cyan-500 border-cyan-300 text-black'
                      : 'bg-[#160d0b] border-[#49302b] text-slate-300 hover:bg-[#241512]'
                  }`}
                >
                  Orbital Photo (25cm)
                </button>
                <button
                  type="button"
                  onClick={() => setTrekLayer('mola')}
                  className={`px-3 py-1.5 border-2 font-mono-hud text-xs font-bold cursor-pointer ${
                    trekLayer === 'mola'
                      ? 'bg-cyan-500 border-cyan-300 text-black'
                      : 'bg-[#160d0b] border-[#49302b] text-slate-300 hover:bg-[#241512]'
                  }`}
                >
                  Elevation Color Map
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 border-3 border-[#49302b] bg-black overflow-hidden">
                {trekLayer === 'hirise' && !trekTileFallback ? (
                  <div className="grid grid-cols-2 w-full aspect-square max-h-[340px] bg-black">
                    {trekData.hiriseTiles.map((tileUrl, idx) => (
                      <img
                        key={tileUrl}
                        src={tileUrl}
                        alt={`Jezero Crater Orbital Quadrant ${idx + 1}`}
                        style={{ imageRendering: 'auto' }}
                        className="w-full h-full object-cover"
                        onError={() => setTrekTileFallback(true)}
                      />
                    ))}
                  </div>
                ) : (
                  <img
                    src={trekLayer === 'mola' && !trekTileFallback ? trekData.molaTileUrl : trekData.fallbackImage}
                    alt={trekLayer === 'mola' ? 'Mars Elevation Map' : 'Jezero Crater'}
                    style={{ imageRendering: 'auto' }}
                    className="w-full h-72 sm:h-80 object-cover object-center"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = trekData.fallbackImage;
                    }}
                  />
                )}
                <div className="p-2.5 bg-[#0a0605] border-t-2 border-[#49302b] font-mono-hud text-[11px] text-slate-400">
                  {trekLayer === 'hirise'
                    ? 'NASA Mars Trek HiRISE Mosaic showing Jezero Crater floor, wind ridges, and ancient delta mud.'
                    : 'NASA Mars Orbiter Laser Altimeter (MOLA) elevation map—blue shows deep ancient lake basins!'}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-[#180f0c] border-2 border-[#49302b]">
                  <div className="text-[10px] font-mono-hud font-bold text-amber-400 uppercase">
                    LANDING COORDINATES
                  </div>
                  <div className="font-title text-sm font-bold text-white mt-1">
                    {trekData.coordinatesLabel}
                  </div>
                </div>

                <div className="p-3.5 bg-[#180f0c] border-2 border-[#49302b]">
                  <div className="text-[10px] font-mono-hud font-bold text-cyan-400 uppercase">
                    CRATER FLOOR DEPTH
                  </div>
                  <div className="font-title text-sm font-bold text-cyan-300 mt-1">
                    {trekData.elevationMeters.toLocaleString()} meters
                  </div>
                  <p className="font-mono-hud text-xs text-slate-300 mt-2 leading-relaxed">
                    {trekData.elevationNote}
                  </p>
                </div>

                <div className="p-3.5 bg-[#180f0c] border-2 border-[#49302b]">
                  <div className="text-[10px] font-mono-hud font-bold text-emerald-400 uppercase">
                    CRATER WIDTH
                  </div>
                  <div className="font-title text-sm font-bold text-emerald-300 mt-1">
                    {trekData.craterDiameterKm} km across
                  </div>
                  <p className="font-mono-hud text-xs text-slate-300 mt-2 leading-relaxed">
                    Big enough to hold an entire ancient lake fed by the Neretva river valley!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'radiation' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
            <div className="p-4 bg-[#180f0c] border-2 border-amber-500/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 font-mono-hud text-xs font-bold text-amber-400 uppercase">
                  <PixelIcon name="sun" className="w-4 h-4" />
                  <span>NASA SOLAR STORM WATCH</span>
                </div>
                <span
                  className={`px-2 py-0.5 border text-[10px] font-mono-hud font-bold ${
                    spaceWeather?.severity === 'HIGH'
                      ? 'bg-red-950 border-red-500 text-red-300'
                      : spaceWeather?.severity === 'MODERATE'
                      ? 'bg-amber-950 border-amber-500 text-amber-300'
                      : 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  }`}
                >
                  {spaceWeather?.severity ?? 'MODERATE'} SOLAR ACTIVITY
                </span>
              </div>

              <h3 className="font-title text-base font-bold text-white">
                {spaceWeather?.stormTitle ?? 'Tracking Solar Flares & Particle Storms'}
              </h3>
              <p className="font-mono-hud text-xs text-slate-200 mt-1.5 leading-relaxed">
                {spaceWeather?.summary ??
                  'Satellites watch the Sun for fast bursts of solar particles. When a storm hits, astronauts take shelter underground or inside thick ship walls!'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                <div className="p-2.5 bg-[#0c0706] border border-[#49302b]">
                  <div className="text-[10px] font-mono-hud text-slate-400">LATEST WATCH</div>
                  <div className="font-mono-hud text-xs font-bold text-amber-300 mt-0.5">
                    {spaceWeather?.flareOrClass ?? 'Solar Watch'}
                  </div>
                </div>
                <div className="p-2.5 bg-[#0c0706] border border-[#49302b]">
                  <div className="text-[10px] font-mono-hud text-slate-400">SOLAR CLOUD SPEED</div>
                  <div className="font-mono-hud text-xs font-bold text-sky-300 mt-0.5">
                    {spaceWeather?.cmeSpeedKmS ?? 950} km/s
                  </div>
                </div>
                <div className="p-2.5 bg-[#0c0706] border border-[#49302b]">
                  <div className="text-[10px] font-mono-hud text-slate-400">LAST RECORDED</div>
                  <div className="font-mono-hud text-xs font-bold text-emerald-300 mt-0.5">
                    {spaceWeather?.eventDate ?? 'Recent'}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#49302b] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-hud">
                <span className={spaceWeather?.isLive ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                  Source: {spaceWeather?.dataSourceNote ?? 'Curated NASA DONKI & MSL RAD archive snapshot (offline fallback)'}
                </span>
                <span className="text-amber-300">
                  Surface Est: {spaceWeather?.solarRadiationMsvDay ?? 0.64} mSv/day
                </span>
              </div>
            </div>

            <div>
              <div className="font-title text-sm font-bold text-white uppercase mb-2">
                Real Space Radiation Shield Meter (mSv / day)
              </div>
              <p className="font-mono-hud text-xs text-slate-400 mb-1.5">
                Compare real measurements from Space Station dosimeters and Mars rovers—notice why thick cave stone is our best shelter!
              </p>
              <p className="font-mono-hud text-[11px] text-sky-300/90 mb-3">
                Data Note: {radLabNote}
              </p>

              <div className="flex flex-col gap-2.5">
                {radLabEntries.map((entry) => {
                  const pct = Math.min(100, Math.max(4, (entry.doseMsvPerDay / 3.8) * 100));
                  const barColor =
                    entry.doseMsvPerDay <= 0.05
                      ? 'bg-emerald-400'
                      : entry.doseMsvPerDay <= 0.7
                      ? 'bg-sky-400'
                      : 'bg-red-500';

                  return (
                    <div
                      key={entry.environment}
                      className="p-3 bg-[#160d0b] border-2 border-[#49302b]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div>
                          <span className="font-title text-xs font-bold text-white">
                            {entry.environment}
                          </span>
                          <span className="ml-2 font-mono-hud text-[10px] text-slate-400">
                            ({entry.instrument})
                          </span>
                        </div>
                        <span className="font-mono-hud text-xs font-bold text-amber-300">
                          {entry.doseMsvPerDay.toFixed(2)} mSv/day
                        </span>
                      </div>

                      <div className="w-full h-3 bg-[#0a0605] border border-[#49302b] p-0.5 mb-1.5">
                        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>

                      <p className="font-mono-hud text-[11px] text-slate-300">{entry.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t-2 border-[#49302b]">
              <div className="font-title text-xs sm:text-sm font-bold text-amber-300 uppercase mb-2">
                NASA Open Datasets Used in This Simulation
              </div>
              <div className="flex flex-col gap-2">
                {NASA_DATA_PROVENANCE.map((src) => (
                  <div
                    key={src.id}
                    className="p-3 bg-[#140c0a] border border-[#49302b] font-mono-hud text-[11px] space-y-1"
                  >
                    <div className="font-bold text-white">
                      {src.datasetName}{' '}
                      <span className="text-sky-300 font-normal">({src.instrument})</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-amber-300 font-bold">Real Values: </span>
                      {src.realValuesUsed}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-emerald-300 font-bold">In-Game Effect: </span>
                      {src.howGameUsesIt}
                    </div>
                    <div className="text-[10px] text-slate-400">{src.disclosure}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">
            <div>
              <h3 className="font-title text-base sm:text-lg font-bold text-white uppercase">
                Astronaut Body &amp; Health Lab
              </h3>
              <p className="font-mono-hud text-xs text-slate-400 mt-1">
                Pick a body topic to explore real NASA space biology studies and see how crews stay healthy flying home from Mars!
              </p>
              <p className="font-mono-hud text-[11px] text-sky-300/90 mt-1">
                Data Note: {healthSourceNote}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {HEALTH_TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setHealthTopic(t.id)}
                  className={`p-3 text-left border-2 cursor-pointer ${
                    healthTopic === t.id
                      ? 'bg-[#2a1b0d] border-amber-500 shadow-[3px_3px_0_#020302]'
                      : 'bg-[#140c0a] border-[#49302b] hover:border-amber-700'
                  }`}
                >
                  <div className="text-[9px] font-mono-hud font-bold text-amber-400 uppercase">
                    {t.badge}
                  </div>
                  <div className="font-title text-xs font-bold text-white mt-1">
                    {t.label}
                  </div>
                </button>
              ))}
            </div>

            {loadingHealth ? (
              <div className="p-6 bg-[#160d0b] border-2 border-[#49302b] text-center font-mono-hud text-xs text-amber-300">
                Checking NASA Space Biology Studies...
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {healthStudies.map((study) => (
                  <div
                    key={study.id}
                    className="p-4 bg-[#180f0c] border-2 border-[#49302b] flex flex-col gap-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2 py-0.5 bg-sky-950 border border-sky-500 text-sky-300 text-[10px] font-mono-hud font-bold uppercase">
                        STUDY {study.id}
                      </span>
                      <span className="font-mono-hud text-[10px] text-slate-400 uppercase">
                        {study.organism}
                      </span>
                    </div>

                    <div className="font-title text-xs sm:text-sm font-bold text-white">
                      {study.title}
                    </div>

                    <p className="font-mono-hud text-xs text-slate-200 leading-relaxed">
                      {study.kidSummary}
                    </p>

                    <div className="p-2.5 bg-emerald-950/35 border border-emerald-600/70 font-mono-hud text-xs text-emerald-200">
                      <span className="font-bold text-emerald-400">CREW HABIT: </span>
                      {study.astronautTip}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'glossary' && (
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCIENCE_GLOSSARY.map((entry) => (
              <div
                key={entry.term}
                className="p-4 bg-[#180f0c] border-2 border-[#49302b] flex flex-col gap-2"
              >
                <div className="font-title text-sm font-bold text-amber-300">
                  {entry.term}
                </div>
                <p className="font-mono-hud text-xs text-white leading-relaxed">
                  {entry.simpleMeaning}
                </p>
                <p className="font-mono-hud text-[11px] text-sky-300/90 pt-2 border-t-2 border-[#49302b] leading-relaxed">
                  {entry.scienceDetail}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
