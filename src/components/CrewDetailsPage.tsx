import React from 'react';
import { CrewMember } from '../data/CrewData';
import { PixelImage } from './PixelImage';

interface CrewDetailsPageProps {
  crew: CrewMember;
  onBack: () => void;
  onContinue: () => void;
}

interface CrewDossierProfile {
  dossierCode: string;
  storyTitle: string;
  story: string;
  stats: { label: string; value: number; color: string }[];
  missionSpecialty: string;
}

const CREW_PROFILES: Record<string, CrewDossierProfile> = {
  '01-BIO': {
    dossierCode: 'DOSSIER // 01-BIO // HEDEYA',
    storyTitle: 'A MOTHER WAITING ON EARTH',
    missionSpecialty: 'STRONGER SHIELDING & FASTER BASE AIR REFILLS (SLIGHTLY HEAVIER BATTERY GEAR)',
    story:
     "Hedeya is a mother first. Back home, her daughter Lina keeps a calendar on the fridge and crosses off every day her mum is away. Every night on Mars, Hedeya records a voice message for her, even though each one takes minutes to cross space.\n\nWith Hedeya on point, you refill Suit Air faster inside the green hydroponic ring and absorb less space-ray wear—while she teaches you why every electrical switch and life-support pump matters.",

    stats: [
      { label: 'LIFE SUPPORT & SUITS', value: 19, color: '#2EC4B6' },
      { label: 'ROVER REPAIRS', value: 18, color: '#38BDF8' },
      { label: 'MARS SCIENCE KNOWLEDGE', value: 17, color: '#F59E0B' },
    ],
  },
  '02-ENG': {
    dossierCode: 'DOSSIER // 02-ENG // SAMANTHA',
    storyTitle:'A DAUGHTER WITH A TELESCOPE',
    missionSpecialty: 'SAVES 15% ROVER BATTERY & EARNS +10 BONUS SCIENCE (LIGHTER RAY RIG)',
    story:
     "Samantha learned the stars on her dad's rooftop, through his old telescope. He is still up there on every clear night, looking for the red dot of Mars and hoping she is safe.\n\nWith Samantha on point, your rover stretches battery power further and collects extra NASA science—so watch your Shielding carefully outside!",
    stats: [
      { label: 'PLANETARY GEOLOGY', value: 19, color: '#FF9F1C' },
      { label: 'RADAR & SENSORS', value: 18, color: '#38BDF8' },
      { label: 'ORBITAL RENDEZVOUS', value: 18, color: '#10B981' },
    ],
  },
  '03-CMD': {
    dossierCode: 'DOSSIER // 03-CMD // HAZALOOM',
    storyTitle:'A BROTHER WITH A SEAT AT THE TABLE',
    missionSpecialty: 'FASTER ROVER SPEED & SOFTER ROCK BUMPS (USES SLIGHTLY MORE SUIT AIR ON FOOT)',
    story:
     "Hazaloom has never missed a family dinner. Hazaloom's brother jhonny and his nephew xavier still set a place at the table every Friday, and they are saving that seat until the day Hazaloom walks back in.\n\nWith Hazaloom on point, you drive faster and take softer rock bumps—just remember to stay inside the rover or base so Suit Air stays high!",
    stats: [
      { label: 'ROVER STEERING & NAVIGATION', value: 19, color: '#FF4D4D' },
      { label: 'HAZARD RESPONSE', value: 18, color: '#F59E0B' },
      { label: 'TEAM LEADERSHIP', value: 20, color: '#10B981' },
    ],
  },
};

export default function CrewDetailsPage({ crew, onBack, onContinue }: CrewDetailsPageProps) {
  const profile = CREW_PROFILES[crew.id] ?? {
    dossierCode: `DOSSIER // ${crew.id} // ${crew.name.toUpperCase()}`,
    storyTitle: crew.role.toUpperCase(),
    missionSpecialty: 'MARS SURFACE EXPLORATION',
    story: crew.quote,
    stats: [
      { label: 'SCIENCE READINESS', value: 18, color: '#dc6547' },
      { label: 'SYSTEMS OPERATION', value: 18, color: '#38bdf8' },
      { label: 'MISSION FOCUS', value: 19, color: '#10b981' },
    ],
  };

  return (
    <main className="crew-details-page w-full h-full min-h-0 overflow-y-auto overflow-x-hidden">
      <div className="dossier-page-label">
        ARES-1 // ASTRONAUT FILE // {crew.name.toUpperCase()}
      </div>

      <div className="dossier-grid">
        <section className="dossier-card">
          <div className="dossier-id">{profile.dossierCode}</div>

          <div className="dossier-image">
            {crew.image ? (
              <PixelImage
                src={crew.image}
                alt={crew.name}
                pixelWidth={56}
                colorLevels={9}
                onHideOnError
              />
            ) : null}
            <div className="dossier-image-strip" />
          </div>

          <h1 className="dossier-name">{crew.name}</h1>
          <p className="dossier-role">{crew.role}</p>

          <div className="dossier-divider" />

          <div className="dossier-stats">
            {profile.stats.map((stat) => (
              <div key={stat.label}>
                <div className="dossier-stat-heading">
                  <span>{stat.label}</span>
                  <span>{Math.round((stat.value / 20) * 100)}%</span>
                </div>
                <div className="dossier-progress">
                  {Array.from({ length: 20 }, (_, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: i < stat.value ? stat.color : '#241512',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="dossier-monitoring">
            SPECIALTY: <span>{profile.missionSpecialty}</span>
          </div>
        </section>

        <section className="dossier-card dossier-story-card">
          <div className="dossier-archive-label">MISSION BRIEFING ARCHIVE // CREW BIO</div>

          <h2 className="dossier-story-title">{profile.storyTitle}</h2>

          <p className="dossier-story">{profile.story}</p>

          <div className="dossier-file-footer">
            <span>STATUS: CLEARED FOR MARS EVA</span>
            <span>TEAM: HAZALOOM · HEDEYA · SAMANTHA</span>
          </div>

          <div className="dossier-divider dossier-actions-divider" />

          <div className="dossier-section-label">READY TO LAUNCH?</div>

          <div className="dossier-actions">
            <button type="button" className="dossier-back-button" onClick={onBack}>
              &lt; PICK ANOTHER CREW
            </button>
            <button type="button" className="dossier-continue-button" onClick={onContinue}>
              CONTINUE TO MISSION CONTROL &gt;
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
