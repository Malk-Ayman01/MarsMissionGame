export interface SpaceWeatherData {
  severity: 'CALM' | 'MODERATE' | 'HIGH';
  stormTitle: string;
  summary: string;
  eventDate: string;
  flareOrClass: string;
  cmeSpeedKmS: number;
  solarRadiationMsvDay: number;
  recentEventCount: number;
  isLive?: boolean;
  dataSourceNote?: string;
}

export interface RadLabComparisonEntry {
  environment: string;
  instrument: string;
  doseMsvPerDay: number;
  absorbedMicroGyPerHour: number;
  note: string;
}

export type HealthTopic = 'bones' | 'muscles' | 'sleep' | 'immune';

export interface AstronautHealthStudy {
  id: string;
  topic: HealthTopic;
  title: string;
  organism: string;
  missionOrPlatform: string;
  kidSummary: string;
  astronautTip: string;
}

export interface MarsTrekTerrainData {
  siteName: string;
  coordinatesLabel: string;
  elevationMeters: number;
  elevationNote: string;
  craterDiameterKm: number;
  hiriseTiles: string[];
  molaTileUrl: string;
  fallbackImage: string;
}

export const DEFAULT_RADLAB_ENTRIES: RadLabComparisonEntry[] = [
  {
    environment: 'Earth Surface',
    instrument: 'Ground Baseline',
    doseMsvPerDay: 0.01,
    absorbedMicroGyPerHour: 0.3,
    note: 'Earth’s thick air and magnetic shield protect us almost completely.',
  },
  {
    environment: 'Mars Lava Cave',
    instrument: 'Subsurface Rock Shield',
    doseMsvPerDay: 0.03,
    absorbedMicroGyPerHour: 1.25,
    note: 'Thick volcanic stone roofs block ~95% of space rays underground!',
  },
  {
    environment: 'Space Station (LEO)',
    instrument: 'ISS DosTel2 / Liulin-5',
    doseMsvPerDay: 0.52,
    absorbedMicroGyPerHour: 10.2,
    note: 'Real space station dosimeters measure constant background rays in orbit.',
  },
  {
    environment: 'Mars Surface (Calm)',
    instrument: 'Curiosity RAD',
    doseMsvPerDay: 0.64,
    absorbedMicroGyPerHour: 11.1,
    note: 'Mars has thin air and no global magnet, so astronauts wear shielded suits.',
  },
  {
    environment: 'Mars Solar Storm',
    instrument: 'RAD Particle Surge',
    doseMsvPerDay: 3.8,
    absorbedMicroGyPerHour: 65.8,
    note: 'During big Sun storms, space rays jump ~6x higher—time to take cover!',
  },
];

export const DEFAULT_MARS_TREK: MarsTrekTerrainData = {
  siteName: 'Jezero Crater & Neretva Vallis',
  coordinatesLabel: '18.45° N, 77.45° E',
  elevationMeters: -2500,
  elevationNote:
    'The crater floor sits about 2,500 meters deep below average Mars ground—perfect for catching ancient river mud and clay!',
  craterDiameterKm: 45,
  hiriseTiles: [
    'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd/1.0.0/default/default028mm/9/202/731.png',
    'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd/1.0.0/default/default028mm/9/202/732.png',
    'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd/1.0.0/default/default028mm/9/203/731.png',
    'https://trek.nasa.gov/tiles/Mars/EQ/JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd/1.0.0/default/default028mm/9/203/732.png',
  ],
  molaTileUrl:
    'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/4/6/22.jpg',
  fallbackImage: '/assets/nasa/jezero_crater.jpg',
};

export async function fetchSpaceWeather(): Promise<SpaceWeatherData | null> {
  try {
    const res = await fetch('/api/nasa/space-weather');
    if (!res.ok) return null;
    return (await res.json()) as SpaceWeatherData;
  } catch {
    return null;
  }
}

export async function fetchRadLabEntries(): Promise<RadLabComparisonEntry[]> {
  const res = await fetchRadLabComparison();
  return res.entries;
}

export interface RadLabResponse {
  entries: RadLabComparisonEntry[];
  isLive: boolean;
  dataSourceNote: string;
}

export async function fetchRadLabComparison(): Promise<RadLabResponse> {
  try {
    const res = await fetch('/api/nasa/radlab');
    if (!res.ok) {
      return {
        entries: DEFAULT_RADLAB_ENTRIES,
        isLive: false,
        dataSourceNote: 'Curated NASA OSDR RadLab & MSL Curiosity RAD offline dataset',
      };
    }
    const data = await res.json();
    const entries =
      Array.isArray(data?.entries) && data.entries.length > 0
        ? (data.entries as RadLabComparisonEntry[])
        : DEFAULT_RADLAB_ENTRIES;
    return {
      entries,
      isLive: Boolean(data?.isLive),
      dataSourceNote:
        typeof data?.dataSourceNote === 'string'
          ? data.dataSourceNote
          : 'Curated NASA OSDR RadLab & MSL Curiosity RAD offline dataset',
    };
  } catch {
    return {
      entries: DEFAULT_RADLAB_ENTRIES,
      isLive: false,
      dataSourceNote: 'Curated NASA OSDR RadLab & MSL Curiosity RAD offline dataset',
    };
  }
}

export interface HealthStudiesResponse {
  items: AstronautHealthStudy[];
  isLive: boolean;
  dataSourceNote: string;
}

export async function fetchHealthStudies(topic: HealthTopic): Promise<AstronautHealthStudy[]> {
  const res = await fetchHealthStudiesWithMeta(topic);
  return res.items;
}

export async function fetchHealthStudiesWithMeta(topic: HealthTopic): Promise<HealthStudiesResponse> {
  try {
    const res = await fetch(`/api/nasa/health-studies?topic=${encodeURIComponent(topic)}`);
    if (!res.ok) {
      return {
        items: [],
        isLive: false,
        dataSourceNote: 'Curated NASA OSDR space biology snapshot (offline fallback)',
      };
    }
    const data = await res.json();
    return {
      items: Array.isArray(data?.items) ? (data.items as AstronautHealthStudy[]) : [],
      isLive: Boolean(data?.isLive),
      dataSourceNote:
        typeof data?.dataSourceNote === 'string'
          ? data.dataSourceNote
          : 'Curated NASA OSDR space biology snapshot (offline fallback)',
    };
  } catch {
    return {
      items: [],
      isLive: false,
      dataSourceNote: 'Curated NASA OSDR space biology snapshot (offline fallback)',
    };
  }
}

export async function fetchMarsTrekTerrain(): Promise<MarsTrekTerrainData> {
  try {
    const res = await fetch('/api/nasa/mars-trek');
    if (!res.ok) return DEFAULT_MARS_TREK;
    return (await res.json()) as MarsTrekTerrainData;
  } catch {
    return DEFAULT_MARS_TREK;
  }
}
