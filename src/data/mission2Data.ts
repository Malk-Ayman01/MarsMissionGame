import { RouteOption, EvidenceCard } from '../types/game';

export const MISSION_2_ROUTES: RouteOption[] = [
  {
    id: 'route_a',
    title: 'Route Alpha: Northern Delta Gorge',
    subtitle: 'Direct Traverse Across Ancient River Inflow Channel',
    distanceMeters: 640,
    estimatedMinutes: 5.2,
    terrainRisk: 'HIGH',
    estimatedBatteryCostPercent: 36,
    scientificValue: 'MODERATE — Traverses volcanic basalt boulder fields with risk of chassis damage.',
    terrainDescription:
      'Shortest geometric distance, but forces navigation through a narrow gorge littered with 1.5-meter basalt boulders and steep sandy banks.',
    tradeOffSummary:
      'Saves travel time, but rough terrain increases rolling resistance, draining significantly more rover battery and risking wheel suspension impacts.',
  },
  {
    id: 'route_b',
    title: 'Route Beta: Southern Delta Terrace',
    subtitle: 'Longer Traverse on Consolidated Fine Sedimentary Plains',
    distanceMeters: 1120,
    estimatedMinutes: 8.5,
    terrainRisk: 'LOW',
    estimatedBatteryCostPercent: 24,
    scientificValue: 'HIGH — Clear view of stratified delta layers with minimal mechanical hazard.',
    terrainDescription:
      'Longer route following the flat, consolidated clay-carbonate terrace deposited at the ancient lake mouth.',
    tradeOffSummary:
      'Takes 3 minutes longer, but flat terrain allows energy-efficient cruising and avoids suspension damage, leaving more battery reserves for science instruments.',
  },
  {
    id: 'route_c',
    title: 'Route Gamma: Alluvial Fan Traverse',
    subtitle: 'Moderate Traverse with Cross-Bedded Sandstone Outcrops',
    distanceMeters: 890,
    estimatedMinutes: 7.0,
    terrainRisk: 'MODERATE',
    estimatedBatteryCostPercent: 29,
    scientificValue: 'VERY HIGH — Direct access to delta scarp and candidate coring target.',
    terrainDescription:
      'Intermediate route winding along the base of the delta scarp, crossing moderate gravel ripples and small sand dunes.',
    tradeOffSummary:
      'A balanced compromise: acceptable energy consumption with direct proximity to prime geological evidence of past water flow.',
  },
];

export const MISSION_2_EVIDENCE: EvidenceCard[] = [
  {
    id: 'evidence_kodiak',
    title: 'Evidence A: Layered Delta Beds at Kodiak Butte',
    sol: 'Sol 76 (Mars 2020)',
    instrument: 'Mastcam-Z & SuperCam Remote Micro-Imager',
    imageSrc: '/assets/nasa/kodiak_layered_rock.jpg',
    observationSummary:
      'Distinct horizontal top-set beds transitioning into steeply dipping delta fore-set beds and flat bottom-set beds within an isolated sedimentary hill.',
    scientificInterpretation:
      'Geologists interpret this sedimentary architecture as classic deltaic deposition: a river carrying sediment into an open body of standing water (paleolake Jezero).',
    uncertaintyNotes:
      'Sedimentary layers confirm ancient flowing water, but orbital and surface images alone cannot prove whether organic chemistry or ancient microbial life existed here.',
    relevanceToWater: 'HIGH',
  },
  {
    id: 'evidence_rochette',
    title: 'Evidence B: Altered Basalt Core at "Rochette"',
    sol: 'Sol 194 (Mars 2020)',
    instrument: 'PIXL X-ray Fluorescence & WATSON Camera',
    imageSrc: '/assets/nasa/sample_core_tube.jpg',
    observationSummary:
      'Fine-grained igneous volcanic rock displaying secondary carbonate and sulfate salt mineral fills inside internal pores and microscopic fractures.',
    scientificInterpretation:
      'The host rock formed from volcanic magma, but groundwater or lake water later percolated through the rock pores, depositing aqueous carbonate minerals over millions of years.',
    uncertaintyNotes:
      'Aqueous alteration minerals prove prolonged contact with liquid water, but igneous basement rocks are less likely to preserve delicate organic microfossils than fine mudstones.',
    relevanceToWater: 'HIGH',
  },
  {
    id: 'evidence_ventifact',
    title: 'Evidence C: Fluted Surface Boulders ("Ventifacts")',
    sol: 'Sol 1184 (Mars 2020)',
    instrument: 'Front Hazcam / Left Navcam',
    imageSrc: '/assets/nasa/neretva_vallis.jpg',
    observationSummary:
      'Dark basalt boulders on the surface featuring smooth, aerodynamic grooves and polished facets aligned with prevailing winds.',
    scientificInterpretation:
      'These grooves are formed by aeolian (wind) saltation: fine airborne sand grains pelting and carving the rock surface over billions of years of hyper-arid desert conditions.',
    uncertaintyNotes:
      'Wind-sculpted ventifacts reflect modern and ancient atmospheric wind patterns, not flowing liquid water or lake environments.',
    relevanceToWater: 'INSUFFICIENT',
  },
];

export const NASA_MEDA_WEATHER_ARCHIVE = {
  station: 'NASA Mars Environmental Dynamics Analyzer (MEDA) on Perseverance',
  sol: 'Sol 240 (Archived NASA Planetary Data System Dataset)',
  location: 'Jezero Crater Floor (-18.44°N, 77.45°E)',
  pressurePa: 628,
  pressureEarthRatio: '0.62% of Earth sea-level atmospheric pressure',
  tempMinCelsius: -68,
  tempMaxCelsius: -19,
  dustOpticalDepthTau: 0.52,
  windSpeedMps: 7.4,
  uvRadiationWm2: 4.6,
  provenance: 'NASA Planetary Data System (PDS) & Centro de Astrobiología (CAB/CSIC-INTA)',
};
