import type { CrewMember } from '../data/CrewData';
import { PixelImage } from './PixelImage';

interface CrewCardProps {
  crew: CrewMember;
  onSelect: (crew: CrewMember) => void;
}

export default function CrewCard({ crew, onSelect }: CrewCardProps) {
  return (
    <article className="crew-card">

      {[
        { top: -2, left: -2 },
        { top: -2, right: -2 },
        { bottom: -2, left: -2 },
        { bottom: -2, right: -2 },
      ].map((corner, index) => (
        <span key={index} className="crew-card-corner" style={corner} />
      ))}

      <div className="crew-id">
        <span>PERSONNEL ID:</span>
        {crew.id}
      </div>

      <div className="crew-image-container">
        <div className="crew-image-grid" />

        {[
          { top: '12%', left: '15%' },
          { top: '22%', right: '18%' },
          { top: '40%', left: '9%' },
          { top: '16%', right: '35%' },
          { top: '55%', right: '10%' },
          { top: '32%', left: '80%' },
        ].map((star, index) => (
          <span key={index} className="crew-pixel-star" style={star} />
        ))}

        {crew.image ? (
          <PixelImage
            src={crew.image}
            alt={crew.name}
            pixelWidth={52}
            colorLevels={9}
            onHideOnError
            className="crew-character-image"
          />
        ) : (
          <div className="crew-image-fallback">CREW IMAGE UNAVAILABLE</div>
        )}

        <div className="crew-image-label">CREW_UNIT // {crew.id}</div>
        <div className="crew-image-bottom-strip" />
      </div>

      <h3 className="crew-name">{crew.name}</h3>

      <p className="crew-role">{crew.role}</p>

      <div className="crew-divider" />

      <p className="crew-quote">&ldquo;{crew.quote}&rdquo;</p>

      <button type="button" onClick={() => onSelect(crew)} className="crew-select-button">
        SELECT CREW MEMBER <span>&gt;</span>
      </button>

      <div className="crew-status">
        <span>UNIT STATUS</span>
        <span className="crew-ready">
          <i /> READY
        </span>
      </div>
    </article>
  );
}
