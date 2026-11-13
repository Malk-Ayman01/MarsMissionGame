import { useEffect, useState } from 'react';
import { PixelIcon } from './PixelIcon';

export default function RotateDevice() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth <= 900);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div className="rotate-device-overlay">
      <div className="rotate-device-content">
        <div className="rotate-icon">
          <PixelIcon name="phone" className="w-10 h-10 text-red-400" />
        </div>

        <p className="rotate-eyebrow">MARS MISSION // DISPLAY WARNING</p>
        <h1>ROTATE YOUR DEVICE</h1>
        <p className="rotate-description">
          THIS MISSION WORKS BEST IN LANDSCAPE MODE.
          <br />
          PLEASE TURN YOUR SCREEN SIDEWAYS TO PLAY!
        </p>

        <div className="rotate-status">
          <span className="rotate-status-dot" />
          WAITING FOR LANDSCAPE MODE...
        </div>
      </div>
    </div>
  );
}
