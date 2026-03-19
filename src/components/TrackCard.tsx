import { useState, useEffect } from 'react';
import { Play, Pause, Clock, Disc } from 'lucide-react';

interface TrackCardProps {
  id: string;
  title: string;
  coverColor: string;
  duration: number;
  featured?: boolean;
  audioFile: string;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function TrackCard({ id, title, coverColor, duration, featured, audioFile }: TrackCardProps) {
  const [isCurrent, setIsCurrent] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handlePlayTrack = (e: Event) => {
      const track = (e as CustomEvent<any>).detail;
      setIsCurrent(track.id === id);
    };

    const handleTimeUpdate = () => {
      // Poll for playing state
      const howl = (window as any).Howl;
      if (howl && isCurrent) {
        // Check if playing
      }
    };

    window.addEventListener('play-track', handlePlayTrack);

    // Check current track periodically
    const interval = setInterval(() => {
      const event = new CustomEvent('get-playing-state', { detail: { trackId: id, callback: (playing: boolean) => {
        setIsPlaying(playing);
      }}});
      window.dispatchEvent(event);
    }, 500);

    return () => {
      window.removeEventListener('play-track', handlePlayTrack);
      clearInterval(interval);
    };
  }, [id]);

  // Listen for custom events to sync playing state
  useEffect(() => {
    const handleTrackChange = (e: Event) => {
      const data = (e as CustomEvent<any>).detail;
      setIsCurrent(data.track?.id === id);
      setIsPlaying(data.isPlaying && data.track?.id === id);
    };

    window.addEventListener('audio-state-change', handleTrackChange);
    return () => window.removeEventListener('audio-state-change', handleTrackChange);
  }, [id]);

  const handlePlay = () => {
    const track = { id, title, audioFile, coverColor, duration };
    window.dispatchEvent(new CustomEvent('play-track', { detail: track }));
  };

  return (
    <button
      onClick={handlePlay}
      aria-label={`Play ${title}`}
      className={`group w-full text-left rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative ${
        isCurrent ? 'ring-2 ring-purple-500/50' : ''
      } ${featured ? 'md:col-span-2 lg:col-span-1' : ''}`}
    >
      {/* Active indicator glow */}
      {isCurrent && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none z-10" />
      )}

      {/* Cover with gradient */}
      <div
        className="aspect-square relative flex items-center justify-center overflow-hidden"
        style={{
          background: coverColor
            ? `linear-gradient(135deg, ${coverColor} 0%, ${adjustColor(coverColor, -40)} 100%)`
            : 'linear-gradient(135deg, #1a1a24 0%, #12121a 100%)'
        }}
      >
        {/* Glow effect - enhanced */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{
            background: isCurrent
              ? 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.4), transparent 70%)'
              : 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2), transparent 70%)'
          }}
        />

        {/* Hover play button */}
        <div
          className={`absolute inset-0 transition-all duration-300 flex items-center justify-center ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
            {isPlaying ? (
              <div className="playing-bar">
                <span></span><span></span><span></span><span></span>
              </div>
            ) : (
              <Play className="text-white fill-white ml-1" size={28} />
            )}
          </div>
        </div>

        {/* Music icon - spins when playing */}
        <Disc className={`w-14 h-14 text-white/15 absolute transition-all duration-500 ${
          isPlaying && isCurrent ? 'animate-spin opacity-50' : 'opacity-30'
        }`}
        style={{ animationDuration: isPlaying ? '3s' : '0s' }} />

        {/* Playing indicator - always visible when playing */}
        {isCurrent && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="playing-bar">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
        )}

        {/* Featured badge */}
        {featured && !isCurrent && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] uppercase tracking-widest text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 relative" style={{ background: 'linear-gradient(180deg, #1a1a20 0%, #151518 100%)' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`font-medium text-sm truncate transition-colors ${
              isCurrent ? 'text-purple-400' : 'text-white'
            }`}>
              {title}
            </p>
            <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
              <Clock size={10} />
              {formatTime(duration)}
            </p>
          </div>
          {isCurrent && (
            <span className="flex-shrink-0 text-[10px] uppercase tracking-widest text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full animate-pulse">
              Playing
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// Helper function to adjust color brightness
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
