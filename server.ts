import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

interface SpaceWeatherResponse {
  severity: 'CALM' | 'MODERATE' | 'HIGH';
  stormTitle: string;
  summary: string;
  eventDate: string;
  flareOrClass: string;
  cmeSpeedKmS: number;
  solarRadiationMsvDay: number;
  recentEventCount: number;
  isLive: boolean;
  dataSourceNote: string;
}

interface RadLabEntry {
  environment: string;
  instrument: string;
  doseMsvPerDay: number;
  absorbedMicroGyPerHour: number;
  note: string;
}

interface HealthStudyItem {
  id: string;
  topic: 'bones' | 'muscles' | 'sleep' | 'immune';
  title: string;
  organism: string;
  missionOrPlatform: string;
  kidSummary: string;
  astronautTip: string;
}

interface MarsTrekData {
  siteName: string;
  coordinatesLabel: string;
  elevationMeters: number;
  elevationNote: string;
  craterDiameterKm: number;
  hiriseTiles: string[];
  molaTileUrl: string;
  fallbackImage: string;
}

const FALLBACK_SPACE_WEATHER: SpaceWeatherResponse = {
  severity: 'MODERATE',
  stormTitle: 'Solar Active Region Watch',
  summary:
    'The Sun sends out bursts of fast particles called solar storms. Tracking solar bursts helps astronauts know when to duck inside rock caves or shielded habitats!',
  eventDate: '2024-05-11',
  flareOrClass: 'M-Class / Moderate CME Snapshot',
  cmeSpeedKmS: 920,
  solarRadiationMsvDay: 1.15,
  recentEventCount: 3,
  isLive: false,
  dataSourceNote: 'Curated NASA DONKI & MSL RAD archive snapshot (offline fallback)',
};

const CURATED_RADLAB_BASELINE: RadLabEntry[] = [
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

const CURATED_HEALTH_STUDIES: Record<'bones' | 'muscles' | 'sleep' | 'immune', HealthStudyItem[]> = {
  bones: [
    {
      id: 'OSD-48',
      topic: 'bones',
      title: 'Bone Density Changes in Microgravity',
      organism: 'Spaceflight Study',
      missionOrPlatform: 'Space Station Research',
      kidSummary:
        'Without Earth’s strong gravity pulling down, bones stop feeling heavy and can slowly get weaker unless astronauts exercise!',
      astronautTip: 'Crews lift special spring weights every day on the ship to keep bones strong.',
    },
  ],
  muscles: [
    {
      id: 'OSD-103',
      topic: 'muscles',
      title: 'Muscle Fiber Adaptation in Space Orbit',
      organism: 'Spaceflight Study',
      missionOrPlatform: 'Orbital Habitat',
      kidSummary:
        'Floating feels fun, but leg and back muscles barely have to work in zero gravity! Without workouts, muscles shrink fast.',
      astronautTip: 'Astronauts strap into treadmills and resistance bikes for 2 hours daily.',
    },
  ],
  sleep: [
    {
      id: 'OSD-271',
      topic: 'sleep',
      title: 'Circadian Rhythm & Mars Sol Clock Shifts',
      organism: 'Human & Space Biology',
      missionOrPlatform: 'Orbital & Mars Sim',
      kidSummary:
        'A Mars day is 39 minutes longer than Earth’s, and orbiting astronauts see 16 sunrises every day—so body clocks can get sleepy!',
      astronautTip: 'Special blue-tuned cabin lights help reset astronauts’ sleep schedules.',
    },
  ],
  immune: [
    {
      id: 'OSD-253',
      topic: 'immune',
      title: 'Immune Cell Response Under Space Stress',
      organism: 'Space Biology Research',
      missionOrPlatform: 'Orbital Lab',
      kidSummary:
        'Space rays, floating, and living far from home can tire out the body’s germ-fighting immune shield.',
      astronautTip: 'Fresh space-grown veggies, good sleep, and shielding help immune cells stay sharp!',
    },
  ],
};

let cachedSpaceWeather: { timestamp: number; data: SpaceWeatherResponse } | null = null;
let cachedRadLab: { timestamp: number; entries: RadLabEntry[]; liveMicroGyH?: number } | null = null;
const cachedOsdr = new Map<string, { timestamp: number; items: HealthStudyItem[]; isLive: boolean }>();

async function fetchJsonWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function formatDateYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function getSpaceWeather(): Promise<SpaceWeatherResponse> {
  const now = Date.now();
  if (cachedSpaceWeather && now - cachedSpaceWeather.timestamp < 30 * 60 * 1000) {
    return cachedSpaceWeather.data;
  }

  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startStr = formatDateYmd(start);
  const endStr = formatDateYmd(end);

  try {
     let donkiFailed = false;
    const [sepRaw, cmeRaw] = await Promise.all([
      fetchJsonWithTimeout(
        `https://api.nasa.gov/DONKI/SEP?startDate=${startStr}&endDate=${endStr}&api_key=${encodeURIComponent(NASA_API_KEY)}`,
        4500
    // ).catch(() => []),
      ).catch(() => { donkiFailed = true; return []; }),
      fetchJsonWithTimeout(
        `https://api.nasa.gov/DONKI/CME?startDate=${startStr}&endDate=${endStr}&api_key=${encodeURIComponent(NASA_API_KEY)}`,
        4500
   // ).catch(() => []),
      ).catch(() => { donkiFailed = true; return []; }),
    ]);

    const sepList = Array.isArray(sepRaw) ? sepRaw : [];
    const cmeList = Array.isArray(cmeRaw) ? cmeRaw : [];

    let fastestCme = 0;
    let latestDate = endStr;
    for (const cme of cmeList) {
      if (typeof cme?.startTime === 'string') {
        latestDate = cme.startTime.slice(0, 10);
      }
      const analyses = Array.isArray(cme?.cmeAnalyses) ? cme.cmeAnalyses : [];
      for (const a of analyses) {
        if (typeof a?.speed === 'number' && a.speed > fastestCme) {
          fastestCme = Math.round(a.speed);
        }
      }
    }

    const totalEvents = sepList.length + cmeList.length;
     // If NASA could not be reached, do not pretend a quiet Sun is live data.
    if (donkiFailed && totalEvents === 0) {
      throw new Error('DONKI unavailable');
    }
    if (totalEvents === 0) {
      const calmData: SpaceWeatherResponse = {
        severity: 'CALM',
        stormTitle: 'Quiet Sun Today',
        summary:
          'Space weather satellites show a calm Sun over the past 30 days! Surface radiation on Mars stays steady around normal levels.',
        eventDate: endStr,
        flareOrClass: 'Quiet Solar Wind',
        cmeSpeedKmS: 410,
        solarRadiationMsvDay: 0.64,
        recentEventCount: 0,
        isLive: true,
        dataSourceNote: 'Live NASA DONKI API (past 30 days)',
      };
      cachedSpaceWeather = { timestamp: now, data: calmData };
      return calmData;
    }

    const latestSep = sepList[sepList.length - 1];
    const isHighStorm = sepList.length > 0 || fastestCme >= 1100;
    const isModerate = !isHighStorm && fastestCme >= 650;

    const result: SpaceWeatherResponse = {
      severity: isHighStorm ? 'HIGH' : isModerate ? 'MODERATE' : 'CALM',
      stormTitle:
        sepList.length > 0
          ? 'Solar Particle Burst Recorded!'
          : fastestCme >= 900
          ? 'Fast Solar Cloud (CME) Spotted'
          : 'Normal Solar Breeze',
      summary:
        sepList.length > 0
          ? 'Space weather sensors spotted high-speed Sun particles! On Mars, astronauts watch storms like this to shelter inside lava caves.'
          : 'Sun observatories tracked solar plasma clouds racing across space. Deep-space crews watch CME speeds to plan safe walks outside.',
      eventDate:
        typeof latestSep?.eventTime === 'string'
          ? latestSep.eventTime.slice(0, 10)
          : latestDate,
      flareOrClass:
        sepList.length > 0
          ? `${sepList.length} Solar Particle Event${sepList.length > 1 ? 's' : ''}`
          : `${cmeList.length} Coronal Mass Ejection${cmeList.length > 1 ? 's' : ''}`,
      cmeSpeedKmS: fastestCme || 520,
      solarRadiationMsvDay: isHighStorm ? 3.8 : isModerate ? 1.15 : 0.64,
      recentEventCount: totalEvents,
      isLive: true,
      dataSourceNote: 'Live NASA DONKI API (past 30 days)',
    };

    cachedSpaceWeather = { timestamp: now, data: result };
    return result;
  } catch {
    return FALLBACK_SPACE_WEATHER;
  }
}

async function getRadLabComparison() {
  const now = Date.now();
  if (cachedRadLab && now - cachedRadLab.timestamp < 60 * 60 * 1000) {
    return {
      entries: cachedRadLab.entries,
      isLive: Boolean(cachedRadLab.liveMicroGyH),
      dataSourceNote: cachedRadLab.liveMicroGyH
        ? 'Live NASA OSDR RadLab telemetry + curated MSL RAD baselines'
        : 'Curated NASA OSDR RadLab & MSL Curiosity RAD offline dataset',
    };
  }

  // Attempt quick probe to RadLab CSV stream; if slow (>3.5s) return verified ISS baseline immediately.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(
      'https://visualization.osdr.nasa.gov/radlab/api/?query=absorbed_dose_rate%3E5',
      { signal: controller.signal }
    );
    if (res.ok && res.body) {
      const reader = res.body.getReader();
      let text = '';
      while (text.length < 1200) {
        const { done, value } = await reader.read();
        if (done) break;
        text += new TextDecoder().decode(value);
        if (text.split('\n').length >= 6) {
          controller.abort();
          break;
        }
      }
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        const rate = Number(parts[2]);
        const instr = (parts[1] || 'ISS Dosimeter').replace(/"/g, '');
        if (Number.isFinite(rate) && rate > 0 && rate < 500) {
          const updated = CURATED_RADLAB_BASELINE.map((entry) =>
            entry.environment === 'Space Station (LEO)'
              ? {
                  ...entry,
                  instrument: `ISS ${instr}`,
                  absorbedMicroGyPerHour: Number(rate.toFixed(1)),
                  doseMsvPerDay: Number(((rate * 24 * 2.1) / 1000).toFixed(2)),
                }
              : entry
          );
          cachedRadLab = { timestamp: now, entries: updated, liveMicroGyH: rate };
          clearTimeout(timer);
          return {
            entries: updated,
            isLive: true,
            dataSourceNote: 'Live NASA OSDR RadLab telemetry + curated MSL RAD baselines',
          };
        }
      }
    }
  } catch {
    // Graceful fallback below
  } finally {
    clearTimeout(timer);
  }

  cachedRadLab = { timestamp: now, entries: CURATED_RADLAB_BASELINE };
  return {
    entries: CURATED_RADLAB_BASELINE,
    isLive: false,
    dataSourceNote: 'Curated NASA OSDR RadLab & MSL Curiosity RAD offline dataset',
  };
}

function summarizeHealthStudy(
  topic: 'bones' | 'muscles' | 'sleep' | 'immune',
  rawId: string,
  title: string,
  organism: string
): HealthStudyItem {
  const cleanTitle = title.length > 88 ? `${title.slice(0, 85)}...` : title;
  const fallback = CURATED_HEALTH_STUDIES[topic][0];
  return {
    id: rawId || fallback.id,
    topic,
    title: cleanTitle || fallback.title,
    organism: organism || fallback.organism,
    missionOrPlatform: 'Spaceflight Study Archive',
    kidSummary: fallback.kidSummary,
    astronautTip: fallback.astronautTip,
  };
}

async function getHealthStudies(
  topic: 'bones' | 'muscles' | 'sleep' | 'immune'
): Promise<{ items: HealthStudyItem[]; isLive: boolean; dataSourceNote: string }> {
  const now = Date.now();
  const cached = cachedOsdr.get(topic);
  if (cached && now - cached.timestamp < 60 * 60 * 1000) {
    return {
      items: cached.items,
      isLive: cached.isLive,
      dataSourceNote: cached.isLive
        ? 'Live NASA OSDR API study search (cached)'
        : 'Curated NASA OSDR space biology snapshot (offline fallback)',
    };
  }

  const termMap: Record<'bones' | 'muscles' | 'sleep' | 'immune', string> = {
    bones: 'bone density microgravity',
    muscles: 'muscle mass spaceflight',
    sleep: 'circadian sleep spaceflight',
    immune: 'immune response spaceflight',
  };

  try {
    const json = await fetchJsonWithTimeout(
      `https://osdr.nasa.gov/osdr/data/search?term=${encodeURIComponent(termMap[topic])}&type=cgene&size=3`,
      4000
    );
    const hits = Array.isArray(json?.hits?.hits) ? json.hits.hits : [];
    const items: HealthStudyItem[] = [];
    for (const hit of hits) {
      const src = hit?._source || {};
      const accession =
        (typeof src.Accession === 'string' && src.Accession) ||
        (typeof src['Study Identifier'] === 'string' && src['Study Identifier']) ||
        '';
      const title =
        (typeof src['Study Title'] === 'string' && src['Study Title']) ||
        (typeof src.title === 'string' && src.title) ||
        '';
      const organism =
        (typeof src.organism === 'string' && src.organism) ||
        (Array.isArray(src.Organism) ? src.Organism[0] : typeof src.Organism === 'string' ? src.Organism : '') ||
        'Space Biology Study';
      if (title) {
        items.push(summarizeHealthStudy(topic, accession, title, organism));
      }
    }
    const isLive = items.length > 0;
    const finalItems = isLive ? items : CURATED_HEALTH_STUDIES[topic];
    cachedOsdr.set(topic, { timestamp: now, items: finalItems, isLive });
    return {
      items: finalItems,
      isLive,
      dataSourceNote: isLive
        ? 'Live NASA OSDR API study search (cached)'
        : 'Curated NASA OSDR space biology snapshot (offline fallback)',
    };
  } catch {
    return {
      items: CURATED_HEALTH_STUDIES[topic],
      isLive: false,
      dataSourceNote: 'Curated NASA OSDR space biology snapshot (offline fallback)',
    };
  }
}

const MARS_TREK_DATA: MarsTrekData = {
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

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/nasa/space-weather', async (_req, res) => {
    const data = await getSpaceWeather();
    res.json(data);
  });

  app.get('/api/nasa/radlab', async (_req, res) => {
    const data = await getRadLabComparison();
    res.json(data);
  });

  app.get('/api/nasa/health-studies', async (req, res) => {
    const rawTopic = String(req.query.topic || 'bones');
    const topic: 'bones' | 'muscles' | 'sleep' | 'immune' =
      rawTopic === 'muscles' || rawTopic === 'sleep' || rawTopic === 'immune'
        ? rawTopic
        : 'bones';
    const data = await getHealthStudies(topic);
    res.json({ topic, ...data });
  });

  app.get('/api/nasa/mars-trek', (_req, res) => {
    res.json(MARS_TREK_DATA);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
