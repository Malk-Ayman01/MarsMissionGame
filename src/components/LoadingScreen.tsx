import { useEffect, useRef, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const loadingMessages = [
  'CONNECTING TO MARS...',
  'CHECKING SUIT AIR SYSTEMS...',
  'LOADING MARS ROVER MAP...',
  'PREPARING CREW PROFILES...',
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const duration = 2200;
    const startTime = Date.now();

    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(progressTimer);
        window.setTimeout(() => onCompleteRef.current(), 300);
      }
    }, 30);

    const messageTimer = window.setInterval(() => {
      setMessageIndex((current) =>
        current === loadingMessages.length - 1 ? 0 : current + 1
      );
    }, 600);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(messageTimer);
    };
  }, []);

  return (
    <main className="mars-loading-screen">
      <div className="loading-grid" />
      <div className="loading-vignette" />

      <div className="loading-content">
        <div className="loading-topline">
          <span>ARES-1 // MARS MISSION</span>
          <span className="loading-live">
            <i /> SYSTEM ONLINE
          </span>
        </div>

        <div className="loading-center">
          <div className="mars-emblem">
            <div className="mars-emblem-inner">
              <span>M</span>
            </div>
          </div>

          <p className="loading-eyebrow">MISSION CONTROL</p>
          <h1>
            MARS <span>MISSION</span>
          </h1>
          <p className="loading-subtitle">THE LOST SIGNAL</p>

          <div className="loading-divider">
            <span />
            <span>INITIALIZATION</span>
            <span />
          </div>

          <div className="loading-progress-info">
            <span>{loadingMessages[messageIndex]}</span>
            <span>{progress}%</span>
          </div>

          <div
            className="loading-progress-track"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Transition progress"
          >
            <div className="loading-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <p className="loading-footer-text">
            {progress < 100
              ? 'PLEASE WAIT — CONNECTING TO ARES-1'
              : 'CONNECTION ESTABLISHED'}
          </p>
        </div>

        <div className="loading-bottomline">
          <span>JEZERO CRATER · MARS</span>
          <span>YEAR 2038</span>
          <span>SECURE CONNECTION</span>
        </div>
      </div>
    </main>
  );
}
