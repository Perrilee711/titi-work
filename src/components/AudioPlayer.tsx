import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc, X, Disc3 } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Vinyl record component
function VinylRecord({ coverColor, isPlaying, size = 'md' }: { coverColor: string; isPlaying: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { outer: 48, inner: 16, hole: 6 },
    md: { outer: 80, inner: 28, hole: 10 },
    lg: { outer: 200, inner: 70, hole: 24 },
  };
  const s = sizes[size];

  return (
    <div
      className={`relative flex-shrink-0 ${isPlaying ? 'animate-spin' : ''}`}
      style={{
        width: s.outer,
        height: s.outer,
        animationDuration: isPlaying ? '3s' : '0s',
        animationTimingFunction: 'linear',
      }}
    >
      {/* Vinyl base */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 50%, #000 100%)',
        }}
      />
      {/* Grooves */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: `repeating-radial-gradient(circle at center, transparent 0px, transparent 2px, rgba(255,255,255,0.03) 3px, transparent 4px)`,
        }}
      />
      {/* Outer edge shine */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
        }}
      />
      {/* Label area */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
        style={{
          width: s.inner,
          height: s.inner,
          background: `linear-gradient(135deg, ${coverColor || '#8b5cf6'} 0%, ${adjustColor(coverColor || '#8b5cf6', -40)} 100%)`,
        }}
      >
        {/* Center hole */}
        <div
          className="rounded-full bg-black"
          style={{ width: s.hole, height: s.hole }}
        />
      </div>
      {/* Reflection */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)',
        }}
      />
    </div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
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

  // Minimized player - vinyl style
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 p-3 bg-gradient-to-r from-[#1a1a20] to-[#12121a] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 hover:border-purple-500/30 transition-all group"
        aria-label="Expand player"
      >
        {/* Spinning vinyl */}
        <div className="relative">
          <VinylRecord
            coverColor={currentTrack.coverColor}
            isPlaying={isPlaying}
            size="sm"
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play size={16} className="text-white/80" fill="white" />
            </div>
          )}
        </div>
        <div className="text-left pr-2">
          <p className="text-white text-sm font-medium truncate max-w-[140px]">{currentTrack.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-white/40 text-xs">{formatTime(progress)}</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-500 ${
        expanded
          ? 'bottom-0 left-0 right-0'
          : 'bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-[520px]'
      } bg-gradient-to-br from-[#1a1a20] via-[#16161f] to-[#12121a] backdrop-blur-2xl border-t md:border md:rounded-3xl shadow-2xl border-purple-500/20`}
      role="region"
      aria-label="Audio player"
    >
      {/* Gradient glow behind player */}
      {isPlaying && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 pointer-events-none animate-pulse" />
      )}

      {/* Record Player Layout */}
      <div className="relative p-5">
        {/* Close/Minimize button */}
        <button
          onClick={() => setMinimized(true)}
          aria-label="Minimize player"
          className="absolute top-3 right-3 p-2 bg-[#1a1a20]/80 border border-white/10 rounded-full text-white/40 hover:text-white hover:border-purple-500/30 transition-all z-10"
        >
          <X size={16} />
        </button>

        <div className={`flex items-center gap-5 ${expanded ? 'flex-col' : ''}`}>
          {/* Large Vinyl Record - The centerpiece! */}
          <div className="relative flex-shrink-0">
            <VinylRecord
              coverColor={currentTrack.coverColor}
              isPlaying={isPlaying}
              size={expanded ? 'lg' : 'md'}
            />

            {/* Play/Pause overlay on vinyl */}
            {!isPlaying && (
              <button
                onClick={toggle}
                className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Play size={32} className="text-white ml-1" fill="white" />
                </div>
              </button>
            )}

            {/* Tonearm indicator when playing */}
            {isPlaying && (
              <div className="absolute -top-2 -right-2">
                <svg width="40" height="60" viewBox="0 0 40 60" className="transform rotate-12">
                  <rect x="18" y="0" width="4" height="35" fill="#a0a0a0" rx="2" />
                  <circle cx="20" cy="52" r="12" fill="#333" stroke="#666" strokeWidth="2" />
                  <circle cx="20" cy="52" r="4" fill="#888" />
                </svg>
              </div>
            )}
          </div>

          {/* Track Info & Controls */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="text-center md:text-left mb-4">
              <h3 className="text-white text-lg font-bold truncate">{currentTrack.title}</h3>
              <p className="text-white/50 text-sm">
                {playlist.length > 1 ? `Track ${playlist.findIndex(t => t.id === currentTrack.id) + 1} of ${playlist.length}` : 'Now Playing'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div
                ref={progressRef}
                onClick={handleProgressClick}
                className="h-3 bg-white/10 rounded-full cursor-pointer group overflow-hidden relative"
              >
                {/* Vinyl groove texture */}
                <div className="absolute inset-0 opacity-30" style={{
                  background: 'repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(255,255,255,0.05) 5px)'
                }} />
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full relative transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* Glowing handle */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/40 font-mono">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              <button onClick={prev} aria-label="Previous track" className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <SkipBack size={24} />
              </button>
              <button
                onClick={toggle}
                aria-label={isPlaying ? `Pause ${currentTrack.title}` : `Play ${currentTrack.title}`}
                className="p-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-xl hover:shadow-purple-500/40 transition-all hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {isPlaying ? (
                  <Pause size={28} className="fill-white relative z-10" />
                ) : (
                  <Play size={28} className="ml-1 fill-white relative z-10" />
                )}
              </button>
              <button onClick={next} aria-label="Next track" className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <SkipForward size={24} />
              </button>
            </div>

            {/* Volume (only in expanded mode) */}
            {expanded && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                  aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volume"
                  className="flex-1 h-1.5 accent-purple-500 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Expanded: Playlist */}
        {expanded && playlist.length > 0 && (
          <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
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
      </div>
    </div>
  );
}
