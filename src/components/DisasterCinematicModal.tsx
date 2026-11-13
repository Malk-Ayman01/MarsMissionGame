import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../audio/SoundManager';
import { CinematicEventType } from '../types/game';
import { PixelIcon } from './PixelIcon';

interface DisasterCinematicModalProps {
  eventType?: CinematicEventType;
  onComplete: () => void;
}

interface SubtitleCue {
  start: number;
  end: number;
  speaker: string;
  speakerColor: string;
  text: string;
}

interface EventConfig {
  badge: string;
  title: string;
  description: string;
  defaultPaths: string[];
  uploadPathHint: string;
  continueLabel: string;
  themeColor: 'amber' | 'red' | 'cyan' | 'emerald';
  cues: SubtitleCue[];
  autoPreviewDurationSec?: number;
}

/**
 * DEVELOPER VIDEO PLACEHOLDERS:
 * Drop .mp4 event videos into public/assets/cinematic/:
 *  - Mission 1 Big Event:       public/assets/cinematic/mission1_event.mp4
 *  - Mission 2 Big Event:       public/assets/cinematic/mission2_event.mp4
 *  - Mission 3 Big Event:       public/assets/cinematic/mission3_event.mp4
 *  - Mission 3 Return Home End: public/assets/cinematic/mission3_final_home.mp4
 */
const EVENT_CONFIGS: Record<CinematicEventType, EventConfig> = {
  mission_1_explosion: {
    badge: 'ARES-1 EMERGENCY // SUDDEN SHIP EVENT',
    title: 'Landing Site Emergency',
    description:
      'A sudden pressure blast just broke your return ship AND knocked out the ship radio! Earth does not know you are stranded—check the Emergency Report to start your rescue plan.',
    defaultPaths: [
      '/assets/cinematic/mission1_event.mp4',
      '/assets/cinematic/cutscene.mp4',
      '/assets/cinematic/scene_01.mp4',
      '/assets/cinematic/scene_02.mp4',
      '/assets/cinematic/scene_03.mp4',
      '/assets/cinematic/scene_04.mp4',
      '/assets/cinematic/scene_05.mp4',
    ],
    uploadPathHint: '',
    continueLabel: 'See Rescue Plan',
    themeColor: 'amber',
    cues: [
      { start: 0.4, end: 4.2, speaker: 'HAZALOOM', speakerColor: 'text-amber-400', text: "I still can't believe we're actually on Mars." },
      { start: 4.2, end: 8.0, speaker: 'SAMANTHA', speakerColor: 'text-purple-300', text: "Enjoy the view. Let's run our ship check so Earth clears the site." },
      { start: 8.2, end: 12.1, speaker: 'HEDEYA', speakerColor: 'text-sky-300', text: "Wait... I'm checking an abnormal pressure spike in the thruster tank." },
      { start: 12.1, end: 16.0, speaker: 'SAMANTHA', speakerColor: 'text-purple-300', text: 'What? That system was cleared before launch!' },
      { start: 16.2, end: 20.1, speaker: 'HAZALOOM', speakerColor: 'text-amber-400', text: 'WHAT WAS THAT?!' },
      { start: 20.1, end: 25.0, speaker: 'SAMANTHA', speakerColor: 'text-red-400', text: 'EMERGENCY! Hold on tight—something just blew!' },
      { start: 25.5, end: 29.0, speaker: 'HEDEYA', speakerColor: 'text-sky-300', text: 'Everyone... answer me. Is everyone okay?' },
      { start: 29.0, end: 32.5, speaker: 'SAMANTHA', speakerColor: 'text-purple-300', text: "We're safe, but the blast fried our return rocket AND our ship radio!" },
      { start: 32.5, end: 36.0, speaker: 'HAZALOOM', speakerColor: 'text-amber-400', text: "If our radio is dead, Earth doesn't even know we need help!" },
      { start: 36.5, end: 43.2, speaker: 'HEDEYA', speakerColor: 'text-emerald-300', text: 'A backup coupler is in the Orange Box outside—fix the Hill Tower so we can call Earth!' },
      { start: 43.2, end: 49.0, speaker: 'SAMANTHA', speakerColor: 'text-purple-300', text: "It's up to you now. Let's keep our crew alive and find a way home!" },
    ],
  },
  mission_2_marsquake: {
    badge: 'MISSION 2 EVENT // UNDERGROUND MARSQUAKE!',
    title: 'Lava Cave Tremor',
    description:
      'You sealed Mars Rock Tube #14! Suddenly, a Marsquake shakes the lava cave roof—race out to the blue exit before falling rocks trap you underground!',
    defaultPaths: ['/assets/cinematic/mission2_event.mp4'],
    uploadPathHint: '',
    continueLabel: 'Escape the Cave!',
    themeColor: 'cyan',
    cues: [
      { start: 0.4, end: 4.5, speaker: 'HEDEYA', speakerColor: 'text-sky-300', text: 'WHOA! The RIMFAX seismic sensors just spiked off the chart!' },
      { start: 4.5, end: 9.0, speaker: 'SAMANTHA', speakerColor: 'text-emerald-300', text: 'A Marsquake is shaking the lava cave roof! Watch out for falling dust!' },
      { start: 9.0, end: 14.0, speaker: 'HAZALOOM', speakerColor: 'text-amber-400', text: 'You saved Rock Tube #14! Now sprint back to the blue Cave Exit!' },
    ],
  },
  mission_3_launch_crisis: {
    badge: 'MISSION 3 EVENT // DUST CYCLONE & LIFTOFF!',
    title: 'Emergency Rocket Ignition',
    description:
      'Giant dust tornadoes sweep across the launchpad as you load Rock Tube #14 and lift off! Earth is too far away to joystick this flight—you steer the rocket yourself!',
    defaultPaths: ['/assets/cinematic/mission3_event.mp4'],
    uploadPathHint: '',
    continueLabel: 'Launch & Steer Rocket!',
    themeColor: 'red',
    cues: [
      { start: 0.4, end: 4.5, speaker: 'SAMANTHA', speakerColor: 'text-emerald-300', text: 'Dust tornadoes are closing in on the pad—there is no time to wait!' },
      { start: 4.5, end: 9.0, speaker: 'HEDEYA', speakerColor: 'text-sky-300', text: 'Rock Tube #14 and all 3 crew seats are locked! Earth cannot steer from 200M km away!' },
      { start: 9.0, end: 14.0, speaker: 'HAZALOOM', speakerColor: 'text-amber-400', text: 'You have the controls! Igniting thrusters in 3... 2... 1... LIFTOFF!' },
    ],
  },
  mission_3_final_home: {
    badge: 'ARES-1 HOMEWARD BOUND // EARTH RETURN ORBITER',
    title: 'Heading Home to Earth',
    description:
      'You did it! You guided Hazaloom, Hedeya, and Samantha through every Mars crisis, protected their health in orbit, and launched everyone safely home with Rock Tube #14!',
    defaultPaths: ['/assets/cinematic/mission3_final_home.mp4', '/assets/cinematic/final_home.mp4'],
    uploadPathHint: '',
    continueLabel: 'Finish Expedition',
    themeColor: 'emerald',
    autoPreviewDurationSec: 12,
    cues: [
      { start: 0.3, end: 4.0, speaker: 'SAMANTHA', speakerColor: 'text-emerald-300', text: 'Mars Rock Tube #14 is locked in and our daily zero-G habits are keeping us strong!' },
      { start: 4.0, end: 8.0, speaker: 'HEDEYA', speakerColor: 'text-sky-300', text: 'All life-support systems are green. Earth Mission Control says welcome home!' },
      { start: 8.0, end: 12.2, speaker: 'HAZALOOM', speakerColor: 'text-amber-400', text: 'You saved the whole crew! Next stop: Planet Earth!' },
    ],
  },
};

async function checkVideoExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const contentType = res.headers.get('content-type') || '';
    return res.ok && contentType.startsWith('video/');
  } catch {
    return false;
  }
}

export const DisasterCinematicModal: React.FC<DisasterCinematicModalProps> = ({
  eventType = 'mission_1_explosion',
  onComplete,
}) => {
  const cfg = EVENT_CONFIGS[eventType];

  const [playlist, setPlaylist] = useState<string[] | null>(null);
  const [isCheckingVideo, setIsCheckingVideo] = useState(true);
  const [clipIndex, setClipIndex] = useState(0);
  const [clipOffsets, setClipOffsets] = useState<number[]>([0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [videoLoadError, setVideoLoadError] = useState(false);

  const [finalElapsed, setFinalElapsed] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {

    let cancelled = false;
    (async () => {
      setIsCheckingVideo(true);
      if (eventType === 'mission_1_explosion') {
        for (const p of ['/assets/cinematic/mission1_event.mp4', '/assets/cinematic/cutscene.mp4']) {
          if (await checkVideoExists(p)) {
            if (!cancelled) {
              setPlaylist([p]);
              setIsCheckingVideo(false);
            }
            return;
          }
        }
        const foundClips: string[] = [];
        for (const p of cfg.defaultPaths.slice(2)) {
          if (await checkVideoExists(p)) {
            foundClips.push(p);
          }
        }
        if (!cancelled) {
          setPlaylist(foundClips);
          setIsCheckingVideo(false);
        }
      } else {
        const found: string[] = [];
        for (const p of cfg.defaultPaths) {
          if (await checkVideoExists(p)) {
            found.push(p);
            break;
          }
        }
        if (!cancelled) {
          setPlaylist(found);
          setIsCheckingVideo(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventType, cfg.defaultPaths]);

  const currentClipSrc = playlist && playlist[clipIndex] ? playlist[clipIndex] : null;
  const isShowingPlaceholder = !isCheckingVideo && (!currentClipSrc || videoLoadError);
  const isAutoPlayingFinalFallback =
    eventType === 'mission_3_final_home' && isShowingPlaceholder;

  useEffect(() => {
    if (!isAutoPlayingFinalFallback || !cfg.autoPreviewDurationSec) return;
    const totalDur = cfg.autoPreviewDurationSec;
    setFinalElapsed(0);
    const interval = setInterval(() => {
      setFinalElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= totalDur) {
          clearInterval(interval);
          setTimeout(() => onCompleteRef.current(), 250);
          return totalDur;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isAutoPlayingFinalFallback, cfg.autoPreviewDurationSec]);

  const cumulativeOffset = clipOffsets[clipIndex] ?? 0;
  const totalElapsedSeconds = currentClipSrc && !videoLoadError
    ? cumulativeOffset + currentTime
    : finalElapsed;

  const activeSubtitle = cfg.cues.find(
    (cue) => totalElapsedSeconds >= cue.start && totalElapsedSeconds < cue.end
  );

  const handleLoadedMetadata = () => {
    const el = videoRef.current;
    if (!el) return;
    setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    el.muted = isMuted;
    el.play().catch(() => {
      el.muted = true;
      setIsMuted(true);
      el.play().catch(() => undefined);
    });
  };

  const handleVideoEnded = () => {
    if (playlist && clipIndex < playlist.length - 1) {
      const finishedDuration = videoRef.current?.duration || duration || 0;
      setClipOffsets((prev) => {
        const next = [...prev];
        next[clipIndex + 1] = (next[clipIndex] ?? 0) + finishedDuration;
        return next;
      });
      setCurrentTime(0);
      setClipIndex((prev) => prev + 1);
    } else {
      onCompleteRef.current();
    }
  };

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleReplay = () => {
    setVideoLoadError(false);
    setClipOffsets([0]);
    setCurrentTime(0);
    setFinalElapsed(0);
    if (clipIndex !== 0) {
      setClipIndex(0);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
    }
  };

  const progressPercent =
    currentClipSrc && !videoLoadError && duration > 0
      ? Math.min(100, (currentTime / duration) * 100)
      : isAutoPlayingFinalFallback && cfg.autoPreviewDurationSec
      ? Math.min(100, (finalElapsed / cfg.autoPreviewDurationSec) * 100)
      : 0;

  const badgeTextClass =
    cfg.themeColor === 'red'
      ? 'text-red-400'
      : cfg.themeColor === 'cyan'
      ? 'text-cyan-400'
      : cfg.themeColor === 'emerald'
      ? 'text-emerald-400'
      : 'text-amber-400';

  const boxClass =
    cfg.themeColor === 'red'
      ? 'pixel-box-red'
      : cfg.themeColor === 'cyan'
      ? 'pixel-box-cyan'
      : cfg.themeColor === 'emerald'
      ? 'pixel-box-emerald'
      : 'pixel-box-amber';

  const btnAccentClass =
    cfg.themeColor === 'red'
      ? 'bg-red-500 hover:bg-red-400 text-white'
      : cfg.themeColor === 'cyan'
      ? 'bg-cyan-500 hover:bg-cyan-400 text-black'
      : cfg.themeColor === 'emerald'
      ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
      : 'bg-amber-500 hover:bg-amber-400 text-black';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white select-none overflow-hidden"
      role="dialog"
      aria-label={cfg.title}
    >

      {/* Video layer */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        {currentClipSrc && !videoLoadError && (
          <video
            ref={videoRef}
            key={currentClipSrc}
            src={currentClipSrc}
            playsInline
            autoPlay
            muted={isMuted}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
            onEnded={handleVideoEnded}
            onError={() => setVideoLoadError(true)}
            className="w-full h-full object-contain bg-black"
          />
        )}

        {/* Animated Pixel Space Backdrop for Auto-Playing Final Home Fallback */}
        {isAutoPlayingFinalFallback && (
          <div
            className="absolute inset-0 overflow-hidden bg-[#030712]"
            style={{
              backgroundImage:
                'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#7dd3fc 1px, transparent 1px)',
              backgroundSize: '44px 44px, 72px 72px',
              backgroundPosition: `${Math.round(-finalElapsed * 18)}px 0, ${Math.round(-finalElapsed * 10)}px 18px`,
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/90 to-transparent" />
      </div>

      {/* Top Controls Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8 pt-4 sm:pt-6">
        <div className="flex flex-col gap-0.5">
          <span className={`font-mono-hud text-xs font-bold tracking-widest uppercase ${badgeTextClass}`}>
            {cfg.badge}
          </span>
          {playlist && playlist.length > 1 && (
            <span className="font-title text-xs font-bold tracking-wide text-slate-300 uppercase">
              Clip {clipIndex + 1} of {playlist.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">

          {currentClipSrc && !videoLoadError && (
            <>
              <button
                onClick={() => setSubtitlesOn((prev) => !prev)}
                className="pixel-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#160f0d] hover:bg-[#241613] text-xs font-mono-hud font-bold text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <PixelIcon name="subtitles" className={`w-4 h-4 ${badgeTextClass}`} />
                <span>{subtitlesOn ? 'Subtitles: On' : 'Subtitles: Off'}</span>
              </button>

              <button
                onClick={handleToggleSound}
                className="pixel-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#160f0d] hover:bg-[#241613] text-xs font-mono-hud font-bold text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isMuted ? (
                  <PixelIcon name="volumeOff" className="w-4 h-4 text-red-400" />
                ) : (
                  <PixelIcon name="volumeOn" className="w-4 h-4 text-emerald-400" />
                )}
                <span>{isMuted ? 'Sound: Off' : 'Sound: On'}</span>
              </button>

              <button
                onClick={handleReplay}
                className="pixel-btn flex items-center gap-1.5 px-3 py-1.5 bg-[#160f0d] hover:bg-[#241613] text-xs font-mono-hud font-bold text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <PixelIcon name="rotate" className="w-3.5 h-3.5 text-sky-400" />
                <span>Replay</span>
              </button>
            </>
          )}

          <button
            onClick={onComplete}
            className={`pixel-btn flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-title uppercase tracking-wider whitespace-nowrap shrink-0 cursor-pointer ${btnAccentClass}`}
          >
            <span>{cfg.continueLabel}</span>
            <PixelIcon name="fastForward" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transmission / Video Frame */}
      {isShowingPlaceholder && (
        <div className="relative z-20 my-auto mx-auto w-full max-w-xl px-4">
          <div className={`${boxClass} bg-[#120b09]/95 p-6 sm:p-8 text-center`}>
            <div className="mx-auto mb-4 w-14 h-14 bg-black/70 border-2 border-current flex items-center justify-center">
              <PixelIcon
                name={eventType === 'mission_3_final_home' ? 'rocket' : 'film'}
                className={`w-7 h-7 ${badgeTextClass} ${isAutoPlayingFinalFallback ? 'animate-bounce' : ''}`}
              />
            </div>

            <div className={`text-[10px] font-mono-hud font-bold uppercase tracking-widest mb-1 ${badgeTextClass}`}>
              {eventType === 'mission_3_final_home' ? 'DEEP SPACE FLIGHT FEED' : 'EMERGENCY LOG FEED'}
            </div>
            <h2 className="font-title text-base sm:text-xl font-bold uppercase text-white">
              {cfg.title}
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {cfg.description}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onComplete}
                className={`pixel-btn w-full sm:w-auto py-3 px-6 font-mono-hud text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${btnAccentClass}`}
              >
                <span>{cfg.continueLabel}</span>
                <PixelIcon name="fastForward" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtitles + Progress Bar */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-8 pb-5 sm:pb-7 flex flex-col gap-3">
        {subtitlesOn && activeSubtitle && (currentClipSrc && !videoLoadError || isAutoPlayingFinalFallback) && (
          <div className={`mx-auto w-full max-w-2xl ${boxClass} bg-black/90 px-5 py-3 text-center`}>
            <div className={`font-mono-hud text-xs font-bold tracking-widest uppercase mb-1 ${activeSubtitle.speakerColor}`}>
              {activeSubtitle.speaker}
            </div>
            <p className="text-sm sm:text-base font-semibold text-white leading-snug">
              "{activeSubtitle.text}"
            </p>
          </div>
        )}

        {((currentClipSrc && !videoLoadError) || isAutoPlayingFinalFallback) && (
          <div className="flex items-center gap-3">
            <span className="font-mono-hud text-[11px] text-slate-300 w-10 text-right tabular-nums">
              {Math.floor(currentClipSrc && !videoLoadError ? currentTime : finalElapsed)}s
            </span>
            <div className="flex-1 h-3 p-0.5 bg-[#140c0a] border-2 border-[#49302b] overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  cfg.themeColor === 'emerald'
                    ? 'bg-emerald-400'
                    : cfg.themeColor === 'cyan'
                    ? 'bg-cyan-400'
                    : cfg.themeColor === 'red'
                    ? 'bg-red-500'
                    : 'bg-amber-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="font-mono-hud text-[11px] text-slate-400 w-10 tabular-nums">
              {Math.floor(
                currentClipSrc && !videoLoadError ? duration : cfg.autoPreviewDurationSec ?? 0
              )}s
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
