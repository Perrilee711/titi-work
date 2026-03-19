import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronUp, ChevronDown, Disc } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const { currentTrack, isPlaying, progress, volume, playlist, toggle, next, prev, seek, setVolume, play } = useAudio();
  const [expanded, setExpanded] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const duration = currentTrack.duration || 0;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Update expanded state on mount to show mini player on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setExpanded(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click on progress bar to seek
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    seek(percent * duration);
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-500 ${
        expanded ? 'bottom-0 left-0 right-0' : 'bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto md:w-96'
      } bg-gradient-to-b from-[#1a1a1f] to-[#0f0f12] backdrop-blur-xl border-t md:border md:rounded-2xl shadow-2xl border-white/10`}
      role="region"
      aria-label="Audio player"
    >
      {/* Track Info + Controls Row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Cover with spinning animation */}
        <div
          className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden ${
            isPlaying ? 'playing-glow' : ''
          }`}
          style={{ backgroundColor: currentTrack.coverColor || '#1a1a1a' }}
        >
          {isPlaying ? (
            <div className="relative">
              <Disc className="w-8 h-8 text-white/80 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/80" />
              </div>
            </div>
          ) : (
            <Disc className="w-8 h-8 text-white/40" />
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate" aria-label="Now playing">{currentTrack.title}</p>
          <p className="text-white/40 text-xs truncate" aria-label="Playlist position">
            {playlist.length > 1 ? `Track ${playlist.findIndex(t => t.id === currentTrack.id) + 1} of ${playlist.length}` : ''}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button onClick={prev} aria-label="Previous track" className="p-2 text-white/50 hover:text-white transition-colors">
            <SkipBack size={18} />
          </button>
          <button
            onClick={toggle}
            aria-label={isPlaying ? `Pause ${currentTrack.title}` : `Play ${currentTrack.title}`}
            className="p-3.5 bg-gradient-to-r from-[#d4789a] to-[#9b8ac4] text-white rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause size={18} className="fill-white" /> : <Play size={18} className="ml-0.5 fill-white" />}
          </button>
          <button onClick={next} aria-label="Next track" className="p-2 text-white/50 hover:text-white transition-colors">
            <SkipForward size={18} />
          </button>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse player' : 'Expand player'}
          className="p-2 text-white/40 hover:text-white transition-colors hidden md:block"
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* Mini Progress Bar (always visible) */}
      {!expanded && (
        <div className="px-4 pb-2">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-1.5 bg-white/10 rounded-full cursor-pointer group overflow-hidden"
          >
            <div
              className="h-full bg-gradient-to-r from-[#d4789a] to-[#9b8ac4] rounded-full transition-all duration-300 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-white/30">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Expanded: Progress + Volume */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="h-2 bg-white/10 rounded-full cursor-pointer group overflow-hidden"
            >
              <div
                className="h-full bg-gradient-to-r from-[#d4789a] via-[#9b8ac4] to-[#8b9a6b] rounded-full transition-all duration-300 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-0 group-hover:scale-100" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-white/50" aria-hidden="true">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} aria-label={volume === 0 ? 'Unmute' : 'Mute'} className="text-white/50 hover:text-white transition-colors">
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="flex-1 h-1.5 accent-white bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>

          {/* Playlist */}
          {playlist.length > 0 && (
            <div className="mt-4 space-y-1" role="list" aria-label="Playlist">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3" aria-hidden="true">Up Next</p>
              {playlist.map((t) => (
                <button
                  key={t.id}
                  onClick={() => play(t)}
                  aria-label={`Play ${t.title}${t.id === currentTrack.id ? ' (current)' : ''}`}
                  aria-current={t.id === currentTrack.id ? 'true' : undefined}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                    t.id === currentTrack.id
                      ? 'bg-gradient-to-r from-white/10 to-white/5 text-white border border-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate block">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
