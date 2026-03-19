import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc, X } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const { currentTrack, isPlaying, progress, volume, playlist, toggle, next, prev, seek, setVolume, play } = useAudio();
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const duration = currentTrack.duration || 0;
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Update expanded state on mount
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

  // Minimized player - floating at bottom right
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#1a1a20] to-[#12121a] backdrop-blur-xl rounded-full shadow-2xl border border-white/10 hover:border-purple-500/30 transition-all group"
        aria-label="Expand player"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${isPlaying ? 'playing-glow' : ''}`}
          style={{ backgroundColor: currentTrack.coverColor || '#8b5cf6' }}
        >
          {isPlaying ? (
            <div className="playing-bar">
              <span></span><span></span><span></span><span></span>
            </div>
          ) : (
            <Disc className="w-5 h-5 text-white/60" />
          )}
        </div>
        <div className="text-left">
          <p className="text-white text-sm font-medium truncate max-w-[120px]">{currentTrack.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-white/40 text-xs">{formatTime(progress)}</span>
          </div>
        </div>
        <Play size={20} className="text-white ml-2" />
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-500 ${
        expanded
          ? 'bottom-0 left-0 right-0'
          : 'bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-[480px]'
      } bg-gradient-to-br from-[#1a1a20] via-[#16161f] to-[#12121a] backdrop-blur-2xl border-t md:border md:rounded-2xl shadow-2xl border-purple-500/20`}
      role="region"
      aria-label="Audio player"
    >
      {/* Gradient glow behind player */}
      {isPlaying && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 pointer-events-none" />
      )}

      {/* Track Info + Controls Row */}
      <div className="relative flex items-center gap-3 px-5 py-4">
        {/* Close/Minimize button */}
        <button
          onClick={() => setMinimized(true)}
          aria-label="Minimize player"
          className="absolute -top-2 -right-2 p-1.5 bg-[#1a1a20] border border-white/10 rounded-full text-white/40 hover:text-white hover:border-purple-500/30 transition-all"
        >
          <X size={14} />
        </button>

        {/* Cover with enhanced animation */}
        <div
          className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden relative ${
            isPlaying ? 'playing-glow' : ''
          }`}
          style={{ backgroundColor: currentTrack.coverColor || '#8b5cf6' }}
        >
          {isPlaying ? (
            <div className="relative">
              <Disc className="w-9 h-9 text-white/80 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
              </div>
              {/* Music note particles when playing */}
              <div className="absolute -top-1 -right-1 text-white/60">
                <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            </div>
          ) : (
            <Disc className="w-9 h-9 text-white/40" />
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-base font-semibold truncate" aria-label="Now playing">
              {currentTrack.title}
            </p>
            {isPlaying && (
              <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-purple-400 uppercase tracking-wider">Playing</span>
              </span>
            )}
          </div>
          <p className="text-white/50 text-xs mt-0.5">
            {playlist.length > 1 ? `Track ${playlist.findIndex(t => t.id === currentTrack.id) + 1} of ${playlist.length}` : 'Now Playing'}
          </p>
        </div>

        {/* Controls - Enhanced */}
        <div className="flex items-center gap-1">
          <button onClick={prev} aria-label="Previous track" className="p-2.5 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <SkipBack size={20} />
          </button>
          <button
            onClick={toggle}
            aria-label={isPlaying ? `Pause ${currentTrack.title}` : `Play ${currentTrack.title}`}
            className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg hover:shadow-purple-500/40 transition-all hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            {/* Button ripple effect */}
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            {isPlaying ? (
              <Pause size={20} className="fill-white relative z-10" />
            ) : (
              <Play size={20} className="ml-0.5 fill-white relative z-10" />
            )}
          </button>
          <button onClick={next} aria-label="Next track" className="p-2.5 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <SkipForward size={20} />
          </button>
        </div>
      </div>

      {/* Mini Progress Bar */}
      {!expanded && (
        <div className="px-5 pb-4">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="h-2 bg-white/10 rounded-full cursor-pointer group overflow-hidden"
          >
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%] animate-gradient rounded-full transition-all duration-300 relative"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Glow effect on progress */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-0 group-hover:scale-100" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40 font-mono">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Expanded: Progress + Volume + Playlist */}
      {expanded && (
        <div className="relative px-5 pb-5 space-y-5">
          {/* Progress bar */}
          <div className="space-y-2">
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="h-2.5 bg-white/10 rounded-full cursor-pointer group overflow-hidden"
            >
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full transition-all duration-300 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-0 group-hover:scale-100" />
              </div>
            </div>
            <div className="flex justify-between text-sm text-white/50 font-mono">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
              className="text-white/50 hover:text-white transition-colors p-1"
            >
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
              className="flex-1 h-1.5 accent-purple-500 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
          </div>

          {/* Playlist */}
          {playlist.length > 0 && (
            <div className="mt-4 space-y-2" role="list" aria-label="Playlist">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Up Next</p>
              {playlist.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => play(t)}
                  aria-label={`Play ${t.title}${t.id === currentTrack.id ? ' (current)' : ''}`}
                  aria-current={t.id === currentTrack.id ? 'true' : undefined}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${
                    t.id === currentTrack.id
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-white/30 w-4">{idx + 1}</span>
                  <span className="truncate flex-1">{t.title}</span>
                  {t.id === currentTrack.id && isPlaying && (
                    <div className="playing-bar">
                      <span></span><span></span><span></span><span></span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Collapse button */}
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
