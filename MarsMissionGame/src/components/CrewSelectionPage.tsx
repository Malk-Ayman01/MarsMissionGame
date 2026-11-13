import CrewCard from './CrewCard';
import { crews, CrewMember } from '../data/CrewData';

interface CrewSelectionPageProps {
  onContinue: (crew: CrewMember) => void;
  onBack: () => void;
}

export default function CrewSelectionPage({ onContinue, onBack }: CrewSelectionPageProps) {
  return (
    <section className="crew-selection-page w-full h-full min-h-0 overflow-y-auto overflow-x-hidden">
      <header className="crew-selection-header">
        <div className="crew-selection-eyebrow">ARES-1 // YOUR RESCUE TEAM</div>

        <h1 className="crew-selection-title">PICK YOUR LEAD PARTNER</h1>

        <p className="crew-selection-subtitle">
          YOU ARE IN CHARGE OF KEEPING ALL 3 ASTRONAUTS ALIVE—CHOOSE WHOSE GEAR &amp; SKILLS YOU DEPLOY FIRST!
        </p>

        <div className="crew-selection-divider">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className={index % 3 === 2 ? 'wide' : ''} />
          ))}
        </div>
      </header>

      <div className="crew-grid">
        {crews.map((crew) => (
          <CrewCard key={crew.id} crew={crew} onSelect={onContinue} />
        ))}
      </div>

      <footer className="crew-selection-footer">
        <span>CREW MEMBERS: {crews.length}</span>
        <span>
          SYSTEM STATUS: <span className="crew-system-online">● ONLINE</span>
        </span>
      </footer>

      <button type="button" className="crew-selection-back" onClick={onBack}>
        &lt; BACK TO HOME
      </button>
    </section>
  );
}
